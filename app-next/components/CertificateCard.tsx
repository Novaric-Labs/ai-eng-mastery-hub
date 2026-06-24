import { Award, Check } from "lucide-react";
import type { CompletionSummary } from "@/lib/course";

// Presentational certificate — used by the public verification page. Renders the
// proof of work (graded exams, modules, scenarios), not just a name, so the
// credential signals demonstrated skill. No client state; safe in a Server
// Component.
export default function CertificateCard({
  recipientName,
  courseTitle,
  tierLabel,
  issuedAt,
  summary,
  verifyUrl,
  linkedInUrl,
  certId,
}: {
  recipientName: string;
  courseTitle: string;
  tierLabel: string;
  issuedAt: string;
  summary: CompletionSummary | null;
  verifyUrl: string;
  linkedInUrl?: string;
  certId: string;
}) {
  const issued = new Date(issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const stats: { big: string; lbl: string }[] = summary
    ? [
        { big: `${summary.modulesMastered}/${summary.modulesTotal}`, lbl: "Modules mastered" },
        { big: `${summary.examsPassed}/${summary.examsTotal}`, lbl: `Mastery exams passed (avg ${summary.examAvg}%)` },
        { big: `${summary.scenariosCompleted}`, lbl: "Production scenarios" },
      ]
    : [];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div
        className="card"
        style={{
          padding: "34px 30px",
          textAlign: "center",
          borderColor: "var(--accent)",
          boxShadow: "0 0 0 1px var(--accent), var(--shadow-2)",
        }}
      >
        {/* Brand + credential type */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700, letterSpacing: "-.01em" }}>
          <span style={{ color: "var(--accent)", fontSize: 18 }}>◆</span>
          <span style={{ fontSize: 16 }}>Novacademy</span>
        </div>
        <p
          className="eyebrow"
          style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}
        >
          <Award size={14} strokeWidth={2} /> {tierLabel}
        </p>

        <p style={{ color: "var(--dim2)", marginTop: 18, fontSize: 14 }}>This certifies that</p>
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "-.02em",
            margin: "6px 0 4px",
            color: "var(--text)",
          }}
        >
          {recipientName}
        </div>
        <p style={{ color: "var(--dim2)", fontSize: 14 }}>has completed</p>
        <div style={{ fontSize: 19, fontWeight: 600, color: "var(--accent)", marginTop: 4 }}>
          {courseTitle}
        </div>

        {/* Proof of work */}
        {stats.length > 0 && (
          <div className="statgrid" style={{ marginTop: 22, textAlign: "center" }}>
            {stats.map((s) => (
              <div className="stat" key={s.lbl}>
                <div className="big">{s.big}</div>
                <div className="lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        )}

        {/* Issue + verification */}
        <div style={{ marginTop: 22, color: "var(--dim)", fontSize: 12.5, lineHeight: 1.6 }}>
          <div>
            Issued {issued}
            {summary ? ` · Level ${summary.level} · ${summary.xp} XP` : ""}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4 }}>
            <Check size={13} strokeWidth={2} style={{ color: "var(--green)" }} />
            Verify at {verifyUrl.replace(/^https?:\/\//, "")}
          </div>
          <div style={{ marginTop: 2, color: "var(--faint)", fontFamily: "var(--mono, monospace)", fontSize: 11 }}>
            ID {certId}
          </div>
        </div>
      </div>

      {linkedInUrl && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <a className="btn" href={linkedInUrl} target="_blank" rel="noopener noreferrer">
            Add to LinkedIn
          </a>
        </div>
      )}
    </div>
  );
}
