import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { paymentsEnabled } from "@/lib/payments";
import { FOUNDING } from "@/lib/offer";

// Slim launch announcement bar for the Founding Member offer. Rendered above the
// page content on the marketing pages. Hidden in invite/free mode (no checkout
// to redeem against). The code itself is entered on the Stripe Checkout page.
export default function FoundingBanner() {
  if (!paymentsEnabled) return null;

  return (
    <Link
      href="/pricing"
      aria-label={`Founding offer: ${FOUNDING.percentOff}% off for life, ends ${FOUNDING.endsLabel}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        flexWrap: "wrap",
        padding: "9px 16px",
        background: "var(--accent-soft)",
        color: "var(--text)",
        borderBottom: "1px solid var(--border)",
        fontSize: 13.5,
        textAlign: "center",
        textDecoration: "none",
      }}
    >
      <Sparkles size={15} strokeWidth={1.75} style={{ color: "var(--accent)", flexShrink: 0 }} />
      <span>
        <b>Founding offer</b> —{" "}
        <b style={{ color: "var(--accent)" }}>{FOUNDING.percentOff}% off for life</b> with code{" "}
        <b style={{ fontFamily: "var(--mono, monospace)", letterSpacing: ".02em" }}>{FOUNDING.code}</b>
        . Ends {FOUNDING.endsLabel}.
      </span>
      <ArrowRight size={14} strokeWidth={2} style={{ color: "var(--accent)", flexShrink: 0 }} />
    </Link>
  );
}
