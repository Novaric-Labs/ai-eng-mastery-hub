// Social proof shown on the homepage. ADD REAL QUOTES ONLY — never invent
// testimonials for a paid product. Collect them from your Week 1 comped testers
// (the NOVA-LAUNCH / TESTER-2026 access codes) in exchange for honest feedback,
// then add entries here. The homepage section renders nothing while this is
// empty, so the page stays clean until you have genuine quotes.
export type Testimonial = {
  /** The quote, in the member's own words. Keep it specific, not generic praise. */
  quote: string;
  /** Attribution — a first name + last initial is fine. */
  name: string;
  /** Optional context that builds credibility, e.g. "Backend engineer". */
  role?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  // {
  //   quote: "The agents module finally made harnesses click — I shipped one at work the next week.",
  //   name: "Jordan P.",
  //   role: "Backend engineer",
  // },
];
