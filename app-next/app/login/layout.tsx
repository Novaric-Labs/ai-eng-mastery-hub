import type { Metadata } from "next";

// login/page.tsx is a Client Component and can't export metadata itself, so the
// title + noindex live here. The sign-in page has no SEO value.
export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the AI Engineering Mastery Hub to start the free preview or access your course.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
