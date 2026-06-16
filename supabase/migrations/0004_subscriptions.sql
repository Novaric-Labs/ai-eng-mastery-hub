-- Membership subscriptions: platform-wide access via a recurring Stripe plan.
--
-- Pricing pivoted from one-time/lifetime to a subscription that unlocks the
-- ENTIRE platform (all courses, current + future). This adds a `subscriptions`
-- table and folds an "active membership" check into is_entitled(), so a single
-- active subscription grants every course. Access codes / admin comps still
-- grant specific courses permanently via the entitlements table (0001/0003).
--
-- Additive + idempotent: safe to re-run; doesn't alter 0003's per-course tables.

create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  plan                   text,                 -- monthly | quarterly | biannual | annual
  status                 text not null default 'incomplete',
  current_period_end     timestamptz,
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_customer_idx
  on public.subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;
grant select on public.subscriptions to authenticated;

-- A user may read only their own subscription. Writes are service-role only
-- (the Stripe webhook), so no insert/update policy is granted to clients.
drop policy if exists subscriptions_self on public.subscriptions;
create policy subscriptions_self on public.subscriptions
  for select using (user_id = auth.uid());

-- Active membership = a non-expired subscription in a paying state. SECURITY
-- DEFINER so the content RLS policy can evaluate it without granting callers
-- SELECT on subscriptions (same pattern as is_entitled()).
create or replace function public.has_active_subscription()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = auth.uid()
      and s.status in ('active','trialing')
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;
grant execute on function public.has_active_subscription() to anon, authenticated;

-- Entitled to a course = an active platform membership OR a specific per-course
-- grant (access code / comp). The content_read policy already calls this with
-- the row's course_id, so updating the body is all that's needed.
create or replace function public.is_entitled(p_course text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_active_subscription() or exists (
    select 1 from public.entitlements e
    where e.user_id = auth.uid() and e.course_id = p_course and e.active
  );
$$;
grant execute on function public.is_entitled(text) to anon, authenticated;
