"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import RedeemDialog from "./RedeemDialog";

// Shown wherever paid content is requested by a non-entitled user (locked
// module, flashcards, scenarios). Unlock → membership pricing; or redeem a code.
export default function Paywall({
  heading = "This is part of the full course",
  blurb = "A Novacademy membership unlocks every course — all modules, quizzes, flashcards, scenarios, and code patterns. From $21/mo, cancel anytime.",
}: {
  heading?: string;
  blurb?: string;
}) {
  return (
    <div className="lockcard">
      <h3><Lock size={18} strokeWidth={1.75} /> {heading}</h3>
      <p style={{ color: "var(--dim)", marginBottom: 14 }}>{blurb}</p>
      <Link href="/pricing" className="btn">
        See membership plans <ArrowRight size={16} strokeWidth={1.75} />
      </Link>
      <RedeemDialog />
    </div>
  );
}
