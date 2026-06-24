import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdmin } from "./admin";

// True if the signed-in user has an active, non-expired membership.
export async function hasActiveMembership(
  supabase: SupabaseClient,
): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .maybeSingle();
  if (!data) return false;
  const paying = data.status === "active" || data.status === "trialing";
  const live =
    !data.current_period_end || new Date(data.current_period_end) > new Date();
  return paying && live;
}

// Full access = an active membership, a per-course grant (access code/comp), OR
// an admin/owner. Used by server features that gate on payment (tutor, grading).
export async function hasFullAccess(
  supabase: SupabaseClient,
  user: { email?: string | null } | null,
): Promise<boolean> {
  if (!user) return false;
  if (isAdmin(user.email)) return true;
  if (await hasActiveMembership(supabase)) return true;
  // ANY active per-course grant (access code / comp) unlocks these global,
  // course-agnostic features (tutor / grade / explain / video). Must tolerate
  // multiple entitlement rows now that a user can own more than one course —
  // .maybeSingle() would error on 2+ rows, so select-limit-1 and test presence.
  const { data } = await supabase
    .from("entitlements")
    .select("course_id")
    .eq("active", true)
    .limit(1);
  return !!data && data.length > 0;
}
