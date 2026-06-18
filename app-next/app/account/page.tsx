import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { ArrowRight, CalendarClock, CreditCard, Sparkles } from "lucide-react";
import NovaMark from "@/components/NovaMark";
import SignOutLink from "@/components/SignOutLink";
import AccountActions from "@/components/AccountActions";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { PLANS, planById, type Plan } from "@/lib/plans";

// Members-only billing management; never index.
export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type SubRow = {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string | null;
  status: string | null;
  current_period_end: string | null;
};

// Authoritative subscription state, read live from Stripe when possible.
type Live = {
  status: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  plan: Plan | null;
  card: { brand: string; last4: string } | null;
  /** True if the live Stripe read failed and we're showing DB basics. */
  degraded: boolean;
};

const fmtDate = (iso: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
};

// Map a Stripe price id back to one of our display plans.
const planByPrice = (priceId: string | null): Plan | null => {
  if (!priceId) return null;
  return PLANS.find((p) => process.env[p.priceEnv] === priceId) ?? null;
};

export default async function AccountPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const admin = isAdmin(user.email);

  const { data } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, stripe_subscription_id, plan, status, current_period_end")
    .maybeSingle();
  const sub = (data as SubRow | null) ?? null;

  let live: Live | null = null;
  if (sub?.stripe_subscription_id) {
    // DB basics as a fallback if the live Stripe read fails.
    const fallback: Live = {
      status: sub.status,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: sub.current_period_end,
      plan: sub.plan ? planById(sub.plan) ?? null : null,
      card: null,
      degraded: true,
    };
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const s = await stripe.subscriptions.retrieve(sub.stripe_subscription_id, {
        expand: ["default_payment_method", "items.data.price"],
      });
      const priceId =
        typeof s.items.data[0]?.price === "string"
          ? (s.items.data[0]?.price as unknown as string)
          : s.items.data[0]?.price?.id ?? null;
      // SDK 16 exposes current_period_end at the top level; fall back to the item.
      const periodEnd =
        (s as unknown as { current_period_end?: number }).current_period_end ??
        (s.items.data[0] as unknown as { current_period_end?: number })?.current_period_end ??
        null;
      const pm = s.default_payment_method;
      const card =
        pm && typeof pm !== "string" && pm.card
          ? { brand: pm.card.brand, last4: pm.card.last4 }
          : null;
      live = {
        status: s.status,
        cancelAtPeriodEnd: s.cancel_at_period_end,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : sub.current_period_end,
        plan: planByPrice(priceId) ?? (sub.plan ? planById(sub.plan) ?? null : null),
        card,
        degraded: false,
      };
    } catch {
      live = fallback;
    }
  }

  return (
    <>
      <AccountHeader email={user.email ?? ""} />
      <main className="wrap" style={{ paddingTop: 40, paddingBottom: 72, maxWidth: 720 }}>
        <p className="eyebrow">YOUR ACCOUNT</p>
        <h1 style={{ fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 600, letterSpacing: "-.02em", margin: "8px 0 6px" }}>
          Membership
        </h1>

        {live ? (
          <MembershipCard live={live} degraded={live.degraded} />
        ) : admin ? (
          <ComplimentaryCard
            note="You have owner / admin access — every course is unlocked and there's no billing to manage here."
          />
        ) : sub?.stripe_customer_id || sub?.status ? (
          <ComplimentaryCard
            note="Your access doesn't go through a Stripe membership — there's nothing to manage here. Reach out if you have a billing question."
          />
        ) : (
          <NoMembershipCard />
        )}
      </main>
    </>
  );
}

function MembershipCard({ live, degraded }: { live: Live; degraded: boolean }) {
  const { status, cancelAtPeriodEnd, currentPeriodEnd, plan, card } = live;
  const active = status === "active" || status === "trialing";
  const pastDue = status === "past_due" || status === "unpaid" || status === "incomplete";
  const dateLabel = fmtDate(currentPeriodEnd);

  // Status pill: green active, amber for canceling / past-due, dim otherwise.
  let pill: { text: string; color: string; border?: string };
  if (cancelAtPeriodEnd) {
    pill = { text: dateLabel ? `Cancels on ${dateLabel}` : "Canceling", color: "var(--amber)", border: "rgba(255,159,10,.4)" };
  } else if (active) {
    pill = { text: "Active", color: "var(--green)", border: "rgba(52,199,89,.4)" };
  } else if (pastDue) {
    pill = { text: "Past due", color: "var(--amber)", border: "rgba(255,159,10,.4)" };
  } else {
    pill = { text: status ? status.replace(/_/g, " ") : "Inactive", color: "var(--dim)" };
  }

  const renewalLine = cancelAtPeriodEnd
    ? dateLabel
      ? `Access until ${dateLabel}`
      : "Access continues until the end of your billing period"
    : dateLabel
      ? `Renews ${dateLabel}`
      : null;

  return (
    <div className="card" style={{ padding: 24, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".04em", color: "var(--faint)", marginBottom: 6 }}>
            CURRENT PLAN
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: "var(--text)" }}>
            {plan ? plan.label : "Membership"}
          </h2>
          {plan && (
            <p style={{ color: "var(--dim2)", fontSize: 14, margin: "4px 0 0" }}>
              {plan.priceLabel} · {plan.cadence}
            </p>
          )}
        </div>
        <span className="pill" style={{ color: pill.color, borderColor: pill.border ?? "var(--border2)", flexShrink: 0 }}>
          {pill.text}
        </span>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        {renewalLine && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--dim)", fontSize: 13.5 }}>
            <CalendarClock size={15} strokeWidth={1.75} /> {renewalLine}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--dim)", fontSize: 13.5 }}>
          <CreditCard size={15} strokeWidth={1.75} />
          {card ? `${cap(card.brand)} ···· ${card.last4}` : "—"}
        </div>
      </div>

      {pastDue && (
        <p style={{ color: "var(--amber)", fontSize: 13, marginTop: 14 }}>
          Your last payment didn&apos;t go through. Update your payment method to keep your access.
        </p>
      )}

      {degraded && (
        <p style={{ color: "var(--dim)", fontSize: 12.5, marginTop: 14 }}>
          Showing your last known billing details — live status from Stripe is temporarily unavailable.
        </p>
      )}

      <AccountActions
        currentPlanId={plan?.id ?? null}
        status={status}
        cancelAtPeriodEnd={cancelAtPeriodEnd}
        currentPeriodEnd={currentPeriodEnd}
      />
    </div>
  );
}

function ComplimentaryCard({ note }: { note: string }) {
  return (
    <div className="card" style={{ padding: 24, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ display: "inline-flex", padding: 9, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)", flexShrink: 0 }}>
          <Sparkles size={18} strokeWidth={1.75} />
        </span>
        <b style={{ fontSize: 15, color: "var(--text)" }}>Complimentary access</b>
      </div>
      <p style={{ color: "var(--dim2)", fontSize: 14, margin: "12px 0 18px", lineHeight: 1.5 }}>
        {note}
      </p>
      <Link href="/courses" className="btn" style={{ margin: 0 }}>
        Go to courses <ArrowRight size={16} strokeWidth={1.75} />
      </Link>
    </div>
  );
}

function NoMembershipCard() {
  return (
    <div
      className="card"
      style={{
        padding: 24,
        marginTop: 16,
        border: "1px solid var(--accent)",
        boxShadow: "0 0 0 1px var(--accent), var(--shadow-2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ display: "inline-flex", padding: 9, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)", flexShrink: 0 }}>
          <Sparkles size={18} strokeWidth={1.75} />
        </span>
        <b style={{ fontSize: 15, color: "var(--text)" }}>No active membership</b>
      </div>
      <p style={{ color: "var(--dim2)", fontSize: 14, margin: "12px 0 18px", lineHeight: 1.5 }}>
        A membership unlocks every course, current and future. Plans start at $21/mo billed yearly. Cancel anytime.
      </p>
      <Link href="/pricing" className="btn" style={{ margin: 0 }}>
        See plans <ArrowRight size={16} strokeWidth={1.75} />
      </Link>
    </div>
  );
}

// Account header — brand, email, sign out (mirrors the catalog header).
function AccountHeader({ email }: { email: string }) {
  return (
    <header className="siteheader-bar">
      <div className="siteheader">
        <Link href="/courses" className="sh-logo brand">
          <NovaMark size={20} className="brand-mark" />
          <span className="brand-word">Novacademy</span>
        </Link>
        <nav className="sh-nav" style={{ alignItems: "center", gap: 14 }}>
          {email && <span style={{ color: "var(--faint)", fontSize: 12.5 }}>{email}</span>}
          <SignOutLink />
        </nav>
      </div>
    </header>
  );
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
