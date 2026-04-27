import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions for JP Rentals self-drive car rental service in Kharar, Punjab & Haryana.",
};

export default function TermsPage() {
  return (
    <>
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-24 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">Legal</span>
          <h1 className="text-display-md text-white mb-4">Terms and Conditions</h1>
          <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
            Please read these terms carefully before using our services.
          </p>
        </div>
      </Section>

      <Section variant="default">
        <div className="max-w-3xl mx-auto space-y-10">
          <PolicySection title="1. Eligibility">
            <p>To rent a vehicle from {siteConfig.brand}, you must:</p>
            <ul>
              <li>Be at least 21 years of age</li>
              <li>Hold a valid Indian Driving Licence</li>
              <li>Provide a valid Aadhaar Card for identity verification</li>
              <li>Both documents must be original and presented at vehicle handover</li>
            </ul>
          </PolicySection>

          <PolicySection title="2. Booking and Payment">
            <ul>
              <li>A {siteConfig.booking.advancePercent}% advance payment is required to confirm your booking</li>
              <li>A refundable security deposit of &#8377;{siteConfig.booking.securityDeposit.toLocaleString("en-IN")} is collected at vehicle handover</li>
              <li>The remaining balance is payable at the time of vehicle delivery or pickup</li>
              <li>We accept both online (UPI, card, net banking) and offline (cash, card at delivery) payments</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. Vehicle Usage">
            <p>The rented vehicle must be used responsibly. The following are strictly prohibited:</p>
            <ul>
              <li>Sub-renting or allowing unauthorised persons to drive the vehicle</li>
              <li>Using the vehicle for racing, towing, or any illegal activity</li>
              <li>Driving under the influence of alcohol or drugs</li>
              <li>Crossing state or international borders without prior written approval</li>
              <li>Smoking inside the vehicle</li>
              <li>Carrying hazardous or illegal materials</li>
            </ul>
          </PolicySection>

          <PolicySection title="4. Fuel Policy">
            <p>
              Fuel costs are the responsibility of the customer. The vehicle will be handed over with a
              certain fuel level, and it must be returned with the same fuel level. Any shortfall may be
              charged at prevailing market rates plus a convenience fee.
            </p>
          </PolicySection>

          <PolicySection title="5. Mileage and Charges">
            <p>
              Standard rental rates include a reasonable daily mileage allowance. Excessive mileage beyond
              the agreed limit may incur additional charges as communicated at the time of booking.
            </p>
          </PolicySection>

          <PolicySection title="6. Damage and Liability">
            <ul>
              <li>The customer is responsible for any damage to the vehicle during the rental period</li>
              <li>Minor scratches and wear consistent with normal use are acceptable</li>
              <li>Major damage, accidents, or mechanical abuse will be assessed, and repair costs will be deducted from the security deposit or billed separately</li>
              <li>In case of an accident, the customer must inform {siteConfig.brand} immediately and file a police report if necessary</li>
              <li>Traffic fines and challans incurred during the rental period are the customer&apos;s responsibility</li>
            </ul>
          </PolicySection>

          <PolicySection title="7. Late Returns">
            <p>
              The vehicle must be returned at the agreed date and time. Late returns may be charged on a
              pro-rata basis. If the vehicle is not returned within 4 hours of the scheduled time without prior
              intimation, additional daily charges will apply.
            </p>
          </PolicySection>

          <PolicySection title="8. Right to Refuse">
            <p>
              {siteConfig.brand} reserves the right to refuse service to any individual at its sole discretion,
              including but not limited to cases where valid identification cannot be produced, the customer
              appears unfit to drive, or there is a history of vehicle misuse.
            </p>
          </PolicySection>

          <PolicySection title="9. Limitation of Liability">
            <p>
              {siteConfig.brand} shall not be held liable for any indirect, incidental, or consequential damages
              arising from the use or inability to use the rented vehicle, including loss of business, personal
              injury (except due to our negligence), or trip delays.
            </p>
          </PolicySection>

          <PolicySection title="10. Governing Law">
            <p>
              These terms and conditions are governed by the laws of India. Any disputes arising from or
              related to these terms shall be subject to the exclusive jurisdiction of the courts in
              Mohali, Punjab.
            </p>
          </PolicySection>

          <PolicySection title="Contact">
            <p>For any questions about these terms, please contact us:</p>
            <ul>
              <li>Phone: {siteConfig.phoneFormatted}</li>
              <li>Email: {siteConfig.email}</li>
              <li>Address: {siteConfig.location.fullAddress}</li>
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
