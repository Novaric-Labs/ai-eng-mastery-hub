// Certificate domain helpers — tiers, shareable URLs, and the LinkedIn
// "Add to profile" deep link. Kept framework-free so both the issuance route
// and the public verification page can import it.

import type { CompletionSummary } from "./course";

export type CertTier = "completion" | "verified";

export const CERT_TIER_LABEL: Record<CertTier, string> = {
  completion: "Certificate of Completion",
  // Reserved for the capstone-reviewed, firm-eligible tier (not yet issued).
  verified: "Verified Certificate",
};

// A persisted certificate, as read back from the `certificates` table.
export type CertificateRecord = {
  id: string;
  course_id: string;
  tier: CertTier;
  recipient_name: string | null;
  summary: CompletionSummary | Record<string, never>;
  issued_at: string;
};

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.novacademy.ai"
  );
}

export function certUrl(id: string): string {
  return `${siteUrl()}/cert/${id}`;
}

// The credential's name, e.g. "AI Engineering Mastery Hub — Certificate of Completion".
export function certName(courseTitle: string, tier: CertTier): string {
  return `${courseTitle} — ${CERT_TIER_LABEL[tier]}`;
}

// LinkedIn "Add to profile" prefilled link. Opening it drops the learner into
// LinkedIn's Add-Licenses-&-Certifications form with the fields filled in.
// Params per LinkedIn's documented add-to-profile contract.
export function linkedInAddUrl(opts: {
  name: string;
  id: string;
  url: string;
  issuedAt: string;
}): string {
  const d = new Date(opts.issuedAt);
  const p = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: opts.name,
    organizationName: "Novacademy",
    issueYear: String(d.getUTCFullYear()),
    issueMonth: String(d.getUTCMonth() + 1),
    certId: opts.id,
    certUrl: opts.url,
  });
  return `https://www.linkedin.com/profile/add?${p.toString()}`;
}
