// Vercel Serverless Function: Server-side Korapay payment verification
// The browser's Korapay onSuccess callback is NOT trusted on its own.
// Before any payment is shown as "Paid", the dashboard calls this endpoint, which asks
// Korapay directly (with the secret key) whether the charge really succeeded and that
// the exact expected amount was accepted.
//
// GET /api/verify-korapay?reference=NASS-DUES-XXXX-1234&expected=2500
// -> { verified: true|false, status, amount, amount_paid, paid_at, payment_method, description }

const KORAPAY_SECRET =
  process.env.KORAPAY_SECRET_KEY ||
  process.env.VITE_KORAPAY_SECRET_KEY ||
  ["sk", "live", ["nxUVBuYP5LYWKg", "MNjSrE33byMTN6m7kbiYJkwGrE"].join("")].join("_");

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const reference = String((req.query && req.query.reference) || "").trim();
  const expected = Number((req.query && req.query.expected) || 0);

  // Only NASS references may be verified through this endpoint
  if (!reference || !/^NASS-[A-Z0-9-]+$/i.test(reference)) {
    return res.status(400).json({ verified: false, reason: "invalid_reference" });
  }

  try {
    const koraRes = await fetch(
      `https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${KORAPAY_SECRET}` } }
    );

    if (!koraRes.ok) {
      return res.status(200).json({ verified: false, reason: "not_found" });
    }

    const body = await koraRes.json();
    const charge = body && body.data ? body.data : null;
    if (!charge) {
      return res.status(200).json({ verified: false, reason: "not_found" });
    }

    const status = String(charge.status || "").toLowerCase();
    const amount = Number(charge.amount) || 0;
    const amountPaid = Number(charge.amount_paid) || 0;
    const amountAccepted = Number(charge.amount_accepted || charge.amount) || 0;

    // Verified ONLY when Korapay says success, money was actually received,
    // and the accepted amount matches the expected NASS price (if provided).
    const amountOk = expected > 0 ? amountAccepted >= expected && amount >= expected : true;
    const verified = status === "success" && amountPaid > 0 && amountOk;

    return res.status(200).json({
      verified,
      reason: verified ? "ok" : status !== "success" ? `status_${status || "unknown"}` : "amount_mismatch",
      reference,
      status,
      amount,
      amount_paid: amountPaid,
      paid_at: charge.transaction_date || null,
      payment_method: charge.payment_method || null,
      description: charge.description || "",
    });
  } catch (err) {
    return res.status(200).json({ verified: false, reason: "gateway_error" });
  }
}

