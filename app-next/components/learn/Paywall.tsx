"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import RedeemDialog from "./RedeemDialog";
import { useCourseStore } from "./StoreProvider";

// Shown wherever paid content is requested by a non-entitled user (locked
// module, flashcards, scenarios). Buy → Stripe Checkout; redeem → access code.
export default function Paywall({
  heading = "This is part of the full course",
  blurb = "Lifetime access unlocks all 21 modules, quizzes, flashcards, scenarios, and code patterns.",
}: {
  heading?: string;
  blurb?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const courseSlug = useCourseStore((s) => s.courseSlug);

  async function buy() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: courseSlug }),
      });
      const d = await res.json();
      if (d.url) location.href = d.url;
      else {
        setBusy(false);
        setMsg("Checkout error: " + (d.error ?? "unknown"));
      }
    } catch {
      setBusy(false);
      setMsg("Could not start checkout.");
    }
  }

  return (
    <div className="lockcard">
      <h3><Lock size={18} strokeWidth={1.75} /> {heading}</h3>
      <p style={{ color: "var(--dim)", marginBottom: 14 }}>{blurb}</p>
      <button className="btn" disabled={busy} onClick={buy}>
        {busy ? "Opening checkout…" : "Buy lifetime access"}
      </button>
      <RedeemDialog />
      {msg && <p style={{ color: "var(--amber)", marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
