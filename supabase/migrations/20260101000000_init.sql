-- AI Engineering Mastery Hub — backend schema
-- Supabase / Postgres. Run via `supabase db push` or paste into the SQL editor.
-- Security model: course content and per-user progress are protected by
-- Row-Level Security. Paid content is only readable by users who hold an
-- active entitlement (from a Stripe purchase OR a redeemed access code).

-- ============================ TABLES ============================

-- Course content, split into rows. Public rows = free preview/marketing
-- (catalog, glossary, plain-English intros, one sample module). Paid rows
-- = the full curriculum, gated by RLS below.
create table if not exists public.content (
  id         text primary key,                 -- e.g. 'meta:catalog', 'module:rag', 'quiz:rag'
  tier       text not null check (tier in ('public','paid')),
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Who has access. One row per user; presence + active = entitled.
create table if not exists public.entitlements (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  active             boolean not null default true,
  source             text not null check (source in ('stripe','code','manual')),
  stripe_customer_id text,
  note               text,
  granted_at         timestamptz not null default now()
);

-- Per-user progress (replaces localStorage; syncs across devices).
create table if not exists public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Direct-unlock tester/promo codes (separate from Stripe promotion codes).
create table if not exists public.access_codes (
  code            text primary key,
  max_redemptions int  not null default 1,
  redeemed_count  int  not null default 0,
  expires_at      timestamptz,
  note            text,
  created_at      timestamptz not null default now()
);

create table if not exists public.code_redemptions (
  code        text references public.access_codes(code) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  primary key (code, user_id)
);

-- ============================ RLS ============================

alter table public.content          enable row level security;
alter table public.entitlements     enable row level security;
alter table public.progress         enable row level security;
alter table public.access_codes     enable row level security;
alter table public.code_redemptions enable row level security;

-- Entitlement check used by the content policy. SECURITY DEFINER so the policy
-- does NOT require the calling role (esp. anon) to hold SELECT on entitlements —
-- otherwise evaluating the policy would error for logged-out visitors.
create or replace function public.is_entitled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = auth.uid() and e.active
  );
$$;
grant execute on function public.is_entitled() to anon, authenticated;

-- content: anyone may read public rows; paid rows require an active entitlement.
drop policy if exists content_read on public.content;
create policy content_read on public.content
  for select using ( tier = 'public' or public.is_entitled() );

-- entitlements: a user can read only their own row (no client writes; granted
-- by the redeem RPC or the Stripe webhook via the service role).
drop policy if exists entitlements_self on public.entitlements;
create policy entitlements_self on public.entitlements
  for select using (user_id = auth.uid());

-- progress: a user can read and write only their own row.
drop policy if exists progress_select on public.progress;
create policy progress_select on public.progress
  for select using (user_id = auth.uid());
drop policy if exists progress_insert on public.progress;
create policy progress_insert on public.progress
  for insert with check (user_id = auth.uid());
drop policy if exists progress_update on public.progress;
create policy progress_update on public.progress
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- access_codes / code_redemptions: RLS enabled with NO policies => the client
-- cannot read or write them directly. The SECURITY DEFINER function below is
-- the only path, so codes can't be enumerated or tampered with from the browser.

-- ============================ GRANTS ============================
-- RLS filters which ROWS are visible; table privileges decide whether the role
-- may touch the table at all. Make them explicit (don't rely on project defaults).
grant select on public.content to anon, authenticated;
grant select on public.entitlements to authenticated;
grant select, insert, update on public.progress to authenticated;
-- access_codes & code_redemptions: intentionally NO grants to anon/authenticated.

-- ============================ FUNCTIONS ============================

-- Redeem a direct-unlock access code for the calling user. Atomic: locks the
-- code row, checks expiry + remaining redemptions, records the redemption, and
-- grants entitlement. Idempotent for a user who already redeemed the same code.
create or replace function public.redeem_access_code(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.access_codes;
begin
  if v_uid is null then return 'not_authenticated'; end if;

  select * into v_row from public.access_codes where code = p_code for update;
  if not found then return 'invalid'; end if;
  if v_row.expires_at is not null and v_row.expires_at < now() then return 'expired'; end if;

  if exists (select 1 from public.code_redemptions where code = p_code and user_id = v_uid) then
    insert into public.entitlements (user_id, active, source, note)
      values (v_uid, true, 'code', 'code:'||p_code)
      on conflict (user_id) do update set active = true;
    return 'ok';
  end if;

  if v_row.redeemed_count >= v_row.max_redemptions then return 'exhausted'; end if;

  update public.access_codes set redeemed_count = redeemed_count + 1 where code = p_code;
  insert into public.code_redemptions (code, user_id) values (p_code, v_uid);
  insert into public.entitlements (user_id, active, source, note)
    values (v_uid, true, 'code', 'code:'||p_code)
    on conflict (user_id) do update set active = true, source = 'code';
  return 'ok';
end;
$$;

revoke all on function public.redeem_access_code(text) from public, anon;
grant execute on function public.redeem_access_code(text) to authenticated;

-- Used by the Stripe webhook (service role) to grant access after payment.
create or replace function public.grant_stripe_entitlement(p_user uuid, p_customer text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.entitlements (user_id, active, source, stripe_customer_id)
  values (p_user, true, 'stripe', p_customer)
  on conflict (user_id) do update
    set active = true, source = 'stripe', stripe_customer_id = excluded.stripe_customer_id;
$$;

revoke all on function public.grant_stripe_entitlement(uuid, text) from public, anon, authenticated;
