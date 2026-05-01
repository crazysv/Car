"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { siteConfig } from "@/data/site-config";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Check auth state on mount and subscribe to changes
  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Close account menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAccountMenuOpen(false);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  // Get display name from email (before the @)
  const displayName = user?.email?.split("@")[0] ?? "";

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

          {/* Account state */}
          {user ? (
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all border border-outline-variant"
                aria-label="Account menu"
              >
                <span className="material-symbols-outlined text-lg text-primary">account_circle</span>
                <span className="text-sm font-bold text-primary max-w-[100px] truncate hidden xl:inline">
                  {displayName}
                </span>
                <span className="material-symbols-outlined text-sm text-outline">
                  {accountMenuOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Dropdown menu */}
              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-elevated border border-outline-variant py-2 animate-fade-in z-50">
                  <div className="px-4 py-3 border-b border-outline-variant">
                    <p className="text-xs font-bold uppercase tracking-widest text-outline mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-primary truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setAccountMenuOpen(false)}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3 border-b border-outline-variant/50"
                  >
                    <span className="material-symbols-outlined text-lg">manage_accounts</span>
                    Account
                  </Link>
                  <Link
                    href="/my-bookings"
                    onClick={() => setAccountMenuOpen(false)}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-lg">receipt_long</span>
                    My Bookings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3 border-t border-outline-variant/50"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all text-sm font-bold text-primary border border-outline-variant"
            >
              <span className="material-symbols-outlined text-lg">person</span>
              Sign In
            </Link>
          )}
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

          {/* Mobile account section */}
          {user && (
            <div className="flex items-center gap-3 px-1 py-2">
              <span className="material-symbols-outlined text-lg text-primary">account_circle</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-outline">Signed in</p>
                <p className="text-sm font-bold text-primary truncate">{user.email}</p>
              </div>
            </div>
          )}

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
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-primary border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined text-lg">manage_accounts</span>
                  Account
                </Link>
                <Link
                  href="/my-bookings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-primary border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined text-lg">receipt_long</span>
                  My Bookings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-on-surface border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-primary border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-lg">person</span>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
