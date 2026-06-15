import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap" style={{ paddingTop: 96, paddingBottom: 96, maxWidth: 520, textAlign: "center" }}>
      <div style={{ fontSize: 40, fontWeight: 700, color: "var(--accent)" }}>404</div>
      <h1 style={{ fontSize: 26, margin: "10px 0 8px" }}>Page not found</h1>
      <p style={{ color: "var(--dim)", marginBottom: 20 }}>
        That page doesn&apos;t exist. The course lives at{" "}
        <Link href="/learn">/learn</Link>.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <Link href="/" className="btn">Go home</Link>
        <Link href="/learn" className="btn ghost">Open the course</Link>
      </div>
    </main>
  );
}
