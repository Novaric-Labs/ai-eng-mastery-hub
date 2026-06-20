import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import JsonLd from "@/components/JsonLd";
import Mdx from "@/components/blog/Mdx";
import { getAllPosts, getPost, formatDate } from "@/lib/blog";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `/blog/${slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        schema={[
          blogPostingSchema(post),
          breadcrumbSchema([
            ["Home", "/"],
            ["Blog", "/blog"],
            [post.title, `/blog/${slug}`],
          ]),
        ]}
      />
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 40, paddingBottom: 72, maxWidth: 720 }}>
        <p className="eyebrow" style={{ marginBottom: 14 }}>
          <Link href="/blog" style={{ color: "var(--accent)" }}>
            ← All posts
          </Link>
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-.02em", lineHeight: 1.2 }}>
          {post.title}
        </h1>
        <p style={{ color: "var(--faint)", fontSize: 13.5, margin: "10px 0 4px" }}>
          By {post.author} ·{" "}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>

        <article className="post-body">
          <Mdx source={post.content} />
        </article>

        <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "36px 0 18px" }} />
        <p style={{ color: "var(--dim)", fontSize: 14 }}>
          Want to go deeper? <Link href="/pricing">Explore Novacademy courses →</Link>
        </p>
      </main>
    </>
  );
}
