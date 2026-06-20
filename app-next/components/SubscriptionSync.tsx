"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Fires right after a successful checkout (/courses?subscribed=1): proactively
// reconciles the subscription from Stripe so access appears immediately even if
// the webhook is slow or failed. If it backfilled anything, refresh so the
// now-active membership renders. Renders nothing; best-effort (never blocks UI).
export default function SubscriptionSync() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    if (params.get("subscribed") !== "1") return;

    (async () => {
      try {
        const res = await fetch("/api/subscription/sync", { method: "POST" });
        const d = await res.json().catch(() => ({}));
        if (d?.synced) router.refresh();
      } catch {
        /* best-effort — the webhook is the primary path */
      }
    })();
  }, [router]);

  return null;
}
