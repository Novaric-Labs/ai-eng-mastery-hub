-- Explicit service_role grants.
--
-- Why this exists: every table here was created with explicit grants to `anon`
-- and `authenticated` but none to `service_role`, which historically worked
-- only because Supabase auto-exposed new public-schema entities to all three
-- Data API roles. That auto-exposure is now OFF by default for new projects
-- (see `auto_expose_new_tables` in supabase/config.toml) and the flag is
-- removed on 2026-10-30, after which the always-revoked behaviour is permanent.
--
-- Without these grants the service-role client (lib/supabase/admin.ts) gets
-- "42501 permission denied" on every call, which silently breaks the entire
-- backend surface: the Stripe webhook cannot mirror subscriptions (paying
-- users get no access), certificates cannot be issued or verified, signed
-- video URLs 404, AI grading cannot read scenarios, admin code creation
-- fails, and the admin content read returns an empty course. Verified locally
-- against a fresh `supabase start`, where the learn page rendered "No course
-- content yet" for an admin despite 76 correctly-seeded rows.
--
-- This follows the same doctrine as the init migration's own note on grants:
-- make them explicit, don't rely on project defaults.

-- Read-only for service_role: content is written by the seed pipeline, which
-- also needs insert/update for its REST upsert (scripts/seed-db.sh posts to
-- /rest/v1/content?on_conflict=course_id,id).
grant select, insert, update on public.content to service_role;
grant select on public.courses to service_role;

-- Certificates: issued (insert) by /api/certificate, read by the public
-- verification page /cert/[id].
grant select, insert on public.certificates to service_role;

-- Subscriptions: upserted by the Stripe webhook and the reconciliation
-- endpoint; read by both to resolve the current membership row.
grant select, insert, update on public.subscriptions to service_role;

-- Entitlements: read for access checks; written by grant_stripe_entitlement
-- (SECURITY DEFINER, so it does not itself need this) and by admin comps.
grant select, insert, update on public.entitlements to service_role;

-- Access codes: minted and listed from the admin page / create-code route.
grant select, insert, update on public.access_codes to service_role;
grant select on public.code_redemptions to service_role;

-- Progress: read server-side when assembling completion state.
grant select on public.progress to service_role;

-- Deliberately NOT granted: public.code_attempts. It is touched only by the
-- SECURITY DEFINER redeem_access_code() function, and migration
-- 20260809000000 revokes it from every client role on purpose.
