import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Handles the redirect from magic link / Google OAuth: exchanges the code for a
// session (sets cookies) and sends the user into the app.
//
// The post-login destination is a fixed in-app path (never taken from the
// request) so a crafted `next`/redirect param can't turn this into an open
// redirect. A missing or invalid code lands the user on /login rather than
// dropping them at /courses with no session.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }
  return NextResponse.redirect(`${origin}/courses`);
}
