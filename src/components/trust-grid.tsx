import React from "react";
import { siteConfig } from "@/data/site-config";

interface TrustFeature {
  icon: string;
  title: string;
  description: string;
}

const trustFeatures: TrustFeature[] = [
  {
    icon: "security",
    title: "Financial Security",
    description: `A standard ${siteConfig.booking.advancePercent}% advance confirms your booking. A fully refundable \u20B9${siteConfig.booking.securityDeposit.toLocaleString("en-IN")} security deposit is held during the rental period.`,
  },
  {
    icon: "verified_user",
    title: "Simple Documentation",
    description: `We keep it simple. Just present your original ${siteConfig.booking.requiredDocuments.join(" and ")} at the time of vehicle handover.`,
  },
  {
    icon: "location_on",
    title: "Coverage Area",
    description: `Serving ${siteConfig.location.region} with free doorstep delivery across the Tricity region and surrounding areas.`,
  },
];

export function TrustGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      {/* Left: Content */}
      <div>
        <div className="text-secondary text-xs font-bold tracking-widest uppercase mb-4">
          No Hidden Fees
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight mb-6">
          Transparent Rentals
        </h2>
        <p className="text-outline text-lg mb-8 leading-relaxed">
          We believe in complete transparency. Our policies are designed to protect both the vehicle and your experience, with no hidden charges or last-minute surprises.
        </p>

        <div className="space-y-6">
          {trustFeatures.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary mt-1">
                {feature.icon}
              </span>
              <div>
                <h4 className="text-primary font-bold text-lg mb-1">
                  {feature.title}
                </h4>
                <p className="text-outline text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Image */}
      <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-elevated">
        <div className="absolute inset-0 bg-primary-container" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <span className="material-symbols-outlined text-[120px] text-white">
            car_rental
          </span>
        </div>
        
        {/* Floating Card */}
        <div className="absolute bottom-8 left-8 right-8 bg-white p-6 rounded-xl shadow-card backdrop-blur-sm bg-white/95">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-outline mb-1">
                Booking Support
              </p>
              <p className="text-primary font-bold">
                {siteConfig.phoneFormatted}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
