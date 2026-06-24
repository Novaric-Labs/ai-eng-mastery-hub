// Shown instantly while the /learn Server Component fetches entitlement + content.
export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        gap: 14,
      }}
    >
      <div className="cosmic-loader" aria-hidden>
        <span className="star" />
        <span className="orbit"><span className="planet" /></span>
      </div>
      <p style={{ color: "var(--dim)", fontSize: 13.5 }}>Charting your course…</p>
    </div>
  );
}
