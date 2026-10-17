import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";
import { AFFILIATE } from "@/lib/affiliate";

export const metadata: Metadata = {
  title: "Affiliate Program — Earn 30% Recurring",
  description:
    "Promote Novacademy and earn 30% recurring commission for 12 months on every member you refer, plus a 15% discount for your audience. Free to join.",
  alternates: { canonical: "/affiliates" },
  openGraph: {
    title: "Novacademy Affiliate Program",
    description:
      "Earn 30% recurring for 12 months per referred member. Your audience gets 15% off. Free to join.",
    url: "/affiliates",
  },
  twitter: {
    card: "summary_large_image",
    title: "Novacademy Affiliate Program",
    description:
      "Earn 30% recurring for 12 months per referred member. Your audience gets 15% off.",
  },
};

// Headline numbers for the program.
const STATS: [string, string][] = [
  [`${AFFILIATE.commissionPct}%`, "recurring commission"],
  [`${AFFILIATE.commissionMonths} months`, "paid per referral"],
  [`${AFFILIATE.learnerDiscountPct}% off`, "for your audience"],
];

const STEPS: [string, string][] = [
  [
    "Apply in 2 minutes",
    "Tell us where you'll share Novacademy. Approval is fast — we approve anyone with a relevant, genuine audience.",
  ],
  [
    "Get your link + code",
    "You'll get a unique referral link with click tracking and a discount code for your audience, plus a dashboard that shows clicks, signups, and earnings in real time.",
  ],
  [
    "Earn every month",
    `When someone subscribes through your link, you earn ${AFFILIATE.commissionPct}% of their payments for ${AFFILIATE.commissionMonths} months. Get paid out monthly.`,
  ],
];

const FOR_YOU = [
  "AI / developer YouTubers and streamers",
  "AI, data, or dev newsletter writers",
  "Build-in-public creators on X or LinkedIn",
  "Bootcamp, community, and Discord operators",
  "Bloggers writing tutorials and “best course” roundups",
];

export default function Affiliates() {
  // External/mailto target — plain anchor (Link is for internal routes).
  const apply = AFFILIATE.signupUrl;

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          ["Home", "/"],
          ["Affiliates", "/affiliates"],
        ])}
      />
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 56, paddingBottom: 72, maxWidth: 760 }}>
        {/* Hero */}
        <p className="eyebrow" style={{ textAlign: "center" }}>AFFILIATE PROGRAM</p>
        <h1
          style={{
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: "-.02em",
            margin: "10px 0 12px",
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          Earn {AFFILIATE.commissionPct}% recurring for sharing
          <br /> a course you believe in.
        </h1>
        <p
          style={{
            color: "var(--dim2)",
            marginBottom: 26,
            textAlign: "center",
            fontSize: 16,
            maxWidth: 560,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Novacademy teaches the real AI skills people are scrambling to learn. Send your
          audience our way and earn <b>{AFFILIATE.commissionPct}% of their membership for{" "}
          {AFFILIATE.commissionMonths} months</b> — they get <b>{AFFILIATE.learnerDiscountPct}% off</b>{" "}
          as a thank-you. Free to join, no cap on earnings.
        </p>

        <div style={{ textAlign: "center" }}>
          <a href={apply} className="btn" style={{ padding: "10px 22px", fontSize: 15 }}>
            Become an affiliate
          </a>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            margin: "34px 0 8px",
          }}
        >
          {STATS.map(([big, small]) => (
            <div key={small} className="card" style={{ padding: "18px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.02em", color: "var(--accent)" }}>
                {big}
              </div>
              <div style={{ color: "var(--dim)", fontSize: 13, marginTop: 4 }}>{small}</div>
            </div>
          ))}
        </div>
        <p style={{ color: "var(--faint)", fontSize: 12.5, textAlign: "center", marginTop: 6 }}>
          That&rsquo;s up to ~$70+ for every member who stays a year — and it stacks across
          your whole audience.
        </p>

        {/* How it works */}
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.01em", margin: "44px 0 16px" }}>
          How it works
        </h2>
        <div style={{ display: "grid", gap: 12 }}>
          {STEPS.map(([title, body], i) => (
            <div key={title} className="card" style={{ padding: 20, display: "flex", gap: 16 }}>
              <div
                style={{
                  flexShrink: 0,
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  background: "var(--accent)",
                  color: "#08080a",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                {i + 1}
              </div>
              <div>
                <b style={{ fontSize: 15 }}>{title}</b>
                <p style={{ color: "var(--dim2)", fontSize: 14, marginTop: 4 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two tiers */}
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.01em", margin: "44px 0 16px" }}>
          Two ways to earn
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="card" style={{ padding: 22 }}>
            <p className="eyebrow">AFFILIATE</p>
            <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0 2px" }}>
              {AFFILIATE.commissionPct}% recurring
            </div>
            <p style={{ color: "var(--dim)", fontSize: 13, marginBottom: 12 }}>
              Open to everyone, free to join.
            </p>
            <ul className="checklist">
              <li><Check size={16} strokeWidth={2} /> {AFFILIATE.commissionMonths} months of commission per member</li>
              <li><Check size={16} strokeWidth={2} /> {AFFILIATE.learnerDiscountPct}% discount code for your audience</li>
              <li><Check size={16} strokeWidth={2} /> Real-time dashboard + monthly payouts</li>
            </ul>
          </div>
          <div className="card" style={{ padding: 22, borderColor: "var(--accent)" }}>
            <p className="eyebrow">PARTNER · INVITED</p>
            <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0 2px" }}>
              up to {AFFILIATE.partnerTierPct}%
            </div>
            <p style={{ color: "var(--dim)", fontSize: 13, marginBottom: 12 }}>
              For proven creators who consistently convert.
            </p>
            <ul className="checklist">
              <li><Check size={16} strokeWidth={2} /> Higher rate or a flat placement fee</li>
              <li><Check size={16} strokeWidth={2} /> Co-marketing + early access to new courses</li>
              <li><Check size={16} strokeWidth={2} /> Custom landing pages for your audience</li>
            </ul>
          </div>
        </div>

        {/* Who it's for */}
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.01em", margin: "44px 0 14px" }}>
          Built for people who teach
        </h2>
        <div className="card" style={{ padding: 22 }}>
          <ul className="checklist">
            {FOR_YOU.map((f) => (
              <li key={f}><Check size={16} strokeWidth={2} /> {f}</li>
            ))}
          </ul>
        </div>

        {/* Final CTA */}
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.01em", marginBottom: 6 }}>
            Ready to earn?
          </h2>
          <p style={{ color: "var(--dim2)", marginBottom: 18 }}>
            Join free, get your link, and start earning on your next post.
          </p>
          <a href={apply} className="btn" style={{ padding: "10px 22px", fontSize: 15 }}>
            Become an affiliate
          </a>
          <p style={{ color: "var(--faint)", fontSize: 12.5, marginTop: 16 }}>
            Questions? Email <a href={`mailto:${AFFILIATE.contactEmail}`}>{AFFILIATE.contactEmail}</a>.
            New here? <Link href="/pricing">See what members get</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
