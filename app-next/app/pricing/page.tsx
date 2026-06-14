import Link from "next/link";

export const metadata = { title: "Pricing — AI Engineering Mastery Hub" };

// Pricing — Server Component (SEO). The actual price lives in Stripe; this is copy.
export default function Pricing() {
  return (
    <main className="wrap" style={{ paddingTop: 64, paddingBottom: 64, maxWidth: 560 }}>
      <h1 style={{ fontSize: 30, marginBottom: 8 }}>One price. Lifetime access.</h1>
      <p style={{ color: "var(--dim2)", marginBottom: 24 }}>
        Buy once, keep it forever — including updates as the field moves.
      </p>

      <div className="card" style={{ borderColor: "var(--accent2)", padding: 24 }}>
        <b style={{ color: "var(--accent2)" }}>Full access</b>
        <ul style={{ listStyle: "none", margin: "12px 0" }}>
          {[
            "All 21 modules across 5 blocks",
            "Quizzes + block mastery exams",
            "Spaced-repetition flashcards",
            "Production scenarios with model answers",
            "Runnable code patterns + debugging guides",
            "Progress synced across your devices",
          ].map((f) => (
            <li key={f} style={{ padding: "5px 0", color: "var(--dim2)" }}>
              ✓ {f}
            </li>
          ))}
        </ul>
        <Link href="/login" className="btn" style={{ display: "inline-block" }}>
          Get access →
        </Link>
      </div>

      <p style={{ color: "var(--dim)", fontSize: 13.5, marginTop: 20 }}>
        Have an access code? Sign in and enter it on the course page.
      </p>
    </main>
  );
}
