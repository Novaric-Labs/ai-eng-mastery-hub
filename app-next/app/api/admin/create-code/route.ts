import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  let code = String(body.code ?? "").trim().toUpperCase();
  if (!code) code = "CODE-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const max = Math.max(1, parseInt(String(body.maxRedemptions)) || 1);
  const days = parseInt(String(body.expiresInDays));
  const expires_at =
    days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null;
  const note = String(body.note ?? "").slice(0, 200) || null;

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("access_codes")
    .insert({ code, max_redemptions: max, expires_at, note })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ code: data });
}
