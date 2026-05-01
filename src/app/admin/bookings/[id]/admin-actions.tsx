"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";

interface AdminActionsProps {
  bookingId: string;
  currentBookingStatus: string;
  currentPaymentStatus: string;
  paymentMode: string;
}

export function AdminActions({ bookingId, currentBookingStatus, currentPaymentStatus, paymentMode }: AdminActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (targetStatus: string, actionName: string, offlinePaymentConfirmed: boolean = false) => {
    if (!confirm(`Are you sure you want to mark this booking as ${actionName}?`)) return;

    setLoadingAction(actionName);
    setError(null);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStatus, note, offlinePaymentConfirmed }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update booking");

      setNote("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 md:p-8">
      <h3 className="font-headline-sm text-primary mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px] text-secondary">admin_panel_settings</span>
        Admin Operations
      </h3>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-100">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-label-bold text-outline mb-2">Optional Internal Note</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="E.g., Vehicle prepped, Customer verified..."
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-secondary transition-colors"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Offline Payment Confirmation */}
        {paymentMode === "offline" && currentPaymentStatus === "unpaid" && currentBookingStatus !== "cancelled" && (
          <Button
            variant="outline"
            onClick={() => handleAction("confirmed", "Offline Payment Received", true)}
            disabled={!!loadingAction}
          >
            {loadingAction === "Offline Payment Received" ? "Processing..." : "Confirm Offline Payment"}
          </Button>
        )}

        {/* Mark Active */}
        {(currentBookingStatus === "confirmed" || currentBookingStatus === "advance_paid") && (
          <Button
            variant="secondary"
            onClick={() => handleAction("active", "Active")}
            disabled={!!loadingAction}
          >
            {loadingAction === "Active" ? "Processing..." : "Mark as Active"}
          </Button>
        )}

        {/* Mark Completed */}
        {currentBookingStatus === "active" && (
          <Button
            variant="primary"
            onClick={() => handleAction("completed", "Completed")}
            disabled={!!loadingAction}
          >
            {loadingAction === "Completed" ? "Processing..." : "Mark as Completed"}
          </Button>
        )}

        {/* Handle Cancellations */}
        {currentBookingStatus === "cancel_requested" && (
          <Button
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50"
            onClick={() => handleAction("cancelled", "Cancelled")}
            disabled={!!loadingAction}
          >
            {loadingAction === "Cancelled" ? "Processing..." : "Approve Cancellation"}
          </Button>
        )}

        {/* Process Refunds */}
        {currentBookingStatus === "cancelled" && currentPaymentStatus === "paid" && (
          <Button
            variant="outline"
            onClick={() => handleAction("refund_pending", "Refund Pending")}
            disabled={!!loadingAction}
          >
            {loadingAction === "Refund Pending" ? "Processing..." : "Initiate Refund (Pending)"}
          </Button>
        )}

        {currentBookingStatus === "refund_pending" && (
          <Button
            variant="outline"
            className="border-green-200 text-green-700 hover:bg-green-50"
            onClick={() => handleAction("refunded", "Refunded")}
            disabled={!!loadingAction}
          >
            {loadingAction === "Refunded" ? "Processing..." : "Mark Refunded"}
          </Button>
        )}
      </div>
    </div>
  );
}
