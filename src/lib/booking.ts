import { siteConfig } from "@/data/site-config";
import type { Vehicle } from "@/data/fleet";

/* ------------------------------------------------------------------ */
/*  Booking Types                                                      */
/* ------------------------------------------------------------------ */

export interface BookingPayload {
  fullName: string;
  phone: string;
  pickupDate: string;
  returnDate: string;
  vehicleSlug: string;
  vehicleName: string;
  location: string;
  paymentMode: "online" | "offline";
  message: string;
  /* Computed fields */
  days: number;
  dailyRate: number;
  rentalTotal: number;
  advanceAmount: number;
  securityDeposit: number;
}

/**
 * Frontend booking statuses — aligned with the database booking_status enum.
 * Every value here matches a real DB value so there is no mismatch
 * between what the API stores and what the UI displays.
 */
export type BookingStatus =
  | "pending_payment"   // Booking created, no payment yet (online or offline)
  | "advance_paid"      // Advance payment received and verified
  | "confirmed"         // Fully confirmed by team
  | "active"            // Rental currently in progress
  | "completed"         // Rental finished
  | "cancelled";        // Booking cancelled

export interface BookingResult {
  success: boolean;
  bookingRef: string;
  bookingId?: string;
  status: BookingStatus;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Payload Builder                                                    */
/* ------------------------------------------------------------------ */

export function buildBookingPayload(
  form: {
    fullName: string;
    phone: string;
    pickupDate: string;
    returnDate: string;
    preferredCar: string;
    location: string;
    paymentMode: string;
    message: string;
  },
  vehicle: Vehicle,
  days: number
): BookingPayload {
  const rentalTotal = vehicle.pricePerDay * days;
  const advanceAmount = Math.round(
    rentalTotal * (siteConfig.booking.advancePercent / 100)
  );

  return {
    fullName: form.fullName.trim(),
    phone: form.phone.replace(/\s/g, ""),
    pickupDate: form.pickupDate,
    returnDate: form.returnDate,
    vehicleSlug: vehicle.slug,
    vehicleName: `${vehicle.name} ${vehicle.year} ${vehicle.variant}`,
    location: form.location.trim(),
    paymentMode: form.paymentMode as "online" | "offline",
    message: form.message.trim(),
    days,
    dailyRate: vehicle.pricePerDay,
    rentalTotal,
    advanceAmount,
    securityDeposit: siteConfig.booking.securityDeposit,
  };
}

/* ------------------------------------------------------------------ */
/*  Ref Generator                                                      */
/* ------------------------------------------------------------------ */

export function generateBookingRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `JP-${ts.slice(-4)}${rand}`;
}

/* ------------------------------------------------------------------ */
/*  Submission Service — Supabase-backed                               */
/* ------------------------------------------------------------------ */

/**
 * Creates a booking in Supabase via the server-side API.
 * Requires the user to be authenticated (session cookie).
 * Returns the DB-accurate status: always "pending_payment".
 */
export async function submitBooking(
  payload: BookingPayload
): Promise<BookingResult> {
  const res = await fetch("/api/bookings/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vehicleSlug: payload.vehicleSlug,
      pickupDate: payload.pickupDate,
      returnDate: payload.returnDate,
      pickupLocation: payload.location,
      paymentMode: payload.paymentMode,
      customerName: payload.fullName,
      customerPhone: payload.phone,
      notes: payload.message || undefined,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    return {
      success: false,
      bookingRef: data.bookingRef || "",
      status: "pending_payment",
      error: data.error || "Failed to create booking",
    };
  }

  // Both online and offline bookings start as pending_payment in the DB.
  // The UI distinguishes between them using paymentMode context, not status.
  return {
    success: true,
    bookingRef: data.bookingRef,
    bookingId: data.bookingId,
    status: "pending_payment",
  };
}

/* ------------------------------------------------------------------ */
/*  Razorpay Integration                                               */
/* ------------------------------------------------------------------ */

export interface RazorpayOrderParams {
  bookingId: string;
  customerName?: string;
  customerPhone?: string;
}

export interface RazorpayOrderResult {
  orderId: string;       // Razorpay order_id
  amount: number;        // In paise
  currency: string;
  bookingRef: string;
}

/**
 * Creates a Razorpay order for the advance payment.
 * Amount is derived server-side from the booking record — never trusted from client.
 */
export async function createPaymentOrder(
  params: RazorpayOrderParams
): Promise<RazorpayOrderResult> {
  const res = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookingId: params.bookingId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
    }),
  });

  const data = (await res.json()) as
    | { order_id?: string; amount?: number; currency?: string; bookingRef?: string; error?: string }
    | undefined;

  if (!res.ok || !data?.order_id || !data.amount || !data.currency) {
    throw new Error(data?.error || "Unable to create payment order");
  }

  return {
    orderId: data.order_id,
    amount: data.amount,
    currency: data.currency,
    bookingRef: data.bookingRef || "",
  };
}

/**
 * Verifies payment completion after Razorpay callback.
 * Server authenticates user, verifies booking ownership,
 * confirms payment record linkage, and returns DB-accurate status.
 */
export async function verifyPayment(
  bookingId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
): Promise<BookingResult> {
  const res = await fetch("/api/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookingId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_signature: razorpaySignature,
    }),
  });

  const data = (await res.json()) as BookingResult;

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Payment verification failed");
  }

  return data;
}
