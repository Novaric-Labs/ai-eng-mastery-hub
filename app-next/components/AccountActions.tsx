"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  XCircle,
  RotateCcw,
  ArrowLeftRight,
  Check,
} from "lucide-react";
import { PLANS, type Plan } from "@/lib/plans";

type Props = {
  /** Plan id of the member's current subscription (may be unknown). */
  currentPlanId: Plan["id"] | null;
  /** Stripe subscription status, e.g. "active", "past_due". */
  status: string | null;
  /** True when the subscription is set to cancel at period end. */
  cancelAtPeriodEnd: boolean;
  /** Current period end as an ISO string (when access ends if canceling). */
  currentPeriodEnd: string | null;
};

type Busy = null | "cancel" | "resume" | "portal" | `switch:${string}`;

export default function AccountActions({
  currentPlanId,
  status,
  cancelAtPeriodEnd,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSwitch, setShowSwitch] = useState(false);

  const active = status === "active" || status === "trialing";

  // POST a subscription action; refresh server data on success. Returns true on
  // success so callers can collapse any open UI.
  async function act(url: string, key: Busy, body?: unknown): Promise<boolean> {
    setError(null);
    setBusy(key);
    try {
      const res = await fetch(url, {
        method: "POST",
        ...(body
          ? { headers: { "content-type": "application/json" }, body: JSON.stringify(body) }
          : {}),
      });
      if (res.status === 401) {
        location.href = "/login";
        return false;
      }
      const d = await res.json().catch(() => ({}));
      if (!res.ok || d?.error) {
        setError(messageFor(d?.error));
        setBusy(null);
        return false;
      }
      // Portal returns a redirect URL instead of { ok: true }.
      if (d?.url) {
        location.href = d.url;
        return true;
      }
      router.refresh();
      setBusy(null);
      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(null);
      return false;
    }
  }

  function cancel() {
    if (
      !confirm(
        "Cancel your membership? You'll keep full access until the end of your current billing period, then it won't renew.",
      )
    ) {
      return;
    }
    void act("/api/subscription/cancel", "cancel");
  }

  function resume() {
    void act("/api/subscription/resume", "resume");
  }

  function updatePayment() {
    void act("/api/portal", "portal");
  }

  async function switchTo(plan: Plan) {
    const ok = await act("/api/subscription/switch", `switch:${plan.id}`, { plan: plan.id });
    if (ok) setShowSwitch(false);
  }

  const otherPlans = PLANS.filter((p) => p.id !== currentPlanId);

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {cancelAtPeriodEnd ? (
          <button
            className="btn"
            onClick={resume}
            disabled={busy === "resume"}
            style={{ margin: 0 }}
          >
            <RotateCcw size={16} strokeWidth={1.75} />
            {busy === "resume" ? "Resuming…" : "Resume membership"}
          </button>
        ) : (
          active && (
            <button
              className="btn"
              onClick={() => setShowSwitch((v) => !v)}
              disabled={!!busy}
              aria-expanded={showSwitch}
              style={{ margin: 0 }}
            >
              <ArrowLeftRight size={16} strokeWidth={1.75} /> Switch plan
            </button>
          )
        )}

        <button
          className="btn ghost"
          onClick={updatePayment}
          disabled={busy === "portal"}
          style={{ margin: 0 }}
        >
          <CreditCard size={16} strokeWidth={1.75} />
          {busy === "portal" ? "Opening…" : "Update payment method"}
        </button>

        {active && !cancelAtPeriodEnd && (
          <button
            className="btn ghost"
            onClick={cancel}
            disabled={busy === "cancel"}
            style={{ margin: 0, color: "var(--dim)" }}
          >
            <XCircle size={16} strokeWidth={1.75} />
            {busy === "cancel" ? "Canceling…" : "Cancel membership"}
          </button>
        )}
      </div>

      {showSwitch && active && !cancelAtPeriodEnd && (
        <div style={{ marginTop: 16 }}>
          <p style={{ color: "var(--dim2)", fontSize: 13.5, margin: "0 0 10px" }}>
            Choose a new plan. The change applies right away and Stripe prorates the
            difference on your next invoice.
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {otherPlans.map((p) => {
              const switching = busy === `switch:${p.id}`;
              return (
                <button
                  key={p.id}
                  className="card"
                  onClick={() => switchTo(p)}
                  disabled={!!busy}
                  style={{
                    margin: 0,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    textAlign: "left",
                    cursor: busy ? "wait" : "pointer",
                    width: "100%",
                    background: "var(--bg)",
                    border: p.highlight ? "1px solid var(--accent)" : "1px solid var(--border2)",
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--text)",
                        fontWeight: 600,
                        fontSize: 14.5,
                      }}
                    >
                      {p.label}
                      {p.save && (
                        <span className="pill" style={{ fontSize: 11.5, color: "var(--green)", borderColor: "rgba(52,199,89,.4)" }}>
                          {p.save}
                        </span>
                      )}
                    </span>
                    <span style={{ display: "block", color: "var(--dim)", fontSize: 12.5, marginTop: 3 }}>
                      {p.priceLabel} {p.cadence} · {p.perMonth}
                    </span>
                  </span>
                  <span style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                    {switching ? "Switching…" : "Switch"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {cancelAtPeriodEnd && (
        <p style={{ color: "var(--dim)", fontSize: 13, marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Check size={14} strokeWidth={1.75} /> Your membership is set to cancel. Resume any time before it ends to keep access.
        </p>
      )}

      {error && (
        <p role="alert" style={{ color: "var(--amber)", fontSize: 13, marginTop: 12 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function messageFor(code?: string): string {
  switch (code) {
    case "no_subscription":
      return "We couldn't find an active membership to manage.";
    case "same_plan":
      return "You're already on that plan.";
    case "price_not_configured":
      return "That plan isn't available right now. Please try another.";
    case "unknown_plan":
      return "That plan isn't recognized.";
    default:
      return "Something went wrong. Please try again.";
  }
}
