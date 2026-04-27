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

export type BookingStatus =
  | "pending_confirmation"   // Request received, waiting for team review
  | "pending_payment"        // Confirmed by team, advance payment required
  | "payment_initiated"      // Razorpay order created, awaiting completion
  | "confirmed"              // Payment received, booking confirmed
  | "cancelled";

export interface BookingResult {
  success: boolean;
  bookingRef: string;
  status: BookingStatus;
  error?: string;
}

interface StoredBooking extends BookingPayload {
  bookingRef: string;
  status: BookingStatus;
  createdAt: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
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

function readLocalBookings(): StoredBooking[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem("jp_bookings");
    return stored ? (JSON.parse(stored) as StoredBooking[]) : [];
  } catch {
    return [];
  }
}

function writeLocalBookings(bookings: StoredBooking[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem("jp_bookings", JSON.stringify(bookings));
  } catch {
    // Ignore local persistence errors in environments without storage
  }
}

export function persistBookingLocally(
  payload: BookingPayload,
  bookingRef: string,
  status: BookingStatus,
  paymentMeta?: { razorpayOrderId?: string; razorpayPaymentId?: string }
) {
  const bookings = readLocalBookings();
  const next = bookings.filter((item) => item.bookingRef !== bookingRef);

  next.push({
    ...payload,
    bookingRef,
    status,
    createdAt: new Date().toISOString(),
    razorpayOrderId: paymentMeta?.razorpayOrderId,
    razorpayPaymentId: paymentMeta?.razorpayPaymentId,
  });

  writeLocalBookings(next);
}

export function updateBookingStatusLocally(
  bookingRef: string,
  status: BookingStatus,
  paymentMeta?: { razorpayOrderId?: string; razorpayPaymentId?: string }
) {
  const bookings = readLocalBookings();
  const next = bookings.map((item) =>
    item.bookingRef === bookingRef
      ? {
          ...item,
          status,
          razorpayOrderId: paymentMeta?.razorpayOrderId ?? item.razorpayOrderId,
          razorpayPaymentId:
            paymentMeta?.razorpayPaymentId ?? item.razorpayPaymentId,
        }
      : item
  );

  writeLocalBookings(next);
}

/* ------------------------------------------------------------------ */
/*  Submission Service                                                 */
/* ------------------------------------------------------------------ */
/*  This is the single integration point for booking submission.       */
/*  Today it stores to localStorage and returns a pending status.      */
/*  Tomorrow it calls a real API endpoint.                             */
/*                                                                     */
/*  For online payments, the flow will be:                             */
/*    1. submitBooking() -> creates order, returns pending_payment     */
/*    2. initiatePayment() -> opens Razorpay checkout                  */
/*    3. confirmPayment() -> verifies with server, returns confirmed   */
/* ------------------------------------------------------------------ */

export async function submitBooking(
  payload: BookingPayload
): Promise<BookingResult> {
  const ref = generateBookingRef();
  const status: BookingStatus =
    payload.paymentMode === "online"
      ? "pending_payment"
      : "pending_confirmation";

  persistBookingLocally(payload, ref, status);

  // --- Simulate network latency (remove when real API is connected) ---
  await new Promise((r) => setTimeout(r, 1200));

  return {
    success: true,
    bookingRef: ref,
    status,
  };
}

/* ------------------------------------------------------------------ */
/*  Razorpay Integration Point                                         */
/* ------------------------------------------------------------------ */
/*  These stubs define the exact interface that will be implemented     */
/*  when Razorpay keys are available. No UI changes will be needed.    */
/* ------------------------------------------------------------------ */

export interface RazorpayOrderParams {
  bookingRef: string;
  amount: number;        // In paise (INR * 100)
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description: string;
}

export interface RazorpayOrderResult {
  orderId: string;       // Razorpay order_id
  amount: number;
  currency: string;
  bookingRef: string;
}

/**
 * Creates a Razorpay order for the advance payment.
 * Will call POST /api/booking/create-order when backend is ready.
 */
export async function createPaymentOrder(
  params: RazorpayOrderParams
): Promise<RazorpayOrderResult> {
  const res = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: params.amount,
      currency: "INR",
      receipt: params.bookingRef,
      bookingRef: params.bookingRef,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      description: params.description,
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
    bookingRef: data.bookingRef || params.bookingRef,
  };
}

/**
 * Verifies payment completion after Razorpay callback.
 * Will call POST /api/booking/verify-payment when backend is ready.
 */
export async function verifyPayment(
  bookingRef: string,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
): Promise<BookingResult> {
  const res = await fetch("/api/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookingRef,
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
