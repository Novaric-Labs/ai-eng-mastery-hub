"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import NovaMark from "@/components/NovaMark";
import { supabaseBrowser } from "@/lib/supabase/client";
import { REMEMBER_COOKIE, REMEMBER_PREF_MAX_AGE } from "@/lib/supabase/remember";

// Persist the trusted-device choice before sign-in so the callback + middleware
// know whether to make the session cookies persistent or session-scoped.
function saveTrustedPref(trusted: boolean) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${REMEMBER_COOKIE}=${trusted ? "1" : "0"}; Path=/; Max-Age=${REMEMBER_PREF_MAX_AGE}; SameSite=Lax${secure}`;
}

// Copy for the `?error=` reasons /auth/callback sends back. Without this the
// callback's redirect landed on a clean login form with no explanation at all,
// which is indistinguishable from "the link did nothing".
const ERRORS: Record<string, string> = {
  expired:
    "That sign-in link is no longer valid — it may have expired or already been used. Enter your email below for a fresh one.",
  verifier:
    "Sign-in links only work in the browser that requested them. Open this page in the browser you used, or request a new link here and click it from this device.",
  denied:
    "That sign-in attempt was declined. Request a new link below, or try Continue with Google.",
  auth: "Something went wrong finishing sign-in. Request a new link below and try again.",
};

export default function LoginPage() {
  // useSearchParams needs a boundary; the layout is force-dynamic, so this only
  // ever renders on the client anyway.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [trusted, setTrusted] = useState(true);

  // A message from the user's own action wins; otherwise explain why they were
  // bounced back here. Unknown reasons fall back to the generic copy.
  const errorParam = params.get("error");
  const errorMsg = errorParam ? (ERRORS[errorParam] ?? ERRORS.auth) : "";
  const notice = msg || errorMsg;
  const isError = !msg && !!errorMsg;

  async function magic() {
    if (!email) return;
    saveTrustedPref(trusted);
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setBusy(false);
    setMsg(error ? error.message : `Check your email for a sign-in link.`);
  }

  async function google() {
    saveTrustedPref(trusted);
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
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
          {notice && (
            <div
              role={isError ? "alert" : "status"}
              style={{
                background: isError ? "rgba(229,99,95,.12)" : "var(--bg3)",
                border: `1px solid ${isError ? "var(--red)" : "var(--border2)"}`,
                borderRadius: "var(--r-md)",
                padding: "10px 12px",
                marginBottom: 14,
                fontSize: 13,
                lineHeight: 1.45,
                color: "var(--dim2)",
              }}
            >
              {notice}
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
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--dim2)", margin: "2px 2px 12px", cursor: "pointer", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={trusted}
              onChange={(e) => setTrusted(e.target.checked)}
              style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }}
            />
            Trusted device — keep me signed in
          </label>
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
