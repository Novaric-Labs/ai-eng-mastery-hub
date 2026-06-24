import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildCourse, courseComplete, completionSummary } from "@/lib/course";
import type { ContentRow, ProgressState } from "@/lib/types";

export const dynamic = "force-dynamic";

// Issue (or return the already-issued) completion certificate for a course.
// The server NEVER trusts the client about completion: it rebuilds the course
// from content + the caller's own progress row and re-checks courseComplete()
// before issuing. Idempotent — one certificate per (user, course, tier).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { course?: unknown } | null;
  const course = typeof body?.course === "string" ? body.course : "";
  if (!course) {
    return NextResponse.json({ error: "missing course" }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const [{ data: rows }, { data: prog }] = await Promise.all([
    // Content (blocks + catalog are public; admin read also covers paid rows).
    admin.from("content").select("id,tier,data").eq("course_id", course),
    // The caller's own progress for this course.
    supabase.from("progress").select("state").eq("course_id", course).maybeSingle(),
  ]);

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "unknown course" }, { status: 404 });
  }

  const built = buildCourse(rows as ContentRow[]);
  const S = (prog?.state ?? {}) as ProgressState;
  if (!courseComplete(built, S)) {
    return NextResponse.json({ error: "course not complete" }, { status: 400 });
  }

  const tier = "completion";

  // Idempotent: hand back the existing certificate if already issued.
  const { data: existing } = await admin
    .from("certificates")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course)
    .eq("tier", tier)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ id: existing.id });
  }

  const recipient =
    (typeof S.name === "string" && S.name.trim()) ||
    user.email?.split("@")[0] ||
    "Learner";

  const { data: created, error } = await admin
    .from("certificates")
    .insert({
      user_id: user.id,
      course_id: course,
      tier,
      recipient_name: recipient,
      summary: completionSummary(built, S),
    })
    .select("id")
    .single();

  if (error || !created) {
    return NextResponse.json(
      { error: "could not issue certificate" },
      { status: 500 },
    );
  }
  return NextResponse.json({ id: created.id });
}
