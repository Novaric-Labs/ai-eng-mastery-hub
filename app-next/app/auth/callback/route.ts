import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Handles the redirect from magic link / Google OAuth: exchanges the code for a
// session (sets cookies) and sends the user into the app.
//
// The post-login destination is a fixed in-app path (never taken from the
// request) so a crafted `next`/redirect param can't turn this into an open
// redirect. A missing or invalid code lands the user on /login rather than
// dropping them at /courses with no session.

// The origin to send the user back to after the exchange.
//
// It MUST be the host the browser actually used, because that is the host the
// session cookie was just set on. `new URL(request.url).origin` is not that
// host: Next resolves it from the server's own binding, so a user who reached
// the app on any other hostname (127.0.0.1 vs localhost in dev, an apex vs www
// domain, a preview URL, or anything behind a proxy) gets redirected to a
// DIFFERENT origin than the cookie — the session looks lost and they bounce
// straight back to /login.
//
// Only the host is taken from headers, and only a fixed in-app path is ever
// appended, so this sends the user back to the host they were already on and
// cannot be pointed somewhere else. `x-forwarded-host` wins (set by proxies
// and CDNs, including Vercel), then `host`, then the parsed origin.
function redirectOrigin(request: Request, fallbackOrigin: string): string {
  const first = (v: string | null) => v?.split(",")[0]?.trim() ?? "";
  const host = first(request.headers.get("x-forwarded-host")) || first(request.headers.get("host"));
  // Reject anything that isn't a bare hostname[:port] — a value carrying a
  // scheme, path, or whitespace is malformed (or hostile), so fall back.
  if (!host || !/^[a-zA-Z0-9.\-_[\]]+(:\d+)?$/.test(host)) return fallbackOrigin;
  const proto =
    first(request.headers.get("x-forwarded-proto")) ||
    (fallbackOrigin.startsWith("https:") ? "https" : "http");
  return `${proto}://${host}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const base = redirectOrigin(request, origin);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${base}/login?error=auth`);
  }
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${base}/login?error=auth`);
  }

  // Flag brand-new accounts so the catalog can fire a one-time "signup" funnel
  // event (analytics runs client-side only). Heuristic: the user was created in
  // the last 2 minutes — i.e. this code exchange is what just created them.
  const createdAt = data.user?.created_at;
  const isNew = !!createdAt && Date.now() - new Date(createdAt).getTime() < 120_000;
  return NextResponse.redirect(`${base}/courses${isNew ? "?welcome=1" : ""}`);
}
