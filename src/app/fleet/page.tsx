import type { Metadata } from "next";
import { fleet } from "@/data/fleet";
import { VehicleCard } from "@/components/vehicle-card";
import { Section } from "@/components/section";
import { Button } from "@/components/button";

export const metadata: Metadata = {
  title: "Fleet",
  description:
    "Browse our premium self-drive car rental fleet. SUVs, Sedans, and Hatchbacks available for rent in Kharar, Punjab & Haryana.",
};

export default function FleetPage() {
  return (
    <>
      {/* Page Hero */}
      <Section variant="dark" className="!py-0">
        <div className="py-14 md:py-24 text-center">
          <span className="font-label-bold uppercase tracking-widest text-secondary-fixed mb-3 block">
            Our Collection
          </span>
          <h1 className="text-display-md text-white mb-4">
            Explore Our Fleet
          </h1>
          <p className="font-body-lg text-white/70 max-w-lg mx-auto">
            Premium self-drive vehicles with free delivery across Punjab &
            Haryana. Choose your perfect ride.
          </p>
        </div>
      </Section>

      {/* Fleet Grid */}
      <Section variant="default">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fleet.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </Section>

      {/* Info Strip */}
      <Section variant="sand">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
          <InfoItem icon="local_shipping" label="Free Delivery" />
          <InfoItem icon="payments" label="Online Payment" />
          <InfoItem icon="percent" label="35% Advance" />
          <InfoItem icon="badge" label="Aadhaar + DL" />
        </div>
      </Section>

      {/* CTA */}
      <Section variant="dark">
        <div className="text-center py-8">
          <h2 className="font-headline-lg text-white mb-4">
            Found Your Ride?
          </h2>
          <p className="font-body-lg text-white/70 mb-8 max-w-md mx-auto">
            Book now and get free delivery to your doorstep in Kharar and
            surrounding areas.
          </p>
          <Button href="/book" variant="secondary" size="lg">
            Book Now
          </Button>
        </div>
      </Section>
    </>
  );
}

function InfoItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <span className="text-sm font-bold tracking-wide text-primary">{label}</span>
    </div>
  );
}
