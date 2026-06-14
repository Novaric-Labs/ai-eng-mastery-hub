import type { ElementType } from "react";

// Renders trusted course HTML (authored content seeded into our own DB — concepts,
// mental models, code, etc. carry inline <b>/<br>/<code> markup). User-generated
// text (scenario notes) is escaped separately before reaching here.
export default function Html({
  html,
  as,
  className,
  style,
}: {
  html: string;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Tag = as ?? "div";
  return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}
