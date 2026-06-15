import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdmin } from "./admin";

// Full access = a paid entitlement OR an admin/owner (who always has access).
// Used by server features that gate on payment (tutor, grading, the course gate).
export async function hasFullAccess(
  supabase: SupabaseClient,
  user: { email?: string | null } | null,
): Promise<boolean> {
  if (!user) return false;
  if (isAdmin(user.email)) return true;
  const { data } = await supabase
    .from("entitlements")
    .select("active")
    .maybeSingle();
  return !!data?.active;
}
