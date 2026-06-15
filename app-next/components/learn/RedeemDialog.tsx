"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Ticket } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

const ERRORS: Record<string, string> = {
  invalid: "That code isn't valid.",
  expired: "That code has expired.",
  exhausted: "That code has been fully used.",
  not_authenticated: "Please sign in first.",
};

// Access-code redemption as a clean inline modal (replaces prompt()/alert()).
// Reused by the sidebar and the paywall — pass a button className/label/style.
export default function RedeemDialog({
  className = "btn ghost",
  style,
  label = "I have a code",
}: {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function submit() {
    const c = code.trim();
    if (!c || busy) return;
    setBusy(true);
    setMsg(null);
    const { data, error } = await supabaseBrowser().rpc("redeem_access_code", { p_code: c });
    if (error) {
      setBusy(false);
      return setMsg({ kind: "error", text: error.message });
    }
    if (data === "ok") {
      setMsg({ kind: "ok", text: "Unlocked! Refreshing…" });
      setTimeout(() => location.reload(), 700);
      return;
    }
    setBusy(false);
    setMsg({ kind: "error", text: ERRORS[data as string] ?? "Could not redeem that code." });
  }

  return (
    <>
      <button className={className} style={style} onClick={() => { setOpen(true); setMsg(null); }}>
        {label}
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="modal-backdrop" onClick={() => setOpen(false)}>
            <div className="modal" role="dialog" aria-modal="true" aria-label="Redeem access code" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
                <Ticket size={18} strokeWidth={1.75} /> Enter your access code
              </h3>
              <p style={{ color: "var(--dim)", fontSize: 14 }}>
                Have a Novacademy access code? Enter it to unlock the full course.
              </p>
              <input
                ref={inputRef}
                className="input"
                placeholder="e.g. NOVA-001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                style={{ marginTop: 6 }}
              />
              {msg && (
                <p style={{ marginTop: 10, fontSize: 13.5, color: msg.kind === "ok" ? "var(--green)" : "var(--red)" }}>
                  {msg.text}
                </p>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button className="btn" disabled={busy} onClick={submit} style={{ margin: 0 }}>
                  {busy ? "Checking…" : "Redeem"}
                </button>
                <button className="btn ghost" onClick={() => setOpen(false)} style={{ margin: 0 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
