import { redirect, notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { courseBySlug } from "@/lib/courses";
import LearnApp from "@/components/LearnApp";
import type { ContentRow, ProgressState } from "@/lib/types";

// Dynamic: reads cookies + per-user data, never statically prerendered.
export const dynamic = "force-dynamic";

// THE HARD PAYWALL: content is fetched server-side under the user's RLS scope,
// now SCOPED TO ONE COURSE. Paid rows for this course are only returned for users
// entitled to this course, so they are never serialized into a non-entitled
// visitor's HTML. Admins/owners always have full access, so their content is read
// with the service-role client (RLS-bypassing) and they are marked entitled.
export default async function LearnCoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course: slug } = await params;
  const meta = courseBySlug(slug);

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = isAdmin(user?.email);

  // Unknown course, or a not-yet-launched one a non-admin tried to deep-link.
  if (!meta) notFound();
  if (meta.status !== "live" && !admin) redirect("/courses");

  // Admins read all rows via the service-role client; everyone else stays
  // RLS-scoped so paid rows never reach a non-entitled visitor. Either way the
  // query is scoped to this course's rows.
  const contentClient = admin ? supabaseAdmin() : supabase;

  const [{ data: content }, { data: ent }, { data: prog }] = await Promise.all([
    contentClient.from("content").select("id,tier,data").eq("course_id", slug),
    supabase.from("entitlements").select("active").eq("course_id", slug).maybeSingle(),
    supabase.from("progress").select("state").maybeSingle(),
  ]);

  return (
    <LearnApp
      content={(content ?? []) as ContentRow[]}
      courseSlug={slug}
      entitled={admin || !!ent?.active}
      admin={admin}
      userId={user?.id ?? ""}
      initialProgress={(prog?.state ?? {}) as ProgressState}
    />
  );
}
