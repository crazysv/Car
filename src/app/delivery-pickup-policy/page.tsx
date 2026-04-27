import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Delivery & Pickup Policy",
  description: "Delivery and pickup policy for JP Rentals self-drive car rentals in Kharar, Punjab & Haryana.",
};

export default function DeliveryPickupPage() {
  return (
    <>
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-24 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">Policy</span>
          <h1 className="text-display-md text-white mb-4">Delivery &amp; Pickup Policy</h1>
          <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
            How vehicle delivery and return works with {siteConfig.brand}.
          </p>
        </div>
      </Section>

      <Section variant="default">
        <div className="max-w-3xl mx-auto space-y-10">
          <PolicySection title="Free Delivery">
            <p>
              We offer free vehicle delivery within Kharar and surrounding areas including Mohali,
              Zirakpur, and Chandigarh Tricity. Delivery to locations beyond this zone may incur
              additional charges, which will be communicated at the time of booking.
            </p>
          </PolicySection>

          <PolicySection title="Delivery Process">
            <ul>
              <li>Once your booking is confirmed, we will schedule delivery at your preferred location and time</li>
              <li>Our team will contact you via phone or WhatsApp to confirm delivery details</li>
              <li>At delivery, you must present your original {siteConfig.booking.requiredDocuments.join(" and ")} for verification</li>
              <li>A vehicle condition checklist will be reviewed and signed by both parties</li>
              <li>The security deposit of &#8377;{siteConfig.booking.securityDeposit.toLocaleString("en-IN")} will be collected at this time</li>
            </ul>
          </PolicySection>

          <PolicySection title="Self-Pickup">
            <p>
              If you prefer, you can pick up the vehicle directly from our location at{" "}
              {siteConfig.location.fullAddress}. Please arrive at the scheduled time with all required
              documents and payment.
            </p>
          </PolicySection>

          <PolicySection title="Vehicle Return">
            <ul>
              <li>Return the vehicle at the agreed date, time, and location</li>
              <li>The vehicle should be returned in the same condition as received</li>
              <li>Fuel level should match the level at the time of delivery</li>
              <li>Our team will inspect the vehicle and process your security deposit refund</li>
              <li>Late returns without prior notice will incur additional charges</li>
            </ul>
          </PolicySection>

          <PolicySection title="Service Hours">
            <p>
              Vehicle deliveries and pickups are available between 7:00 AM and 10:00 PM, seven days a week.
              Special timing requests can be accommodated with advance notice.
            </p>
          </PolicySection>

          <PolicySection title="Service Area">
            <p>Our primary service area covers:</p>
            <ul>
              <li>Kharar and surrounding villages</li>
              <li>Mohali (SAS Nagar)</li>
              <li>Zirakpur</li>
              <li>Chandigarh</li>
              <li>Panchkula</li>
              <li>Other locations in Punjab and Haryana (on request, charges may apply)</li>
            </ul>
          </PolicySection>

          <PolicySection title="Contact for Delivery">
            <p>To coordinate your delivery or pickup, reach out to us:</p>
            <ul>
              <li>Phone: {siteConfig.phoneFormatted}</li>
              <li>WhatsApp: {siteConfig.phoneFormatted}</li>
              <li>Email: {siteConfig.email}</li>
            </ul>
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
