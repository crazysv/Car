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

  // --- Persist locally until real backend exists ---
  try {
    const stored = JSON.parse(localStorage.getItem("jp_bookings") || "[]");
    stored.push({
      ...payload,
      bookingRef: ref,
      status: payload.paymentMode === "online" ? "pending_payment" : "pending_confirmation",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("jp_bookings", JSON.stringify(stored));
  } catch {
    // localStorage may not be available in all contexts
  }

  // --- Simulate network latency (remove when real API is connected) ---
  await new Promise((r) => setTimeout(r, 1200));

  // --- Determine initial status based on payment mode ---
  const status: BookingStatus =
    payload.paymentMode === "online"
      ? "pending_payment"       // Advance payment still required
      : "pending_confirmation"; // Offline: team will call to confirm

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
}

/**
 * Creates a Razorpay order for the advance payment.
 * Will call POST /api/booking/create-order when backend is ready.
 */
export async function createPaymentOrder(
  _params: RazorpayOrderParams
): Promise<RazorpayOrderResult> {
  // TODO: Replace with actual API call
  // const res = await fetch("/api/booking/create-order", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(params),
  // });
  // return res.json();
  throw new Error("Payment integration not yet configured. Please use offline payment or contact us directly.");
}

/**
 * Verifies payment completion after Razorpay callback.
 * Will call POST /api/booking/verify-payment when backend is ready.
 */
export async function verifyPayment(
  _bookingRef: string,
  _razorpayPaymentId: string,
  _razorpayOrderId: string,
  _razorpaySignature: string
): Promise<BookingResult> {
  // TODO: Replace with actual API call
  throw new Error("Payment verification not yet configured.");
}
