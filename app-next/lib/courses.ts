// The course catalog — display source of truth for the marketing pages and the
// post-login catalog (/courses). Operational fields (per-course Stripe price,
// entitlement rows, FK anchor) live in the Supabase `courses` table; the copy a
// learner reads lives here so the public pages stay static and SEO-friendly.
//
// Keep the `slug` values in sync with the `courses` table (supabase migration
// 0003) and with content `course_id`s seeded by content/seed.mjs.

export type CourseMeta = {
  slug: string;
  title: string;
  /** One-line positioning under the title. */
  subtitle: string;
  /** Short paragraph for the catalog card. */
  blurb: string;
  /** Who the course is best for — rendered as chips on the catalog card. */
  bestFor: string[];
  level: string;
  estHours: string;
  moduleCount: number;
  status: "live" | "coming_soon";
  /** Per-course accent color — the catalog card's left stripe and level label. */
  accent: string;
};

// Ordered for the learner's natural progression: the beginner on-ramp first,
// then the deep course it leads into. Catalog and home pages render in this order.
export const COURSES: CourseMeta[] = [
  {
    slug: "ai-foundations",
    title: "AI Foundations",
    subtitle: "Zero to fluent — what LLMs, tokens, and prompts actually are, before the deep course.",
    blurb:
      "The gentle on-ramp for total beginners. Plain-English mental models for how LLMs work, what tokens and context windows are, and how to prompt well — so the Mastery Hub feels like the obvious next step.",
    bestFor: [
      "Total beginners to AI",
      "Non-engineers who want to keep up",
      "A primer before the Mastery Hub",
    ],
    level: "Beginner",
    estHours: "6–8 hrs",
    moduleCount: 8,
    status: "live",
    accent: "#2dd4bf",
  },
  {
    slug: "ai-eng",
    title: "AI Engineering Mastery Hub",
    subtitle: "The real production job — RAG, agents, harnesses, evals, and the judgment to ship.",
    blurb:
      "The deep, hands-on course: 21 modules across foundations, RAG, agents, and production. Concepts, mechanics, runnable code patterns, quizzes, spaced-repetition flashcards, and real production scenarios.",
    bestFor: [
      "Engineers & PMs who can code a little",
      "People shipping LLM features at work",
      "Anyone past prompt tricks who wants the real job",
    ],
    level: "Intermediate",
    estHours: "20–30 hrs",
    moduleCount: 21,
    status: "live",
    accent: "#5b8cff",
  },
];

export const courseBySlug = (slug: string): CourseMeta | undefined =>
  COURSES.find((c) => c.slug === slug);

export const LIVE_COURSES = COURSES.filter((c) => c.status === "live");
