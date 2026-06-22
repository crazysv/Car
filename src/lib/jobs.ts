import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Finds all 'online' bookings in 'pending_payment' status older than 15 minutes
 * and marks them as cancelled.
 * Throws an error if the database update fails.
 */
export async function expireStaleBookings() {
  const admin = createAdminClient();
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  // 1. Find stale bookings
  const { data: staleBookings, error: fetchError } = await admin
    .from("bookings")
    .select("id")
    .eq("booking_status", "pending_payment")
    .eq("payment_mode", "online")
    .lt("created_at", fifteenMinutesAgo);

  if (fetchError) {
    throw new Error(`Failed to fetch stale bookings: ${fetchError.message}`);
  }

  if (!staleBookings || staleBookings.length === 0) {
    return { count: 0 };
  }

  const staleIds = staleBookings.map((b) => b.id);

  // 2. Update statuses
  const { error: updateError } = await admin
    .from("bookings")
    .update({
      booking_status: "cancelled",
      payment_status: "verification_failed",
    })
    .in("id", staleIds);

  if (updateError) {
    throw new Error(`Failed to update stale bookings: ${updateError.message}`);
  }

  // 2.5 Expire related payment attempts
  const { error: paymentsError } = await admin
    .from("booking_payments")
    .update({ status: "verification_failed" })
    .in("booking_id", staleIds)
    .eq("status", "order_created");

  if (paymentsError) {
    // Audit gap risk if this fails while bookings were cancelled.
    throw new Error(`Failed to update stale payment attempts: ${paymentsError.message}`);
  }

  // 3. Log history
  const historyEntries = staleIds.map((id) => ({
    booking_id: id,
    status: "cancelled",
    note: "System auto-cancelled: payment hold expired",
    changed_by: null,
  }));

  const { error: historyError } = await admin
    .from("booking_status_history")
    .insert(historyEntries);

  if (historyError) {
    // If history fails, we must throw so callers fail closed and don't silently ignore the audit gap
    throw new Error(`CRITICAL: Audit gap - bookings cancelled but history insert failed: ${historyError.message}`);
  }

  return { count: staleIds.length };
}
