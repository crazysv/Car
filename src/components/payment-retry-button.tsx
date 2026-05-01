"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { getPublicRazorpayKey, openRazorpayCheckout, formatPaymentError } from "@/lib/razorpay-client";

interface PaymentRetryProps {
  bookingId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export function PaymentRetryButton({
  bookingId,
  customerName,
  customerEmail,
  customerPhone,
}: PaymentRetryProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (typeof window === "undefined" || !window.Razorpay) {
      setError("Payment gateway is still loading. Please wait a moment and try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Get/create order
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, forceFresh: true }),
      });
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initiate payment");
      }

      // 2. Open Razorpay
      const paymentResponse = await openRazorpayCheckout({
        key: getPublicRazorpayKey(),
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "JP Rentals",
        description: `Advance Payment for Booking ${bookingId}`,
        order_id: orderData.order_id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: "#0f172a", // Primary slate-900
        },
      });

      // 3. Verify
      const verifyRes = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        }),
      });
      
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Payment verification failed");
      }

      // Success
      router.refresh();
    } catch (err: unknown) {
      console.warn("Payment retry incomplete:", err instanceof Error ? err.message : String(err));
      setError(formatPaymentError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 mt-4">
      <Button className="w-full" onClick={handlePayment} disabled={loading}>
        <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
        {loading ? "Processing..." : "Complete Payment"}
      </Button>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
