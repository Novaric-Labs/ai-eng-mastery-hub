import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Novacademy — AI Engineering Mastery Hub",
    template: "%s · Novacademy",
  },
  description:
    "Novacademy's self-paced course to master production AI engineering: RAG, agents, harnesses, evals, and the judgment to ship. 21 modules, quizzes, flashcards, and real-world scenarios.",
  applicationName: "Novacademy",
  openGraph: {
    title: "Novacademy — AI Engineering Mastery Hub",
    description:
      "Master production AI engineering — RAG, agents, evals, and the judgment to ship.",
    type: "website",
    url: SITE_URL,
    siteName: "Novacademy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Novacademy — AI Engineering Mastery Hub",
    description:
      "Master production AI engineering — RAG, agents, evals, and the judgment to ship.",
  },
};

// Apply the saved theme before first paint to avoid a dark→light flash.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('aihub_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
