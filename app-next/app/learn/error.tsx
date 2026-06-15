"use client";

import { useEffect } from "react";
import Link from "next/link";

// Scoped error boundary for the course. Keeps a failure inside /learn from taking
// down the whole app and offers a retry (re-runs the server gate fetch).
export default function LearnError({
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
      <div style={{ fontSize: 40 }}>⚠️</div>
      <h1 style={{ fontSize: 24, margin: "10px 0 8px" }}>Couldn&apos;t load your course</h1>
      <p style={{ color: "var(--dim)", marginBottom: 20 }}>
        Something went wrong fetching your content. This is usually temporary.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button className="btn" onClick={() => reset()}>Retry</button>
        <Link href="/" className="btn ghost">Go home</Link>
      </div>
    </main>
  );
}
