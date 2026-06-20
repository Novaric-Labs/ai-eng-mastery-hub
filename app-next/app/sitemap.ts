import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Only the public, indexable routes. The signed-in catalog (/courses), the course
// reader (/learn), account/admin, /login (noindex auth page), /auth and the API are
// gated, private, or non-indexable and are intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/refund`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
