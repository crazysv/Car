import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fleet, getVehicleBySlug, getRelatedVehicles } from "@/data/fleet";
import { siteConfig } from "@/data/site-config";
import { VehicleCard } from "@/components/vehicle-card";
import { BookingSummaryCard } from "@/components/booking-summary-card";
import { Section, SectionHeader } from "@/components/section";
import { Button } from "@/components/button";

interface PageProps<T> {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return fleet.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata(
  props: PageProps<"/fleet/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) return { title: "Vehicle Not Found" };

  return {
    title: `${vehicle.name} ${vehicle.year} ${vehicle.variant}`,
    description: vehicle.description,
  };
}

export default async function VehicleDetailPage(
  props: PageProps<"/fleet/[slug]">
) {
  const { slug } = await props.params;
  const vehicle = getVehicleBySlug(slug);

  if (!vehicle) notFound();

  const related = getRelatedVehicles(slug, 3);

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-container-max mx-auto section-padding py-4">
          <nav className="font-body-sm text-outline font-semibold">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/fleet" className="hover:text-primary transition-colors">
              Fleet
            </Link>
            <span className="mx-2">/</span>
            <span className="text-primary font-bold">
              {vehicle.name} {vehicle.year}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Detail */}
      <Section variant="default">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left: Vehicle Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image */}
            <div className="relative h-64 md:h-80 lg:h-96 bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant flex items-center justify-center">
              <Image
                src={vehicle.image}
                alt={vehicle.name}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface/40 to-transparent pointer-events-none" />
              <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-primary text-white rounded-sm shadow-sm">
                {vehicle.category}
              </span>
              {vehicle.featured && (
                <span className="absolute top-4 right-4 px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-secondary-container text-on-secondary-container rounded-sm shadow-sm">
                  Featured
                </span>
              )}
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-display-md text-primary mb-2">
                {vehicle.name}
              </h1>
              <p className="font-body-lg font-semibold text-outline mb-4">
                {vehicle.year} &middot; {vehicle.variant} &middot; {vehicle.fuelType}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-display-sm font-black text-primary">
                  &#8377;{vehicle.pricePerDay.toLocaleString("en-IN")}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-outline">/day</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <Badge>Free Delivery</Badge>
              <Badge>Online Payment</Badge>
              <Badge>{siteConfig.location.region}</Badge>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-headline-md text-primary mb-4">
                About This Vehicle
              </h2>
              <p className="font-body-lg text-outline leading-relaxed">
                {vehicle.description}
              </p>
            </div>

            {/* Highlights */}
            <div>
              <h2 className="font-headline-md text-primary mb-4">
                Key Highlights
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {vehicle.highlights.map((h) => (
                  <div
                    key={h}
                    className="flex items-center gap-3 px-4 py-4 bg-surface-container-low rounded-xl border border-outline-variant shadow-sm"
                  >
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span className="font-body-sm font-bold text-primary">
                      {h}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rental Terms */}
            <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant shadow-sm">
              <h2 className="font-headline-md text-primary mb-6">
                Rental Terms
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TermItem
                  label="Advance"
                  value={`${siteConfig.booking.advancePercent}% required`}
                />
                <TermItem
                  label="Deposit"
                  value={`\u20B9${siteConfig.booking.securityDeposit.toLocaleString("en-IN")} refundable`}
                />
                <TermItem
                  label="Documents"
                  value={siteConfig.booking.requiredDocuments.join(" & ")}
                />
                <TermItem
                  label="Cancellation"
                  value={`Within ${siteConfig.booking.cancellationHours} hours`}
                />
                <TermItem label="Fuel" value="Paid by customer" />
                <TermItem label="Delivery" value="Free" />
              </div>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingSummaryCard vehicle={vehicle} />
            </div>
          </div>
        </div>
      </Section>

      {/* Related Vehicles */}
      {related.length > 0 && (
        <Section variant="sand">
          <SectionHeader
            label="Similar Options"
            title="You Might Also Like"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((v) => (
              <VehicleCard key={v.id} vehicle={v} variant="compact" />
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section variant="dark">
        <div className="text-center py-8">
          <h2 className="font-headline-lg text-white mb-4">
            Ready to Book?
          </h2>
          <p className="font-body-lg text-white/70 mb-8 max-w-[28rem] mx-auto">
            Reserve your {vehicle.name} today with free delivery in Kharar and
            surrounding areas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              href={`/book?car=${vehicle.slug}`}
              variant="secondary"
              size="lg"
            >
              Book This Car
            </Button>
            <Button
              href={siteConfig.phoneHref}
              variant="outline"
              size="lg"
              className="!text-white !border-white/20 hover:!bg-white/5"
            >
              Call Now
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary bg-surface border border-outline-variant rounded-md shadow-sm">
      {children}
    </span>
  );
}

function TermItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-2">
      <span className="text-xs font-bold uppercase tracking-widest text-outline">
        {label}
      </span>
      <span className="font-body-md font-bold text-primary">{value}</span>
    </div>
  );
}
