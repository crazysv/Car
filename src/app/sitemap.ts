import { MetadataRoute } from "next";
import { fleet } from "@/data/fleet";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://car-ruby-mu.vercel.app";

  // Static public routes
  const staticRoutes = [
    "",
    "/fleet",
    "/faq",
    "/contact",
    "/cancellation-refund-policy",
    "/delivery-pickup-policy",
    "/policy",
    "/privacy-policy",
    "/terms-and-conditions",
    "/book",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic fleet routes
  const dynamicFleetRoutes = fleet.map((vehicle) => ({
    url: `${siteUrl}/fleet/${vehicle.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...dynamicFleetRoutes];
}
