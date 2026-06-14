import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Handles the redirect from magic link / Google OAuth: exchanges the code for a
// session (sets cookies) and sends the user into the app.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await supabaseServer();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}/learn`);
}
