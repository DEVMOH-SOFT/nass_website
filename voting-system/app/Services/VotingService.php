<?php

namespace App\Services;

use App\Models\Candidate;
use App\Models\Setting;
use App\Models\VoteTransaction;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class VotingService
{
    /**
     * Calculate the total amount for a given number of votes (in kobo).
     */
    public function calculateAmount(int $votes): int
    {
        return $votes * Setting::getVotePriceKobo();
    }

    /**
     * Calculate the total amount in Naira.
     */
    public function calculateAmountNaira(int $votes): float
    {
        return $this->calculateAmount($votes) / 100;
    }

    /**
     * Generate a unique transaction reference.
     */
    public function generateReference(): string
    {
        do {
            $reference = 'NASS-VOTE-' . strtoupper(Str::random(10)) . '-' . time();
        } while (VoteTransaction::where('reference', $reference)->exists());

        return $reference;
    }

    /**
     * Create a pending vote transaction.
     */
    public function createTransaction(array $data): VoteTransaction
    {
        $votes = (int) $data['votes'];
        $amount = $this->calculateAmount($votes);

        return VoteTransaction::create([
            'candidate_id' => $data['candidate_id'],
            'reference' => $data['reference'] ?? $this->generateReference(),
            'voter_name' => $data['voter_name'],
            'voter_email' => $data['voter_email'],
            'votes' => $votes,
            'amount' => $amount,
            'payment_method' => $data['payment_method'] ?? Setting::getPaymentProvider(),
            'payment_status' => 'pending',
            'verification_status' => 'unverified',
        ]);
    }

    /**
     * Process a successful payment — add votes to candidate.
     * Uses transaction locking for safety and idempotency check.
     */
    public function processSuccessfulPayment(VoteTransaction $transaction): bool
    {
        // Idempotency check — don't process if already processed
        if ($transaction->isProcessed()) {
            return false;
        }

        return DB::transaction(function () use ($transaction) {
            // Lock the transaction row for update
            $lockedTransaction = VoteTransaction::lockForUpdate()->find($transaction->id);

            // Double-check idempotency after acquiring lock
            if ($lockedTransaction->isProcessed()) {
                return false;
            }

            // Add votes to candidate atomically
            $candidate = Candidate::lockForUpdate()->find($lockedTransaction->candidate_id);
            $candidate->addVotes($lockedTransaction->votes);

            // Mark transaction as processed
            $lockedTransaction->markAsProcessed();

            return true;
        });
    }

    /**
     * Reject a transaction.
     */
    public function rejectTransaction(VoteTransaction $transaction): void
    {
        $transaction->update([
            'payment_status' => 'failed',
            'verification_status' => 'rejected',
        ]);
    }

    /**
     * Upload receipt for a bank transfer transaction.
     */
    public function uploadReceipt(VoteTransaction $transaction, string $receiptPath): void
    {
        $transaction->update([
            'receipt_image' => $receiptPath,
        ]);
    }

    /**
     * Check if voting is currently enabled.
     */
    public function isVotingEnabled(): bool
    {
        return Setting::isVotingEnabled();
    }
}
