"use client";

import { siteConfig } from "@/data/site-config";

export function MobileBookingBar() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-outline-variant lg:hidden"
      style={{ boxShadow: "0 -4px 12px rgba(0,10,30,0.08)", height: 68 }}
    >
      <div className="grid grid-cols-2 gap-3 h-full items-center px-4">
        <a
          href={siteConfig.phoneHref}
          className="flex items-center justify-center gap-2 border border-primary text-primary rounded-xl font-bold text-sm py-3"
        >
          <span className="material-symbols-outlined text-lg">call</span>
          Call Now
        </a>
        <a
          href="/book"
          className="flex items-center justify-center gap-2 bg-primary text-white rounded-xl font-bold text-sm py-3 shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">directions_car</span>
          Book Now
        </a>
      </div>
    </div>
  );
}
