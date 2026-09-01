/**
 * Emits a <script type="application/ld+json"> block.
 *
 * JSON.stringify alone is not safe to drop into a <script> tag: a payload
 * containing "</script" would close the tag early and the rest would render
 * as visible page text. The replace escapes exactly that sequence.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export default JsonLd;
