import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Section } from "@/components/section";
import { Button } from "@/components/button";

export const metadata: Metadata = {
  title: "My Bookings | JP Rentals",
  description: "View and manage your JP Rentals bookings.",
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

/* ------------------------------------------------------------------ */
/*  Booking card row                                                   */
/* ------------------------------------------------------------------ */

interface BookingRow {
  id: string;
  booking_ref: string;
  pickup_date: string;
  return_date: string;
  rental_total: number;
  advance_amount: number;
  booking_status: string;
  payment_status: string;
  payment_mode: string;
  created_at: string;
  vehicles: {
    name: string;
    year: number;
    slug: string;
  };
}

function BookingCard({ booking }: { booking: BookingRow }) {
  const bs = bookingStatusConfig[booking.booking_status] ?? bookingStatusConfig.pending_payment;
  const ps = paymentStatusConfig[booking.payment_status] ?? paymentStatusConfig.unpaid;

  return (
    <Link
      href={`/my-bookings/${booking.id}`}
      className="block bg-surface-container-low rounded-2xl border border-outline-variant hover:border-secondary/40 hover:shadow-md transition-all duration-200 overflow-hidden group"
    >
      <div className="p-6 md:p-8">
        {/* Top row: ref + status */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="font-label-bold text-xs uppercase tracking-widest text-outline">
              {booking.booking_ref}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bs.color}`}>
              <span className="material-symbols-outlined text-[14px]">{bs.icon}</span>
              {bs.label}
            </span>
          </div>
          <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors text-[20px]">
            chevron_right
          </span>
        </div>

        {/* Vehicle + dates */}
        <h3 className="font-headline-md text-primary mb-1">
          {booking.vehicles.name} {booking.vehicles.year}
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-outline mb-4">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            {formatDate(booking.pickup_date)} - {formatDate(booking.return_date)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">payments</span>
            {booking.payment_mode === "online" ? "Online" : "Offline"}
          </span>
        </div>

        {/* Financial summary */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-outline-variant/50">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-outline block">Total</span>
            <span className="text-sm font-black text-primary">&#x20B9;{fmt(booking.rental_total)}</span>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-outline block">Advance</span>
            <span className="text-sm font-black text-primary">&#x20B9;{fmt(booking.advance_amount)}</span>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-outline block">Payment</span>
            <span className={`text-sm font-bold ${ps.color}`}>{ps.label}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Section grouping                                                   */
/* ------------------------------------------------------------------ */

type StatusGroup = "active" | "upcoming" | "past";

function getGroup(status: string): StatusGroup {
  if (["active"].includes(status)) return "active";
  if (["pending_payment", "advance_paid", "confirmed"].includes(status)) return "upcoming";
  return "past";
}

const groupLabels: Record<StatusGroup, { title: string; icon: string }> = {
  active:   { title: "Active Rentals",          icon: "directions_car" },
  upcoming: { title: "Upcoming & Pending",      icon: "event_upcoming" },
  past:     { title: "Past & Cancelled",        icon: "history" },
};

const groupOrder: StatusGroup[] = ["active", "upcoming", "past"];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // ProtectedLayout handles redirect
  }

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_ref,
      pickup_date,
      return_date,
      rental_total,
      advance_amount,
      booking_status,
      payment_status,
      payment_mode,
      created_at,
      vehicles (name, year, slug)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch bookings:", error);
    return (
      <>
        <Section variant="dark" className="!py-0">
          <div className="py-14 md:py-20 text-center">
            <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
              Your Account
            </span>
            <h1 className="text-display-md text-white mb-3">My Bookings</h1>
            <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
              Track your reservations, payment status, and rental history.
            </p>
          </div>
        </Section>
        <Section variant="default">
          <ErrorState />
        </Section>
      </>
    );
  }

  const rows = (bookings ?? []) as unknown as BookingRow[];

  // Group by status category
  const grouped: Record<StatusGroup, BookingRow[]> = {
    active: [],
    upcoming: [],
    past: [],
  };

  for (const b of rows) {
    grouped[getGroup(b.booking_status)].push(b);
  }

  return (
    <>
      {/* Hero */}
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-20 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
            Your Account
          </span>
          <h1 className="text-display-md text-white mb-3">
            My Bookings
          </h1>
          <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
            Track your reservations, payment status, and rental history.
          </p>
        </div>
      </Section>

      {/* Content */}
      <Section variant="default">
        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-12">
            {groupOrder.map((group) => {
              const items = grouped[group];
              if (items.length === 0) return null;
              const { title, icon } = groupLabels[group];
              return (
                <div key={group}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-secondary text-[24px]">{icon}</span>
                    <h2 className="font-headline-md text-primary">
                      {title}
                      <span className="ml-2 text-sm font-bold text-outline">({items.length})</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {items.map((b) => (
                      <BookingCard key={b.id} booking={b} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <div className="text-center py-16 md:py-24">
      <div className="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center mx-auto mb-8">
        <span className="material-symbols-outlined text-[48px] text-outline">
          directions_car
        </span>
      </div>
      <h2 className="font-headline-lg text-primary mb-3">
        No Bookings Yet
      </h2>
      <p className="font-body-lg text-outline mb-8 max-w-[28rem] mx-auto">
        You haven&apos;t made any bookings. Browse our premium fleet and book
        your first self-drive rental today.
      </p>
      <Button href="/fleet" size="lg">
        <span className="material-symbols-outlined text-[20px]">search</span>
        Browse Fleet
      </Button>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="text-center py-16 md:py-24">
      <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-8">
        <span className="material-symbols-outlined text-[48px] text-red-400">
          error
        </span>
      </div>
      <h2 className="font-headline-lg text-primary mb-3">
        Unable to Load Bookings
      </h2>
      <p className="font-body-lg text-outline mb-8 max-w-[28rem] mx-auto">
        We couldn&apos;t retrieve your bookings right now. Please try again
        shortly or contact support if the issue persists.
      </p>
      <Button href="/my-bookings" size="lg" variant="outline">
        <span className="material-symbols-outlined text-[20px]">refresh</span>
        Try Again
      </Button>
    </div>
  );
}
