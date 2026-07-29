/* eslint-disable security/detect-unsafe-regex, security/detect-non-literal-regexp -- FE-012 fixed-tag stripper; patterns are constant allowlists */
/**
 * Defense-in-depth sanitiser for editorial article HTML (FE-012).
 * Strips executable sinks without adding a sanitiser dependency.
 * Repo-authored CMS content is the primary source today.
 */

const BLOCKED_ELEMENT_NAMES = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "svg",
  "math",
  "template",
  "noscript",
] as const;

const VOIDISH_BLOCKED_TAGS =
  /<\/?(?:input|button|textarea|select|option|link|meta|base)(?:\s[^>]*)?>/gi;

const EVENT_HANDLER_ATTR =
  /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

const DANGEROUS_URL_ATTR =
  /(\s(?:href|src|xlink:href|action|formaction|poster)\s*=\s*)(["'])\s*(?:javascript|vbscript|data)\s*:/gi;

const DANGEROUS_URL_ATTR_UNQUOTED =
  /(\s(?:href|src|xlink:href|action|formaction|poster)\s*=\s*)(?:javascript|vbscript|data)\s*:/gi;

function stripNamedElements(html: string, name: string): string {
  const openRe = new RegExp(`<${name}\\b[^>]*>`, "i");
  const closeRe = new RegExp(`</\\s*${name}\\s*>`, "i");
  let out = html;
  for (let guard = 0; guard < 32; guard += 1) {
    const openMatch = openRe.exec(out);
    if (!openMatch || openMatch.index === undefined) {
      break;
    }
    const from = openMatch.index;
    const afterOpen = from + openMatch[0].length;
    closeRe.lastIndex = afterOpen;
    const closeMatch = closeRe.exec(out);
    const to = closeMatch
      ? closeMatch.index + closeMatch[0].length
      : afterOpen;
    out = `${out.slice(0, from)}${out.slice(to)}`;
    openRe.lastIndex = 0;
    closeRe.lastIndex = 0;
  }
  out = out.replace(new RegExp(`</?\\s*${name}\\b[^>]*>`, "gi"), "");
  return out;
}

export function sanitizeArticleHtml(html: string): string {
  if (!html) {
    return "";
  }

  let out = html;
  for (let i = 0; i < 3; i += 1) {
    for (const name of BLOCKED_ELEMENT_NAMES) {
      out = stripNamedElements(out, name);
    }
    out = out
      .replace(VOIDISH_BLOCKED_TAGS, "")
      .replace(EVENT_HANDLER_ATTR, "")
      .replace(DANGEROUS_URL_ATTR, "$1$2#")
      .replace(DANGEROUS_URL_ATTR_UNQUOTED, "$1#");
  }

  return out;
}
