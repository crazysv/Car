"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", exact: true },
    { href: "/admin/bookings", label: "All Bookings", exact: false },
  ];

  return (
    <div className="bg-surface-container-low border-b border-outline-variant sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center gap-6 h-14">
        {links.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-label-bold tracking-wide transition-colors h-full flex items-center border-b-2 ${
                isActive
                  ? "text-secondary border-secondary"
                  : "text-outline hover:text-primary border-transparent"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
