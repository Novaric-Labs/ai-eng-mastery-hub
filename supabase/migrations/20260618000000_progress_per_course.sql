-- Per-course learner progress.
--
-- The progress table was created in the single-course era as one row per user
-- (PK = user_id), holding a single JSON blob of read/quiz/exam/card/scenario
-- state keyed by module & scenario id. Now that more than one course is live,
-- those ids COLLIDE across courses: ai-eng and ai-foundations both ship modules
-- `context`/`tools`, blocks `b1`/`b2`, and scenarios `s1`–`s8`. With a single
-- per-user blob, completing one of those in Foundations marked it done in
-- Mastery (and vice versa) — progress bled between courses.
--
-- Fix: key progress by (user_id, course_id). Every pre-existing row belongs to
-- the original course, so backfill course_id = 'ai-eng' via the column default.
--
-- RLS is unaffected: the progress_select/insert/update policies gate on
-- user_id = auth.uid(), which still holds under the composite key.

alter table public.progress
  add column if not exists course_id text not null default 'ai-eng';

-- Re-key: drop the single-column PK and adopt the composite one. Idempotent —
-- drop-if-exists removes whichever pkey is present (single or composite) before
-- the re-add, so this migration can be applied more than once safely.
alter table public.progress drop constraint if exists progress_pkey;
alter table public.progress add primary key (user_id, course_id);
