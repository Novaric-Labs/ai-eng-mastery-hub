import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const course = String(body.course ?? "ai-eng");

  // The course must exist and be live; pull its Stripe price (flagship falls
  // back to the legacy STRIPE_PRICE_ID env so existing config keeps working).
  const { data: c } = await supabase
    .from("courses")
    .select("status, stripe_price_id")
    .eq("slug", course)
    .maybeSingle();
  if (!c || c.status !== "live") {
    return NextResponse.json({ error: "course_unavailable" }, { status: 400 });
  }
  const price =
    c.stripe_price_id ||
    (course === "ai-eng" ? process.env.STRIPE_PRICE_ID : undefined);
  if (!price) {
    return NextResponse.json({ error: "price_not_configured" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const site = process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "payment", // one-time lifetime access
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,
    metadata: { course },
    success_url: `${site}/learn/${course}?checkout=success`,
    cancel_url: `${site}/pricing?checkout=cancel`,
  });

  return NextResponse.json({ url: session.url });
}
