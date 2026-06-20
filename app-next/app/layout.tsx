import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, organizationSchema, webSiteSchema } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Novacademy — Learn AI Skills: RAG, Agents & Evals",
    template: "%s · Novacademy",
  },
  description:
    "Novacademy is an online learning platform for modern AI skills. One membership unlocks every course — RAG, agents, harnesses, evals, and the engineering judgment to ship. From $21/mo, cancel anytime.",
  applicationName: "Novacademy",
  keywords: [
    "AI courses",
    "learn AI engineering",
    "RAG course",
    "AI agents course",
    "LLM evals",
    "prompt engineering",
    "AI foundations for beginners",
    "online AI education",
  ],
  openGraph: {
    title: "Novacademy — Learn AI Skills: RAG, Agents & Evals",
    description:
      "Online courses on the real AI job — RAG, agents, evals, and the judgment to ship. One membership unlocks every course.",
    type: "website",
    url: SITE_URL,
    siteName: "Novacademy",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Novacademy — Learn AI Skills: RAG, Agents & Evals",
    description:
      "Online courses on the real AI job — RAG, agents, evals, and the judgment to ship. One membership unlocks every course.",
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
        <JsonLd schema={[organizationSchema(), webSiteSchema()]} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
