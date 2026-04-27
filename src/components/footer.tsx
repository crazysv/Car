import Link from "next/link";
import { siteConfig } from "@/data/site-config";

export function Footer() {
  return (
    <footer className="bg-primary-container text-white border-t border-slate-800">
      <div className="max-w-container-max mx-auto py-16 px-6 md:px-8 flex flex-col items-center gap-10">
        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-white text-lg font-black mb-6">JP RENTALS</h3>
            <p className="text-xs tracking-widest uppercase mb-4 text-outline-variant">Location</p>
            <p className="text-sm leading-relaxed mb-1">{siteConfig.location.name}</p>
            <p className="text-sm leading-relaxed text-on-primary-container">{siteConfig.location.fullAddress}</p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs tracking-widest uppercase text-white font-bold mb-6">Quick Links</p>
            <ul className="space-y-3 text-sm">
              {siteConfig.footer.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-on-primary-container hover:text-secondary-fixed transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs tracking-widest uppercase text-white font-bold mb-6">Services</p>
            <ul className="space-y-3 text-sm">
              {siteConfig.footer.serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-on-primary-container hover:text-secondary-fixed transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="text-xs tracking-widest uppercase text-white font-bold mb-6">Connect</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={siteConfig.phoneHref} className="flex items-center gap-2 text-on-primary-container hover:text-secondary-fixed transition-all">
                  <span className="material-symbols-outlined text-base">call</span> {siteConfig.phoneFormatted}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 text-on-primary-container hover:text-secondary-fixed transition-all">
                  <span className="material-symbols-outlined text-base">mail</span> {siteConfig.email}
                </a>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-2 text-on-primary-container hover:text-secondary-fixed transition-all">
                  <span className="material-symbols-outlined text-base">near_me</span> Contact Concierge
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full pt-10 border-t border-slate-800 text-center flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-widest text-on-primary-container">
            © {new Date().getFullYear()} JP Rentals. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/policy" className="text-on-primary-container hover:text-secondary-fixed transition-colors">
              Privacy Policy
            </Link>
            <Link href="/policy" className="text-on-primary-container hover:text-secondary-fixed transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
