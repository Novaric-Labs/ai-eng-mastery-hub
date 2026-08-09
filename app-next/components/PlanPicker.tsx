"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { paymentsEnabled } from "@/lib/payments";
import { trackEvent } from "@/lib/analytics";

// Renders the membership plans and starts Stripe Checkout for the chosen plan.
// Not-signed-in users are bounced to /login (then back to pricing) so checkout
// always has a user to attach the subscription to.
export default function PlanPicker() {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Invite/free mode (Stripe not yet configured): don't render checkout, which
  // would fail. Point people at the free start + access codes instead.
  if (!paymentsEnabled) {
    return (
      <div className="card" style={{ padding: 22, textAlign: "center", maxWidth: 460, margin: "0 auto" }}>
        <b style={{ fontSize: 15 }}>Memberships are opening soon</b>
        <p style={{ color: "var(--dim)", fontSize: 13.5, marginTop: 8 }}>
          Novacademy is invite-only right now. Sign in to start free, then unlock the full course with an
          access code. Paid membership ({PLANS[0].priceLabel}/mo) is coming shortly.
        </p>
      </div>
    );
  }

  async function choose(plan: string) {
    setBusy(plan);
    setMsg(null);
    trackEvent("checkout_started", { plan });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const d = await res.json();
      if (res.status === 401) {
        location.href = "/login?next=/pricing";
        return;
      }
      if (res.status === 409) {
        setBusy(null);
        setMsg("You already have a membership on file (it may be waiting on a payment retry) — manage it from your account page.");
        return;
      }
      if (d.url) {
        location.href = d.url;
        return;
      }
      setBusy(null);
      setMsg("Couldn't start checkout: " + (d.error ?? "unknown"));
    } catch {
      setBusy(null);
      setMsg("Couldn't start checkout. Please try again.");
    }
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        }}
      >
        {PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => choose(p.id)}
            disabled={!!busy}
            className="card"
            style={{
              marginBottom: 0,
              padding: "18px 16px",
              textAlign: "left",
              cursor: busy ? "wait" : "pointer",
              border: p.highlight ? "1px solid var(--accent)" : undefined,
              boxShadow: p.highlight ? "0 0 0 1px var(--accent), var(--shadow-2)" : undefined,
              position: "relative",
            }}
          >
            {p.badge && (
              <span
                className="pill"
                style={{
                  position: "absolute",
                  top: -10,
                  right: 12,
                  fontSize: 10.5,
                  color: "var(--accent)",
                  borderColor: "rgba(91,140,255,.5)",
                  background: "var(--bg)",
                }}
              >
                {p.badge}
              </span>
            )}
            <div style={{ fontSize: 13, color: "var(--dim2)", fontWeight: 600 }}>{p.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "6px 0 2px" }}>
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.02em", color: "var(--text)" }}>{p.priceLabel}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--dim)" }}>{p.cadence}</div>
            <div style={{ fontSize: 12.5, color: "var(--accent)", marginTop: 8, fontWeight: 600 }}>
              {p.perMonth}
              {p.save && <span style={{ color: "var(--green)", marginLeft: 6 }}>· {p.save}</span>}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                marginTop: 12,
                fontSize: 12.5,
                fontWeight: 600,
                color: p.highlight ? "var(--accent)" : "var(--dim2)",
              }}
            >
              {busy === p.id ? "Opening…" : "Choose"} <ArrowRight size={13} strokeWidth={2} />
            </div>
          </button>
        ))}
      </div>
      {msg && <p style={{ color: "var(--amber)", marginTop: 14, textAlign: "center", fontSize: 13.5 }}>{msg}</p>}
    </>
  );
}
