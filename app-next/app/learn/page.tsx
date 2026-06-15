import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import LearnApp from "@/components/LearnApp";
import type { ContentRow, ProgressState } from "@/lib/types";

// Dynamic: reads cookies + per-user data, never statically prerendered.
export const dynamic = "force-dynamic";

// THE HARD PAYWALL: content is fetched server-side under the user's RLS scope.
// Paid rows are only returned for entitled users, so they are never serialized
// into a non-entitled visitor's HTML. Admins/owners always have full access, so
// their content is read with the service-role client (RLS-bypassing) and they
// are marked entitled.
export default async function LearnPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = isAdmin(user?.email);

  // Admins read all rows via the service-role client; everyone else stays
  // RLS-scoped so paid rows never reach a non-entitled visitor.
  const contentClient = admin ? supabaseAdmin() : supabase;

  const [{ data: content }, { data: ent }, { data: prog }] = await Promise.all([
    contentClient.from("content").select("id,tier,data"),
    supabase.from("entitlements").select("active").maybeSingle(),
    supabase.from("progress").select("state").maybeSingle(),
  ]);

  return (
    <LearnApp
      content={(content ?? []) as ContentRow[]}
      entitled={admin || !!ent?.active}
      userId={user?.id ?? ""}
      initialProgress={(prog?.state ?? {}) as ProgressState}
    />
  );
}
