/**
 * Serialize JSON-LD for embedding inside a <script> tag.
 * Escapes `<` so a string value cannot break out via `</script>` (FE-012).
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
