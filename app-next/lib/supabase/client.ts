import { createBrowserClient } from "@supabase/ssr";

// Browser Supabase client (RLS uses the logged-in user). Use in Client Components.
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
