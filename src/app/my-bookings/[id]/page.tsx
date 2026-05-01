import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Section } from "@/components/section";
import { PaymentRetryButton } from "@/components/payment-retry-button";
import { CancelBookingButton } from "@/components/cancel-booking-button";

export const metadata: Metadata = {
  title: "Booking Details | JP Rentals",
  description: "View your booking details, payment status, and history.",
};

/* ------------------------------------------------------------------ */
/*  Status display helpers                                             */
/* ------------------------------------------------------------------ */

const bookingStatusConfig: Record<string, { label: string; icon: string; color: string }> = {
  pending_payment: { label: "Pending",      icon: "hourglass_top",  color: "bg-amber-100 text-amber-800" },
  advance_paid:    { label: "Advance Paid", icon: "verified",       color: "bg-green-100 text-green-800" },
  confirmed:       { label: "Confirmed",    icon: "verified",       color: "bg-green-100 text-green-800" },
  active:          { label: "Active",       icon: "directions_car", color: "bg-blue-100 text-blue-800" },
  completed:       { label: "Completed",    icon: "check_circle",   color: "bg-slate-100 text-slate-700" },
  cancel_requested:{ label: "Cancel Req.",  icon: "pending",        color: "bg-orange-100 text-orange-800" },
  cancelled:       { label: "Cancelled",    icon: "cancel",         color: "bg-red-100 text-red-800" },
  refund_pending:  { label: "Refund Pending",icon:"schedule",       color: "bg-amber-100 text-amber-800" },
  refunded:        { label: "Refunded",     icon: "currency_rupee", color: "bg-slate-100 text-slate-700" },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  unpaid:              { label: "Unpaid",              color: "text-amber-700" },
  order_created:       { label: "Payment Initiated",   color: "text-amber-700" },
  paid:                { label: "Paid",                color: "text-green-700" },
  verification_failed: { label: "Verification Failed", color: "text-red-700" },
  refunded:            { label: "Refunded",            color: "text-slate-600" },
};

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BookingDetail {
  id: string;
  booking_ref: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  payment_mode: string;
  rental_total: number;
  advance_amount: number;
  security_deposit: number;
  booking_status: string;
  payment_status: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  notes: string | null;
  created_at: string;
  vehicles: {
    name: string;
    year: number;
    slug: string;
    category: string;
    fuel_type: string;
    price_per_day: number;
  };
  profiles: {
    email: string;
    full_name: string | null;
    phone: string | null;
  };
}

interface StatusHistoryRow {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
}

interface PaymentRow {
  id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // RLS enforces ownership natively
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_ref,
      pickup_date,
      return_date,
      pickup_location,
      payment_mode,
      rental_total,
      advance_amount,
      security_deposit,
      booking_status,
      payment_status,
      customer_name,
      customer_phone,
      customer_email,
      notes,
      created_at,
      vehicles (name, year, slug, category, fuel_type, price_per_day),
      profiles (email, full_name, phone)
    `)
    .eq("id", id)
    .single();

  if (error || !booking) {
    notFound();
  }

  const b = booking as unknown as BookingDetail;

  // Fetch status history
  const { data: history, error: historyError } = await supabase
    .from("booking_status_history")
    .select("id, status, note, created_at")
    .eq("booking_id", id)
    .order("created_at", { ascending: true });

  if (historyError) {
    console.error("Failed to fetch booking history:", historyError);
  }
  const historyRows = (history ?? []) as StatusHistoryRow[];

  // Fetch payments
  const { data: payments, error: paymentsError } = await supabase
    .from("booking_payments")
    .select("id, razorpay_order_id, razorpay_payment_id, amount, currency, status, paid_at, created_at")
    .eq("booking_id", id)
    .order("created_at", { ascending: false });

  if (paymentsError) {
    console.error("Failed to fetch booking payments:", paymentsError);
  }
  const paymentRows = (payments ?? []) as PaymentRow[];

  const bs = bookingStatusConfig[b.booking_status] ?? bookingStatusConfig.pending_payment;
  const ps = paymentStatusConfig[b.payment_status] ?? paymentStatusConfig.unpaid;

  const pickupMs = new Date(b.pickup_date).getTime();
  const returnMs = new Date(b.return_date).getTime();
  const days = Math.max(Math.ceil((returnMs - pickupMs) / 86_400_000), 1);
  const balanceDue = b.rental_total - b.advance_amount;

  const showPaymentRetry = 
    b.payment_mode === "online" && 
    b.booking_status === "pending_payment" && 
    (b.payment_status === "unpaid" || b.payment_status === "order_created");

  const canCancel = ["pending_payment", "advance_paid", "confirmed"].includes(b.booking_status);

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      
      {/* Hero */}
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-20">
          <Link
            href="/my-bookings"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors mb-6"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to My Bookings
          </Link>
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <h1 className="text-display-md text-white">
              {b.booking_ref}
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bs.color}`}>
              <span className="material-symbols-outlined text-[14px]">{bs.icon}</span>
              {bs.label}
            </span>
          </div>
          <p className="font-body-lg text-white/70">
            {b.vehicles.name} {b.vehicles.year} &middot; {b.vehicles.category} &middot; {b.vehicles.fuel_type}
          </p>
        </div>
      </Section>

      {/* Main content */}
      <Section variant="default">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left column: details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Booking details card */}
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-6 md:p-8">
              <h2 className="font-headline-md text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">info</span>
                Booking Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                <DetailRow label="Booking Ref" value={b.booking_ref} mono />
                <DetailRow label="Booked On" value={formatDateTime(b.created_at)} />
                <DetailRow label="Vehicle" value={`${b.vehicles.name} ${b.vehicles.year}`} />
                <DetailRow label="Daily Rate" value={`\u20B9${fmt(b.vehicles.price_per_day)}/day`} />
                <DetailRow label="Pickup Date" value={formatDate(b.pickup_date)} />
                <DetailRow label="Return Date" value={formatDate(b.return_date)} />
                <DetailRow label="Duration" value={`${days} day${days > 1 ? "s" : ""}`} />
                <DetailRow label="Pickup Location" value={b.pickup_location} />
                <DetailRow label="Payment Mode" value={b.payment_mode === "online" ? "Online (UPI / Card / Net Banking)" : "Offline (Cash / Card at delivery)"} />
                {b.notes && (
                  <div className="sm:col-span-2">
                    <DetailRow label="Special Requests" value={b.notes} />
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info Card */}
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-6 md:p-8">
              <h2 className="font-headline-md text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">person</span>
                Customer Info
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                <DetailRow label="Name" value={b.customer_name || b.profiles.full_name || "\u2014"} />
                <DetailRow label="Phone" value={b.customer_phone || b.profiles.phone || "\u2014"} />
                <DetailRow label="Email" value={b.customer_email || b.profiles.email || "\u2014"} />
              </div>
            </div>

            {/* Status history timeline */}
            {historyRows.length > 0 && (
              <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-6 md:p-8">
                <h2 className="font-headline-md text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">timeline</span>
                  Status History
                </h2>
                <div className="relative pl-8">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-outline-variant" />

                  <div className="space-y-6">
                    {historyRows.map((h, i) => {
                      const hc = bookingStatusConfig[h.status] ?? bookingStatusConfig.pending_payment;
                      const isLatest = i === historyRows.length - 1;
                      return (
                        <div key={h.id} className="relative">
                          {/* Dot */}
                          <div className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                            isLatest
                              ? "bg-secondary border-secondary text-white"
                              : "bg-surface border-outline-variant text-outline"
                          }`}>
                            <span className="material-symbols-outlined text-[14px]">{hc.icon}</span>
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${hc.color}`}>
                                {hc.label}
                              </span>
                              <span className="text-xs text-outline">
                                {formatDateTime(h.created_at)}
                              </span>
                            </div>
                            {h.note && (
                              <p className="text-sm text-outline leading-relaxed">
                                {h.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Payment records */}
            {paymentRows.length > 0 && (
              <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-6 md:p-8">
                <h2 className="font-headline-md text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">receipt_long</span>
                  Payment Records
                </h2>
                <div className="space-y-4">
                  {paymentRows.map((p) => {
                    const psc = paymentStatusConfig[p.status] ?? paymentStatusConfig.unpaid;
                    return (
                      <div key={p.id} className="flex flex-wrap items-start justify-between gap-4 p-4 bg-surface rounded-xl border border-outline-variant/50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${psc.color}`}>{psc.label}</span>
                            <span className="text-xs text-outline">&middot;</span>
                            <span className="text-xs text-outline">&#x20B9;{fmt(p.amount)}</span>
                          </div>
                          {p.razorpay_order_id && (
                            <p className="text-xs text-outline font-mono">
                              Order: {p.razorpay_order_id}
                            </p>
                          )}
                          {p.razorpay_payment_id && (
                            <p className="text-xs text-outline font-mono">
                              Payment: {p.razorpay_payment_id}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-xs text-outline">
                          <p>{formatDateTime(p.created_at)}</p>
                          {p.paid_at && (
                            <p className="text-green-700 font-bold">
                              Paid {formatDateTime(p.paid_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column: financial summary sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Financial summary card */}
              <div className="bg-surface-container-low rounded-2xl border border-outline-variant overflow-hidden">
                <div className="bg-primary p-6">
                  <h3 className="font-headline-md text-white">Payment Summary</h3>
                  <p className="font-body-sm font-bold text-white/70 mt-1">
                    {b.vehicles.name} {b.vehicles.year}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <SummaryRow label={`${days} day${days > 1 ? "s" : ""} \u00D7 \u20B9${fmt(b.vehicles.price_per_day)}`} value={`\u20B9${fmt(b.rental_total)}`} />

                  <div className="border-t border-outline-variant pt-4 space-y-3">
                    <SummaryRow label="Advance (35%)" value={`\u20B9${fmt(b.advance_amount)}`} highlight />
                    <SummaryRow label="Balance Due" value={`\u20B9${fmt(balanceDue)}`} />
                    <SummaryRow label="Security Deposit" value={`\u20B9${fmt(b.security_deposit)} (refundable)`} />
                  </div>

                  <div className="border-t border-outline-variant pt-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-outline">Booking Status</span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bs.color}`}>
                        <span className="material-symbols-outlined text-[14px]">{bs.icon}</span>
                        {bs.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-outline">Payment Status</span>
                      <span className={`text-sm font-bold ${ps.color}`}>{ps.label}</span>
                    </div>
                  </div>

                  {showPaymentRetry && (
                    <div className="border-t border-outline-variant pt-4">
                      <PaymentRetryButton 
                        bookingId={b.id}
                        amount={b.advance_amount}
                        customerEmail={b.profiles.email}
                        customerName={b.profiles.full_name || ""}
                        customerPhone={b.profiles.phone || ""}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-6 space-y-3">
                <h3 className="font-label-bold text-xs uppercase tracking-widest text-outline mb-4">
                  Need Help?
                </h3>
                <a
                  href={`https://wa.me/917027705618?text=${encodeURIComponent(
                    `Hi, I have a question about my booking.\n\nRef: ${b.booking_ref}\nVehicle: ${b.vehicles.name} ${b.vehicles.year}\nDates: ${b.pickup_date} to ${b.return_date}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary-container text-on-primary rounded-lg font-label-bold text-sm hover:opacity-90 transition-opacity shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  Contact on WhatsApp
                </a>
                <a
                  href="tel:+917027705618"
                  className="flex items-center justify-center gap-2 w-full py-3 border border-outline-variant text-primary rounded-lg font-label-bold text-sm hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  Call +91 70277 05618
                </a>
                
                {canCancel && (
                  <div className="pt-2">
                    <CancelBookingButton bookingId={b.id} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-widest text-outline block mb-1">
        {label}
      </span>
      <span className={`text-sm font-bold text-primary ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-outline">{label}</span>
      <span className={`text-sm text-right ${highlight ? "font-black text-secondary" : "font-bold text-primary"}`}>
        {value}
      </span>
    </div>
  );
}
