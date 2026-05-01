export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error?: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

// Window augmentation for Razorpay script
declare global {
  interface Window {
    Razorpay?: {
      new (options: RazorpayCheckoutOptions & {
        handler: (response: RazorpaySuccessResponse) => void;
        modal?: {
          ondismiss?: () => void;
        };
      }): {
        on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void;
        open: () => void;
      };
    };
  }
}

export function getPublicRazorpayKey() {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!key) {
    throw new Error("Razorpay public key is not configured.");
  }
  return key;
}

export function formatPaymentError(error: unknown): string {
  let msg = "Something went wrong while processing the payment. Please try again.";
  
  if (error instanceof Error && error.message) {
    msg = error.message;
  } else if (typeof error === "string") {
    msg = error;
  }

  const lowerMsg = msg.toLowerCase();

  // Map raw internal/provider errors to friendly UI text
  if (lowerMsg.includes("api key provided by you has expired") || lowerMsg.includes("invalid api key")) {
    return "Payment service is temporarily unavailable. Please try again shortly.";
  }
  if (lowerMsg.includes("invalid order") || lowerMsg.includes("order id")) {
    return "We couldn't start the payment right now. Please try again in a moment.";
  }
  if (lowerMsg.includes("cancelled") || lowerMsg.includes("canceled")) {
    return "Payment was cancelled. You can try again when you're ready.";
  }
  if (lowerMsg.includes("network") || lowerMsg.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }
  if (lowerMsg.includes("failed to open razorpay") || lowerMsg.includes("checkout is not available")) {
    return "We couldn't start the payment right now. Please try again in a moment.";
  }

  // If it's a known generic message, return it, otherwise fallback to generic
  if (msg.length < 100 && !msg.includes("api") && !msg.includes("razorpay") && !msg.includes("sdk")) {
    return msg;
  }

  return "Payment was not completed. Please try again.";
}

export function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
  return new Promise<RazorpaySuccessResponse>((resolve, reject) => {
    if (typeof window === "undefined" || !window.Razorpay) {
      reject(new Error("Razorpay checkout is not available yet. Please refresh and try again."));
      return;
    }

    try {
      const checkout = new window.Razorpay({
        ...options,
        handler: (response) => resolve(response),
        modal: {
          ondismiss: () => reject(new Error("Payment was cancelled before completion.")),
        },
      });

      checkout.on("payment.failed", (response) => {
        reject(
          new Error(
            response.error?.description ||
              response.error?.reason ||
              "Payment failed. Please try again."
          )
        );
      });

      checkout.open();
    } catch (err: unknown) {
      // If Razorpay throws synchronously (e.g. invalid order id)
      const errObject = err as Record<string, unknown>;
      const desc = errObject?.error ? (errObject.error as Record<string, string>)?.description : undefined;
      const msg = err instanceof Error ? err.message : String(err);
      reject(new Error(desc || msg || "Failed to open Razorpay checkout. The payment session may be invalid."));
    }
  });
}
