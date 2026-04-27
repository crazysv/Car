import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";
import { fleet } from "@/data/fleet";
import { Section } from "@/components/section";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/button";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with JP Rentals for bookings, questions, or support. Based in Modern Valley, Kharar, serving Punjab & Haryana.",
};

export default function ContactPage() {
  const vehicleOptions = fleet.map((v) => ({
    label: `${v.name} ${v.year} ${v.variant}`,
    value: v.slug,
  }));

  return (
    <>
      {/* Page Header */}
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-24 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
            Get In Touch
          </span>
          <h1 className="text-display-md text-white mb-4">
            Contact JP Rentals
          </h1>
          <p className="font-body-lg text-white/70 max-w-[32rem] mx-auto">
            Have questions about booking, availability, or our services? We are here to help.
          </p>
        </div>
      </Section>

      {/* Contact Form + Info */}
      <Section variant="default">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant p-8 md:p-10">
              <h2 className="font-headline-md text-primary mb-8">
                Send Us a Message
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Your Name"
                    name="name"
                    placeholder="Enter your name"
                    required
                  />
                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <FormField
                  label="Interested In (Optional)"
                  name="car"
                  type="select"
                  placeholder="Select a vehicle"
                  options={vehicleOptions}
                />
                <FormField
                  label="Your Message"
                  name="message"
                  type="textarea"
                  placeholder="Tell us how we can help..."
                  required
                />
                <div className="pt-4">
                  <Button type="submit" size="lg" className="w-full justify-center" variant="primary">
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Phone */}
            <ContactInfoCard
              icon="call"
              title="Call Us"
              description="Available for bookings and support"
            >
              <a
                href={siteConfig.phoneHref}
                className="text-lg font-bold text-primary hover:text-secondary transition-colors"
              >
                {siteConfig.phoneFormatted}
              </a>
            </ContactInfoCard>

            {/* Location */}
            <ContactInfoCard
              icon="location_on"
              title="Our Location"
              description="Visit us or get free delivery"
            >
              <p className="font-body-sm font-bold text-primary">
                {siteConfig.location.fullAddress}
              </p>
            </ContactInfoCard>

            {/* Service Area */}
            <ContactInfoCard
              icon="public"
              title="Service Region"
              description="Cars available across"
            >
              <p className="font-body-sm font-bold text-primary">
                {siteConfig.location.region}
              </p>
            </ContactInfoCard>

            {/* Quick Actions */}
            <div className="bg-primary rounded-2xl p-8 text-white">
              <h3 className="font-headline-sm text-white mb-6">
                Quick Actions
              </h3>
              <div className="space-y-4">
                <Button
                  href={siteConfig.phoneHref}
                  variant="secondary"
                  size="lg"
                  className="w-full justify-center"
                >
                  Call Now
                </Button>
                <Button
                  href="/book"
                  variant="outline"
                  size="lg"
                  className="w-full justify-center !text-white !border-white/20 hover:!bg-white/5"
                >
                  Book a Car
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Reassurance */}
      <Section variant="sand">
        <div className="text-center max-w-[32rem] mx-auto">
          <h2 className="font-headline-lg text-primary mb-4">
            We Are Here for You
          </h2>
          <p className="font-body-lg text-outline">
            From booking to delivery and throughout your rental &mdash; JP Rentals provides complete support for a smooth experience.
          </p>
        </div>
      </Section>
    </>
  );
}

function ContactInfoCard({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-low rounded-xl shadow-sm border border-outline-variant p-6 hover:border-secondary transition-all duration-300">
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        <div>
          <h3 className="font-headline-sm text-primary mb-1">{title}</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-outline mb-3">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
