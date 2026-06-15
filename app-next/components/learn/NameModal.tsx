"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCourseStore } from "./StoreProvider";

// Asks first-time users what they'd like to be called (used to personalize the
// app). Auto-opens once when no name is set; re-openable via the
// `aihub:edit-name` event (sidebar "edit" affordance).
export default function NameModal() {
  const { name, nameAsked, setName, markNameAsked } = useCourseStore((s) => ({
    name: s.S.name,
    nameAsked: !!s.S.nameAsked,
    setName: s.setName,
    markNameAsked: s.markNameAsked,
  }));

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [firstTime, setFirstTime] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-open once for brand-new users (no name, never asked).
  useEffect(() => {
    if (!nameAsked && !name) {
      setFirstTime(true);
      setOpen(true);
    }
  }, [nameAsked, name]);

  // Allow re-opening to edit later.
  useEffect(() => {
    function onEdit() {
      setFirstTime(false);
      setValue(name ?? "");
      setOpen(true);
    }
    window.addEventListener("aihub:edit-name", onEdit);
    return () => window.removeEventListener("aihub:edit-name", onEdit);
  }, [name]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const save = () => {
    if (value.trim()) setName(value);
    else markNameAsked();
    setOpen(false);
  };
  const skip = () => {
    markNameAsked();
    setOpen(false);
  };

  return createPortal(
    <div className="modal-backdrop" onClick={firstTime ? undefined : () => setOpen(false)}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Your name" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{firstTime ? "Welcome to Novacademy 👋" : "Update your name"}</h3>
        <p style={{ color: "var(--dim)", fontSize: 14 }}>
          What should we call you? We&apos;ll use it to personalize your dashboard.
        </p>
        <input
          ref={inputRef}
          className="input"
          placeholder="e.g. Alex"
          value={value}
          maxLength={40}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          style={{ marginTop: 6 }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={save} style={{ margin: 0 }}>Save</button>
          {firstTime && <button className="btn ghost" onClick={skip} style={{ margin: 0 }}>Skip</button>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
