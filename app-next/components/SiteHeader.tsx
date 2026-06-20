import Link from "next/link";
import NovaMark from "@/components/NovaMark";

// Server component — simple marketing nav for public pages.
export default function SiteHeader() {
  return (
    <header className="siteheader-bar">
      <div className="siteheader">
        <Link href="/" className="sh-logo brand">
          <NovaMark size={20} className="brand-mark" />
          <span className="brand-word">Novacademy</span>
        </Link>
        <nav className="sh-nav">
          <Link href="/blog">Blog</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/login" className="btn sm">
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
