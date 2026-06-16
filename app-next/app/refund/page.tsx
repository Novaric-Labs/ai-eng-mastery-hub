import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Novacademy membership billing, cancellation, and our 14-day money-back guarantee on your first payment.",
  alternates: { canonical: "/refund" },
};

export default function Refund() {
  return (
    <LegalPage title="Refund Policy" updated="June 16, 2026">
      <p>
        Novacademy is a <strong>membership</strong> — a recurring subscription that unlocks every course
        on the platform while it&rsquo;s active. This policy explains cancellation, renewals, and refunds.
      </p>

      <h2>Cancel anytime</h2>
      <p>
        You can cancel your membership whenever you like from <strong>Manage membership</strong> in your
        account (or by emailing us). When you cancel, your membership stays active until the end of the
        billing period you&rsquo;ve already paid for, and you won&rsquo;t be charged again. We don&rsquo;t
        prorate or refund the unused part of a period that&rsquo;s already started, except where required
        by law.
      </p>

      <h2>14-day money-back guarantee (first payment)</h2>
      <p>
        We want you to buy with confidence. If you&rsquo;re not satisfied, request a refund within{" "}
        <strong>14 days</strong> of your <strong>first</strong> membership payment and we&rsquo;ll refund
        that payment in full and cancel your membership — no complicated hoops.
      </p>

      <h2>Renewals</h2>
      <p>
        Your membership <strong>auto-renews</strong> at the end of each billing period (monthly, 3-month,
        6-month, or annual, depending on the plan you chose) until you cancel. To avoid a renewal charge,
        cancel before your renewal date — you can see that date in <strong>Manage membership</strong>.
        Renewal payments are generally <strong>non-refundable</strong>, but you can cancel at any time to
        stop future charges.
      </p>

      <h2>How to cancel or request a refund</h2>
      <p>
        Cancel yourself anytime via <strong>Manage membership</strong> (this opens our secure billing
        portal). For a refund under the guarantee above, email <strong>support@novacademy.ai</strong> from
        the address on your account. Approved refunds go back to your original payment method and typically
        appear within 5&ndash;10 business days, depending on your bank.
      </p>

      <h2>What happens to access</h2>
      <p>
        When your membership ends or a refund is issued, access to the paid content is removed. Your
        account and any free preview content (orientation, glossary, and the sample module) remain
        available. Any course you unlocked permanently with an access code stays unlocked.
      </p>

      <h2>Exceptions</h2>
      <ul>
        <li>The money-back guarantee applies to your first membership payment only, not to renewals.</li>
        <li>Access granted via free access codes or complimentary/comped access isn&rsquo;t eligible for a
          cash refund (there was no payment).</li>
        <li>We may decline refunds in cases of abuse — for example, evidence of content sharing, piracy, or
          repeated refund-and-resubscribe.</li>
      </ul>

      <h2>Your statutory rights</h2>
      <p>
        Nothing here limits any non-waivable consumer rights you may have under the laws of your country
        (for example, EU/UK withdrawal rights for digital purchases).
      </p>

      <h2>Contact</h2>
      <p>
        Questions about billing or a refund? Email <strong>support@novacademy.ai</strong>.
      </p>
    </LegalPage>
  );
}
