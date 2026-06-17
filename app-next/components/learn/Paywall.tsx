"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import RedeemDialog from "./RedeemDialog";
import { paymentsEnabled } from "@/lib/payments";

// Shown wherever paid content is requested by a non-entitled user (locked
// module, flashcards, scenarios). Unlock → membership pricing; or redeem a code.
// In invite/free mode (payments off) the access code is the only unlock path, so
// lead with it and hide the membership link (which would dead-end at checkout).
export default function Paywall({
  heading = "This is part of the full course",
  blurb,
}: {
  heading?: string;
  blurb?: string;
}) {
  const text =
    blurb ??
    (paymentsEnabled
      ? "A Novacademy membership unlocks every course — all modules, quizzes, flashcards, scenarios, and code patterns. From $21/mo, cancel anytime."
      : "Novacademy is invite-only right now. Have an access code? Enter it to unlock every course — all modules, quizzes, flashcards, scenarios, and code patterns.");
  return (
    <div className="lockcard">
      <h3><Lock size={18} strokeWidth={1.75} /> {heading}</h3>
      <p style={{ color: "var(--dim)", marginBottom: 14 }}>{text}</p>
      {paymentsEnabled && (
        <Link href="/pricing" className="btn">
          See membership plans <ArrowRight size={16} strokeWidth={1.75} />
        </Link>
      )}
      <RedeemDialog />
    </div>
  );
}
