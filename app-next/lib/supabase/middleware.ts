import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Refreshes the Supabase auth cookie on every request so Server Components see a
// valid session. Standard @supabase/ssr middleware pattern.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // If Supabase isn't configured, don't throw and 500 every route — pass through.
  // (The /learn server gate still redirects unauthenticated users to /login.)
  if (!url || !anonKey) return response;

  // Belt-and-suspenders: the auth-cookie refresh must NEVER take the whole site
  // down. Any failure here (client construction, runtime quirk, network) just
  // skips the refresh — Server Components re-check the session themselves.
  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    await supabase.auth.getUser();
  } catch {
    // swallow — never 500 from middleware
  }
  return response;
}
