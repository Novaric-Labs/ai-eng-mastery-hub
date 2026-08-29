-- Catalog anchor row for the 'ai-architect' course (AI Architect).
--
-- The `courses` table exists so content/entitlements/access_codes have a FK
-- target; the display copy a learner reads lives in app-next/lib/courses.ts.
-- Only the minimal anchor is inserted here, matching how 'ai-eng' and
-- 'ai-foundations' were seeded in 20260615000000_multi_course.sql.
--
-- Idempotent: safe to re-run. Ships 'coming_soon'; the app gates deep links on
-- lib/courses.ts status, so flipping to live is a code change, not a data one.

insert into public.courses (slug, title, status, sort_order)
values ('ai-architect', 'AI Architect', 'coming_soon', 3)
on conflict (slug) do nothing;
