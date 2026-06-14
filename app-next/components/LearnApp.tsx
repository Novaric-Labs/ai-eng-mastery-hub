"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { ContentRow, ProgressState } from "@/lib/types";

// P0 shell: proves the server-side gate end-to-end (entitled users receive paid
// rows; non-entitled receive preview only), plus buy / redeem / sign-out.
// In P1 this becomes the full ported course UI; the props it receives won't change.
export default function LearnApp({
  content,
  entitled,
}: {
  content: ContentRow[];
  entitled: boolean;
  initialProgress: ProgressState;
}) {
  const supabase = supabaseBrowser();
  const [busy, setBusy] = useState(false);
  const paid = content.filter((c) => c.tier === "paid").length;
  const pub = content.filter((c) => c.tier === "public").length;

  async function buy() {
    setBusy(true);
    const res = await fetch("/api/checkout", { method: "POST" });
    const d = await res.json();
    if (d.url) location.href = d.url;
    else {
      setBusy(false);
      alert("Checkout error: " + (d.error ?? "unknown"));
    }
  }

  async function redeem() {
    const code = prompt("Enter your access code");
    if (!code) return;
    const { data, error } = await supabase.rpc("redeem_access_code", {
      p_code: code.trim(),
    });
    if (error) return alert("Error: " + error.message);
    if (data === "ok") location.reload();
    else
      alert(
        ({
          invalid: "That code isn't valid.",
          expired: "That code has expired.",
          exhausted: "That code has been fully used.",
          not_authenticated: "Please sign in first.",
        } as Record<string, string>)[data as string] ?? "Could not redeem.",
      );
  }

  async function signOut() {
    await supabase.auth.signOut();
    location.href = "/";
  }

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: 26 }}>Your course</h1>
      <p style={{ color: "var(--dim)" }}>
        Server gate received <b>{content.length}</b> content rows ({pub} public,{" "}
        <b>{paid}</b> paid). Access:{" "}
        <b style={{ color: entitled ? "var(--green)" : "var(--amber)" }}>
          {entitled ? "FULL" : "PREVIEW"}
        </b>
        .
      </p>

      {!entitled && (
        <div
          style={{
            border: "1px solid var(--accent2)",
            borderRadius: 12,
            padding: 18,
            margin: "16px 0",
          }}
        >
          <b style={{ color: "var(--accent2)" }}>🔒 Unlock full access</b>
          <p style={{ color: "var(--dim)", margin: "6px 0 12px" }}>
            Lifetime access to all 21 modules, quizzes, flashcards, scenarios,
            and code patterns.
          </p>
          <button className="btn" disabled={busy} onClick={buy}>
            {busy ? "Opening checkout…" : "Buy lifetime access"}
          </button>{" "}
          <button className="btn ghost" onClick={redeem}>
            I have a code
          </button>
        </div>
      )}

      {entitled && (
        <p style={{ color: "var(--green)" }}>
          ✓ Full access. (P1 renders the full course UI here.)
        </p>
      )}

      <p style={{ marginTop: 28 }}>
        <button className="btn ghost" onClick={signOut}>
          Sign out
        </button>
      </p>
    </div>
  );
}
