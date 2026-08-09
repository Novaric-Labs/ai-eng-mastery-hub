import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildCourse, courseComplete, completionSummary } from "@/lib/course";
import { hasCourseAccess } from "@/lib/entitlement";
import type { ContentRow, ProgressState } from "@/lib/types";

export const dynamic = "force-dynamic";

// Issue (or return the already-issued) completion certificate for a course.
// Two gates before issuing, both server-side:
//  1. Entitlement — the caller must actually own access to THIS course (active
//     membership, a per-course grant, or admin). Certificates are publicly
//     verifiable, so issuance must never be reachable from a free account.
//  2. Completion — the course is rebuilt from content + the caller's progress
//     row and courseComplete() is re-checked. Note the progress row is
//     client-reported (the app syncs it from the browser), so this gate stops
//     accidents, not determined forgery; the entitlement gate is the hard one.
//     Server-authoritative completion needs server-graded assessments (tracked
//     in docs/CURRICULUM_AUDIT_2026-08.md).
// Idempotent — one certificate per (user, course, tier).
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

  // Gate 1: entitlement, scoped to the course being certified (membership
  // unlocks all courses; a per-course grant only its own).
  if (!(await hasCourseAccess(supabase, user, course))) {
    return NextResponse.json({ error: "not entitled" }, { status: 403 });
  }

  const admin = supabaseAdmin();
  const tier = "completion";
  const [{ data: rows }, { data: prog }, { data: existing }] = await Promise.all([
    // Content (blocks + catalog are public; admin read also covers paid rows).
    admin.from("content").select("id,tier,data").eq("course_id", course),
    // The caller's own progress for this course.
    supabase.from("progress").select("state").eq("course_id", course).maybeSingle(),
    // Any already-issued certificate for (user, course, tier) — checked below.
    admin
      .from("certificates")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course)
      .eq("tier", tier)
      .maybeSingle(),
  ]);

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "unknown course" }, { status: 404 });
  }

  const built = buildCourse(rows as ContentRow[]);
  const S = (prog?.state ?? {}) as ProgressState;
  if (!courseComplete(built, S)) {
    return NextResponse.json({ error: "course not complete" }, { status: 400 });
  }

  // Idempotent: hand back the existing certificate if already issued.
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
