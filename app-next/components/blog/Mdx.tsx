import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import type { ComponentProps } from "react";

// Render authored MDX (server component, compiled at build). Internal links go
// through next/link; external links open safely in a new tab.
const components = {
  a: ({ href = "", children, ...props }: ComponentProps<"a">) => {
    const internal = href.startsWith("/") || href.startsWith("#");
    return internal ? (
      <Link href={href} {...props}>
        {children}
      </Link>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
};

export default function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug],
        },
      }}
    />
  );
}
