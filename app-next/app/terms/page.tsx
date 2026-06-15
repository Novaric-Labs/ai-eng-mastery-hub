import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of Novacademy and the AI Engineering Mastery Hub course.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="June 15, 2026">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Novacademy
        (the &ldquo;Service&rdquo;), operated by <strong>[Novacademy — legal entity name]</strong>
        {" "}(&ldquo;we&rdquo;, &ldquo;us&rdquo;), including the AI Engineering Mastery Hub course at{" "}
        <strong>novacademy.ai</strong>. By creating an account or using the Service you agree to these Terms.
        If you don&rsquo;t agree, don&rsquo;t use the Service.
      </p>

      <h2>1. The Service</h2>
      <p>
        Novacademy provides self-paced, online educational content — written lessons, code patterns,
        quizzes, flashcards, and practice scenarios — about AI engineering. Content is provided for
        learning purposes and may be updated, expanded, or revised over time.
      </p>

      <h2>2. Your account</h2>
      <p>
        You sign in with your email via a one-time link (and optionally Google). You&rsquo;re responsible
        for the activity under your account and for keeping access to your email secure. Provide an
        accurate email address. You must be at least 16 years old (or the age of digital consent in your
        country) to use the Service.
      </p>

      <h2>3. License &amp; acceptable use</h2>
      <p>
        Upon purchase or redemption of an access code, we grant you a personal, non-exclusive,
        non-transferable, revocable license to access the course content for your own learning. You may not:
      </p>
      <ul>
        <li>share, resell, sublicense, or redistribute the content or your account access;</li>
        <li>scrape, copy, or republish substantial portions of the content;</li>
        <li>circumvent the paywall, access controls, or rate limits;</li>
        <li>use the Service unlawfully or to infringe others&rsquo; rights.</li>
      </ul>

      <h2>4. Purchases &amp; access</h2>
      <p>
        Access may be obtained by a one-time purchase (lifetime access to the purchased course) or by a
        valid access code we issue. Payments are processed by <strong>Stripe</strong>; we don&rsquo;t store
        your card details. Prices may change, but changes don&rsquo;t affect access you&rsquo;ve already
        purchased. Refunds are governed by our <a href="/refund">Refund Policy</a>.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        All course content, branding, and materials are owned by us or our licensors and protected by
        intellectual-property laws. Your license to access them does not transfer any ownership. Code
        snippets and patterns in the course may be used in your own projects.
      </p>

      <h2>6. No professional advice; no guarantees</h2>
      <p>
        The content is educational and provided &ldquo;as is.&rdquo; It is not professional, legal, or
        financial advice, and we make no guarantee of any particular outcome, certification, job, or result
        from using it.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for indirect, incidental, or
        consequential damages, and our total liability for any claim relating to the Service is limited to
        the amount you paid us for it in the 12 months before the claim.
      </p>

      <h2>8. Termination</h2>
      <p>
        We may suspend or terminate access that breaches these Terms (for example, sharing or piracy),
        without refund where the breach is material. You may stop using the Service at any time.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update these Terms; material changes will be reflected by the &ldquo;Last updated&rdquo;
        date above. Continued use after changes means you accept them.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of <strong>[your jurisdiction — e.g., State of ___, USA]</strong>,
        without regard to conflict-of-laws rules.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms? Email <strong>support@novacademy.ai</strong>.
      </p>
    </LegalPage>
  );
}
