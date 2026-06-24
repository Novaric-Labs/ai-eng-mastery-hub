import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import CertificateCard from "@/components/CertificateCard";
import { courseBySlug } from "@/lib/courses";
import { CERT_TIER_LABEL, certUrl, certName, linkedInAddUrl } from "@/lib/certificates";

// Local-only design preview for the certificate card — never served in
// production (the real, verifiable page lives at /cert/[id]). Lets the owner
// eyeball the visual before the DB migration is applied.
export const dynamic = "force-dynamic";

export default function CertificatePreview() {
  if (process.env.NODE_ENV === "production") notFound();

  const course = courseBySlug("ai-eng");
  const id = "00000000-0000-0000-0000-000000000000";
  const title = course?.title ?? "AI Engineering Mastery Hub";
  const url = certUrl(id);

  return (
    <>
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <p style={{ textAlign: "center", color: "var(--amber)", fontSize: 12.5, marginBottom: 16 }}>
          Preview only (dev) — sample data. The real certificate lives at /cert/&lt;id&gt;.
        </p>
        <CertificateCard
          recipientName="Alex Rivera"
          courseTitle={title}
          tierLabel={CERT_TIER_LABEL.completion}
          issuedAt="2026-06-20T00:00:00.000Z"
          summary={{
            modulesMastered: 21,
            modulesTotal: 21,
            examsPassed: 6,
            examsTotal: 6,
            examAvg: 92,
            scenariosCompleted: 8,
            level: 14,
            xp: 3120,
          }}
          verifyUrl={url}
          linkedInUrl={linkedInAddUrl({
            name: certName(title, "completion"),
            id,
            url,
            issuedAt: "2026-06-20T00:00:00.000Z",
          })}
          certId={id}
        />
      </main>
    </>
  );
}
