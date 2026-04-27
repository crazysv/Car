import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for JP Rentals. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-24 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">Legal</span>
          <h1 className="text-display-md text-white mb-4">Privacy Policy</h1>
          <p className="font-body-lg text-white/70 max-w-lg mx-auto">
            How we handle and protect your personal information.
          </p>
        </div>
      </Section>

      <Section variant="default">
        <div className="max-w-3xl mx-auto space-y-10">
          <PolicySection title="Information We Collect">
            <p>When you book a vehicle or contact us, we collect the following information:</p>
            <ul>
              <li>Full name and contact details (phone number, email)</li>
              <li>Government-issued identification (Aadhaar Card, Driving Licence) for verification at vehicle handover</li>
              <li>Pickup and delivery address</li>
              <li>Payment details (processed securely through our payment partners)</li>
              <li>Vehicle preferences and booking dates</li>
            </ul>
          </PolicySection>

          <PolicySection title="How We Use Your Information">
            <p>Your personal information is used for the following purposes:</p>
            <ul>
              <li>Processing and confirming your vehicle bookings</li>
              <li>Coordinating vehicle delivery and pickup</li>
              <li>Communicating booking confirmations, updates, and reminders via phone or WhatsApp</li>
              <li>Processing payments and refunds</li>
              <li>Verifying your identity and driving eligibility</li>
              <li>Improving our services and customer experience</li>
            </ul>
          </PolicySection>

          <PolicySection title="Information Sharing">
            <p>We do not sell, rent, or trade your personal information to third parties. Your data may be shared only with:</p>
            <ul>
              <li>Payment processors (for secure transaction processing)</li>
              <li>Law enforcement or regulatory authorities (when required by law)</li>
              <li>Insurance providers (in the event of a claim related to your rental)</li>
            </ul>
          </PolicySection>

          <PolicySection title="Data Security">
            <p>
              We take reasonable precautions to protect your personal information. Payment data is handled through
              secure, PCI-compliant payment gateways and is never stored on our servers. Identity documents
              are verified in-person at vehicle handover and are not retained digitally.
            </p>
          </PolicySection>

          <PolicySection title="Cookies and Analytics">
            <p>
              Our website may use basic analytics tools to understand traffic patterns and improve our services.
              We do not use tracking cookies for advertising purposes.
            </p>
          </PolicySection>

          <PolicySection title="Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction or deletion of your personal data</li>
              <li>Withdraw consent for marketing communications at any time</li>
            </ul>
          </PolicySection>

          <PolicySection title="Contact Us">
            <p>
              If you have any questions about this Privacy Policy or your personal data, please contact us:
            </p>
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
