import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import CertificateCard from "@/components/CertificateCard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { courseBySlug } from "@/lib/courses";
import {
  CERT_TIER_LABEL,
  certName,
  certUrl,
  linkedInAddUrl,
  type CertTier,
  type CertificateRecord,
} from "@/lib/certificates";
import type { CompletionSummary } from "@/lib/course";

export const dynamic = "force-dynamic";

// Public, verifiable, but not indexed (the page carries a person's name).
async function getCert(id: string): Promise<CertificateRecord | null> {
  // A malformed (non-uuid) id makes Postgres throw rather than return empty;
  // swallow it and treat as not-found.
  const { data } = await supabaseAdmin()
    .from("certificates")
    .select("id,course_id,tier,recipient_name,summary,issued_at")
    .eq("id", id)
    .maybeSingle();
  return (data as CertificateRecord | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cert = await getCert(id).catch(() => null);
  if (!cert) return { title: "Certificate — Novacademy", robots: { index: false } };
  const course = courseBySlug(cert.course_id);
  const who = cert.recipient_name ?? "A Novacademy learner";
  const title = `${who} — ${course?.title ?? "Course"} | Novacademy`;
  const description = `${CERT_TIER_LABEL[cert.tier]} verified by Novacademy.`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, url: `/cert/${cert.id}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cert = await getCert(id).catch(() => null);
  if (!cert) notFound();

  const course = courseBySlug(cert.course_id);
  const tier = cert.tier as CertTier;
  const courseTitle = course?.title ?? cert.course_id;
  const url = certUrl(cert.id);
  const name = certName(courseTitle, tier);
  const summary =
    cert.summary && "modulesTotal" in cert.summary
      ? (cert.summary as CompletionSummary)
      : null;

  return (
    <>
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <CertificateCard
          recipientName={cert.recipient_name ?? "Novacademy learner"}
          courseTitle={courseTitle}
          tierLabel={CERT_TIER_LABEL[tier]}
          issuedAt={cert.issued_at}
          summary={summary}
          verifyUrl={url}
          linkedInUrl={linkedInAddUrl({ name, id: cert.id, url, issuedAt: cert.issued_at })}
          certId={cert.id}
        />
        <p style={{ textAlign: "center", color: "var(--dim)", fontSize: 13.5, marginTop: 24 }}>
          Earn your own at <Link href="/courses">Novacademy</Link> — practical AI skills,
          graded as you go.
        </p>
      </main>
    </>
  );
}
