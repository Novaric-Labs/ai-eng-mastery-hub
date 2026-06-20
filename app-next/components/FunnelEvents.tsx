"use client";

import { useEffect, useRef } from "react";
import { trackEvent, type FunnelEvent } from "@/lib/analytics";

// Fires funnel events from the client (Vercel Analytics only runs in the
// browser). Renders nothing. Two modes:
//
//   <FunnelEvents event="preview_started" course="ai-eng" />
//     → fires that event once on mount (used on the gated learn page for
//       non-members opening the free preview).
//
//   <FunnelEvents />
//     → reads the URL for landing flags and fires the matching event:
//       ?welcome=1   → "signup"     (set by the auth callback for new accounts)
//       ?subscribed=1 → "subscribed" (Stripe Checkout success_url)
//
// We read window.location.search directly (in an effect, browser-only) instead
// of useSearchParams() so the component needs no Suspense boundary.
export default function FunnelEvents({
  event,
  course,
}: {
  event?: FunnelEvent;
  course?: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    if (event) {
      trackEvent(event, course ? { course } : undefined);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "1") trackEvent("signup");
    if (params.get("subscribed") === "1") trackEvent("subscribed");
  }, [event, course]);

  return null;
}
