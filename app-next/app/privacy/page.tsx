import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Novacademy collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Privacy Policy — Novacademy", url: "/privacy" },
};

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="June 15, 2026" path="/privacy">
      <p>
        This Privacy Policy explains what data Novacademy (&ldquo;we&rdquo;, operated by{" "}
        <strong>Novaric Labs LLC</strong>) collects and how we use it. We aim to collect
        as little as possible.
      </p>

      <h2>1. Data we collect</h2>
      <ul>
        <li><strong>Account:</strong> your email address (used for magic-link sign-in), and a user id.</li>
        <li><strong>Learning progress:</strong> which modules you&rsquo;ve read, quiz/exam scores, flashcard
          and scenario state — so your progress syncs across devices.</li>
        <li><strong>Payment:</strong> handled entirely by Stripe. We receive a confirmation and your
          entitlement status, but <strong>never see or store your card details</strong>.</li>
        <li><strong>Usage analytics:</strong> aggregate, privacy-friendly page analytics (no cross-site
          tracking, no ad cookies) to understand what&rsquo;s used.</li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>to provide the course, authenticate you, and sync your progress;</li>
        <li>to process purchases and grant/revoke access;</li>
        <li>to send essential account email (sign-in links, purchase receipts);</li>
        <li>to improve the product in aggregate.</li>
      </ul>
      <p>We do <strong>not</strong> sell your personal data.</p>

      <h2>3. Service providers</h2>
      <p>We share data only with processors that run the Service:</p>
      <ul>
        <li><strong>Supabase</strong> — authentication, database, and entitlement/progress storage.</li>
        <li><strong>Stripe</strong> — payment processing.</li>
        <li><strong>Vercel</strong> — application hosting and aggregate analytics.</li>
        <li><strong>Resend</strong> — delivery of sign-in and transactional email.</li>
      </ul>

      <h2>4. Cookies &amp; local storage</h2>
      <p>
        We use a first-party cookie to keep you signed in, and your browser&rsquo;s local storage to cache
        your theme preference and an offline copy of your progress. We don&rsquo;t use advertising or
        cross-site tracking cookies.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We keep your account and progress data while your account is active. You can request deletion at
        any time (see below); some records (e.g. payment/tax records) may be retained where required by law.
      </p>

      <h2>6. Your rights</h2>
      <p>
        Depending on your location (e.g. GDPR/UK GDPR, CCPA), you may have the right to access, correct,
        export, or delete your personal data, and to object to certain processing. To exercise these,
        email <strong>support@novacademy.ai</strong> and we&rsquo;ll respond within a reasonable time.
      </p>

      <h2>7. Security</h2>
      <p>
        Data is stored with our providers using industry-standard protections, and access to paid content
        and personal rows is enforced server-side. No system is perfectly secure, but we take reasonable
        measures to protect your data.
      </p>

      <h2>8. International transfers</h2>
      <p>
        Our providers may process data in countries other than yours. Where required, transfers rely on
        appropriate safeguards (such as standard contractual clauses).
      </p>

      <h2>9. Children</h2>
      <p>
        The Service isn&rsquo;t directed to children under 16 and we don&rsquo;t knowingly collect their data.
      </p>

      <h2>10. Changes &amp; contact</h2>
      <p>
        We may update this policy; the &ldquo;Last updated&rdquo; date reflects changes. Questions or
        requests: <strong>support@novacademy.ai</strong>.
      </p>
    </LegalPage>
  );
}
