import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check, Clock, BarChart3, Layers, Lock, Sparkles, Settings } from "lucide-react";
import NovaMark from "@/components/NovaMark";
import SignOutLink from "@/components/SignOutLink";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { hasActiveMembership } from "@/lib/entitlement";
import { COURSES, type CourseMeta } from "@/lib/courses";

// Behind auth; never index the signed-in catalog.
export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const admin = isAdmin(user.email);

  const [{ data: ents }, member] = await Promise.all([
    supabase.from("entitlements").select("course_id, active"),
    hasActiveMembership(supabase),
  ]);
  const granted = new Set(
    (ents ?? []).filter((e) => e.active).map((e) => e.course_id as string),
  );
  // Active membership unlocks everything; admins always; codes/comps per course.
  const hasAccess = (slug: string) => admin || member || granted.has(slug);
  const isMember = admin || member;

  return (
    <>
      <CatalogHeader email={user.email ?? ""} member={member} />
      <main className="wrap" style={{ paddingTop: 40, paddingBottom: 72, maxWidth: 880 }}>
        <p className="eyebrow">YOUR LIBRARY</p>
        <h1 style={{ fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 600, letterSpacing: "-.02em", margin: "8px 0 6px" }}>
          Course catalog
        </h1>
        <p style={{ color: "var(--dim2)", fontSize: 16, marginBottom: 24, maxWidth: 560 }}>
          {isMember
            ? "Your membership unlocks every course below. New courses are added over time — they're included."
            : "Pick a course to preview free. A membership unlocks every course, current and future."}
        </p>

        {!isMember && (
          <div
            className="card"
            style={{
              marginBottom: 24,
              padding: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              border: "1px solid var(--accent)",
              boxShadow: "0 0 0 1px var(--accent), var(--shadow-2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <span style={{ display: "inline-flex", padding: 9, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)", flexShrink: 0 }}>
                <Sparkles size={18} strokeWidth={1.75} />
              </span>
              <div style={{ minWidth: 0 }}>
                <b style={{ fontSize: 15 }}>Unlock every course</b>
                <p style={{ color: "var(--dim2)", fontSize: 13.5, margin: "2px 0 0" }}>
                  Membership from $21/mo. Cancel anytime.
                </p>
              </div>
            </div>
            <Link href="/pricing" className="btn" style={{ margin: 0, flexShrink: 0 }}>
              See plans <ArrowRight size={16} strokeWidth={1.75} />
            </Link>
          </div>
        )}

        <div style={{ display: "grid", gap: 18 }}>
          {COURSES.map((c) => (
            <CourseCard key={c.slug} course={c} access={hasAccess(c.slug)} member={isMember} />
          ))}
        </div>
      </main>
    </>
  );
}

function CourseCard({
  course: c,
  access,
  member,
}: {
  course: CourseMeta;
  access: boolean;
  member: boolean;
}) {
  const live = c.status === "live";
  const accessible = live; // any signed-in user can open a live course (preview)

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
            {live && access && (
              <span className="pill" style={{ color: "var(--green)", borderColor: "rgba(52,199,89,.4)" }}>
                <Check size={12} strokeWidth={2.5} style={{ marginRight: 3 }} /> Unlocked
              </span>
            )}
            {live && !access && member === false && (
              <span className="pill" style={{ color: "var(--dim)" }}>Free preview</span>
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
            <span key={b} className="pill" style={{ fontSize: 12, color: "var(--dim2)", borderColor: "var(--border2)" }}>
              {b}
            </span>
          ))}
        </div>
      </div>

      {accessible ? (
        <Link href={`/learn/${c.slug}`} className="btn" style={{ margin: 0 }}>
          {access ? "Continue" : "Start free preview"}{" "}
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

// Catalog header — brand, membership management, sign out.
function CatalogHeader({ email, member }: { email: string; member: boolean }) {
  return (
    <header className="siteheader-bar">
      <div className="siteheader">
        <Link href="/courses" className="sh-logo brand">
          <NovaMark size={20} className="brand-mark" />
          <span className="brand-word">Novacademy</span>
        </Link>
        <nav className="sh-nav" style={{ alignItems: "center", gap: 14 }}>
          {email && <span style={{ color: "var(--faint)", fontSize: 12.5 }}>{email}</span>}
          {member && (
            <Link
              href="/account"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--dim)", fontSize: 13 }}
            >
              <Settings size={14} strokeWidth={1.75} /> Manage membership
            </Link>
          )}
          <SignOutLink />
        </nav>
      </div>
    </header>
  );
}
