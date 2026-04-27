import type { Metadata } from "next";
import { policyData } from "@/data/policy";
import { siteConfig } from "@/data/site-config";
import { Section } from "@/components/section";
import { Button } from "@/components/button";

export const metadata: Metadata = {
  title: "Rental Policy",
  description:
    "Understand JP Rentals booking terms, advance payment, security deposit, cancellation policy, and document requirements.",
};


export default function PolicyPage() {
  return (
    <>
      {/* Page Header */}
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-24 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
            Transparency First
          </span>
          <h1 className="text-display-md text-white mb-4">
            Rental Policy & Terms
          </h1>
          <p className="font-body-lg text-white/70 max-w-lg mx-auto">
            Clear rules for a smooth rental experience. No hidden charges, no surprises.
          </p>
        </div>
      </Section>

      {/* Policy Sections */}
      <Section variant="default">
        <div className="max-w-3xl mx-auto space-y-8">
          {policyData.map((section) => (
            <div
              key={section.id}
              className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant p-8 md:p-10"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">{section.icon}</span>
                </div>
                <h2 className="font-headline-lg text-primary mt-1">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-4 md:ml-[64px]">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 font-body-lg text-outline leading-relaxed"
                  >
                    <span className="material-symbols-outlined text-secondary mt-1 text-[20px] shrink-0">check</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Help */}
      <Section variant="sand">
        <div className="text-center max-w-lg mx-auto">
          <h2 className="font-headline-lg text-primary mb-4">
            Need Clarification?
          </h2>
          <p className="font-body-lg text-outline mb-8">
            If you have any questions about our rental terms, feel free to reach out. We are happy to help.
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
