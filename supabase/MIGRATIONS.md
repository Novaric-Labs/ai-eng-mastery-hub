# Database migrations

Schema changes live in `supabase/migrations/NNNN_name.sql` and are applied to the
single prod Supabase project (`zcyjdrqtcyhkqncytvyv`). There is no separate
staging DB — previews and prod share this database.

## History (important)

Migrations `0001`–`0006` were applied **ad hoc** (REST, the Management API, and the
dashboard SQL Editor) before CLI tracking existed, so the CLI's migration-history
table (`supabase_migrations.schema_migrations`) does **not** yet know about them.
Until the one-time repair below is done, `supabase db push` would try to **replay**
`0001`–`0006` against prod. Don't run `db push` before repairing.

## One-time setup — establish CLI tracking

Run once, from the repo root. Needs the Supabase login (browser) and the database
password (Dashboard → Project Settings → Database → Connection string).

```bash
npx supabase login                                  # opens browser, stores a PAT
npx supabase link --project-ref zcyjdrqtcyhkqncytvyv # prompts for the DB password

# Tell the CLI which migrations are ALREADY applied (records them WITHOUT re-running).
# Note: 0005 is not on main — it only exists on the shelved feat/using-claude-course branch.
npx supabase migration repair --status applied 0001 0002 0003 0004 0006

npx supabase migration list   # verify: every migration shows applied both locally & remotely
```

After this, `supabase_migrations.schema_migrations` matches reality and the CLI is
the source of truth.

## Applying a new migration (after setup)

```bash
# 1. add supabase/migrations/0007_whatever.sql
npx supabase db push          # applies ONLY new (unrecorded) migrations to prod
npx supabase migration list   # confirm it registered
```

Until the one-time setup is done, apply new migrations as standalone SQL in the
dashboard SQL Editor instead, and `migration repair --status applied <NNNN>` them
afterward so the history stays consistent.

## Notes

- Migrations should be idempotent where practical (`add column if not exists`,
  `drop ... if exists` before re-create) so a re-run is safe.
- `config.toml`'s `db.major_version` (currently 17) only affects local `supabase
  start` / `db diff`; it doesn't matter for `db push` to the remote. If you use
  those, set it to match prod (`SHOW server_version;`).
