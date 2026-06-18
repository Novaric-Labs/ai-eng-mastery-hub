-- Add the 'using-claude' course: a standalone, general-user course on choosing
-- and using the right Claude surface (Chat vs Cowork vs Code).
--
-- Only the catalog anchor row is needed here — it's the FK target for the
-- content/entitlements rows seeded by content/seed.mjs. Display copy lives in
-- app-next/lib/courses.ts; per-course Stripe price is set on this row later (or
-- falls back to STRIPE_PRICE_ID). Ships 'coming_soon' until the content is
-- reviewed and approved. Idempotent: safe to re-run.

insert into public.courses (slug, title, status, sort_order) values
  ('using-claude', 'Claude, Actually', 'coming_soon', 2)
  on conflict (slug) do nothing;
