"use client";

import { useState } from "react";
import NovaMark from "@/components/NovaMark";
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
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    // On success the browser redirects to Google; we only get here on error.
    if (error) {
      setBusy(false);
      setMsg(error.message);
    }
  }

  return (
    <div className="hero-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div className="brandmark brand" style={{ fontSize: 18, justifyContent: "center", marginBottom: 6 }}>
          <NovaMark size={22} className="brand-mark" />
          <span className="brand-word">Novacademy</span>
        </div>
        <p style={{ color: "var(--dim)", fontSize: 13.5, marginBottom: 18, textAlign: "center" }}>
          Sign in to continue to your AI Engineering course. New here? This also creates your account.
        </p>
        <div className="authcard">
          {msg && (
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: "var(--r-md)", padding: "10px 12px", marginBottom: 14, fontSize: 13, color: "var(--dim2)" }}>
              {msg}
            </div>
          )}
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={{ marginBottom: 10 }}
          />
          <button className="btn" style={{ width: "100%", justifyContent: "center", margin: 0 }} disabled={busy} onClick={magic}>
            {busy ? "Sending…" : "Email me a sign-in link"}
          </button>
          <div style={{ color: "var(--faint)", fontSize: 12, margin: "14px 0", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
            or
            <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>
          <button className="btn ghost" style={{ width: "100%", justifyContent: "center", margin: 0 }} disabled={busy} onClick={google}>
            <GoogleMark /> Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}
