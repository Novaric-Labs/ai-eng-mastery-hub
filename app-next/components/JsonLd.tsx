// Renders one or more JSON-LD structured-data blocks as <script type="application/ld+json">.
// Pass a single schema object or an array of them.
export default function JsonLd({
  schema,
}: {
  schema: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  const blocks = Array.isArray(schema) ? schema : [schema];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Structured data is build-time/server-derived from our own content,
          // not user input, so this is safe to inline.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
