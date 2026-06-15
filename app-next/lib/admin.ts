// Permanent owner(s): always admin + full access, independent of env config so
// it can't be lost by a misconfigured ADMIN_EMAILS.
const OWNER_EMAILS = ["braxton.jackson7@protonmail.com"];

// Admin allowlist: the owner(s) above plus any env emails (comma-separated),
// e.g. ADMIN_EMAILS=you@x.com
export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  const list = [
    ...OWNER_EMAILS,
    ...(process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  ];
  return list.includes(email.toLowerCase());
}
