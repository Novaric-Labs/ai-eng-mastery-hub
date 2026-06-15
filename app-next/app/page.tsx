import type { Metadata } from "next";
import Link from "next/link";
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
  ["Foundations", "LLMs, prompting, context engineering, the 2026 model landscape"],
  ["RAG & Knowledge", "Pipelines, embeddings, vector DBs, memory, data engineering"],
  ["Agents & Harnesses", "Tools, loops, multi-agent, and the harness that makes them reliable"],
  ["Production & Leadership", "Evals, guardrails, architecture, and build/buy/wait judgment"],
];

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
        <section className="wrap" style={{ paddingTop: 56, paddingBottom: 8, textAlign: "center" }}>
          <p style={{ color: "var(--accent2)", fontWeight: 600, fontSize: 13, letterSpacing: ".04em" }}>
            2026 EDITION · UPDATED JUNE 2026
          </p>
          <h1 style={{ fontSize: 44, lineHeight: 1.1, letterSpacing: "-.02em", margin: "10px auto 14px", maxWidth: 720 }}>
            Master production AI engineering.
          </h1>
          <p style={{ color: "var(--dim2)", fontSize: 18, maxWidth: 620, margin: "0 auto" }}>
            Not prompt tricks — the real job: RAG, agents, harnesses, evals, cost
            and latency discipline, and the judgment to ship.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", margin: "26px 0 10px" }}>
            <Link href="/login" className="btn">Start free preview →</Link>
            <Link href="/pricing" className="btn ghost">See pricing</Link>
          </div>
          <p style={{ color: "var(--dim)", fontSize: 13 }}>No card required for the preview.</p>
        </section>

        {/* stats */}
        <section className="wrap" style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap", padding: "24px 20px" }}>
          {STATS.map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: "var(--accent)" }}>{n}</div>
              <div style={{ fontSize: 12.5, color: "var(--dim)" }}>{l}</div>
            </div>
          ))}
        </section>

        {/* curriculum */}
        <section className="wrap" style={{ paddingBottom: 12 }}>
          <h2 style={{ fontSize: 22, textAlign: "center", margin: "16px 0 18px" }}>What's inside</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            {BLOCKS.map(([h, b]) => (
              <div className="card" key={h}>
                <b>{h}</b>
                <p style={{ color: "var(--dim)", fontSize: 13.5, marginTop: 6 }}>{b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* faq */}
        <section className="wrap" style={{ paddingTop: 28, paddingBottom: 28, maxWidth: 680 }}>
          <h2 style={{ fontSize: 22, textAlign: "center", marginBottom: 16 }}>Questions</h2>
          {FAQ.map(([q, a]) => (
            <div className="card" key={q}>
              <b>{q}</b>
              <p style={{ color: "var(--dim)", fontSize: 14, marginTop: 4 }}>{a}</p>
            </div>
          ))}
          <div style={{ textAlign: "center", marginTop: 22 }}>
            <Link href="/login" className="btn">Start free preview →</Link>
          </div>
        </section>

        <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 20px", textAlign: "center", color: "var(--dim)", fontSize: 13 }}>
          <div className="wrap" style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Link href="/pricing">Pricing</Link>
            <Link href="/login">Sign in</Link>
          </div>
          <p style={{ marginTop: 10 }}>© 2026 AI Engineering Mastery Hub</p>
        </footer>
      </main>
    </>
  );
}
