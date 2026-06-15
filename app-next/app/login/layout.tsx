import type { Metadata } from "next";

// login/page.tsx is a Client Component and can't export metadata itself, so the
// title + noindex live here. The sign-in page has no SEO value.
export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the AI Engineering Mastery Hub to start the free preview or access your course.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/login" },
};

// The login page builds a Supabase browser client at render, which requires the
// public env vars. Render it dynamically (per-request) instead of prerendering at
// build time, so the build never depends on env being present. It's an interactive
// auth page with no SEO value anyway (also noindex above).
export const dynamic = "force-dynamic";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
