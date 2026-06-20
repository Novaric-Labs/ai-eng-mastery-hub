// Filesystem-backed blog. Posts are MDX files in content/blog/<slug>.mdx with
// YAML frontmatter (title, description, date, author, tags, draft). Everything
// that calls these helpers (the /blog pages, sitemap, RSS feed) is statically
// generated, so the filesystem is only read at build time — no runtime fs.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  /** ISO date string, e.g. "2026-06-10". */
  date: string;
  author: string;
  tags: string[];
  draft: boolean;
};

export type Post = PostMeta & { content: string };

// Drafts are visible in dev, hidden from production builds.
const isPublished = (p: PostMeta) =>
  process.env.NODE_ENV !== "production" || !p.draft;

function readPost(slug: string): Post | null {
  const file = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    author: String(data.author ?? "Novacademy"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: Boolean(data.draft ?? false),
    content,
  };
}

/** All published posts, newest first (metadata + body). */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => readPost(f.replace(/\.mdx$/, "")))
    .filter((p): p is Post => p !== null && isPublished(p))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** A single published post, or null if missing/draft-in-prod. */
export function getPost(slug: string): Post | null {
  const post = readPost(slug);
  return post && isPublished(post) ? post : null;
}

/** Human-readable date, formatted deterministically (built statically). */
export function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
