import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import AdminCodes from "@/components/AdminCodes";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!isAdmin(user.email)) {
    return (
      <main className="wrap" style={{ paddingTop: 64 }}>
        <h1>Not authorized</h1>
        <p style={{ color: "var(--dim)" }}>
          This page is for admins only. Add your email to ADMIN_EMAILS.
        </p>
      </main>
    );
  }

  const admin = supabaseAdmin();
  const { data: codes } = await admin
    .from("access_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminCodes initialCodes={codes ?? []} />;
}
