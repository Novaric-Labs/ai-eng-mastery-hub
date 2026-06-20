import { TESTIMONIALS } from "@/lib/testimonials";

// Homepage social-proof section. Renders nothing until real quotes exist in
// lib/testimonials.ts — an empty section reads worse than no section, and fake
// testimonials on a paid product are a trust (and legal) risk.
export default function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="wrap" style={{ paddingTop: 36, paddingBottom: 8, maxWidth: 760 }}>
      <h2 style={{ fontSize: 22, textAlign: "center", marginBottom: 6 }}>What members say</h2>
      <p style={{ textAlign: "center", color: "var(--dim)", fontSize: 14, marginBottom: 22 }}>
        Early members on what actually clicked.
      </p>
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        {TESTIMONIALS.map((t) => (
          <figure key={t.name + t.quote.slice(0, 16)} className="card" style={{ margin: 0, padding: 20 }}>
            <blockquote style={{ margin: 0, color: "var(--text)", fontSize: 14.5, lineHeight: 1.5 }}>
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption style={{ marginTop: 12, color: "var(--dim)", fontSize: 12.5 }}>
              <b style={{ color: "var(--dim2)" }}>{t.name}</b>
              {t.role && <span> · {t.role}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
