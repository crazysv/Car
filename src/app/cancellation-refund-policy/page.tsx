import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description: "Cancellation and refund policy for JP Rentals car rental bookings in Kharar, Punjab & Haryana.",
};

export default function CancellationRefundPage() {
  return (
    <>
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-24 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">Policy</span>
          <h1 className="text-display-md text-white mb-4">Cancellation &amp; Refund Policy</h1>
          <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
            Our cancellation and refund terms for all bookings.
          </p>
        </div>
      </Section>

      <Section variant="default">
        <div className="max-w-3xl mx-auto space-y-10">
          <PolicySection title="Cancellation by Customer">
            <ul>
              <li>
                <strong>Within {siteConfig.booking.cancellationHours} hours of booking:</strong> Full
                refund of the advance payment will be processed
              </li>
              <li>
                <strong>More than 48 hours before pickup:</strong> 80% refund of the advance payment
              </li>
              <li>
                <strong>24 to 48 hours before pickup:</strong> 50% refund of the advance payment
              </li>
              <li>
                <strong>Less than 24 hours before pickup:</strong> No refund of the advance payment
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="Cancellation by JP Rentals">
            <p>
              In rare cases, we may need to cancel your booking due to vehicle unavailability,
              maintenance requirements, or unforeseen circumstances. In such cases:
            </p>
            <ul>
              <li>You will receive a full refund of any advance payment made</li>
              <li>We will offer an alternative vehicle of equal or higher value where possible</li>
              <li>We will notify you as early as possible via phone or WhatsApp</li>
            </ul>
          </PolicySection>

          <PolicySection title="Refund Processing">
            <ul>
              <li>Online payment refunds are processed within 5&ndash;7 business days</li>
              <li>Cash refunds are processed at the time of cancellation confirmation</li>
              <li>Refunds are credited to the original payment method used during booking</li>
            </ul>
          </PolicySection>

          <PolicySection title="Security Deposit Refund">
            <p>
              The refundable security deposit of &#8377;{siteConfig.booking.securityDeposit.toLocaleString("en-IN")} is
              returned after the vehicle is inspected and found in acceptable condition upon return. Deductions may
              apply for:
            </p>
            <ul>
              <li>Vehicle damage beyond normal wear and tear</li>
              <li>Missing fuel (below the level at handover)</li>
              <li>Excessive interior cleaning requirements</li>
              <li>Unpaid traffic challans or toll charges</li>
            </ul>
          </PolicySection>

          <PolicySection title="No-Show Policy">
            <p>
              If you fail to collect the vehicle at the scheduled time without prior communication,
              your booking will be treated as a cancellation with no refund after a 2-hour grace period.
            </p>
          </PolicySection>

          <PolicySection title="How to Cancel">
            <p>To cancel your booking, contact us through any of the following:</p>
            <ul>
              <li>Phone: {siteConfig.phoneFormatted}</li>
              <li>WhatsApp: {siteConfig.phoneFormatted}</li>
              <li>Email: {siteConfig.email}</li>
            </ul>
            <p>Please keep your booking reference number ready when contacting us.</p>
          </PolicySection>

          <p className="text-xs text-outline text-center pt-6 border-t border-outline-variant">
            Last updated: April 2026. {siteConfig.brand}, {siteConfig.location.fullAddress}.
          </p>
        </div>
      </Section>
    </>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-headline-md text-primary mb-4">{title}</h2>
      <div className="font-body-lg text-outline leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-outline">
        {children}
      </div>
    </div>
  );
}
