import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Section } from "@/components/section";
import { AdminActions } from "./admin-actions";

export const metadata: Metadata = {
  title: "Admin Booking Details | JP Rentals",
  description: "Manage booking details and operations.",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function formatDateFull(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const bookingStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending_payment: { label: "Pending Payment",   color: "text-amber-800", bg: "bg-amber-100" },
  advance_paid:    { label: "Advance Paid",      color: "text-green-800", bg: "bg-green-100" },
  confirmed:       { label: "Confirmed",         color: "text-green-800", bg: "bg-green-100" },
  active:          { label: "Active Rental",     color: "text-blue-800",  bg: "bg-blue-100" },
  completed:       { label: "Completed",         color: "text-slate-800", bg: "bg-slate-200" },
  cancel_requested:{ label: "Cancel Requested",  color: "text-orange-800",bg: "bg-orange-100" },
  cancelled:       { label: "Cancelled",         color: "text-red-800",   bg: "bg-red-100" },
  refund_pending:  { label: "Refund Pending",    color: "text-amber-800", bg: "bg-amber-100" },
  refunded:        { label: "Refunded",          color: "text-slate-800", bg: "bg-slate-200" },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  unpaid:              { label: "Unpaid",              color: "text-amber-700" },
  order_created:       { label: "Payment Initiated",   color: "text-amber-700" },
  paid:                { label: "Paid",                color: "text-green-700" },
  verification_failed: { label: "Verification Failed", color: "text-red-700" },
  refunded:            { label: "Refunded",            color: "text-slate-600" },
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AdminBookingDetail {
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
    full_name: string;
    phone: string;
  };
}

interface StatusHistoryRow {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
  profiles?: { email: string };
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
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Use service_role to bypass RLS for admin workflows
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: booking, error } = await adminClient
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

  const b = booking as unknown as AdminBookingDetail;

  // Fetch status history
  const { data: history } = await adminClient
    .from("booking_status_history")
    .select("id, status, note, created_at, profiles(email)")
    .eq("booking_id", id)
    .order("created_at", { ascending: false });

  const historyRows = (history ?? []) as unknown as StatusHistoryRow[];

  // Fetch payments
  const { data: payments } = await adminClient
    .from("booking_payments")
    .select("id, razorpay_order_id, razorpay_payment_id, amount, currency, status, paid_at, created_at")
    .eq("booking_id", id)
    .order("created_at", { ascending: false });

  const paymentRows = (payments ?? []) as PaymentRow[];

  const bs = bookingStatusConfig[b.booking_status] ?? bookingStatusConfig.pending_payment;
  const ps = paymentStatusConfig[b.payment_status] ?? paymentStatusConfig.unpaid;
  const remainingBal = b.rental_total - b.advance_amount;

  return (
    <>
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-20 max-w-4xl mx-auto px-4 md:px-0">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 text-secondary hover:text-white font-label-bold uppercase tracking-widest text-xs transition-colors mb-6"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Admin Bookings
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
                {b.booking_ref}
              </span>
              <h1 className="text-display-md text-white mb-4">Booking Details</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${bs.bg} ${bs.color}`}>
                  {bs.label}
                </span>
                <span className="text-white/60 font-body-md">|</span>
                <span className={`font-label-bold uppercase tracking-wider ${ps.color}`}>
                  Payment: {ps.label}
                </span>
              </div>
            </div>
            
            <div className="bg-surface-container-low/20 p-4 rounded-xl border border-white/10 backdrop-blur-sm text-right">
              <div className="text-white/70 text-sm mb-1 font-body-md">Rental Total</div>
              <div className="text-display-sm text-white">&#8377;{fmt(b.rental_total)}</div>
            </div>
          </div>
        </div>
      </Section>

      <Section variant="default" className="min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Admin Operations Panel */}
          <AdminActions 
            bookingId={b.id} 
            currentBookingStatus={b.booking_status}
            currentPaymentStatus={b.payment_status}
            paymentMode={b.payment_mode}
          />

          {/* Customer & Vehicle Information */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant">
              <h3 className="font-headline-sm text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">person</span>
                Customer Info
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-outline mb-1">Full Name</div>
                  <div className="font-headline-sm text-primary">{b.customer_name || b.profiles.full_name || "\u2014"}</div>
                </div>
                <div>
                  <div className="text-sm text-outline mb-1">Email</div>
                  <div className="font-body-lg text-primary">{b.customer_email || b.profiles.email || "\u2014"}</div>
                </div>
                <div>
                  <div className="text-sm text-outline mb-1">Phone</div>
                  <div className="font-body-lg text-primary">{b.customer_phone || b.profiles.phone || "\u2014"}</div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant">
              <h3 className="font-headline-sm text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">directions_car</span>
                Vehicle Info
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-outline mb-1">Vehicle</div>
                  <div className="font-headline-sm text-primary">{b.vehicles.name} {b.vehicles.year}</div>
                </div>
                <div>
                  <div className="text-sm text-outline mb-1">Category / Fuel</div>
                  <div className="font-body-lg text-primary">{b.vehicles.category} &bull; {b.vehicles.fuel_type}</div>
                </div>
                <div>
                  <div className="text-sm text-outline mb-1">Daily Rate</div>
                  <div className="font-body-lg text-primary">&#8377;{fmt(b.vehicles.price_per_day)} / day</div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant">
            <h3 className="font-headline-sm text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">event</span>
              Schedule & Location
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-outline mb-1">Pickup Date</div>
                <div className="font-body-lg text-primary">{formatDateFull(b.pickup_date)}</div>
              </div>
              <div>
                <div className="text-sm text-outline mb-1">Return Date</div>
                <div className="font-body-lg text-primary">{formatDateFull(b.return_date)}</div>
              </div>
              <div>
                <div className="text-sm text-outline mb-1">Location</div>
                <div className="font-body-lg text-primary">{b.pickup_location}</div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant">
            <h3 className="font-headline-sm text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">payments</span>
              Payment Summary
            </h3>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
                <span className="text-outline">Payment Mode</span>
                <span className="font-label-bold uppercase text-primary">
                  {b.payment_mode === "offline" ? "Pay at Pickup" : "Online Advance"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
                <span className="text-outline">Rental Total</span>
                <span className="font-body-lg text-primary">&#8377;{fmt(b.rental_total)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
                <span className="text-outline">Advance Required (35%)</span>
                <span className="font-body-lg text-primary">&#8377;{fmt(b.advance_amount)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
                <span className="text-outline">Refundable Deposit</span>
                <span className="font-body-lg text-primary">&#8377;{fmt(b.security_deposit)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-headline-sm text-primary">Remaining Balance</span>
                <span className="font-headline-sm text-secondary">
                  &#8377;{fmt(remainingBal)}
                </span>
              </div>
            </div>
          </div>

          {/* Audit & Logs Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Payment Records */}
            <div>
              <h3 className="font-headline-sm text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                Payment Attempts
              </h3>
              {paymentRows.length === 0 ? (
                <div className="text-sm text-outline py-4 px-6 bg-surface-container-lowest border border-outline-variant rounded-2xl">
                  No payment records found.
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentRows.map((pr) => {
                    const rowStatus = paymentStatusConfig[pr.status] ?? paymentStatusConfig.unpaid;
                    return (
                      <div key={pr.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 text-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-bold tracking-wide uppercase text-[11px] ${rowStatus.color}`}>
                            {rowStatus.label}
                          </span>
                          <span className="font-headline-sm text-primary">&#8377;{fmt(pr.amount)}</span>
                        </div>
                        {pr.razorpay_order_id && (
                          <div className="text-outline font-mono text-[11px] mb-1 break-all">
                            Order: {pr.razorpay_order_id}
                          </div>
                        )}
                        {pr.razorpay_payment_id && (
                          <div className="text-outline font-mono text-[11px] mb-2 break-all">
                            Pay: {pr.razorpay_payment_id}
                          </div>
                        )}
                        <div className="text-[11px] text-outline/70">
                          {new Date(pr.created_at).toLocaleString("en-IN")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status History */}
            <div>
              <h3 className="font-headline-sm text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">history</span>
                Status Audit Trail
              </h3>
              {historyRows.length === 0 ? (
                <div className="text-sm text-outline py-4 px-6 bg-surface-container-lowest border border-outline-variant rounded-2xl">
                  No status history found.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyRows.map((hr) => {
                    const statusLabel = bookingStatusConfig[hr.status]?.label ?? hr.status;
                    return (
                      <div key={hr.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 text-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-primary">{statusLabel}</span>
                        </div>
                        {hr.note && (
                          <div className="text-outline mb-2 p-2 bg-surface-container-low rounded-lg italic">
                            {hr.note}
                          </div>
                        )}
                        <div className="flex justify-between text-[11px] text-outline/70">
                          <span>{new Date(hr.created_at).toLocaleString("en-IN")}</span>
                          <span>{hr.profiles?.email || "System"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </Section>
    </>
  );
}
