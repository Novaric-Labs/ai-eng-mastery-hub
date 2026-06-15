import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Novacademy's 14-day money-back guarantee for course purchases.",
  alternates: { canonical: "/refund" },
};

export default function Refund() {
  return (
    <LegalPage title="Refund Policy" updated="June 15, 2026">
      <p>
        We want you to be confident in your purchase. Novacademy offers a straightforward money-back
        guarantee on course purchases, described below.
      </p>

      <h2>14-day money-back guarantee</h2>
      <p>
        If you&rsquo;re not satisfied with the course, request a refund within <strong>14 days</strong> of
        your purchase and we&rsquo;ll refund you in full — no complicated hoops. This applies to one-time
        course purchases made through our checkout.
      </p>

      <h2>How to request</h2>
      <p>
        Email <strong>support@novacademy.ai</strong> from the address on your account, with your purchase
        details. We&rsquo;ll process eligible refunds to your original payment method (refunds typically
        appear within 5–10 business days, depending on your bank).
      </p>

      <h2>What happens to access</h2>
      <p>
        When a refund is issued, your access to the paid content is revoked. Your account and any free
        preview content remain available.
      </p>

      <h2>Exceptions</h2>
      <ul>
        <li>Requests made more than 14 days after purchase are generally not eligible.</li>
        <li>Access granted via free access codes or complimentary/comped access isn&rsquo;t eligible for a
          cash refund (there was no payment).</li>
        <li>We may decline refunds in cases of abuse — for example, evidence of content sharing, piracy, or
          repeated refund-and-repurchase.</li>
      </ul>

      <h2>Your statutory rights</h2>
      <p>
        Nothing here limits any non-waivable consumer rights you may have under the laws of your country
        (for example, EU/UK withdrawal rights for digital purchases).
      </p>

      <h2>Contact</h2>
      <p>
        Questions about a refund? Email <strong>support@novacademy.ai</strong>.
      </p>
    </LegalPage>
  );
}
