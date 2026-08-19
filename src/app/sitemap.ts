import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

const SITE_URL = "https://crydensync-docs.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/ai`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const docRoutes: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: `${SITE_URL}${page.url}`,
    changeFrequency: "weekly",
    priority: page.url === "/docs" ? 0.9 : 0.7,
  }));

  return [...staticRoutes, ...docRoutes];
}
