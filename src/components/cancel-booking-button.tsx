"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to request cancellation for this booking?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel booking.");
      }

      router.refresh();
    } catch (err: unknown) {
      console.error("Cancel error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full text-red-600 border-red-200 hover:bg-red-50"
        onClick={handleCancel}
        disabled={loading}
      >
        <span className="material-symbols-outlined text-[20px]">cancel</span>
        {loading ? "Processing..." : "Request Cancellation"}
      </Button>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
