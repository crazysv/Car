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
                  <span className="material-symbols-outlined text-base">near_me</span> Contact Us
                </Link>
              </li>
              <li>
                <a href={siteConfig.instagramHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-on-primary-container hover:text-secondary-fixed transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                  </svg>
                  Instagram
                </a>
              </li>
              <li>
                <a href={siteConfig.whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-on-primary-container hover:text-secondary-fixed transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full pt-10 border-t border-slate-800 text-center flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-widest text-on-primary-container">
            &copy; {new Date().getFullYear()} JP Rentals. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
            <Link href="/privacy-policy" className="text-on-primary-container hover:text-secondary-fixed transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-on-primary-container hover:text-secondary-fixed transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/cancellation-refund-policy" className="text-on-primary-container hover:text-secondary-fixed transition-colors">
              Cancellation &amp; Refund
            </Link>
            <Link href="/delivery-pickup-policy" className="text-on-primary-container hover:text-secondary-fixed transition-colors">
              Delivery &amp; Pickup
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
