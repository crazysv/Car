import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://car-ruby-mu.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/my-bookings/",
        "/account/",
        "/auth/",
        "/login/",
        "/forgot-password/",
        "/reset-password/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
