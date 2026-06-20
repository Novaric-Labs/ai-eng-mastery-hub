import { track } from "@vercel/analytics";

// The four funnel stages we measure to know which traffic actually converts.
// Keep this list tight — every event here should map to a step in the
// signup → preview → checkout → subscribe funnel so the marketing dashboard
// stays legible. See docs/marketing-plan.md for how these feed the weekly goals.
export type FunnelEvent =
  | "signup" // a brand-new account was created
  | "preview_started" // a non-member opened a course to read the free preview
  | "checkout_started" // a Stripe Checkout session was requested
  | "subscribed"; // a paid membership became active

type Props = Record<string, string | number | boolean>;

// Thin wrapper over Vercel Analytics' track(). Analytics must NEVER break a
// user flow, so any failure (blocked script, SSR, etc.) is swallowed.
export function trackEvent(event: FunnelEvent, props?: Props): void {
  try {
    track(event, props);
  } catch {
    /* analytics is best-effort — ignore */
  }
}
