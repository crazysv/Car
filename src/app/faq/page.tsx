import type { Metadata } from "next";
import { faqData, faqCategories, getFAQsByCategory } from "@/data/faq";
import { siteConfig } from "@/data/site-config";
import { Section } from "@/components/section";
import { AccordionGroup } from "@/components/accordion";
import { Button } from "@/components/button";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Find answers to common questions about JP Rentals - booking, payment, documents, delivery, cancellation, and more.",
};

export default function FAQPage() {
  return (
    <>
      {/* Page Header */}
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-24 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
            Help & Support
          </span>
          <h1 className="text-display-md text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
            Everything you need to know about renting a car from JP Rentals.
          </p>
        </div>
      </Section>

      {/* FAQ Sections */}
      <Section variant="default">
        <div className="max-w-3xl mx-auto space-y-12">
          {faqCategories.map((category) => {
            const items = getFAQsByCategory(category);
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <h2 className="font-headline-lg text-primary mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-secondary rounded-full" />
                  {category}
                </h2>
                <AccordionGroup
                  items={items.map((f) => ({
                    question: f.question,
                    answer: f.answer,
                  }))}
                />
              </div>
            );
          })}
        </div>
      </Section>

      {/* Need Help */}
      <Section variant="sand">
        <div className="text-center max-w-[32rem] mx-auto">
          <h2 className="font-headline-lg text-primary mb-4">
            Still Have Questions?
          </h2>
          <p className="font-body-lg text-outline mb-8">
            Our team is happy to help. Call us directly or send us a message.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href={siteConfig.phoneHref} variant="primary" size="lg">
              Call {siteConfig.phoneFormatted}
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Contact Us
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
