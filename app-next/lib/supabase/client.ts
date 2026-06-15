import { createBrowserClient, type CookieOptions } from "@supabase/ssr";
import { parse, serialize } from "cookie";
import { REMEMBER_COOKIE, isRemembered, applyRemember } from "./remember";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Browser Supabase client (RLS uses the logged-in user). Use in Client Components.
//
// We supply an explicit cookie adapter (mirroring @supabase/ssr's default
// document.cookie handling) so we can honor the "trusted device" choice: on
// write, persistent vs session-scoped cookies. The preference is read fresh
// inside setAll, so the cached singleton client always uses the latest choice.
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === "undefined") return [];
          const parsed = parse(document.cookie);
          return Object.keys(parsed).map((name) => ({ name, value: parsed[name] ?? "" }));
        },
        setAll(cookiesToSet: CookieToSet[]) {
          if (typeof document === "undefined") return;
          const remember = isRemembered(parse(document.cookie)[REMEMBER_COOKIE]);
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = serialize(name, value, applyRemember(options, remember));
          });
        },
      },
    },
  );
}
