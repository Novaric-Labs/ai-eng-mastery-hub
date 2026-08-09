-- Redeem hardening (audit Aug 2026, docs/CURRICULUM_AUDIT_2026-08.md):
--
-- 1. REVOKED ENTITLEMENTS STAY REVOKED. The already-redeemed branch of
--    redeem_access_code unconditionally set active = true, so anyone whose
--    entitlement an admin had revoked could resurrect it by re-entering the
--    same code. The branch now restores a MISSING row (legit: new device,
--    idempotent re-entry) but never flips active = false back to true, and
--    reports 'revoked' so the UI can say something honest. A fresh, valid,
--    unredeemed code is a new grant and still activates.
--
-- 2. BRUTE-FORCE THROTTLE. The RPC is callable straight from the browser by
--    any signed-in user and codes are short/typable, so failed attempts are
--    now recorded and capped (10 failures/hour/user). A per-user advisory
--    xact lock serializes the count-then-insert, so a parallel burst can't
--    all read the pre-burst count and slip past the cap. New status:
--    'too_many_attempts'. Only failures are logged — successes have no
--    reader, and logging them would let anyone with one valid code bloat
--    the table at will.

create table if not exists public.code_attempts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempted_at timestamptz not null default now()
);
create index if not exists code_attempts_user_time
  on public.code_attempts (user_id, attempted_at desc);

-- Only the security-definer function below may touch this table: RLS on with
-- no policies denies all direct access, and the default grants are revoked.
alter table public.code_attempts enable row level security;
revoke all on table public.code_attempts from public, anon, authenticated;
revoke all on sequence public.code_attempts_id_seq from public, anon, authenticated;

create or replace function public.redeem_access_code(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.access_codes;
  v_recent_failures int;
begin
  if v_uid is null then return 'not_authenticated'; end if;

  -- Serialize this user's attempts for the rest of the transaction, then
  -- throttle before revealing anything about the code space.
  perform pg_advisory_xact_lock(hashtext('redeem:' || v_uid::text));

  select count(*) into v_recent_failures
    from public.code_attempts a
    where a.user_id = v_uid
      and a.attempted_at > now() - interval '1 hour';
  if v_recent_failures >= 10 then return 'too_many_attempts'; end if;

  -- Opportunistic cleanup keeps the table from growing unbounded.
  delete from public.code_attempts
    where user_id = v_uid and attempted_at < now() - interval '1 day';

  select * into v_row from public.access_codes where code = p_code for update;
  if not found then
    insert into public.code_attempts (user_id) values (v_uid);
    return 'invalid';
  end if;
  if v_row.expires_at is not null and v_row.expires_at < now() then
    insert into public.code_attempts (user_id) values (v_uid);
    return 'expired';
  end if;

  if exists (select 1 from public.code_redemptions where code = p_code and user_id = v_uid) then
    -- Idempotent re-entry: restore a missing entitlement row, but never
    -- reactivate one an admin revoked (do NOTHING on conflict).
    insert into public.entitlements (user_id, course_id, active, source, note)
      values (v_uid, v_row.course_id, true, 'code', 'code:'||p_code)
      on conflict (user_id, course_id) do nothing;
    return case when exists (
      select 1 from public.entitlements e
      where e.user_id = v_uid and e.course_id = v_row.course_id and e.active
    ) then 'ok' else 'revoked' end;
  end if;

  if v_row.redeemed_count >= v_row.max_redemptions then
    insert into public.code_attempts (user_id) values (v_uid);
    return 'exhausted';
  end if;

  update public.access_codes set redeemed_count = redeemed_count + 1 where code = p_code;
  insert into public.code_redemptions (code, user_id) values (p_code, v_uid);
  insert into public.entitlements (user_id, course_id, active, source, note)
    values (v_uid, v_row.course_id, true, 'code', 'code:'||p_code)
    on conflict (user_id, course_id) do update set active = true, source = 'code';
  return 'ok';
end;
$$;
