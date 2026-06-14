"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function magic() {
    if (!email) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setBusy(false);
    setMsg(error ? error.message : `Check your email for a sign-in link.`);
  }

  async function google() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div style={{ maxWidth: 380, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: 20, marginBottom: 6 }}>⚡ AI Engineering Mastery Hub</h1>
      <p style={{ color: "var(--dim)", fontSize: 13.5, marginBottom: 16 }}>
        Sign in to start. New here? This also creates your account.
      </p>
      {msg && (
        <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 13 }}>
          {msg}
        </div>
      )}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)", marginBottom: 10 }}
      />
      <button className="btn" style={{ width: "100%" }} disabled={busy} onClick={magic}>
        {busy ? "Sending…" : "Email me a sign-in link"}
      </button>
      <div style={{ color: "var(--dim)", fontSize: 12, margin: "8px 0" }}>or</div>
      <button className="btn ghost" style={{ width: "100%" }} onClick={google}>
        Continue with Google
      </button>
    </div>
  );
}
