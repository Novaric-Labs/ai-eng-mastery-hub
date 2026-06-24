-- Course completion certificates.
--
-- A certificate attests to *graded work*, not attendance: it is only issued by
-- /api/certificate after the server re-verifies (from the user's progress row)
-- that every block in the course is mastered — all modules read + quiz >= 80 and
-- every block mastery exam passed (>= 85). The `summary` jsonb snapshots what was
-- demonstrated at issue time (modules mastered, exams passed + average score,
-- scenarios completed, level/xp) so the public verification page can show the
-- proof of work even if the learner's progress later changes.
--
-- `tier` is 'completion' today; a future 'verified' tier (capstone-reviewed,
-- consulting-firm-eligible) can coexist via the (user_id, course_id, tier) key.

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  tier text not null default 'completion',
  recipient_name text,
  summary jsonb not null default '{}'::jsonb,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id, tier)
);

create index if not exists certificates_user_idx on public.certificates(user_id);

alter table public.certificates enable row level security;

-- Learners can read their own certificates. Issuance (insert) and the public
-- verification page both go through the service-role client (RLS-bypassing) in
-- their route handlers, so no insert policy and no public select policy are
-- needed here — mirrors the locked-down pattern used for access_codes.
drop policy if exists certificates_self on public.certificates;
create policy certificates_self on public.certificates
  for select using (user_id = auth.uid());
