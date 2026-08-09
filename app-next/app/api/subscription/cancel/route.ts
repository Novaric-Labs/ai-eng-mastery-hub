import { setCancelAtPeriodEnd } from "@/lib/subscription-actions";

export const runtime = "nodejs";

// Cancels the member's subscription at the end of the current billing period —
// they keep access until current_period_end, then it lapses. The webhook syncs
// the resulting customer.subscription.updated event back into our DB.
export async function POST() {
  return setCancelAtPeriodEnd(true);
}
