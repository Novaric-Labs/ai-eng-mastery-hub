import { getAllPosts } from "@/lib/blog";
import { SITE_NAME, abs } from "@/lib/seo";

// Built statically at build time (fs available, no per-request work).
export const dynamic = "force-static";

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] ?? c,
  );

export function GET() {
  const posts = getAllPosts();
  const items = posts
    .map((p) => {
      const url = abs(`/blog/${p.slug}`);
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(p.description)}</description>
      ${p.date ? `<pubDate>${new Date(p.date).toUTCString()}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_NAME} Blog</title>
    <link>${abs("/blog")}</link>
    <description>Guides on building with AI — RAG, agents, evals, and shipping real LLM features.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
