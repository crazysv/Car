import { NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";

export const runtime = "nodejs";

interface CreateOrderRequest {
  amount?: number;
  currency?: string;
  receipt?: string;
  bookingRef?: string;
  customerName?: string;
  customerPhone?: string;
  description?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderRequest;
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise" },
        { status: 400 }
      );
    }

    const currency = body.currency?.trim() || "INR";
    const receipt = body.receipt?.trim() || body.bookingRef?.trim();

    if (!receipt) {
      return NextResponse.json(
        { error: "Receipt is required" },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes: {
        bookingRef: body.bookingRef?.trim() || receipt,
        customerName: body.customerName?.trim() || "",
        customerPhone: body.customerPhone?.trim() || "",
        description: body.description?.trim() || "",
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingRef: body.bookingRef?.trim() || receipt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create Razorpay order";

    if (message.toLowerCase().includes("auth")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
