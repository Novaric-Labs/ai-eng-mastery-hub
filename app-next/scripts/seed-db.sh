#!/usr/bin/env bash
# Upsert public.content rows into Supabase. Builds the payload with seed-db.mjs,
# then POSTs it via the PostgREST endpoint (curl, because Node's undici can't
# reliably connect in some local envs). Safe to re-run: upsert on (course_id, id).
#
# Run from app-next/:
#   ./scripts/seed-db.sh                    # both courses
#   SEED_COURSE=ai-foundations ./scripts/seed-db.sh   # just one course
#
# Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
set -euo pipefail
cd "$(dirname "$0")/.."

# Load .env.local (KEY=VALUE lines) without exporting comments/blank lines.
if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  . <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env.local)
  set +a
fi

URL="${NEXT_PUBLIC_SUPABASE_URL:-}"
KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"
if [ -z "$URL" ] || [ -z "$KEY" ] || printf '%s%s' "$URL" "$KEY" | grep -qi placeholder; then
  echo "✗ Set real NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in app-next/.env.local first." >&2
  exit 1
fi

# Build the payload (respects SEED_COURSE if set).
node --env-file=.env.local scripts/seed-db.mjs

echo "POST ${URL}/rest/v1/content  (upsert on course_id,id)"
HTTP_CODE=$(curl -sS -o /tmp/seed-db-resp.txt -w '%{http_code}' \
  -X POST "${URL}/rest/v1/content?on_conflict=course_id,id" \
  -H "apikey: ${KEY}" \
  -H "Authorization: Bearer ${KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -H "Prefer: return=minimal" \
  --data-binary @scripts/seed-payload.json)

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "✓ Upsert OK (HTTP ${HTTP_CODE})"
else
  echo "✗ Upsert failed (HTTP ${HTTP_CODE}):" >&2
  cat /tmp/seed-db-resp.txt >&2
  exit 1
fi
