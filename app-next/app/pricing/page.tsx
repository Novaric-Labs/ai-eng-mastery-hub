import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import PlanPicker from "@/components/PlanPicker";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "One membership unlocks every Novacademy course. $35/month, or save with a 3-month, 6-month, or annual plan. Cancel anytime.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — Novacademy",
    description: "One membership, every course. From $21/mo. Cancel anytime.",
    url: "/pricing",
  },
};

// What the membership includes.
const INCLUDES = [
  "Every course on the platform — current and future",
  "All modules, quizzes, and block mastery exams",
  "Spaced-repetition flashcards + production scenarios",
  "Runnable code patterns + debugging guides",
  "AI tutor + scenario grading",
  "Progress synced across your devices",
];

// Pricing — Server Component shell (SEO) with a client plan picker for checkout.
export default function Pricing() {
  return (
    <>
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 56, paddingBottom: 64, maxWidth: 720 }}>
        <p className="eyebrow" style={{ textAlign: "center" }}>MEMBERSHIP</p>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-.02em", margin: "10px 0 8px", textAlign: "center" }}>
          One membership. Every course.
        </h1>
        <p style={{ color: "var(--dim2)", marginBottom: 28, textAlign: "center" }}>
          Unlock the whole platform for $35/month — or pay for longer and save. Cancel anytime.
        </p>

        <PlanPicker />

        <div className="card" style={{ marginTop: 26, padding: 24, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
          <b style={{ fontSize: 15 }}>Every plan includes</b>
          <ul className="checklist" style={{ marginTop: 12 }}>
            {INCLUDES.map((f) => (
              <li key={f}><Check size={16} strokeWidth={2} /> {f}</li>
            ))}
          </ul>
        </div>

        <p style={{ color: "var(--dim)", fontSize: 13.5, marginTop: 20, textAlign: "center" }}>
          Just browsing? <Link href="/login">Sign in</Link> to read the orientation, glossary, and a
          full sample module free. Have an access code? Enter it on the course page.
        </p>
        <p style={{ color: "var(--faint)", fontSize: 12.5, marginTop: 10, textAlign: "center" }}>
          Cancel anytime from your account — access runs to the end of the period you paid for. By
          subscribing you agree to our <Link href="/terms">Terms</Link>.
        </p>
      </main>
    </>
  );
}
