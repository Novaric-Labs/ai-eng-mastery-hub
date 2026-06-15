import Link from "next/link";
import { Zap } from "lucide-react";

// Server component — simple marketing nav for public pages.
export default function SiteHeader() {
  return (
    <header className="siteheader-bar">
      <div className="siteheader">
        <Link href="/" className="sh-logo">
          <Zap size={18} strokeWidth={1.75} fill="currentColor" />
          AI Engineering Mastery Hub
        </Link>
        <nav className="sh-nav">
          <Link href="/pricing">Pricing</Link>
          <Link href="/login" className="btn sm">
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
