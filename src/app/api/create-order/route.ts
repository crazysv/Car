import { NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { expireStaleBookings } from "@/lib/jobs";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface CreateOrderRequest {
  bookingId?: string;
  customerName?: string;
  customerPhone?: string;
  forceFresh?: boolean;
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate the current user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Rate Limit: 5 requests per 5 minutes (300,000 ms)
    const rateLimitKey = `create_order_${user.id}`;
    if (!checkRateLimit(rateLimitKey, 5, 300_000)) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    let body: CreateOrderRequest;
    try {
      body = (await request.json()) as CreateOrderRequest;
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    
    const bookingId = body.bookingId?.trim();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // 1.5 Cleanup stale holds
    try {
      await expireStaleBookings();
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
      return NextResponse.json(
        { error: "Unable to process payment (cleanup failed). Please try again." },
        { status: 500 }
      );
    }

    // 2. Load the booking and verify ownership
    const admin = createAdminClient();
    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select("id, booking_ref, user_id, advance_amount, payment_status, payment_mode, vehicle_id, pickup_date, return_date, booking_status")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.user_id !== user.id) {
      return NextResponse.json(
        { error: "You do not have access to this booking" },
        { status: 403 }
      );
    }

    if (booking.payment_mode !== "online") {
      return NextResponse.json(
        { error: "This booking does not use online payment" },
        { status: 400 }
      );
    }

    if (booking.booking_status === "cancelled") {
      return NextResponse.json(
        { error: "Your payment session has expired. Please create a new booking request." },
        { status: 400 }
      );
    }

    if (booking.payment_status === "paid") {
      return NextResponse.json(
        { error: "Payment has already been completed for this booking" },
        { status: 400 }
      );
    }

    // 2.5 Server-side availability re-check (Half-open interval logic: [pickupDate, returnDate))
    // Overlap: existing.pickup_date < requested.return_date AND existing.return_date > requested.pickup_date
    const blockingStatuses = ["pending_payment", "advance_paid", "confirmed", "active", "cancel_requested"];
    const { data: overlapping, error: overlapError } = await admin
      .from("bookings")
      .select("id")
      .eq("vehicle_id", booking.vehicle_id)
      .in("booking_status", blockingStatuses)
      .lt("pickup_date", booking.return_date)
      .gt("return_date", booking.pickup_date)
      .neq("id", booking.id) // Exclude current booking
      .limit(1);

    if (overlapError) {
      console.error("Availability check error:", overlapError);
      return NextResponse.json(
        { error: "Unable to verify vehicle availability. Please try again." },
        { status: 500 }
      );
    }

    if (overlapping && overlapping.length > 0) {
      return NextResponse.json(
        { error: "Vehicle is no longer available for these dates. Someone else may have booked it." },
        { status: 409 }
      );
    }

    // 3. Guard against duplicate unpaid order creation
    //    If an active unpaid payment attempt already exists, return the existing order
    //    instead of creating unlimited new Razorpay orders.
    const { data: existingPayment } = await admin
      .from("booking_payments")
      .select("id, razorpay_order_id, amount, status, created_at")
      .eq("booking_id", booking.id)
      .eq("status", "order_created")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPayment?.razorpay_order_id) {
      const orderAgeMinutes = (Date.now() - new Date(existingPayment.created_at).getTime()) / 60000;
      
      // If the order is less than 15 minutes old, it's safe to reuse (debounces double-clicks)
      // unless forceFresh is explicitly requested by the client (e.g. user clicked Retry Payment)
      if (orderAgeMinutes < 15 && !body.forceFresh) {
        return NextResponse.json({
          order_id: existingPayment.razorpay_order_id,
          amount: existingPayment.amount * 100, // Convert back to paise for Razorpay checkout
          currency: "INR",
          bookingRef: booking.booking_ref,
        });
      } else {
        // Order is stale or a fresh order was explicitly requested. Mark it as failed so it's not ambiguous.
        const { error: supersedeError } = await admin
          .from("booking_payments")
          .update({ status: "verification_failed" })
          .eq("id", existingPayment.id);

        if (supersedeError) {
          console.error("Failed to supersede previous payment attempt:", supersedeError);
          return NextResponse.json(
            { error: "Failed to supersede previous payment attempt. Please try again." },
            { status: 500 }
          );
        }
      }
    }

    // 4. Derive the payable amount from trusted DB data (never trust client amount)
    const amountInPaise = booking.advance_amount * 100;

    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: "Advance amount is too low to process" },
        { status: 400 }
      );
    }

    // 5. Create Razorpay order
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: booking.booking_ref,
      notes: {
        bookingRef: booking.booking_ref,
        bookingId: booking.id,
        customerName: body.customerName?.trim() || "",
        customerPhone: body.customerPhone?.trim() || "",
      },
    });

    // 6. Create booking_payments row — FAIL if this fails
    const { error: paymentInsertError } = await admin
      .from("booking_payments")
      .insert({
        booking_id: booking.id,
        razorpay_order_id: order.id,
        amount: booking.advance_amount,
        currency: "INR",
        status: "order_created",
      });

    if (paymentInsertError) {
      console.error("Failed to persist payment record:", paymentInsertError);
      return NextResponse.json(
        { error: "Failed to create payment record. Please try again." },
        { status: 500 }
      );
    }

    // 7. Update booking payment_status — FAIL if this fails
    //    Booking and payment row must stay aligned; do not return
    //    a Razorpay order_id if the booking row is stale.
    const { error: bookingUpdateError } = await admin
      .from("bookings")
      .update({ payment_status: "order_created" })
      .eq("id", booking.id);

    if (bookingUpdateError) {
      console.error("Failed to update booking payment status:", bookingUpdateError);

      // Rollback: mark the payment row as failed so it doesn't linger as an active order
      const { error: rollbackError } = await admin
        .from("booking_payments")
        .update({ status: "verification_failed" })
        .eq("razorpay_order_id", order.id);

      if (rollbackError) {
        console.error("CRITICAL: Could not rollback orphaned payment row:", rollbackError);
      }

      return NextResponse.json(
        { error: "Failed to update booking state. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingRef: booking.booking_ref,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order. Please try again." },
      { status: 500 }
    );
  }
}
