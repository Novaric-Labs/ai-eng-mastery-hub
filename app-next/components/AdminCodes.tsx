"use client";

import { useState } from "react";

type Code = {
  code: string;
  max_redemptions: number;
  redeemed_count: number;
  expires_at: string | null;
  note: string | null;
  created_at: string;
};

export default function AdminCodes({ initialCodes }: { initialCodes: Code[] }) {
  const [codes, setCodes] = useState<Code[]>(initialCodes);
  const [form, setForm] = useState({ code: "", maxRedemptions: "1", expiresInDays: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function create() {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/admin/create-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    setBusy(false);
    if (d.error) return setErr(d.error);
    setCodes([d.code, ...codes]);
    setForm({ code: "", maxRedemptions: "1", expiresInDays: "", note: "" });
  }

  const inp = { padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)" };

  return (
    <main className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Access codes</h1>
      <p style={{ color: "var(--dim)", marginBottom: 20 }}>
        Generate direct-unlock codes for testers. A code grants full access on redemption.
      </p>

      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
          <input style={inp} placeholder="Code (blank = random)" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input style={inp} type="number" min={1} placeholder="Max uses" value={form.maxRedemptions}
            onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })} />
          <input style={inp} type="number" min={0} placeholder="Expires in days (blank = never)" value={form.expiresInDays}
            onChange={(e) => setForm({ ...form, expiresInDays: e.target.value })} />
          <input style={inp} placeholder="Note (e.g. 'Alex')" value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </div>
        <button className="btn" style={{ marginTop: 12 }} disabled={busy} onClick={create}>
          {busy ? "Creating…" : "Create code"}
        </button>
        {err && <span style={{ color: "var(--red)", marginLeft: 10 }}>{err}</span>}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16, fontSize: 13.5 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--dim)" }}>
            <th style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)" }}>Code</th>
            <th style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)" }}>Used</th>
            <th style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)" }}>Expires</th>
            <th style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)" }}>Note</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((c) => (
            <tr key={c.code}>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", fontFamily: "ui-monospace, monospace", color: "var(--teal)" }}>{c.code}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)" }}>{c.redeemed_count}/{c.max_redemptions}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--dim)" }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "never"}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--dim)" }}>{c.note ?? ""}</td>
            </tr>
          ))}
          {codes.length === 0 && (
            <tr><td colSpan={4} style={{ padding: "14px 10px", color: "var(--dim)" }}>No codes yet.</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
