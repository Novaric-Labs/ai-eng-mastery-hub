import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, Database, Bot, Rocket, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const STATS = [
  ["21", "modules"],
  ["5", "blocks"],
  ["78", "flashcards"],
  ["22", "scenarios"],
];

const BLOCKS = [
  [Boxes, "Foundations", "LLMs, prompting, context engineering, the 2026 model landscape"],
  [Database, "RAG & Knowledge", "Pipelines, embeddings, vector DBs, memory, data engineering"],
  [Bot, "Agents & Harnesses", "Tools, loops, multi-agent, and the harness that makes them reliable"],
  [Rocket, "Production & Leadership", "Evals, guardrails, architecture, and build/buy/wait judgment"],
] as const;

const FAQ = [
  ["Do I need an ML background?", "No — just basic programming and what an API is. No math or model training."],
  ["Is it up to date?", "It's the 2026 edition, updated for the current model landscape — and updates are included."],
  ["What do I actually get?", "Concepts, mechanics, worked examples, runnable code patterns, quizzes, spaced-repetition flashcards, and production scenarios for all 21 modules."],
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
            <p className="eyebrow">2026 EDITION · UPDATED JUNE 2026</p>
            <h1 style={{ fontSize: "clamp(34px, 6vw, 52px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.025em", margin: "14px auto 16px", maxWidth: 720 }}>
              Master production AI engineering.
            </h1>
            <p style={{ color: "var(--dim2)", fontSize: 18, maxWidth: 600, margin: "0 auto", lineHeight: 1.5 }}>
              Not prompt tricks — the real job: RAG, agents, harnesses, evals, cost
              and latency discipline, and the judgment to ship.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", margin: "30px 0 12px", flexWrap: "wrap" }}>
              <Link href="/login" className="btn">Start free preview <ArrowRight size={16} strokeWidth={1.75} /></Link>
              <Link href="/pricing" className="btn ghost">See pricing</Link>
            </div>
            <p style={{ color: "var(--faint)", fontSize: 13 }}>No card required for the preview.</p>
          </div>
        </section>

        {/* stats */}
        <section className="wrap statrow" style={{ padding: "28px 20px" }}>
          {STATS.map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: "var(--accent)", letterSpacing: "-.02em" }}>{n}</div>
              <div style={{ fontSize: 12.5, color: "var(--dim)" }}>{l}</div>
            </div>
          ))}
        </section>

        {/* curriculum */}
        <section className="wrap" style={{ paddingTop: 16, paddingBottom: 12 }}>
          <h2 style={{ fontSize: 22, textAlign: "center", margin: "16px 0 20px" }}>What&apos;s inside</h2>
          <div className="grid-2">
            {BLOCKS.map(([Icon, h, b]) => (
              <div className="card" key={h} style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ display: "inline-flex", padding: 8, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)" }}>
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <b>{h}</b>
                </div>
                <p style={{ color: "var(--dim)", fontSize: 13.5 }}>{b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* faq */}
        <section className="wrap" style={{ paddingTop: 36, paddingBottom: 28, maxWidth: 680 }}>
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
          <p style={{ marginTop: 10, color: "var(--faint)" }}>© 2026 Novacademy · AI Engineering Mastery Hub</p>
        </footer>
      </main>
    </>
  );
}
