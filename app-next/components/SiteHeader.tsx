import Link from "next/link";

// Server component — simple marketing nav for public pages.
export default function SiteHeader() {
  return (
    <header className="siteheader">
      <Link href="/" className="sh-logo">⚡ AI Engineering Mastery Hub</Link>
      <nav className="sh-nav">
        <Link href="/pricing">Pricing</Link>
        <Link href="/login" className="btn" style={{ padding: "7px 16px" }}>
          Sign in
        </Link>
      </nav>
    </header>
  );
}
