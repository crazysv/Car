import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Admin Bookings | JP Rentals",
  description: "Manage all customer bookings.",
};

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

interface AdminBookingRow {
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
  profiles: {
    email: string;
    full_name: string;
    phone: string;
  };
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const queryText = q?.toLowerCase() || "";

  // Use service_role to bypass RLS and fetch all bookings
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: bookings, error } = await adminClient
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
      vehicles (name, year, slug),
      profiles (email, full_name, phone)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin fetch bookings failed:", error);
    return (
      <Section variant="default">
        <div className="max-w-4xl mx-auto py-12 text-center text-red-600">
          Failed to load bookings. Check server logs.
        </div>
      </Section>
    );
  }

  const rows = (bookings ?? []) as unknown as AdminBookingRow[];

  // Filter in-memory for search query across multiple fields
  const filteredRows = rows.filter((b) => {
    if (!queryText) return true;
    const vName = b.vehicles?.name?.toLowerCase() || "";
    const email = b.profiles?.email?.toLowerCase() || "";
    const phone = b.profiles?.phone?.toLowerCase() || "";
    const fullName = b.profiles?.full_name?.toLowerCase() || "";
    const ref = b.booking_ref.toLowerCase();

    return (
      ref.includes(queryText) ||
      vName.includes(queryText) ||
      email.includes(queryText) ||
      phone.includes(queryText) ||
      fullName.includes(queryText)
    );
  });

  return (
    <>
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-20 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
            Operations
          </span>
          <h1 className="text-display-md text-white mb-3">Admin Dashboard</h1>
          <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
            Manage all customer bookings, track payments, and update rental statuses.
          </p>
        </div>
      </Section>

      <Section variant="default" className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Search Form */}
          <div className="mb-8 flex items-center justify-between">
            <form className="flex gap-2 w-full max-w-[28rem]" method="GET" action="/admin/bookings">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search by ref, email, phone, vehicle..."
                className="flex-1 bg-surface-container-low border border-outline-variant rounded-full px-4 py-2 font-body-md text-primary placeholder:text-outline focus:outline-none focus:border-secondary transition-colors"
              />
              <button
                type="submit"
                className="bg-secondary text-primary font-label-bold px-6 py-2 rounded-full hover:bg-secondary-fixed transition-colors"
              >
                Search
              </button>
              {q && (
                <Link
                  href="/admin/bookings"
                  className="bg-surface-container-high text-primary font-label-bold px-6 py-2 rounded-full hover:bg-surface-container transition-colors"
                >
                  Clear
                </Link>
              )}
            </form>
          </div>

          <div className="flex flex-col gap-4">
            {filteredRows.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-lowest border border-outline-variant border-dashed rounded-3xl">
                <span className="material-symbols-outlined text-[48px] text-outline mb-4">
                  search_off
                </span>
                <h3 className="font-headline-sm text-primary mb-2">No bookings found</h3>
                <p className="text-outline">Try adjusting your search criteria.</p>
              </div>
            ) : (
              filteredRows.map((booking) => {
                const bs = bookingStatusConfig[booking.booking_status] ?? bookingStatusConfig.pending_payment;
                const ps = paymentStatusConfig[booking.payment_status] ?? paymentStatusConfig.unpaid;

                return (
                  <Link
                    key={booking.id}
                    href={`/admin/bookings/${booking.id}`}
                    className="block bg-surface-container-low rounded-2xl border border-outline-variant hover:border-secondary/40 hover:shadow-md transition-all duration-200 overflow-hidden group"
                  >
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="font-label-bold text-xs uppercase tracking-widest text-outline">
                            {booking.booking_ref}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bs.color}`}>
                            <span className="material-symbols-outlined text-[14px]">{bs.icon}</span>
                            {bs.label}
                          </span>
                          <span className={`text-xs font-bold uppercase tracking-wider ${ps.color}`}>
                            &bull; {ps.label}
                          </span>
                        </div>
                        <h3 className="font-headline-md text-primary mb-1">
                          {booking.vehicles.name} {booking.vehicles.year}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-outline mb-2">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                            {formatDate(booking.pickup_date)} - {formatDate(booking.return_date)}
                          </span>
                        </div>
                        <div className="text-sm text-outline font-body-md flex items-center gap-4">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">person</span>
                            {booking.profiles?.full_name || "Unknown"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">mail</span>
                            {booking.profiles?.email}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">call</span>
                            {booking.profiles?.phone || "No phone"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-outline mb-1">Total</div>
                          <div className="font-headline-md text-primary">&#8377;{fmt(booking.rental_total)}</div>
                        </div>
                        <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors text-[24px]">
                          chevron_right
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
