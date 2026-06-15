import Link from "next/link";
import SiteHeader from "./SiteHeader";

// Shared shell for Terms / Privacy / Refund — SiteHeader + a readable prose column.
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="wrap legal" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 760 }}>
        <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-.02em", marginBottom: 6 }}>{title}</h1>
        <p style={{ color: "var(--faint)", fontSize: 13.5, marginBottom: 28 }}>Last updated: {updated}</p>
        {children}
        <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "32px 0 16px" }} />
        <p style={{ color: "var(--dim)", fontSize: 13 }}>
          <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link> ·{" "}
          <Link href="/refund">Refund</Link> · <Link href="/">Home</Link>
        </p>
      </main>
    </>
  );
}
