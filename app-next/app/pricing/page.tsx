import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, Lock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { COURSES } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Buy a course once, keep it for life. Each Novacademy course is a one-time purchase with lifetime access and updates included.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — Novacademy",
    description: "One-time purchase. Lifetime access. Updates included.",
    url: "/pricing",
  },
};

// What the flagship course includes — shown on its pricing card.
const AI_ENG_INCLUDES = [
  "All 21 modules across 5 blocks",
  "Quizzes + block mastery exams",
  "Spaced-repetition flashcards",
  "Production scenarios with model answers",
  "Runnable code patterns + debugging guides",
  "Progress synced across your devices",
];

// Pricing — Server Component (SEO). Actual prices live in Stripe; this is copy.
export default function Pricing() {
  return (
    <>
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 56, paddingBottom: 64, maxWidth: 600 }}>
        <p className="eyebrow" style={{ textAlign: "center" }}>PRICING</p>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-.02em", margin: "10px 0 8px", textAlign: "center" }}>
          Buy once. Keep it for life.
        </h1>
        <p style={{ color: "var(--dim2)", marginBottom: 28, textAlign: "center" }}>
          Every course is a one-time purchase — no subscription. Updates included.
        </p>

        <div style={{ display: "grid", gap: 18 }}>
          {COURSES.map((c) => {
            const live = c.status === "live";
            return (
              <div
                key={c.slug}
                className="card"
                style={{ padding: 28, opacity: live ? 1 : 0.92, boxShadow: "var(--shadow-2), var(--hairline)" }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
                  <b style={{ fontSize: 16 }}>{c.title}</b>
                  {live ? (
                    <span className="pill" style={{ color: "var(--accent)", borderColor: "rgba(91,140,255,.4)" }}>Lifetime</span>
                  ) : (
                    <span className="pill" style={{ color: "var(--dim)" }}>
                      <Lock size={11} strokeWidth={2} style={{ marginRight: 3 }} /> Coming soon
                    </span>
                  )}
                </div>
                <p style={{ color: "var(--dim2)", fontSize: 14, margin: "0 0 12px", lineHeight: 1.45 }}>{c.subtitle}</p>

                {live && c.price ? (
                  <>
                    <div style={{ margin: "4px 0 16px" }}>
                      <div className="price-row">
                        <span className="price-amt">{c.price}</span>
                        {c.compareAt && (
                          <span style={{ textDecoration: "line-through", color: "var(--faint)", fontSize: 20, fontWeight: 600 }}>{c.compareAt}</span>
                        )}
                        {c.compareAt && (
                          <span className="pill" style={{ color: "var(--accent)", borderColor: "rgba(91,140,255,.4)", alignSelf: "center" }}>Launch price</span>
                        )}
                      </div>
                      <div className="price-unit">one-time · lifetime access</div>
                      <p className="price-note">Updates included · promo codes honored at checkout</p>
                    </div>
                    {c.slug === "ai-eng" && (
                      <ul className="checklist">
                        {AI_ENG_INCLUDES.map((f) => (
                          <li key={f}><Check size={16} strokeWidth={2} /> {f}</li>
                        ))}
                      </ul>
                    )}
                    <Link href="/login" className="btn" style={{ marginTop: 8 }}>
                      Get access <ArrowRight size={16} strokeWidth={1.75} />
                    </Link>
                  </>
                ) : (
                  <p style={{ color: "var(--dim)", fontSize: 13.5, margin: "4px 0 0" }}>
                    Pricing announced at launch — it&apos;ll be priced below the Mastery Hub
                    as a gentle on-ramp.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p style={{ color: "var(--dim)", fontSize: 13.5, marginTop: 20, textAlign: "center" }}>
          Have an access code? Sign in and enter it on the course page.
        </p>
        <p style={{ color: "var(--faint)", fontSize: 12.5, marginTop: 10, textAlign: "center" }}>
          14-day money-back guarantee. By purchasing you agree to our{" "}
          <Link href="/terms">Terms</Link> and <Link href="/refund">Refund Policy</Link>.
        </p>
      </main>
    </>
  );
}
