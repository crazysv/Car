"use client";

import Link from "next/link";
import { useState } from "react";
import { siteConfig } from "@/data/site-config";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-8 h-20 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 transition-all duration-200 ease-in-out">
      <div className="flex items-center justify-between max-w-container-max mx-auto w-full">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tighter text-primary font-headline-md">
          JP RENTALS
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-8 flex-1 justify-center">
          {siteConfig.nav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
                  isActive 
                    ? "text-primary border-b-2 border-secondary pb-1" 
                    : "text-slate-500 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href={siteConfig.phoneHref}
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-primary px-4 py-2 rounded-lg hover:bg-slate-50 transition-all"
          >
            <span className="material-symbols-outlined text-lg">call</span>
            Call Now
          </a>
          <Link
            href="/book"
            className="bg-primary-container text-on-primary px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide hover:opacity-90 transition-all shadow-md active:scale-95"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-primary"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-lg p-6 lg:hidden animate-fade-in flex flex-col gap-4">
          <nav className="flex flex-col gap-4">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-base font-semibold text-on-surface hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="h-px bg-slate-200 w-full my-2" />
          <div className="flex flex-col gap-3">
            <a
              href={siteConfig.phoneHref}
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-primary border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              Call {siteConfig.phoneFormatted}
            </a>
            <Link
              href="/book"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-primary-container rounded-lg shadow-md"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
