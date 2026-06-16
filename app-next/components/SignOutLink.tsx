"use client";

import { LogOut } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

// Small client island: signs out and returns to the marketing home.
export default function SignOutLink() {
  async function signOut() {
    await supabaseBrowser().auth.signOut();
    location.href = "/";
  }
  return (
    <button
      onClick={signOut}
      className="sh-signout"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        color: "var(--dim)",
        font: "inherit",
        fontSize: 13,
        cursor: "pointer",
        padding: 0,
      }}
    >
      <LogOut size={14} strokeWidth={1.75} /> Sign out
    </button>
  );
}
