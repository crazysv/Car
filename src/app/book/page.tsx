import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { siteConfig } from "@/data/site-config";
import { Section, SectionHeader } from "@/components/section";
import { BookingForm } from "@/components/booking-form";
import { AccordionGroup } from "@/components/accordion";

export const metadata: Metadata = {
  title: "Book a Car",
  description:
    "Complete your car rental booking with JP Rentals. Easy process, online payment, free delivery in Kharar, Punjab & Haryana.",
};

export default function BookPage() {
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      {/* Page Header */}
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-24 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
            Secure Booking
          </span>
          <h1 className="text-display-md text-white mb-4">
            Complete Your Booking
          </h1>
          <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
            Simple process. Free delivery. Secure online payment.
          </p>
        </div>
      </Section>

      {/* Booking Form (client component with Suspense for useSearchParams) */}
      <Section variant="default">
        <Suspense fallback={<BookingFormSkeleton />}>
          <BookingForm />
        </Suspense>
      </Section>

      {/* Help */}
      <Section variant="sand">
        <SectionHeader
          label="Need Help?"
          title="Common Booking Questions"
        />
        <div className="max-w-3xl mx-auto">
          <AccordionGroup
            items={[
              {
                question: "Do I need to pay the full amount online?",
                answer: `No, you only need to pay a ${siteConfig.booking.advancePercent}% advance to confirm your booking. The remaining rental amount and the \u20B9${siteConfig.booking.securityDeposit.toLocaleString("en-IN")} refundable security deposit are paid at the time of vehicle handover.`,
              },
              {
                question: "What documents are required?",
                answer: `You must present your original Aadhaar Card and a valid Driving Licence at the time of handover. Both documents will be verified.`,
              },
              {
                question: "What if my online payment fails?",
                answer: `If your advance payment fails, your booking request is still saved. You can retry the payment from your 'My Bookings' page or contact our support team.`,
              },
              {
                question: "How can I contact JP Rentals directly?",
                answer: `You can reach us at ${siteConfig.phoneFormatted} via phone call or WhatsApp. We are happy to help with any questions.`,
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}

function BookingFormSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 animate-pulse">
      <div className="lg:col-span-2">
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-8 md:p-10 space-y-6">
          <div className="h-8 w-40 bg-surface-container rounded" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-12 bg-surface-container rounded-lg" />
            <div className="h-12 bg-surface-container rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-12 bg-surface-container rounded-lg" />
            <div className="h-12 bg-surface-container rounded-lg" />
          </div>
          <div className="h-12 bg-surface-container rounded-lg" />
          <div className="h-12 bg-surface-container rounded-lg" />
          <div className="h-14 bg-primary/20 rounded-lg" />
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant h-96" />
      </div>
    </div>
  );
}

