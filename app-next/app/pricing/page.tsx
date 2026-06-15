import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "One price, lifetime access to all 21 modules, quizzes, flashcards, scenarios, and code patterns — including updates as the field moves.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — AI Engineering Mastery Hub",
    description: "One price. Lifetime access. Updates included.",
    url: "/pricing",
  },
};

// Pricing — Server Component (SEO). The actual price lives in Stripe; this is copy.
export default function Pricing() {
  return (
    <>
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 56, paddingBottom: 64, maxWidth: 560 }}>
        <p className="eyebrow" style={{ textAlign: "center" }}>PRICING</p>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-.02em", margin: "10px 0 8px", textAlign: "center" }}>
          One price. Lifetime access.
        </h1>
        <p style={{ color: "var(--dim2)", marginBottom: 28, textAlign: "center" }}>
          Buy once, keep it forever — including updates as the field moves.
        </p>

        <div className="card" style={{ padding: 28, boxShadow: "var(--shadow-2), var(--hairline)" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
            <b style={{ fontSize: 16 }}>Full access</b>
            <span className="pill" style={{ color: "var(--accent)", borderColor: "rgba(91,140,255,.4)" }}>Lifetime</span>
          </div>
          <div style={{ margin: "10px 0 16px" }}>
            <div className="price-row">
              <span className="price-amt">$149</span>
              <span style={{ textDecoration: "line-through", color: "var(--faint)", fontSize: 20, fontWeight: 600 }}>$199</span>
              <span className="pill" style={{ color: "var(--accent)", borderColor: "rgba(91,140,255,.4)", alignSelf: "center" }}>Launch price</span>
            </div>
            <div className="price-unit">one-time · lifetime access</div>
            <p className="price-note">Updates included · promo codes honored at checkout</p>
          </div>
          <ul className="checklist">
            {[
              "All 21 modules across 5 blocks",
              "Quizzes + block mastery exams",
              "Spaced-repetition flashcards",
              "Production scenarios with model answers",
              "Runnable code patterns + debugging guides",
              "Progress synced across your devices",
            ].map((f) => (
              <li key={f}>
                <Check size={16} strokeWidth={2} /> {f}
              </li>
            ))}
          </ul>
          <Link href="/login" className="btn" style={{ marginTop: 8 }}>
            Get access <ArrowRight size={16} strokeWidth={1.75} />
          </Link>
        </div>

        <p style={{ color: "var(--dim)", fontSize: 13.5, marginTop: 20, textAlign: "center" }}>
          Have an access code? Sign in and enter it on the course page.
        </p>
      </main>
    </>
  );
}
