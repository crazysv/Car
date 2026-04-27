import Link from "next/link";
import Image from "next/image";
import type { Vehicle } from "@/data/fleet";

interface VehicleCardProps {
  vehicle: Vehicle;
  variant?: "default" | "compact";
}

export function VehicleCard({ vehicle, variant = "default" }: VehicleCardProps) {
  const isCompact = variant === "compact";

  return (
    <div className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full ${vehicle.featured ? "border border-secondary-container" : "border border-outline-variant"}`}>
      {/* Image Container */}
      <div className={`relative ${isCompact ? "h-48" : "h-56"} bg-surface-container-low overflow-hidden w-full flex-shrink-0 flex items-center justify-center`}>
        <Image
          src={vehicle.image}
          alt={vehicle.name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-primary text-white rounded-sm shadow-sm">
            {vehicle.category}
          </span>
          {vehicle.featured && (
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-secondary-container text-on-secondary-container rounded-sm shadow-sm">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div className={`flex flex-col flex-grow ${isCompact ? "p-5 gap-3" : "p-6 gap-4"}`}>
        {/* Header: Title & Price */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-primary font-bold text-xl mb-1 tracking-tight line-clamp-1">
              {vehicle.name}
            </h3>
            <p className="text-outline text-sm font-semibold tracking-wide flex items-center">
              <span className="material-symbols-outlined text-[16px] align-middle mr-1">local_gas_station</span>
              {vehicle.fuelType} &middot; {vehicle.year}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-primary font-black text-xl block">
              &#8377;{vehicle.pricePerDay.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-outline font-bold">
              Per Day
            </span>
          </div>
        </div>

        {/* Footer: CTAs */}
        <div className={`mt-auto grid grid-cols-2 ${isCompact ? "gap-2" : "gap-3"}`}>
          <Link
            href={`/fleet/${vehicle.slug}`}
            className="text-center py-3 border border-outline-variant rounded-lg text-primary font-bold text-sm tracking-widest uppercase hover:bg-surface-container transition-colors"
          >
            Details
          </Link>
          <Link
            href={`/book?car=${vehicle.slug}`}
            className="text-center py-3 bg-primary text-white rounded-lg font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-opacity shadow-sm"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
