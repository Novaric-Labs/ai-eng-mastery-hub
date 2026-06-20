// Centralized SEO config + JSON-LD builders. Keep all structured data truthful:
// only mark up content that actually exists on the page. NEVER add aggregateRating,
// review counts, or enrollment numbers we can't substantiate — Google penalizes
// fabricated review/rating markup.

import { COURSES, type CourseMeta } from "@/lib/courses";

// Canonical production domain. We fall back to the live site (not localhost) so
// metadataBase / sitemap / robots emit correct absolute URLs even if the env var
// is unset in a given build environment.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.novacademy.ai"
).replace(/\/$/, "");

export const SITE_NAME = "Novacademy";

// Absolute URL helper for canonicals / JSON-LD ids.
export const abs = (path = "/"): string =>
  new URL(path, SITE_URL).toString();

// Sitewide Organization schema. Only fields we can stand behind.
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: abs("/"),
    logo: abs("/icon.svg"),
    description:
      "Novacademy is an online learning platform for modern AI skills — RAG, agents, evals, and the engineering judgment to ship real AI features.",
    email: "support@novacademy.ai",
  };
}

// WebSite schema — helps Google understand the site name in results.
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: abs("/"),
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

// Course schema for a single catalog course. Truthful mapping only.
export function courseSchema(c: CourseMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: c.title,
    description: c.blurb,
    url: abs("/courses"),
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: abs("/"),
    },
    educationalLevel: c.level,
    // hasCourseInstance describes how the course is delivered. Online, self-paced.
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: c.estHours,
    },
  };
}

// All catalog courses as an ItemList of Course nodes (for the home page).
export function coursesItemListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: COURSES.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: courseSchema(c),
    })),
  };
}

// BreadcrumbList from an ordered list of [name, path] pairs.
export function breadcrumbSchema(items: Array<[name: string, path: string]>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: abs(path),
    })),
  };
}

// ---- Blog ----

type BlogPostLike = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author?: string;
};

// Blog schema (the /blog index) listing its posts.
export function blogSchema(posts: BlogPostLike[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: `${SITE_NAME} Blog`,
    url: abs("/blog"),
    publisher: { "@id": `${SITE_URL}/#organization` },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      url: abs(`/blog/${p.slug}`),
    })),
  };
}

// BlogPosting schema for a single article.
export function blogPostingSchema(post: BlogPostLike) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: post.author || SITE_NAME, url: abs("/") },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: abs(`/blog/${post.slug}`),
    url: abs(`/blog/${post.slug}`),
  };
}

// FAQPage from [question, answer] pairs. Only use with FAQ content rendered on
// the page (Google requires the markup to match visible content).
export function faqSchema(faqs: Array<[question: string, answer: string]>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
