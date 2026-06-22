import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Section } from "@/components/section";
import { checkEmailConfiguration } from "@/lib/mailer";
import { EmailTester } from "@/components/admin/email-tester";

export const metadata: Metadata = {
  title: "Operations Dashboard | JP Rentals",
  description: "Daily operations overview.",
};

const bookingStatusConfig: Record<string, { label: string; icon: string; color: string }> = {
  pending_payment: { label: "Pending",      icon: "hourglass_top",  color: "bg-amber-100 text-amber-800" },
  advance_paid:    { label: "Advance Paid", icon: "verified",       color: "bg-green-100 text-green-800" },
  confirmed:       { label: "Confirmed",    icon: "verified",       color: "bg-green-100 text-green-800" },
  active:          { label: "Active",       icon: "directions_car", color: "bg-blue-100 text-blue-800" },
  cancel_requested:{ label: "Cancel Req.",  icon: "pending",        color: "bg-orange-100 text-orange-800" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

interface DashboardBookingRow {
  id: string;
  booking_ref: string;
  pickup_date: string;
  return_date: string;
  booking_status: string;
  payment_status: string;
  payment_mode: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  vehicles: { name: string; year: number; slug: string };
  profiles: { full_name: string; phone: string; email: string };
}

function BookingCard({ b }: { b: DashboardBookingRow }) {
  const bs = bookingStatusConfig[b.booking_status] ?? { label: b.booking_status, icon: "info", color: "bg-slate-100 text-slate-800" };
  return (
    <Link
      href={`/admin/bookings/${b.id}`}
      className="block bg-surface-container-low rounded-xl border border-outline-variant hover:border-secondary/40 hover:shadow-sm transition-all p-4 group"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-label-bold text-[10px] uppercase tracking-widest text-outline block mb-1">
            {b.booking_ref}
          </span>
          <h4 className="font-headline-sm text-primary">
            {b.vehicles?.name} {b.vehicles?.year}
          </h4>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${bs.color}`}>
          {bs.label}
        </span>
      </div>
      <div className="text-sm text-outline mb-1">
        {formatDate(b.pickup_date)} - {formatDate(b.return_date)}
      </div>
      <div className="text-sm font-label-bold text-primary truncate">
        {b.customer_name || b.profiles?.full_name} &bull; {b.customer_phone || b.profiles?.phone}
      </div>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get today in IST
  const todayIso = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const { data: rawBookings, error } = await adminClient
    .from("bookings")
    .select(`
      id, booking_ref, pickup_date, return_date, booking_status, payment_status, payment_mode,
      customer_name, customer_email, customer_phone,
      vehicles (name, year, slug),
      profiles (full_name, phone, email)
    `)
    .not("booking_status", "in", '("cancelled","refunded","completed","refund_pending")')
    .order("pickup_date", { ascending: true });

  if (error) {
    return <div className="p-8 text-red-600">Failed to load dashboard data.</div>;
  }

  const bookings = (rawBookings ?? []) as unknown as DashboardBookingRow[];

  // 1. Action Required
  const actionRequired = bookings.filter((b) => 
    b.booking_status === "cancel_requested" || 
    (b.booking_status === "pending_payment" && b.payment_mode === "offline")
  );

  // 2. Today's Operations
  const pickupsToday = bookings.filter((b) => b.pickup_date === todayIso && b.booking_status !== "active");
  const returnsToday = bookings.filter((b) => b.return_date === todayIso);

  // 3. Active Rentals
  const activeRentals = bookings.filter((b) => b.booking_status === "active");

  // 4. Vehicle Schedule (grouped by vehicle)
  const scheduleBookings = bookings.filter((b) => 
    ["advance_paid", "confirmed", "active"].includes(b.booking_status)
  );
  
  const scheduleByVehicle = scheduleBookings.reduce((acc, b) => {
    const vName = `${b.vehicles?.name} ${b.vehicles?.year}`;
    if (!acc[vName]) acc[vName] = [];
    acc[vName].push(b);
    return acc;
  }, {} as Record<string, DashboardBookingRow[]>);

  return (
    <>
      <Section variant="dark" className="!py-0">
        <div className="py-12 text-center relative flex flex-col items-center">
          <div className="absolute top-6 right-6 hidden md:block">
            <EmailTester isConfigured={checkEmailConfiguration().configured} />
          </div>
          <h1 className="text-display-sm text-white mb-2">Operations Dashboard</h1>
          <p className="font-body-lg text-white/70 mb-6 md:mb-2">
            Today is {new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full" })}
          </p>
          <div className="block md:hidden mb-4">
            <EmailTester isConfigured={checkEmailConfiguration().configured} />
          </div>
        </div>
      </Section>

      <Section variant="default" className="min-h-screen pt-12">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* ACTION REQUIRED */}
          {actionRequired.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-headline-md text-orange-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Action Required
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actionRequired.map(b => <BookingCard key={b.id} b={b} />)}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* TODAY'S OPERATIONS */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-headline-md text-primary mb-4 flex items-center gap-2 border-b border-outline-variant pb-2">
                  <span className="material-symbols-outlined text-secondary">flight_takeoff</span>
                  Pickups Today ({pickupsToday.length})
                </h2>
                {pickupsToday.length === 0 ? (
                  <p className="text-outline italic">No pickups scheduled for today.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pickupsToday.map(b => <BookingCard key={b.id} b={b} />)}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-headline-md text-primary mb-4 flex items-center gap-2 border-b border-outline-variant pb-2">
                  <span className="material-symbols-outlined text-secondary">flight_land</span>
                  Returns Today ({returnsToday.length})
                </h2>
                {returnsToday.length === 0 ? (
                  <p className="text-outline italic">No returns scheduled for today.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {returnsToday.map(b => <BookingCard key={b.id} b={b} />)}
                  </div>
                )}
              </div>
            </div>

            {/* ACTIVE RENTALS */}
            <div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6">
                <h2 className="text-xl font-headline-md text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">directions_car</span>
                  Active Rentals ({activeRentals.length})
                </h2>
                {activeRentals.length === 0 ? (
                  <p className="text-outline italic">No active rentals right now.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {activeRentals.map(b => <BookingCard key={b.id} b={b} />)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* VEHICLE SCHEDULE */}
          <div className="pt-8 border-t border-outline-variant">
            <h2 className="text-2xl font-headline-md text-primary mb-8">Upcoming Vehicle Schedule</h2>
            {Object.keys(scheduleByVehicle).length === 0 ? (
              <p className="text-outline">No upcoming bookings found.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {Object.entries(scheduleByVehicle).map(([vName, vBookings]) => (
                  <div key={vName} className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant">
                    <h3 className="font-headline-sm text-primary mb-4 border-b border-outline-variant/50 pb-2">
                      {vName}
                    </h3>
                    <div className="flex flex-col gap-3">
                      {vBookings.map(b => (
                        <Link
                          key={b.id}
                          href={`/admin/bookings/${b.id}`}
                          className="bg-white rounded-lg p-3 border border-outline-variant hover:border-secondary transition-colors text-sm"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-label-bold text-xs text-outline">{b.booking_ref}</span>
                            <span className="text-xs font-bold uppercase text-primary">
                              {bookingStatusConfig[b.booking_status]?.label}
                            </span>
                          </div>
                          <div className="text-primary mb-1">
                            {formatDate(b.pickup_date)} to {formatDate(b.return_date)}
                          </div>
                          <div className="text-outline text-xs truncate">
                            {b.customer_name || b.profiles?.full_name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </Section>
    </>
  );
}
