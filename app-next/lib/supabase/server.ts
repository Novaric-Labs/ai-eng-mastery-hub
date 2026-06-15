import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { REMEMBER_COOKIE, isRemembered, applyRemember } from "./remember";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Server-side Supabase client bound to the request cookies (RLS uses the user's
// session). Use in Server Components, Route Handlers, and Server Actions.
export async function supabaseServer() {
  const cookieStore = await cookies();
  // Trusted-device preference controls whether the session cookies persist.
  const remember = isRemembered(cookieStore.get(REMEMBER_COOKIE)?.value);
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, applyRemember(options, remember)),
            );
          } catch {
            // called from a Server Component (read-only cookies); middleware
            // refreshes the session, so this is safe to ignore.
          }
        },
      },
    },
  );
}
