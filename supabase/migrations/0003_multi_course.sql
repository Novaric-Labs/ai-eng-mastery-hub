-- Multi-course: scope content + entitlements + access codes by course.
--
-- Before this migration the product was a single global course: one entitlement
-- row per user granted access to ALL paid content. This adds a `courses` table
-- (the catalog) and a `course_id` dimension to content/entitlements/access_codes
-- so access becomes per-course. Existing data is backfilled to the flagship
-- course slug 'ai-eng', so nobody loses access.
--
-- Idempotent + backward-compatible: safe to re-run; existing entitlements keep
-- working (they map to 'ai-eng').

-- ============================ COURSES ============================

create table if not exists public.courses (
  slug             text primary key,
  title            text not null,
  subtitle         text,
  summary          text,
  best_for         jsonb not null default '[]'::jsonb,
  level            text,
  est_hours        numeric,
  module_count     int,
  price_cents      int,
  compare_at_cents int,
  stripe_price_id  text,
  status           text not null default 'coming_soon' check (status in ('live','coming_soon')),
  accent           text,
  sort_order       int not null default 0,
  updated_at       timestamptz not null default now()
);

alter table public.courses enable row level security;
grant select on public.courses to anon, authenticated;

-- Catalog is public marketing data — anyone may read it.
drop policy if exists courses_read on public.courses;
create policy courses_read on public.courses for select using (true);

-- Minimal anchor rows so the FKs below validate against existing backfilled data.
-- Richer display copy lives in the app (lib/courses.ts); stripe_price_id is set
-- per-course in this table (or falls back to STRIPE_PRICE_ID for the flagship).
insert into public.courses (slug, title, status, sort_order) values
  ('ai-eng', 'AI Engineering Mastery Hub', 'live', 0)
  on conflict (slug) do nothing;
insert into public.courses (slug, title, status, sort_order) values
  ('ai-foundations', 'AI Foundations', 'coming_soon', 1)
  on conflict (slug) do nothing;

-- ============================ CONTENT ============================
-- Add course_id, backfill existing rows to the flagship, make the PK composite
-- so module ids (e.g. 'module:rag') can repeat across courses.

alter table public.content add column if not exists course_id text;
update public.content set course_id = 'ai-eng' where course_id is null;
alter table public.content alter column course_id set not null;

do $$ begin
  if exists (
    select 1 from pg_constraint
    where conname = 'content_pkey' and conrelid = 'public.content'::regclass
  ) and not exists (
    -- only swap once: composite PK has 2 columns
    select 1 from pg_index i
    where i.indrelid = 'public.content'::regclass and i.indisprimary
      and array_length(i.indkey::int[], 1) = 2
  ) then
    alter table public.content drop constraint content_pkey;
    alter table public.content add primary key (course_id, id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'content_course_fk'
  ) then
    alter table public.content
      add constraint content_course_fk foreign key (course_id)
      references public.courses(slug) on delete cascade;
  end if;
end $$;

-- ============================ ENTITLEMENTS ============================
-- Per-course access: one row per (user, course). Existing global rows backfill
-- to 'ai-eng' so current buyers/redeemers keep the flagship course.

alter table public.entitlements add column if not exists course_id text;
update public.entitlements set course_id = 'ai-eng' where course_id is null;
alter table public.entitlements alter column course_id set not null;

do $$ begin
  if exists (
    select 1 from pg_constraint
    where conname = 'entitlements_pkey' and conrelid = 'public.entitlements'::regclass
  ) and not exists (
    select 1 from pg_index i
    where i.indrelid = 'public.entitlements'::regclass and i.indisprimary
      and array_length(i.indkey::int[], 1) = 2
  ) then
    alter table public.entitlements drop constraint entitlements_pkey;
    alter table public.entitlements add primary key (user_id, course_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'entitlements_course_fk'
  ) then
    alter table public.entitlements
      add constraint entitlements_course_fk foreign key (course_id)
      references public.courses(slug) on delete cascade;
  end if;
end $$;

-- ============================ ACCESS CODES ============================
-- Each code unlocks a specific course (defaults to the flagship).

alter table public.access_codes add column if not exists course_id text;
update public.access_codes set course_id = 'ai-eng' where course_id is null;
alter table public.access_codes alter column course_id set not null;
alter table public.access_codes alter column course_id set default 'ai-eng';

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'access_codes_course_fk'
  ) then
    alter table public.access_codes
      add constraint access_codes_course_fk foreign key (course_id)
      references public.courses(slug) on delete cascade;
  end if;
end $$;

-- ============================ RLS: course-aware entitlement ============================

-- New course-scoped entitlement check. SECURITY DEFINER so the content policy can
-- evaluate it for anon/unentitled callers without granting them SELECT on
-- entitlements (same rationale as the original is_entitled()).
create or replace function public.is_entitled(p_course text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = auth.uid() and e.course_id = p_course and e.active
  );
$$;
grant execute on function public.is_entitled(text) to anon, authenticated;

-- content: public rows readable by all; paid rows require an active entitlement
-- for THAT row's course.
drop policy if exists content_read on public.content;
create policy content_read on public.content
  for select using ( tier = 'public' or public.is_entitled(course_id) );

-- ============================ FUNCTIONS: course-aware grants ============================

-- Redeem an access code: grants entitlement for the code's own course.
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
    insert into public.entitlements (user_id, course_id, active, source, note)
      values (v_uid, v_row.course_id, true, 'code', 'code:'||p_code)
      on conflict (user_id, course_id) do update set active = true;
    return 'ok';
  end if;

  if v_row.redeemed_count >= v_row.max_redemptions then return 'exhausted'; end if;

  update public.access_codes set redeemed_count = redeemed_count + 1 where code = p_code;
  insert into public.code_redemptions (code, user_id) values (p_code, v_uid);
  insert into public.entitlements (user_id, course_id, active, source, note)
    values (v_uid, v_row.course_id, true, 'code', 'code:'||p_code)
    on conflict (user_id, course_id) do update set active = true, source = 'code';
  return 'ok';
end;
$$;

revoke all on function public.redeem_access_code(text) from public, anon;
grant execute on function public.redeem_access_code(text) to authenticated;

-- Stripe webhook (service role) grants access for the purchased course.
create or replace function public.grant_stripe_entitlement(p_user uuid, p_customer text, p_course text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.entitlements (user_id, course_id, active, source, stripe_customer_id)
  values (p_user, p_course, true, 'stripe', p_customer)
  on conflict (user_id, course_id) do update
    set active = true, source = 'stripe', stripe_customer_id = excluded.stripe_customer_id;
$$;

revoke all on function public.grant_stripe_entitlement(uuid, text, text) from public, anon, authenticated;

-- Retire the old global-grant signature so it can't accidentally insert a row
-- without a course_id (which would now violate the composite PK).
drop function if exists public.grant_stripe_entitlement(uuid, text);
drop function if exists public.is_entitled();
