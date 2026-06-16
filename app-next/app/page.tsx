import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, BarChart3, Layers, Lock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { COURSES } from "@/lib/courses";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const FAQ = [
  ["Do I need an ML background?", "No — just basic programming and what an API is. No math or model training."],
  ["Is it up to date?", "Yes — courses are built for today's model landscape, and updates are included as the field moves."],
  ["What do I actually get?", "Concepts, mechanics, worked examples, runnable code patterns, quizzes, spaced-repetition flashcards, and production scenarios."],
  ["Can I try before buying?", "Yes — sign in to read the orientation, glossary, and a full sample module free."],
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* hero */}
        <section className="hero-bg">
          <div className="wrap" style={{ paddingTop: 72, paddingBottom: 16, textAlign: "center" }}>
            <p className="eyebrow">NOVACADEMY</p>
            <h1 style={{ fontSize: "clamp(34px, 6vw, 52px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.025em", margin: "14px auto 16px", maxWidth: 720 }}>
              Master the skills behind modern AI.
            </h1>
            <p style={{ color: "var(--dim2)", fontSize: 18, maxWidth: 600, margin: "0 auto", lineHeight: 1.5 }}>
              Focused, hands-on courses on the real job — not prompt tricks. RAG,
              agents, harnesses, evals, and the judgment to ship. One membership
              unlocks every course — from $21/mo, cancel anytime.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", margin: "30px 0 12px", flexWrap: "wrap" }}>
              <Link href="/login" className="btn">Start free preview <ArrowRight size={16} strokeWidth={1.75} /></Link>
              <Link href="#courses" className="btn ghost">Browse courses</Link>
            </div>
            <p style={{ color: "var(--faint)", fontSize: 13 }}>No card required for the preview.</p>
          </div>
        </section>

        {/* courses */}
        <section id="courses" className="wrap" style={{ paddingTop: 28, paddingBottom: 8 }}>
          <h2 style={{ fontSize: 22, textAlign: "center", margin: "16px 0 6px" }}>Courses</h2>
          <p style={{ textAlign: "center", color: "var(--dim)", fontSize: 14, marginBottom: 22 }}>
            One academy, growing library. A single membership unlocks all of it.
          </p>
          <div style={{ display: "grid", gap: 16, maxWidth: 760, margin: "0 auto" }}>
            {COURSES.map((c) => {
              const live = c.status === "live";
              return (
                <div key={c.slug} className="card" style={{ marginBottom: 0, padding: 22, opacity: live ? 1 : 0.92 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <b style={{ fontSize: 17 }}>{c.title}</b>
                        {!live && (
                          <span className="pill" style={{ color: "var(--dim)" }}>
                            <Lock size={11} strokeWidth={2} style={{ marginRight: 3 }} /> Coming soon
                          </span>
                        )}
                      </div>
                      <p style={{ color: "var(--dim2)", fontSize: 14, margin: "6px 0 0", lineHeight: 1.45 }}>{c.subtitle}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "14px 0 0", color: "var(--dim)", fontSize: 12.5 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><BarChart3 size={14} strokeWidth={1.75} /> {c.level}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Layers size={14} strokeWidth={1.75} /> {c.moduleCount} modules</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={14} strokeWidth={1.75} /> {c.estHours}</span>
                  </div>

                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", margin: "14px 0 16px" }}>
                    {c.bestFor.map((b) => (
                      <span key={b} className="pill" style={{ fontSize: 11.5, color: "var(--dim2)", borderColor: "var(--border2)" }}>{b}</span>
                    ))}
                  </div>

                  {live ? (
                    <Link href="/login" className="btn" style={{ margin: 0 }}>Start free preview <ArrowRight size={16} strokeWidth={1.75} /></Link>
                  ) : (
                    <button className="btn ghost" disabled style={{ margin: 0, cursor: "not-allowed", opacity: 0.7 }}>Coming soon</button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* faq */}
        <section className="wrap" style={{ paddingTop: 40, paddingBottom: 28, maxWidth: 680 }}>
          <h2 style={{ fontSize: 22, textAlign: "center", marginBottom: 18 }}>Questions</h2>
          {FAQ.map(([q, a]) => (
            <div className="card" key={q}>
              <b>{q}</b>
              <p style={{ color: "var(--dim)", fontSize: 14, marginTop: 4 }}>{a}</p>
            </div>
          ))}
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/login" className="btn">Start free preview <ArrowRight size={16} strokeWidth={1.75} /></Link>
          </div>
        </section>

        <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 20px", textAlign: "center", color: "var(--dim)", fontSize: 13 }}>
          <div className="wrap" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/pricing">Pricing</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/refund">Refund</Link>
          </div>
          <p style={{ marginTop: 10, color: "var(--faint)" }}>© 2026 Novacademy</p>
        </footer>
      </main>
    </>
  );
}
