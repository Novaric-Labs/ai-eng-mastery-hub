import { setCancelAtPeriodEnd } from "@/lib/subscription-actions";

export const runtime = "nodejs";

// Reverses a pending cancellation: the subscription keeps renewing as normal.
// Only meaningful while cancel_at_period_end is true and the period hasn't ended.
export async function POST() {
  return setCancelAtPeriodEnd(false);
}
