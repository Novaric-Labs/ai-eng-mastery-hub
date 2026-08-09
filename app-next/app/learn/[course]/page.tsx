import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { courseBySlug } from "@/lib/courses";
import { hasActiveMembership } from "@/lib/entitlement";
import LearnApp from "@/components/LearnApp";
import FunnelEvents from "@/components/FunnelEvents";
import type { ContentRow, ProgressState } from "@/lib/types";

// Dynamic: reads cookies + per-user data, never statically prerendered.
export const dynamic = "force-dynamic";

// Gated, per-user course reader (paid content behind the paywall) — never index.
export const metadata: Metadata = { robots: { index: false, follow: false } };

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

  const [{ data: content }, { data: ent }, member, { data: prog }] = await Promise.all([
    contentClient.from("content").select("id,tier,data").eq("course_id", slug),
    supabase.from("entitlements").select("active").eq("course_id", slug).maybeSingle(),
    hasActiveMembership(supabase),
    supabase.from("progress").select("state").eq("course_id", slug).maybeSingle(),
  ]);

  // Access this course = active membership (unlocks everything) OR a per-course
  // grant (access code / comp) OR admin. Mirrors the is_entitled() RLS gate.
  const entitled = admin || member || !!ent?.active;

  return (
    <>
      {/* A non-entitled visitor opening a live course = a preview start (activation). */}
      {!entitled && <FunnelEvents event="preview_started" course={slug} />}
      <LearnApp
        content={(content ?? []) as ContentRow[]}
        courseSlug={slug}
        entitled={entitled}
        admin={admin}
        userId={user?.id ?? ""}
        initialProgress={(prog?.state ?? {}) as ProgressState}
      />
    </>
  );
}
