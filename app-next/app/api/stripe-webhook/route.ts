import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // raw body + signature verification need Node

export async function POST(request: Request) {
  const body = await request.text(); // raw body for signature verification
  const sig = request.headers.get("stripe-signature");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (e) {
    return new NextResponse(`bad signature: ${(e as Error).message}`, {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.client_reference_id && s.payment_status === "paid") {
      // service-role client bypasses RLS to grant entitlement
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );
      // Which course was purchased (set in checkout metadata; default flagship).
      const course = s.metadata?.course || "ai-eng";
      const { error } = await admin.rpc("grant_stripe_entitlement", {
        p_user: s.client_reference_id,
        p_customer: typeof s.customer === "string" ? s.customer : null,
        p_course: course,
      });
      if (error) {
        return new NextResponse(`grant failed: ${error.message}`, {
          status: 500,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
