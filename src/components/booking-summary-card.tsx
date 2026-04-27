import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import type { Vehicle } from "@/data/fleet";
import { Button } from "./button";

interface BookingSummaryCardProps {
  vehicle?: Vehicle;
}

export function BookingSummaryCard({ vehicle }: BookingSummaryCardProps) {
  const dailyRate = vehicle?.pricePerDay ?? 0;

  return (
    <div className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
      {/* Header */}
      <div className="bg-primary p-6">
        <h3 className="font-headline-md text-white">Booking Summary</h3>
        {vehicle && (
          <p className="font-body-sm font-bold text-white/70 mt-1">
            {vehicle.name} {vehicle.year} &middot; {vehicle.variant}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="p-6 md:p-8 space-y-6">
        {vehicle && (
          <div className="flex items-baseline justify-between pb-6 border-b border-outline-variant">
            <span className="font-body-sm text-outline">Price per day</span>
            <span className="text-display-sm font-black text-primary">
              &#8377;{dailyRate.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        <div className="space-y-4">
          <SummaryRow
            label="Advance Payment"
            value={`${siteConfig.booking.advancePercent}% of total`}
          />
          <SummaryRow
            label="Security Deposit"
            value={`\u20B9${siteConfig.booking.securityDeposit.toLocaleString("en-IN")} (refundable)`}
          />
          <SummaryRow label="Payment Modes" value="Online & Offline" />
          <SummaryRow
            label="Documents"
            value={siteConfig.booking.requiredDocuments.join(" & ")}
          />
          <SummaryRow label="Fuel Policy" value="Paid by customer" />
          <SummaryRow label="Delivery" value="Free delivery available" />
          <SummaryRow
            label="Cancellation"
            value={`Within ${siteConfig.booking.cancellationHours} hours`}
          />
        </div>

        {/* Location */}
        <div className="pt-6 border-t border-outline-variant">
          <p className="text-xs font-bold uppercase tracking-widest text-outline flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {siteConfig.location.name} &middot; {siteConfig.location.region}
          </p>
        </div>

        {/* CTA */}
        <Button
          href={vehicle ? `/book?car=${vehicle.slug}` : "/book"}
          variant="primary"
          size="lg"
          className="w-full justify-center mt-2"
        >
          Proceed to Booking
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-body-sm text-outline">{label}</span>
      <span className="font-body-sm font-bold text-primary text-right">
        {value}
      </span>
    </div>
  );
}
