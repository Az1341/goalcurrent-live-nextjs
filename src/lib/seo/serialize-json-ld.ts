/**
 * Serialize JSON-LD for embedding inside a <script> tag (FE-012).
 * Escapes `<` so a string value cannot break out via `</script>` / mixed case.
 * Also escapes U+2028 / U+2029 which are valid in JSON but can break script parsing.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
