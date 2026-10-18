<?php

namespace App\Services;

use App\Models\VoteTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KorapayService
{
    protected string $secretKey;
    protected string $publicKey;
    protected string $paymentUrl;

    public function __construct()
    {
        $this->secretKey = config('korapay.secret_key');
        $this->publicKey = config('korapay.public_key');
        $this->paymentUrl = config('korapay.payment_url');
    }

    /**
     * Initialize a Korapay hosted checkout transaction.
     *
     * @param array $data [email, amount (kobo), reference, callback_url, metadata]
     * @return array|null Checkout URL data or null on failure
     */
    public function initializeTransaction(array $data): ?array
    {
        try {
            $amountNaira = $this->toNairaAmount($data['amount']);

            $response = Http::withToken($this->secretKey)
                ->post("{$this->paymentUrl}/api/v1/charges/initialize", [
                    'amount' => $amountNaira,
                    'currency' => 'NGN',
                    'reference' => $data['reference'],
                    'merchant_bears_cost' => false,
                    'customer' => [
                        'email' => $data['email'],
                        'name' => $data['name'] ?? null,
                    ],
                    'redirect_url' => $data['callback_url'],
                    'metadata' => $data['metadata'] ?? [],
                ]);

            $result = $response->json();

            if (($result['status'] ?? false) && isset($result['data']['checkout_url'])) {
                return $result['data'];
            }

            Log::error('Korapay initialization failed', ['response' => $result]);
            return null;
        } catch (\Exception $e) {
            Log::error('Korapay initialization exception', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Verify a Korapay charge by reference.
     */
    public function verifyTransaction(string $reference): ?array
    {
        try {
            $response = Http::withToken($this->secretKey)
                ->get("{$this->paymentUrl}/api/v1/charges/{$reference}");

            $result = $response->json();

            if ($result['status'] ?? false) {
                return $result['data'] ?? $result;
            }

            Log::error('Korapay verification failed', [
                'reference' => $reference,
                'response' => $result,
            ]);
            return null;
        } catch (\Exception $e) {
            Log::error('Korapay verification exception', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Validate Korapay webhook signature.
     * Uses HMAC SHA-256 over the data object only.
     */
    public function validateWebhookSignature(array $payload, string $signature): bool
    {
        $data = $payload['data'] ?? null;
        if ($data === null) {
            return false;
        }

        $computedSignature = hash_hmac('sha256', json_encode($data), $this->secretKey);
        return hash_equals($computedSignature, $signature);
    }

    /**
     * Get the public key for frontend usage.
     */
    public function getPublicKey(): string
    {
        return $this->publicKey;
    }

    /**
     * Process a webhook event payload.
     *
     * @return bool Whether the event was processed successfully
     */
    public function processWebhookEvent(array $event): bool
    {
        $data = $event['data'] ?? [];
        $reference = $data['reference'] ?? null;
        $status = $data['status'] ?? null;

        if (!$reference) {
            Log::warning('Korapay webhook: missing reference');
            return false;
        }

        // Only process successful charges
        if ($status !== 'success') {
            Log::info('Korapay webhook: ignoring non-success status', ['status' => $status]);
            return true;
        }

        $transaction = VoteTransaction::where('reference', $reference)->first();

        if (!$transaction) {
            Log::warning('Korapay webhook: transaction not found', ['reference' => $reference]);
            return false;
        }

        if ($transaction->isProcessed()) {
            Log::info('Korapay webhook: transaction already processed', ['reference' => $reference]);
            return true;
        }

        $paidAmount = $data['amount'] ?? 0;
        $expectedAmount = $this->toNairaAmount($transaction->amount);
        if ((int) $paidAmount !== (int) $expectedAmount) {
            Log::warning('Korapay webhook: amount mismatch', [
                'reference' => $reference,
                'expected' => $expectedAmount,
                'received' => $paidAmount,
            ]);
            return false;
        }

        $transaction->update([
            'payment_provider_reference' => $data['id'] ?? null,
        ]);

        $votingService = app(VotingService::class);
        return $votingService->processSuccessfulPayment($transaction);
    }

    protected function toNairaAmount(int $amountKobo): int
    {
        return (int) round($amountKobo / 100);
    }
}
