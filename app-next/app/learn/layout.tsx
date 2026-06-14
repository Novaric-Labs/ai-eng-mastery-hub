import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

// Server gate: anything under /learn requires a session.
export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <>{children}</>;
}
