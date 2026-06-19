import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Allow crawling of the public marketing + legal pages; disallow gated, private,
// and non-indexable routes (the signed-in catalog, course reader, account/admin,
// the sign-in page, auth callbacks, and the API).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/courses",
        "/learn",
        "/account",
        "/admin",
        "/login",
        "/api/",
        "/auth/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
