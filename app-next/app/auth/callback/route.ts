import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Handles the redirect from magic link / Google OAuth: exchanges the code for a
// session (sets cookies) and sends the user into the app.
//
// The post-login destination is a fixed in-app path (never taken from the
// request) so a crafted `next`/redirect param can't turn this into an open
// redirect. A missing or invalid code lands the user on /login rather than
// dropping them at /courses with no session.

// Why a sign-in attempt failed, as a fixed allow-list. /login turns these into
// copy; keeping it closed means nothing from the query string (or a Supabase
// error message) is ever reflected back into the page.
const REASONS = ["expired", "verifier", "denied", "auth"] as const;
type Reason = (typeof REASONS)[number];

function backToLogin(origin: string, reason: Reason) {
  return NextResponse.redirect(`${origin}/login?error=${reason}`);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // Supabase reports verification failures on the redirect itself — there's no
  // code at all, just `?error=access_denied&error_code=otp_expired&…`. Without
  // this branch those land here as "no code" and the real reason is lost.
  const errorCode = searchParams.get("error_code");
  if (errorCode || searchParams.get("error")) {
    return backToLogin(origin, errorCode === "otp_expired" ? "expired" : "denied");
  }

  const code = searchParams.get("code");
  if (!code) {
    return backToLogin(origin, "auth");
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // PKCE: the code verifier is a cookie held by the browser that REQUESTED the
    // link. Opening the email elsewhere — another device, or a mail app's
    // in-app browser — leaves it missing, which is the most common failure and
    // needs different advice than "your link expired".
    const missingVerifier = /code[\s_]?verifier/i.test(error.message);
    return backToLogin(origin, missingVerifier ? "verifier" : "expired");
  }

  // Flag brand-new accounts so the catalog can fire a one-time "signup" funnel
  // event (analytics runs client-side only). Heuristic: the user was created in
  // the last 2 minutes — i.e. this code exchange is what just created them.
  const createdAt = data.user?.created_at;
  const isNew = !!createdAt && Date.now() - new Date(createdAt).getTime() < 120_000;
  return NextResponse.redirect(`${origin}/courses${isNew ? "?welcome=1" : ""}`);
}
