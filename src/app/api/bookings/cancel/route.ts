import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { sendCancellationRequestAdminEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const serverClient = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await serverClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership and fetch current status
    const { data: booking, error: fetchError } = await serverClient
      .from("bookings")
      .select("id, booking_ref, booking_status, customer_name, customer_email, customer_phone, pickup_date, return_date, vehicles(name)")
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: "Booking not found or access denied" },
        { status: 404 }
      );
    }

    const allowedStatuses = ["pending_payment", "advance_paid", "confirmed"];
    if (!allowedStatuses.includes(booking.booking_status)) {
      return NextResponse.json(
        { error: "Booking cannot be cancelled in its current state." },
        { status: 400 }
      );
    }

    // Initialize service role client to bypass RLS for updating booking status
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update status
    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        booking_status: "cancel_requested",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      throw updateError;
    }

    // Insert history record
    const { error: historyError } = await supabaseAdmin
      .from("booking_status_history")
      .insert({
        booking_id: bookingId,
        status: "cancel_requested",
        note: "Cancellation requested by customer",
      });

    if (historyError) {
      console.error("Warning: Failed to insert status history", historyError);
      
      // Attempt rollback
      const { error: revertError } = await supabaseAdmin
        .from("bookings")
        .update({
          booking_status: booking.booking_status,
          // Reverting updated_at is optional, but setting back the status is critical
        })
        .eq("id", bookingId);

      if (revertError) {
        console.error("CRITICAL: Failed to rollback booking status after audit log failure:", revertError);
        return NextResponse.json(
          { error: "CRITICAL: Audit log failed AND state rollback failed. Booking state is inconsistent." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Failed to write audit log. Cancellation reverted." },
        { status: 500 }
      );
    }

    // Send cancellation request email to admin
    sendCancellationRequestAdminEmail({
      bookingRef: booking.booking_ref,
      customerName: booking.customer_name || "Unknown",
      customerPhone: booking.customer_phone || "Unknown",
      customerEmail: booking.customer_email || "Unknown",
      vehicleName: Array.isArray(booking.vehicles) 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (booking.vehicles as any)[0]?.name 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        : ((booking.vehicles as any)?.name || "Unknown Vehicle"),
      pickupDate: booking.pickup_date,
      returnDate: booking.return_date,
      currentStatus: booking.booking_status,
    }).catch(err => console.error("Cancellation email failed:", err));

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Cancel API Error:", err);
    return NextResponse.json(
      { error: "Failed to request cancellation." },
      { status: 500 }
    );
  }
}
