import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateBookingRef } from "@/lib/booking";
import {
  sendNewBookingAdminEmail,
  sendBookingConfirmationEmail,
} from "@/lib/mailer";

export const runtime = "nodejs";

interface CreateBookingRequest {
  vehicleSlug?: string;
  pickupDate?: string;
  returnDate?: string;
  pickupLocation?: string;
  paymentMode?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate the user via session cookie
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

    // 2. Parse and validate the request body
    const body = (await request.json()) as CreateBookingRequest;

    const vehicleSlug = body.vehicleSlug?.trim();
    const pickupDate = body.pickupDate?.trim();
    const returnDate = body.returnDate?.trim();
    const pickupLocation = body.pickupLocation?.trim();
    const paymentMode = body.paymentMode?.trim();
    const customerName = body.customerName?.trim();
    const customerPhone = body.customerPhone?.trim();

    if (
      !vehicleSlug ||
      !pickupDate ||
      !returnDate ||
      !pickupLocation ||
      !paymentMode ||
      !customerName ||
      !customerPhone
    ) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    if (!["online", "offline"].includes(paymentMode)) {
      return NextResponse.json(
        { error: "Invalid payment mode" },
        { status: 400 }
      );
    }

    // 3. Look up the vehicle by slug (server-side validation)
    const admin = createAdminClient();

    const { data: vehicle, error: vehicleError } = await admin
      .from("vehicles")
      .select("id, slug, name, price_per_day")
      .eq("slug", vehicleSlug)
      .eq("is_active", true)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found or not available" },
        { status: 400 }
      );
    }

    // 4. Server-side price computation — all financial values derived server-side
    const pickupMs = new Date(pickupDate).getTime();
    const returnMs = new Date(returnDate).getTime();
    const days = Math.max(Math.ceil((returnMs - pickupMs) / 86_400_000), 1);
    const trustedTotal = vehicle.price_per_day * days;
    const trustedAdvance = Math.round(trustedTotal * 0.35); // 35% advance
    const trustedDeposit = 5000; // Business-rule constant — never trust client

    // 5. Generate booking ref and create the booking row
    const bookingRef = generateBookingRef();
    const initialBookingStatus = "pending_payment";
    const initialPaymentStatus = "unpaid";

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .insert({
        booking_ref: bookingRef,
        user_id: user.id,
        vehicle_id: vehicle.id,
        pickup_date: pickupDate,
        return_date: returnDate,
        pickup_location: pickupLocation,
        payment_mode: paymentMode,
        rental_total: trustedTotal,
        advance_amount: trustedAdvance,
        security_deposit: trustedDeposit,
        booking_status: initialBookingStatus,
        payment_status: initialPaymentStatus,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: user.email,
        notes: body.notes?.trim() || null,
      })
      .select("id, booking_ref, booking_status, payment_status")
      .single();

    if (bookingError || !booking) {
      console.error("Booking creation error:", bookingError);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    // 6. Log initial status in booking_status_history
    await admin.from("booking_status_history").insert({
      booking_id: booking.id,
      status: initialBookingStatus,
      note: `Booking created via ${paymentMode} payment mode`,
      changed_by: user.id,
    });

    // 7. Dispatch transactional emails (fire-and-forget so they don't block response)
    Promise.all([
      sendNewBookingAdminEmail({
        bookingRef: booking.booking_ref,
        customerName,
        customerPhone,
        customerEmail: user.email!,
        vehicleName: vehicle.name || vehicleSlug,
        pickupDate,
        returnDate,
        pickupLocation,
        paymentMode,
        bookingStatus: booking.booking_status,
        paymentStatus: booking.payment_status,
      }),
      sendBookingConfirmationEmail({
        toEmail: user.email!,
        customerName,
        bookingRef: booking.booking_ref,
        vehicleName: vehicle.name || vehicleSlug,
        pickupDate,
        returnDate,
        pickupLocation,
        paymentMode,
        rentalTotal: trustedTotal,
        advanceAmount: trustedAdvance,
        securityDeposit: trustedDeposit,
      }),
    ]).catch((err) => console.error("Email dispatch failed:", err));

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingRef: booking.booking_ref,
      bookingStatus: booking.booking_status,
      paymentStatus: booking.payment_status,
      rentalTotal: trustedTotal,
      advanceAmount: trustedAdvance,
    });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create booking",
      },
      { status: 500 }
    );
  }
}
