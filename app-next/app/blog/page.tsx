import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import JsonLd from "@/components/JsonLd";
import { getAllPosts, formatDate } from "@/lib/blog";
import { blogSchema, breadcrumbSchema } from "@/lib/seo";

const TITLE = "Blog — AI Engineering Guides & Tutorials";
const DESCRIPTION =
  "Practical guides on building with AI — RAG, agents, evals, and shipping real LLM features — from the team behind Novacademy.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/blog", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <JsonLd
        schema={[
          blogSchema(posts),
          breadcrumbSchema([
            ["Home", "/"],
            ["Blog", "/blog"],
          ]),
        ]}
      />
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 48, paddingBottom: 72, maxWidth: 760 }}>
        <p className="eyebrow">Novacademy Blog</p>
        <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-.02em", margin: "6px 0 10px" }}>
          Guides for building with AI
        </h1>
        <p style={{ color: "var(--dim)", fontSize: 16, marginBottom: 8, maxWidth: 620 }}>
          Plain-English explainers and practical walkthroughs on RAG, agents, evals, and the
          engineering judgment to ship real AI features.
        </p>

        {posts.length === 0 ? (
          <p style={{ color: "var(--dim)", marginTop: 28 }}>No posts yet — check back soon.</p>
        ) : (
          <div style={{ display: "grid", gap: 14, marginTop: 28 }}>
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="card"
                style={{ display: "block", textDecoration: "none" }}
              >
                <time
                  dateTime={post.date}
                  style={{ color: "var(--faint)", fontSize: 12.5, fontFamily: "var(--font-mono)" }}
                >
                  {formatDate(post.date)}
                </time>
                <h2
                  style={{
                    fontSize: 19,
                    fontWeight: 600,
                    color: "var(--text)",
                    letterSpacing: "-.01em",
                    margin: "4px 0 6px",
                  }}
                >
                  {post.title}
                </h2>
                <p style={{ color: "var(--dim2)", fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>
                  {post.description}
                </p>
                {post.tags.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    {post.tags.map((tag) => (
                      <span key={tag} className="pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
