import Link from "next/link";
import { getFeaturedVehicles } from "@/data/fleet";
import { faqData } from "@/data/faq";
import { siteConfig } from "@/data/site-config";
import { Section, SectionHeader } from "@/components/section";
import { VehicleCard } from "@/components/vehicle-card";
import { BookingStrip } from "@/components/booking-strip";
import { ProcessSteps } from "@/components/process-steps";
import { TrustGrid } from "@/components/trust-grid";
import { AccordionGroup } from "@/components/accordion";
import { Button } from "@/components/button";

export default function Home() {
  const featured = getFeaturedVehicles();
  const previewFaqs = faqData.slice(0, 5);

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-20 bg-primary overflow-hidden">
        {/* Background Graphic */}
        <div className="absolute inset-0 z-0">
          <div className="absolute right-0 top-0 w-[60%] h-full bg-[url('https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-luminosity opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-container-max mx-auto section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 flex flex-col items-start text-left">
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-6">
                <span className="h-[2px] w-8 bg-secondary" />
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                  Premium Self-Drive
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-display-lg text-white mb-6 leading-tight">
                Drive the Best. <br />
                <span className="text-secondary-fixed">Delivered to You.</span>
              </h1>

              {/* Subheadline */}
              <p className="font-body-lg text-white/70 max-w-xl mb-12">
                Experience the freedom of the open road with our premium self-drive fleet. 
                Free delivery across Punjab &amp; Haryana, starting from &#8377;2,200/day.
              </p>

              {/* Booking Strip */}
              <div className="w-full max-w-5xl mb-8">
                <BookingStrip variant="hero" />
              </div>
              
              <p className="text-xs text-white/50 flex items-center gap-2">
                Need immediate assistance? 
                <a href={siteConfig.phoneHref} className="text-secondary-fixed font-bold hover:text-white transition-colors">
                  Call {siteConfig.phoneFormatted}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND EXPERIENCE STATEMENT */}
      <section className="bg-surface py-20 md:py-32">
        <div className="max-w-container-max mx-auto section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Text */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                  The JP Rentals Experience
                </span>
              </div>
              <h2 className="font-headline-lg text-primary mb-6">
                Premium vehicles. <br />
                Uncompromising service.
              </h2>
              <p className="font-body-lg text-outline leading-relaxed mb-8">
                JP Rentals was built with a simple belief &mdash; renting a car should
                feel as premium as owning one. From our curated fleet of
                well-maintained vehicles to free doorstep delivery across
                Kharar, every detail is designed for your comfort and
                confidence.
              </p>
              <div className="flex gap-4">
                <Button href="/contact" variant="primary" size="md">
                  Get in Touch
                </Button>
                <Button href="/fleet" variant="outline" size="md">
                  Explore Cars
                </Button>
              </div>
            </div>

            {/* Visual panel - Premium Stats */}
            <div className="grid grid-cols-2 gap-6">
              <HighlightBox icon="directions_car" value="13+" label="Premium Vehicles" />
              <HighlightBox icon="map" value="2" label="States Covered" />
              <HighlightBox icon="stars" value="Free" label="Doorstep Delivery" />
              <HighlightBox icon="support_agent" value="24/7" label="Local Support" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED FLEET */}
      <Section variant="sand">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-2xl">
            <span className="block text-xs font-bold uppercase tracking-widest text-secondary mb-3">
              Our Fleet
            </span>
            <h2 className="font-headline-lg text-primary mb-4">
              Featured Vehicles
            </h2>
            <p className="font-body-lg text-outline">
              Hand-picked premium cars available for self-drive rental. All prices are per day.
            </p>
          </div>
          <div className="mt-6 md:mt-0 hidden md:block">
            <Button href="/fleet" variant="outline" size="md">
              View All Vehicles &rarr;
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
        
        <div className="mt-10 md:hidden">
          <Button href="/fleet" variant="outline" size="md" className="w-full justify-center">
            View All Vehicles &rarr;
          </Button>
        </div>
      </Section>

      {/* HOW BOOKING WORKS */}
      <Section variant="default">
        <SectionHeader
          label="Simple Process"
          title="How Booking Works"
          description="Four simple steps from choosing your car to hitting the road."
        />
        <ProcessSteps />
      </Section>

      {/* SERVICE AREA / LOCATION */}
      <section className="bg-surface-container-highest py-24">
        <div className="max-w-container-max mx-auto section-padding">
          <div className="relative rounded-2xl overflow-hidden min-h-[500px] flex items-center p-6 md:p-16">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-60 mix-blend-luminosity" />
              <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
            </div>

            {/* Floating Card */}
            <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-elevated p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                  Our Location
                </span>
              </div>
              <h2 className="font-headline-md text-primary mb-4">
                Based in Kharar.<br />
                Serving Punjab &amp; Haryana.
              </h2>
              <p className="font-body-md text-outline mb-8">
                JP Rentals is based at Modern Valley, Kharar &mdash; conveniently located
                for customers across the Tricity region and beyond. We provide
                self-drive car rental service with free delivery across our service network.
              </p>

              <div className="space-y-6 mb-8">
                <LocationDetail
                  icon="home"
                  title="Base Location"
                  text="Modern Valley, Kharar, Punjab"
                />
                <LocationDetail
                  icon="public"
                  title="Service Region"
                  text="Punjab &amp; Haryana"
                />
                <LocationDetail
                  icon="call"
                  title="Contact"
                  text={siteConfig.phoneFormatted}
                />
              </div>

              <Button href="/contact" variant="primary" size="md" className="w-full justify-center">
                Get Directions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING RULES / TRUST SECTION */}
      <section className="bg-surface py-24">
        <div className="max-w-container-max mx-auto section-padding">
          <TrustGrid />
          <div className="text-center mt-16">
            <Button href="/policy" variant="outline" size="md">
              View Full Rental Policy
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ PREVIEW */}
      <Section variant="sand">
        <SectionHeader
          label="Common Questions"
          title="Frequently Asked Questions"
          description="Quick answers to help you book with confidence."
        />
        <div className="max-w-3xl mx-auto">
          <AccordionGroup
            items={previewFaqs.map((f) => ({
              question: f.question,
              answer: f.answer,
            }))}
          />
          <div className="text-center mt-10">
            <Button href="/faq" variant="outline" size="md">
              View All FAQs
            </Button>
          </div>
        </div>
      </Section>

      {/* FINAL CTA BANNER */}
      <section className="bg-primary py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]" />
        <div className="relative max-w-container-max mx-auto section-padding text-center">
          <h2 className="text-display-md text-white mb-6">
            Ready to Drive Premium?
          </h2>
          <p className="font-body-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Book your self-drive car today. Free delivery, online payment,
            and trusted local service across Punjab &amp; Haryana.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/book" variant="secondary" size="lg">
              Book Your Car Now
            </Button>
            <a
              href={siteConfig.phoneHref}
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white border border-outline-variant rounded-lg hover:bg-white/5 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
              Call {siteConfig.phoneFormatted}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/* Sub-components */

function HighlightBox({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 text-left hover:border-secondary transition-all duration-300 group shadow-sm">
      <span className="material-symbols-outlined text-secondary text-[32px] mb-4 block">
        {icon}
      </span>
      <p className="text-3xl font-black text-primary mb-1 tracking-tight">{value}</p>
      <p className="text-xs font-bold text-outline uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}

function LocationDetail({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-primary mt-1">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-outline mb-1">
          {title}
        </p>
        <p className="text-base font-bold text-primary">{text}</p>
      </div>
    </div>
  );
}
