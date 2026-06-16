import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of Novacademy and its membership courses.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="June 16, 2026">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Novacademy
        (the &ldquo;Service&rdquo;), operated by <strong>[Novacademy — legal entity name]</strong>
        {" "}(&ldquo;we&rdquo;, &ldquo;us&rdquo;), including its online courses at{" "}
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
        While you have an active membership, or upon redemption of an access code, we grant you a personal,
        non-exclusive, non-transferable, revocable license to access the course content available to you for
        your own learning. You may not:
      </p>
      <ul>
        <li>share, resell, sublicense, or redistribute the content or your account access;</li>
        <li>scrape, copy, or republish substantial portions of the content;</li>
        <li>circumvent the paywall, access controls, or rate limits;</li>
        <li>use the Service unlawfully or to infringe others&rsquo; rights.</li>
      </ul>

      <h2>4. Membership, billing &amp; auto-renewal</h2>
      <p>
        Access to paid content is provided through a <strong>membership</strong> — a recurring subscription
        that unlocks every course on the platform (current and future) while it is active. You choose a plan
        at checkout (for example, monthly, 3-month, 6-month, or annual). Payments are processed by{" "}
        <strong>Stripe</strong>; we don&rsquo;t store your card details.
      </p>
      <p>
        <strong>Your membership automatically renews</strong> at the end of each billing period at the
        then-current price for your plan, and your payment method is charged for the next period, until you
        cancel. You can <strong>cancel at any time</strong> from &ldquo;Manage membership&rdquo; in your
        account; cancellation takes effect at the end of the current paid period, after which renewal stops
        and paid access ends. We may change prices, but a price change applies only to billing periods that
        begin after we notify you. As an alternative to membership, access to a specific course may also be
        granted by a valid access code we issue. Cancellations and refunds are governed by our{" "}
        <a href="/refund">Refund Policy</a>.
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
