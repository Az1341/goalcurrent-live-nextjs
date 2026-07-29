/**
 * Defense-in-depth sanitiser for editorial article HTML (FE-012).
 * Strips executable sinks without adding a sanitiser dependency.
 * Repo-authored CMS content is the primary source today.
 */

const BLOCKED_ELEMENTS =
  /<(?:script|style|iframe|object|embed|form|svg|math|template|noscript)\b[^>]*>[\s\S]*?<\/\s*(?:script|style|iframe|object|embed|form|svg|math|template|noscript)\s*>/gi;

const BLOCKED_TAGS =
  /<\/?(?:script|style|iframe|object|embed|form|input|button|textarea|select|option|link|meta|base|svg|math|template|noscript)(?:\s[^>]*)?>/gi;

const EVENT_HANDLER_ATTR =
  /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

const DANGEROUS_URL_ATTR =
  /(\s(?:href|src|xlink:href|action|formaction|poster)\s*=\s*)(["'])\s*(?:javascript|vbscript|data)\s*:/gi;

const DANGEROUS_URL_ATTR_UNQUOTED =
  /(\s(?:href|src|xlink:href|action|formaction|poster)\s*=\s*)(?:javascript|vbscript|data)\s*:/gi;

export function sanitizeArticleHtml(html: string): string {
  if (!html) {
    return "";
  }

  let out = html;
  // Repeat removals so nested/broken tags cannot reconstitute a sink.
  for (let i = 0; i < 3; i += 1) {
    out = out
      .replace(BLOCKED_ELEMENTS, "")
      .replace(BLOCKED_TAGS, "")
      .replace(EVENT_HANDLER_ATTR, "")
      .replace(DANGEROUS_URL_ATTR, "$1$2#")
      .replace(DANGEROUS_URL_ATTR_UNQUOTED, "$1#");
  }

  return out;
}
