"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="wrap" style={{ paddingTop: 96, paddingBottom: 96, maxWidth: 520, textAlign: "center" }}>
      <TriangleAlert size={40} strokeWidth={1.5} style={{ color: "var(--amber)" }} />
      <h1 style={{ fontSize: 26, margin: "10px 0 8px" }}>Something went wrong</h1>
      <p style={{ color: "var(--dim)", marginBottom: 20 }}>
        An unexpected error occurred. You can try again or head back home.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button className="btn" onClick={() => reset()}>Try again</button>
        <Link href="/" className="btn ghost">Go home</Link>
      </div>
    </main>
  );
}
