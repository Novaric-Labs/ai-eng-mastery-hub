"use client";

import { useState } from "react";
import { Award } from "lucide-react";
import { useCourseStore } from "./StoreProvider";

// Shown on the dashboard once a course is fully complete. POSTs to the issuance
// route (which re-verifies completion server-side) and opens the verifiable
// certificate page.
export default function CertificateClaim() {
  const courseSlug = useCourseStore((s) => s.courseSlug);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function claim() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: courseSlug }),
      });
      const d = await res.json();
      if (d.id) {
        window.open(`/cert/${d.id}`, "_blank", "noopener");
        return;
      }
      setErr(d.error === "course not complete" ? "Finish every block first." : "Couldn't issue your certificate. Try again.");
    } catch {
      setErr("Couldn't issue your certificate. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ borderColor: "var(--green)" }}>
      <b style={{ color: "var(--green)", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Award size={16} strokeWidth={2} /> Course complete — claim your certificate
      </b>
      <p style={{ color: "var(--dim)", fontSize: 13.5, margin: "6px 0 10px" }}>
        You mastered every module and passed every block exam. Generate a shareable,
        verifiable certificate you can add to your LinkedIn profile.
      </p>
      <button className="btn" onClick={claim} disabled={busy}>
        {busy ? "Generating…" : "Get my certificate"}
      </button>
      {err && <p style={{ color: "var(--amber)", fontSize: 13, marginTop: 8 }}>{err}</p>}
    </div>
  );
}
