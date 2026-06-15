"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

// Shown wherever paid content is requested by a non-entitled user (locked
// module, flashcards, scenarios). Buy → Stripe Checkout; redeem → access code.
export default function Paywall({
  heading = "This is part of the full course",
  blurb = "Lifetime access unlocks all 21 modules, quizzes, flashcards, scenarios, and code patterns.",
}: {
  heading?: string;
  blurb?: string;
}) {
  const supabase = supabaseBrowser();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const d = await res.json();
      if (d.url) location.href = d.url;
      else {
        setBusy(false);
        setMsg("Checkout error: " + (d.error ?? "unknown"));
      }
    } catch {
      setBusy(false);
      setMsg("Could not start checkout.");
    }
  }

  async function redeem() {
    const code = prompt("Enter your access code");
    if (!code) return;
    const { data, error } = await supabase.rpc("redeem_access_code", { p_code: code.trim() });
    if (error) return setMsg("Error: " + error.message);
    if (data === "ok") location.reload();
    else
      setMsg(
        (
          {
            invalid: "That code isn't valid.",
            expired: "That code has expired.",
            exhausted: "That code has been fully used.",
            not_authenticated: "Please sign in first.",
          } as Record<string, string>
        )[data as string] ?? "Could not redeem.",
      );
  }

  return (
    <div className="lockcard">
      <h3><Lock size={18} strokeWidth={1.75} /> {heading}</h3>
      <p style={{ color: "var(--dim)", marginBottom: 14 }}>{blurb}</p>
      <button className="btn" disabled={busy} onClick={buy}>
        {busy ? "Opening checkout…" : "Buy lifetime access"}
      </button>
      <button className="btn ghost" onClick={redeem}>
        I have a code
      </button>
      {msg && <p style={{ color: "var(--amber)", marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
