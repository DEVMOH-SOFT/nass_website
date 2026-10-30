/**
 * Korapay Payment Gateway Integration
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides unified helper functions for:
 * 1. Seamless Inline / Popup Checkout via Korapay Collections Modal
 * 2. Fallback Server-side Checkout Redirect
 *
 * Documentation: https://docs.korapay.com/
 */

// IMPORTANT: These keys MUST belong to the NASS LASUSTECH Korapay merchant account.
// The merchant name shown to students on checkout and receipts ("Your payment to ...")
// comes from the Korapay account that owns this key — NOT from this codebase.
// No hard-coded fallback: previously this fell back to the NACOS LASUSTECH key,
// which routed NASS dues into the NACOS account.
export const KORAPAY_LIVE_PUBLIC_KEY: string =
  import.meta.env.VITE_KORAPAY_LIVE_PUBLIC_KEY || import.meta.env.VITE_KORAPAY_PUBLIC_KEY || "";

export const KORAPAY_TEST_PUBLIC_KEY: string =
  import.meta.env.VITE_KORAPAY_TEST_PUBLIC_KEY || "";

/**
 * Checks if test sandbox mode is active.
 * Only returns true if explicitly set to test mode or configured with a pk_test_ key.
 */
export const isKorapayTestMode = () => {
  return (
    import.meta.env.VITE_KORAPAY_MODE === "test" ||
    (typeof import.meta.env.VITE_KORAPAY_PUBLIC_KEY === "string" && import.meta.env.VITE_KORAPAY_PUBLIC_KEY.startsWith("pk_test_"))
  );
};

/**
 * Keys that must never be used by the NASS website:
 * - Keys belonging to the NACOS LASUSTECH Korapay merchant account (they route NASS money to NACOS)
 * - Unfilled placeholders
 * Even if a hosting dashboard still injects one of these via env vars, checkout stays disabled.
 */
const BLOCKED_KORAPAY_KEYS = new Set<string>([
  "pk_live_Q8YucBLGXAKq3z23CBLa79Jv95brJLcwxvd9XUDM", // NACOS LASUSTECH (live)
  "pk_test_xRzLDXmeuiQMaiyF5oXuvT4iSsXJN8friVqFkweh", // NACOS LASUSTECH (test)
]);

const isUsableKorapayKey = (key: string) =>
  !!key && !BLOCKED_KORAPAY_KEYS.has(key) && !key.toUpperCase().includes("REPLACE") && !key.includes("your_");

export const NASS_PRESIDENT_WHATSAPP_URL =
  "https://wa.me/2348102306949?text=Hello%20NASS%20President%2C%20I%20would%20like%20assistance%20with%20my%20NASS%20payment.";

export const KORAPAY_UNAVAILABLE_MESSAGE =
  "Online payment is temporarily unavailable. Please contact the NASS President on WhatsApp (08102306949): https://wa.me/2348102306949";

// Determine active public key (Live production by default). Returns "" when no valid NASS key is configured.
export const getKorapayPublicKey = (isTest = false) => {
  const key = (isTest || isKorapayTestMode()) ? KORAPAY_TEST_PUBLIC_KEY : KORAPAY_LIVE_PUBLIC_KEY;
  return isUsableKorapayKey(key) ? key : "";
};

export const isKorapayConfigured = (isTest = false) => Boolean(getKorapayPublicKey(isTest));

declare global {
  interface Window {
    Korapay?: {
      initialize: (options: KorapayModalOptions) => void;
    };
  }
}

export interface KorapayModalOptions {
  key: string;
  reference: string;
  amount: number;
  currency?: string;
  merchant_bears_cost?: boolean;
  customer: {
    name?: string;
    email: string;
  };
  narration?: string;
  notification_url?: string;
  channels?: string[];
  onSuccess?: (response: any) => void;
  onClose?: () => void;
  onFailed?: (response: any) => void;
}

/**
 * Ensures the Korapay Collections popup script is loaded into the DOM.
 * Includes active polling to avoid hanging if the script already finished loading.
 */
export const loadKorapayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Korapay) {
      resolve(true);
      return;
    }

    const scriptId = "korapay-inline-script";
    let existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (!existing) {
      existing = document.createElement("script");
      existing.id = scriptId;
      existing.src = "https://korablobstorage.blob.core.windows.net/modal-bucket/korapay-collections.min.js";
      existing.async = true;
      document.head.appendChild(existing);
    }

    // Active poll for window.Korapay for up to 3.5 seconds
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (typeof window !== "undefined" && window.Korapay) {
        clearInterval(interval);
        resolve(true);
      } else if (attempts > 35) {
        clearInterval(interval);
        // If window.Korapay still isn't available, resolve false to trigger fallback
        resolve(typeof window !== "undefined" && !!window.Korapay);
      }
    }, 100);

    existing.addEventListener("load", () => {
      clearInterval(interval);
      resolve(true);
    });
    existing.addEventListener("error", () => {
      clearInterval(interval);
      resolve(false);
    });
  });
};

/**
 * Triggers a seamless Korapay checkout popup with rigorous input sanitization.
 * Configured with merchant_bears_cost: false (customer bears gateway fees)
 * and guarantees reference format starts with/contains NASS.
 */
export const triggerKorapayCheckout = async (options: {
  amount: number;
  email: string;
  name?: string;
  reference?: string;
  narration?: string;
  merchant_bears_cost?: boolean;
  isTest?: boolean;
  onSuccess?: (res: any) => void;
  onClose?: () => void;
  onFailed?: (res: any) => void;
}): Promise<boolean> => {
  const publicKey = getKorapayPublicKey(options.isTest);
  if (!publicKey) {
    console.error(
      "[Korapay Gateway] No NASS Korapay public key configured. Set VITE_KORAPAY_PUBLIC_KEY to the NASS LASUSTECH merchant key."
    );
    if (options.onFailed) {
      options.onFailed({
        message: KORAPAY_UNAVAILABLE_MESSAGE,
        whatsappUrl: NASS_PRESIDENT_WHATSAPP_URL,
      });
    }
    return true; // handled: onFailed already informed the user
  }

  const loaded = await loadKorapayScript();

  console.info(
    `[Korapay Gateway] Launching checkout in ${isKorapayTestMode() ? "TEST (Sandbox)" : "LIVE"} mode. ` +
    `Key: ${publicKey ? publicKey.slice(0, 14) + "..." : "none"}`
  );

  // Guarantee that every transaction reference contains "NASS"
  let ref = options.reference || `NASS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  if (!ref.toUpperCase().includes("NASS")) {
    ref = `NASS-${ref}`;
  }

  // Korapay collections script rejects special characters in customer name via regex: /[!#$%&()*:;<=>?\]\^[{|\}~]/
  const sanitizedName = (options.name || "NASS Student Scholar")
    .replace(/[!#$%&()*:;<=>?\]\^[{|\}~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Sanitize email and strip invalid characters
  const sanitizedEmail = (options.email || "student@lasustech.edu.ng")
    .replace(/[!#$%&*()<>?\]\^[{|\}~]/g, "")
    .trim()
    .toLowerCase();

  // Sanitize narration
  const sanitizedNarration = (options.narration || "NASS LASUSTECH Collegiate Payment")
    .replace(/[!#$%&()*:;<=>?\]\^[{|\}~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Ensure pointer events and focus are unlocked on document.body
  if (typeof document !== "undefined") {
    document.body.style.pointerEvents = "auto";
    document.body.removeAttribute("data-scroll-locked");
  }

  if (loaded && window.Korapay && typeof window.Korapay.initialize === "function") {
    try {
      window.Korapay.initialize({
        key: publicKey,
        reference: ref,
        amount: options.amount,
        currency: "NGN",
        merchant_bears_cost: options.merchant_bears_cost !== undefined ? options.merchant_bears_cost : false,
        customer: {
          name: sanitizedName || "NASS Student",
          email: sanitizedEmail,
        },
        narration: sanitizedNarration,
        onSuccess: (data) => {
          if (options.onSuccess) options.onSuccess(data);
        },
        onClose: () => {
          if (options.onClose) options.onClose();
        },
        onFailed: (err) => {
          if (options.onFailed) options.onFailed(err);
        },
      });
      return true;
    } catch (e) {
      console.warn("Korapay modal initialize failed:", e);
      return false;
    }
  }

  console.warn("Korapay gateway script not available on window.");
  return false;
};
