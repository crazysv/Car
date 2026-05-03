import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import type { BookingResult } from "@/lib/booking";
import { getRazorpaySecret } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendPaymentSuccessEmail } from "@/lib/mailer";

export const runtime = "nodejs";

interface VerifyPaymentRequest {
  bookingId?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

function jsonResult(result: BookingResult, status: number) {
  return NextResponse.json(result, { status });
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate the current user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonResult(
        {
          success: false,
          bookingRef: "",
          status: "pending_payment",
          error: "Authentication required",
        },
        401
      );
    }

    const body = (await request.json()) as VerifyPaymentRequest;
    const bookingId = body.bookingId?.trim();
    const paymentId = body.razorpay_payment_id?.trim();
    const orderId = body.razorpay_order_id?.trim();
    const signature = body.razorpay_signature?.trim();

    if (!bookingId || !paymentId || !orderId || !signature) {
      return jsonResult(
        {
          success: false,
          bookingRef: "",
          status: "pending_payment",
          error: "Missing required verification fields",
        },
        400
      );
    }

    // 2. Load the booking and verify ownership
    const admin = createAdminClient();
    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select("id, booking_ref, user_id, booking_status, payment_status, customer_name, customer_email")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return jsonResult(
        {
          success: false,
          bookingRef: "",
          status: "pending_payment",
          error: "Booking not found",
        },
        404
      );
    }

    if (booking.user_id !== user.id) {
      return jsonResult(
        {
          success: false,
          bookingRef: "",
          status: "pending_payment",
          error: "You do not have access to this booking",
        },
        403
      );
    }

    // 3. Verify the payment record belongs to this booking
    const { data: paymentRecord, error: paymentError } = await admin
      .from("booking_payments")
      .select("id, booking_id, razorpay_order_id, status, amount")
      .eq("razorpay_order_id", orderId)
      .eq("booking_id", booking.id)
      .single();

    if (paymentError || !paymentRecord) {
      return jsonResult(
        {
          success: false,
          bookingRef: booking.booking_ref,
          status: "pending_payment",
          error: "No matching payment record found for this booking",
        },
        400
      );
    }

    if (paymentRecord.status === "paid") {
      // Already verified — idempotent success
      return jsonResult(
        {
          success: true,
          bookingRef: booking.booking_ref,
          bookingId: booking.id,
          status: "advance_paid",
        },
        200
      );
    }

    // 4. Verify Razorpay signature
    const digest = createHmac("sha256", getRazorpaySecret())
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const received = Buffer.from(signature, "utf8");
    const expected = Buffer.from(digest, "utf8");

    const isValid =
      received.length === expected.length && timingSafeEqual(received, expected);

    if (!isValid) {
      // Signature invalid — update records to reflect failure
      await admin
        .from("booking_payments")
        .update({
          razorpay_payment_id: paymentId,
          status: "verification_failed",
        })
        .eq("id", paymentRecord.id);

      await admin
        .from("bookings")
        .update({ payment_status: "verification_failed" })
        .eq("id", booking.id);

      await admin.from("booking_status_history").insert({
        booking_id: booking.id,
        status: "pending_payment",
        note: `Payment signature verification failed. Order: ${orderId}`,
      });

      return jsonResult(
        {
          success: false,
          bookingRef: booking.booking_ref,
          status: "pending_payment",
          error: "Payment signature verification failed",
        },
        400
      );
    }

    // 5. Signature valid — update booking + payment records
    //    FAIL if critical DB persistence fails (do not return misleading success)
    const { error: bookingUpdateError } = await admin
      .from("bookings")
      .update({
        booking_status: "advance_paid",
        payment_status: "paid",
      })
      .eq("id", booking.id);

    if (bookingUpdateError) {
      console.error("Failed to update booking after verified payment:", bookingUpdateError);
      return jsonResult(
        {
          success: false,
          bookingRef: booking.booking_ref,
          status: "pending_payment",
          error: "Payment was verified but booking could not be updated. Please contact support.",
        },
        500
      );
    }

    // Update the payment record — this is critical for reconciliation
    const { error: paymentUpdateError } = await admin
      .from("booking_payments")
      .update({
        razorpay_payment_id: paymentId,
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", paymentRecord.id);

    if (paymentUpdateError) {
      console.error("CRITICAL: Payment record update failed after booking update:", paymentUpdateError);
      // Attempt to rollback booking status since payment record is inconsistent
      const { error: rollbackError } = await admin
        .from("bookings")
        .update({
          booking_status: booking.booking_status,
          payment_status: booking.payment_status,
        })
        .eq("id", booking.id);

      if (rollbackError) {
        console.error("CRITICAL: Booking rollback also failed. State is inconsistent:", rollbackError);
        return jsonResult(
          {
            success: false,
            bookingRef: booking.booking_ref,
            status: "pending_payment",
            error: "Payment verified but system state is inconsistent. Please contact support immediately.",
          },
          500
        );
      }

      return jsonResult(
        {
          success: false,
          bookingRef: booking.booking_ref,
          status: "pending_payment",
          error: "Payment was verified but could not be fully recorded. Please try again or contact support.",
        },
        500
      );
    }

    // Log status transition — non-critical but important for audit
    const { error: historyError } = await admin.from("booking_status_history").insert({
      booking_id: booking.id,
      status: "advance_paid",
      note: `Advance payment verified. Razorpay Payment: ${paymentId}`,
      changed_by: user.id,
    });

    if (historyError) {
      // Payment and booking are both correctly updated, but audit trail is incomplete.
      // Return success (payment IS real) but flag the audit gap so it can be investigated.
      console.error("WARNING: Payment verified and recorded, but audit log insert failed:", historyError);

      // Send success email even though audit failed — the payment is real
      sendPaymentSuccessEmail({
        toEmail: booking.customer_email || user.email!,
        customerName: booking.customer_name || user.email!.split("@")[0],
        bookingRef: booking.booking_ref,
        amount: paymentRecord.amount,
        bookingStatus: "advance_paid",
      }).catch(err => console.error("Payment success email failed:", err));

      return jsonResult(
        {
          success: true,
          bookingRef: booking.booking_ref,
          bookingId: booking.id,
          status: "advance_paid",
          error: "Payment recorded successfully, but audit log could not be written. Our team has been notified.",
        },
        200
      );
    }

    // Send success email (fire-and-forget, does not affect response)
    sendPaymentSuccessEmail({
      toEmail: booking.customer_email || user.email!,
      customerName: booking.customer_name || user.email!.split("@")[0],
      bookingRef: booking.booking_ref,
      amount: paymentRecord.amount, // already in rupees (stored as rupees in DB)
      bookingStatus: "advance_paid",
    }).catch(err => console.error("Payment success email failed:", err));

    // 6. Return DB-accurate status (advance_paid, not "confirmed")
    return jsonResult(
      {
        success: true,
        bookingRef: booking.booking_ref,
        bookingId: booking.id,
        status: "advance_paid",
      },
      200
    );
  } catch (error) {
    return jsonResult(
      {
        success: false,
        bookingRef: "",
        status: "pending_payment",
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify payment",
      },
      500
    );
  }
}
