import { supabaseServer } from "@/lib/supabase/server";
import LearnApp from "@/components/LearnApp";
import type { ContentRow, ProgressState } from "@/lib/types";

// Dynamic: reads cookies + per-user data, never statically prerendered.
export const dynamic = "force-dynamic";

// THE HARD PAYWALL: content is fetched server-side under the user's RLS scope.
// Paid rows are only returned for entitled users, so they are never serialized
// into a non-entitled visitor's HTML.
export default async function LearnPage() {
  const supabase = await supabaseServer();

  const [{ data: content }, { data: ent }, { data: prog }] = await Promise.all([
    supabase.from("content").select("id,tier,data"),
    supabase.from("entitlements").select("active").maybeSingle(),
    supabase.from("progress").select("state").maybeSingle(),
  ]);

  return (
    <LearnApp
      content={(content ?? []) as ContentRow[]}
      entitled={!!ent?.active}
      initialProgress={(prog?.state ?? {}) as ProgressState}
    />
  );
}
