---
name: account-membership-page
description: On-domain /account membership management page — files, Stripe read pattern, and where Manage-membership entry points live
metadata:
  type: project
---

Native membership management lives at `app-next/app/account/page.tsx` (server, force-dynamic, noindex), replacing the old Stripe-portal redirect for plan/status display + cancel/resume/switch. Card entry still goes through `/api/portal` (PCI).

**Why:** Owner wanted billing managed on novacademy.ai, not via a redirect to billing.stripe.com.

**How to apply:**
- Authoritative subscription state is read LIVE from Stripe in the server page (`subscriptions.retrieve(id, { expand: ["default_payment_method","items.data.price"] })`) because the `subscriptions` table does NOT store `cancel_at_period_end`. The DB row is only a fallback (degraded mode) if Stripe read fails.
- Stripe SDK is 16.x → `current_period_end` is top-level on the subscription (not item-level). The page reads top-level with an item-level fallback to be forward-safe for SDK 18+.
- Map Stripe price id → display plan by finding the `PLANS` entry whose `process.env[plan.priceEnv]` matches (`planByPrice` helper in the page). Plans/price env live in `lib/plans.ts`.
- Mutations are `app/api/subscription/{cancel,resume,switch}/route.ts` (Node runtime, auth-gated). They only call Stripe; the existing `app/api/stripe-webhook` syncs results back into the DB. Switch uses `proration_behavior: "create_prorations"`.
- Client actions: `components/AccountActions.tsx` (busy states, confirm() on cancel, 401→/login, inline `var(--amber)` errors, `router.refresh()` after success).
- "Manage membership" entry points now Link to `/account`: courses header (`app/courses/page.tsx`) and learn `components/learn/Sidebar.tsx`. `StartHere.tsx` never had it. `ManageMembership` component + `/api/portal` kept (used for Update payment method).

**Gotcha confirmed:** no global `button { color: inherit }` reset — `<button className="card">` text needs an explicit `color: var(--text)` or it renders black. Applied in AccountActions switch-plan buttons.
