# Database migrations

Schema changes live in `supabase/migrations/NNNN_name.sql` and are applied to the
single prod Supabase project (`zcyjdrqtcyhkqncytvyv`). There is no separate
staging DB — previews and prod share this database.

## History (important)

The first five migrations were originally numbered `0001`–`0006` (no `0005` on
main — see below) and applied **ad hoc** (REST, the Management API, and the
dashboard SQL Editor) before CLI tracking existed. The Supabase CLI only
recognises **14-digit timestamp** versions, so those files were renamed:

| was | now |
|---|---|
| `0001_init.sql` | `20260101000000_init.sql` |
| `0002_video_bucket.sql` | `20260101000001_video_bucket.sql` |
| `0003_multi_course.sql` | `20260615000000_multi_course.sql` |
| `0004_subscriptions.sql` | `20260616000000_subscriptions.sql` |
| `0006_progress_per_course.sql` | `20260618000000_progress_per_course.sql` |

The renames are **on-disk only** — the schema is already live in prod; only the
filenames changed. The CLI's history table (`supabase_migrations.schema_migrations`)
still doesn't know these are applied, so `supabase db push` would try to **replay**
them. Don't run `db push` before the one-time repair below.

## One-time setup — establish CLI tracking

Run once, from the repo root. Needs the Supabase login (browser) and the database
password (Dashboard → Project Settings → Database → Connection string).

```bash
npx supabase login                                  # opens browser, stores a PAT
npx supabase link --project-ref zcyjdrqtcyhkqncytvyv # prompts for the DB password

# Tell the CLI which migrations are ALREADY applied (records them WITHOUT re-running).
npx supabase migration repair --status applied \
  20260101000000 20260101000001 20260615000000 20260616000000 20260618000000

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
- The shelved `feat/using-claude-course` branch still carries the old-style
  `0005_using_claude_course.sql`. When that work resumes, rename it to a
  timestamp **after** `20260618000000` and `migration repair`/`db push` it.
- `config.toml`'s `db.major_version` (currently 17) only affects local `supabase
  start` / `db diff`; it doesn't matter for `db push` to the remote. If you use
  those, set it to match prod (`SHOW server_version;`).
