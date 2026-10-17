-- Full-platform access codes: let a single code comp EVERY course (like a
-- membership) instead of just one. Adds an `all_courses` flag to access_codes
-- and teaches redeem_access_code to grant an entitlement for every course in the
-- catalog when the flag is set. Single-course codes (flag = false, the default)
-- keep their existing behavior, so nothing about the current NOVA-00x codes
-- changes except the ones explicitly flagged below.
--
-- Idempotent + backward-compatible: safe to re-run.

-- 1) The flag. Defaults false so every existing code stays single-course.
alter table public.access_codes
  add column if not exists all_courses boolean not null default false;

-- 2) The three tester codes minted for full-platform access.
update public.access_codes
  set all_courses = true
  where code in ('NOVA-008', 'NOVA-009', 'NOVA-010');

-- 3) Course-aware redeem, now flag-aware. When all_courses is set, grant an
--    active entitlement for EVERY course (future courses included the next time
--    the code is touched). Otherwise, grant only the code's own course_id.
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

  -- Same user redeeming again: re-assert the grant(s), don't bump the counter.
  if exists (select 1 from public.code_redemptions where code = p_code and user_id = v_uid) then
    if v_row.all_courses then
      insert into public.entitlements (user_id, course_id, active, source, note)
        select v_uid, c.slug, true, 'code', 'code:'||p_code from public.courses c
        on conflict (user_id, course_id) do update set active = true;
    else
      insert into public.entitlements (user_id, course_id, active, source, note)
        values (v_uid, v_row.course_id, true, 'code', 'code:'||p_code)
        on conflict (user_id, course_id) do update set active = true;
    end if;
    return 'ok';
  end if;

  if v_row.redeemed_count >= v_row.max_redemptions then return 'exhausted'; end if;

  update public.access_codes set redeemed_count = redeemed_count + 1 where code = p_code;
  insert into public.code_redemptions (code, user_id) values (p_code, v_uid);

  if v_row.all_courses then
    insert into public.entitlements (user_id, course_id, active, source, note)
      select v_uid, c.slug, true, 'code', 'code:'||p_code from public.courses c
      on conflict (user_id, course_id) do update set active = true, source = 'code';
  else
    insert into public.entitlements (user_id, course_id, active, source, note)
      values (v_uid, v_row.course_id, true, 'code', 'code:'||p_code)
      on conflict (user_id, course_id) do update set active = true, source = 'code';
  end if;
  return 'ok';
end;
$$;

revoke all on function public.redeem_access_code(text) from public, anon;
grant execute on function public.redeem_access_code(text) to authenticated;
