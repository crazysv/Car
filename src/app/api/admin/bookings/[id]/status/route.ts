import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 1. Verify Authentication & Authorization
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { targetStatus, note, offlinePaymentConfirmed } = body;

    if (!targetStatus) {
      return NextResponse.json({ error: "Missing targetStatus" }, { status: 400 });
    }

    // 2. Initialize Service Role Client for Admin actions
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Fetch current state to validate transition
    const { data: booking, error: fetchError } = await admin
      .from("bookings")
      .select("booking_status, payment_status, payment_mode")
      .eq("id", id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const { booking_status: currentStatus, payment_status: currentPaymentStatus, payment_mode: paymentMode } = booking;

    // 4. Validate Transitions
    let isValid = false;
    if (targetStatus === "confirmed" && offlinePaymentConfirmed) {
      isValid = paymentMode === "offline" && currentPaymentStatus === "unpaid" && currentStatus === "pending_payment";
    } else if (targetStatus === "active") {
      isValid = currentStatus === "confirmed" || currentStatus === "advance_paid";
    } else if (targetStatus === "completed") {
      isValid = currentStatus === "active";
    } else if (targetStatus === "cancelled") {
      isValid = currentStatus === "cancel_requested";
    } else if (targetStatus === "refund_pending") {
      isValid = currentStatus === "cancelled" && currentPaymentStatus === "paid";
    } else if (targetStatus === "refunded") {
      isValid = currentStatus === "refund_pending";
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
    }

    // 5. Update Booking
    const updatePayload: Record<string, string> = {
      booking_status: targetStatus,
    };

    if (offlinePaymentConfirmed) {
      updatePayload.payment_status = "paid";
    } else if (targetStatus === "refunded") {
      updatePayload.payment_status = "refunded";
    }

    const { error: updateError } = await admin
      .from("bookings")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      console.error("Admin booking update error:", updateError);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    // 6. Log to Status History
    let auditNote = note ? `Admin Action: ${note}` : `Admin changed status to ${targetStatus}`;
    if (offlinePaymentConfirmed) {
      auditNote += " (Offline payment marked as confirmed)";
    }

    const { error: historyError } = await admin
      .from("booking_status_history")
      .insert({
        booking_id: id,
        status: targetStatus,
        note: auditNote,
        changed_by: user.id,
      });

    // 7. Pseudo-atomicity check: if history fails, revert booking status
    if (historyError) {
      console.error("Admin history insert error:", historyError);
      
      // Rollback booking update to preserve atomicity
      const revertPayload: Record<string, string> = {
        booking_status: currentStatus,
      };
      if (updatePayload.payment_status) {
        revertPayload.payment_status = currentPaymentStatus;
      }
      
      const { error: revertError } = await admin.from("bookings").update(revertPayload).eq("id", id);
      
      if (revertError) {
        console.error("CRITICAL: Failed to rollback booking status after audit log failure:", revertError);
        return NextResponse.json({ 
          error: "CRITICAL: Audit log failed AND state rollback failed. Booking state is inconsistent. Manual intervention required.",
          inconsistent: true
        }, { status: 500 });
      }
      
      return NextResponse.json({ error: "Failed to write audit log. Booking state reverted successfully." }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: targetStatus });
  } catch (err: unknown) {
    console.error("Admin status route error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
