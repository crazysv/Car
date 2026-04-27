import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import type { BookingResult } from "@/lib/booking";
import { getRazorpaySecret } from "@/lib/razorpay";

export const runtime = "nodejs";

interface VerifyPaymentRequest {
  bookingRef?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

function jsonResult(result: BookingResult, status: number) {
  return NextResponse.json(result, { status });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyPaymentRequest;
    const bookingRef = body.bookingRef?.trim();
    const paymentId = body.razorpay_payment_id?.trim();
    const orderId = body.razorpay_order_id?.trim();
    const signature = body.razorpay_signature?.trim();

    if (!bookingRef || !paymentId || !orderId || !signature) {
      return jsonResult(
        {
          success: false,
          bookingRef: bookingRef ?? "",
          status: "pending_payment",
          error: "Missing payment verification fields",
        },
        400
      );
    }

    const digest = createHmac("sha256", getRazorpaySecret())
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const received = Buffer.from(signature, "utf8");
    const expected = Buffer.from(digest, "utf8");

    const isValid =
      received.length === expected.length && timingSafeEqual(received, expected);

    if (!isValid) {
      return jsonResult(
        {
          success: false,
          bookingRef,
          status: "pending_payment",
          error: "Payment signature verification failed",
        },
        400
      );
    }

    return jsonResult(
      {
        success: true,
        bookingRef,
        status: "confirmed",
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
