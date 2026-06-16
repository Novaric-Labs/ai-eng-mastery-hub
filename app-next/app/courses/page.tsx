import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check, Clock, BarChart3, Layers, Lock } from "lucide-react";
import NovaMark from "@/components/NovaMark";
import SignOutLink from "@/components/SignOutLink";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { COURSES, type CourseMeta } from "@/lib/courses";

// Behind auth; never index the signed-in catalog.
export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const admin = isAdmin(user.email);

  const { data: ents } = await supabase
    .from("entitlements")
    .select("course_id, active");
  const owned = new Set(
    (ents ?? []).filter((e) => e.active).map((e) => e.course_id as string),
  );

  return (
    <>
      <CatalogHeaderServer email={user.email ?? ""} />
      <main className="wrap" style={{ paddingTop: 40, paddingBottom: 72, maxWidth: 880 }}>
        <p className="eyebrow">YOUR LIBRARY</p>
        <h1 style={{ fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 600, letterSpacing: "-.02em", margin: "8px 0 6px" }}>
          Course catalog
        </h1>
        <p style={{ color: "var(--dim2)", fontSize: 16, marginBottom: 28, maxWidth: 560 }}>
          Pick a course to start learning. New courses are on the way — owned courses
          stay yours for life.
        </p>

        <div style={{ display: "grid", gap: 18 }}>
          {COURSES.map((c) => (
            <CourseCard
              key={c.slug}
              course={c}
              owned={admin || owned.has(c.slug)}
              admin={admin}
            />
          ))}
        </div>
      </main>
    </>
  );
}

function CourseCard({
  course: c,
  owned,
  admin,
}: {
  course: CourseMeta;
  owned: boolean;
  admin: boolean;
}) {
  const live = c.status === "live";
  const accessible = live || admin;

  return (
    <div
      className="card"
      style={{
        marginBottom: 0,
        padding: 24,
        opacity: live ? 1 : 0.92,
        boxShadow: "var(--shadow-2), var(--hairline)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 19, fontWeight: 600, margin: 0 }}>{c.title}</h2>
            {owned && live && (
              <span className="pill" style={{ color: "var(--green)", borderColor: "rgba(52,199,89,.4)" }}>
                <Check size={12} strokeWidth={2.5} style={{ marginRight: 3 }} /> Owned
              </span>
            )}
            {!live && (
              <span className="pill" style={{ color: "var(--dim)" }}>
                <Lock size={11} strokeWidth={2} style={{ marginRight: 3 }} /> Coming soon
              </span>
            )}
          </div>
          <p style={{ color: "var(--dim2)", fontSize: 14.5, margin: "6px 0 0", lineHeight: 1.45 }}>
            {c.subtitle}
          </p>
        </div>
        {live && !owned && c.price && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", letterSpacing: "-.02em" }}>{c.price}</div>
            <div style={{ fontSize: 11.5, color: "var(--faint)" }}>one-time</div>
          </div>
        )}
      </div>

      <p style={{ color: "var(--dim)", fontSize: 13.5, lineHeight: 1.5, margin: "12px 0 14px" }}>
        {c.blurb}
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "0 0 16px", color: "var(--dim)", fontSize: 12.5 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <BarChart3 size={14} strokeWidth={1.75} /> {c.level}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Layers size={14} strokeWidth={1.75} /> {c.moduleCount} modules
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Clock size={14} strokeWidth={1.75} /> {c.estHours}
        </span>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".04em", color: "var(--faint)", marginBottom: 8 }}>
          BEST FOR
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {c.bestFor.map((b) => (
            <span
              key={b}
              className="pill"
              style={{ fontSize: 12, color: "var(--dim2)", borderColor: "var(--border2)" }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {accessible ? (
        <Link href={`/learn/${c.slug}`} className="btn" style={{ margin: 0 }}>
          {owned ? "Continue" : "Start free preview"}{" "}
          <ArrowRight size={16} strokeWidth={1.75} />
        </Link>
      ) : (
        <button className="btn ghost" disabled style={{ margin: 0, cursor: "not-allowed", opacity: 0.7 }}>
          Coming soon
        </button>
      )}
    </div>
  );
}

// Header for the catalog page — brand + sign out. Kept inline-server with a
// small client island for the sign-out action.
function CatalogHeaderServer({ email }: { email: string }) {
  return (
    <header className="siteheader-bar">
      <div className="siteheader">
        <Link href="/courses" className="sh-logo brand">
          <NovaMark size={20} className="brand-mark" />
          <span className="brand-word">Novacademy</span>
        </Link>
        <nav className="sh-nav" style={{ alignItems: "center", gap: 14 }}>
          {email && <span style={{ color: "var(--faint)", fontSize: 12.5 }}>{email}</span>}
          <SignOutLink />
        </nav>
      </div>
    </header>
  );
}
