"use client";

import { useState } from "react";
import { Settings } from "lucide-react";

// Opens the Stripe billing portal so a member can switch plan, update payment,
// or cancel. Rendered only for users with an active membership.
export default function ManageMembership({
  label = "Manage membership",
  className,
  style,
}: {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [busy, setBusy] = useState(false);

  async function open() {
    setBusy(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const d = await res.json();
      if (d.url) {
        location.href = d.url;
        return;
      }
      setBusy(false);
      alert(
        d.error === "no_subscription"
          ? "No active membership to manage."
          : "Couldn't open the billing portal: " + (d.error ?? "unknown"),
      );
    } catch {
      setBusy(false);
      alert("Couldn't open the billing portal.");
    }
  }

  return (
    <button
      onClick={open}
      disabled={busy}
      className={className}
      style={
        className
          ? style
          : {
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              color: "var(--dim)",
              font: "inherit",
              fontSize: 13,
              cursor: busy ? "wait" : "pointer",
              padding: 0,
              ...style,
            }
      }
    >
      <Settings size={14} strokeWidth={1.75} /> {busy ? "Opening…" : label}
    </button>
  );
}
