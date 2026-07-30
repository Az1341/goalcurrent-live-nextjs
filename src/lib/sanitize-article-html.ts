/* eslint-disable security/detect-unsafe-regex, security/detect-non-literal-regexp -- FE-012 fixed-tag stripper; patterns are constant allowlists */
/**
 * Defense-in-depth sanitiser for editorial article HTML (FE-012).
 * Strips executable sinks without adding a sanitiser dependency.
 * Repo-authored CMS content is the primary source today.
 *
 * Sprint 021-R2 assurance: also neutralises common scheme obfuscation
 * (HTML entities / whitespace inside javascript: / data: / vbscript: URLs).
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

const URL_ATTR_QUOTED =
  /(\s(?:href|src|xlink:href|action|formaction|poster)\s*=\s*)(["'])([\s\S]*?)\2/gi;

const URL_ATTR_UNQUOTED =
  /(\s(?:href|src|xlink:href|action|formaction|poster)\s*=\s*)([^\s>]+)/gi;

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#([0-9]+);?/g, (_, dec: string) =>
      String.fromCodePoint(Number.parseInt(dec, 10)),
    )
    .replace(/&colon;/gi, ":")
    .replace(/&tab;/gi, "\t")
    .replace(/&newline;/gi, "\n");
}

function isDangerousScheme(raw: string): boolean {
  const decoded = decodeBasicEntities(raw);
  const compact = decoded.replace(/[\u0000-\u0020\u007f]+/g, "");
  return /^(?:javascript|vbscript|data):/i.test(compact);
}

function neutralizeUrlAttrs(html: string): string {
  let out = html.replace(URL_ATTR_QUOTED, (full, prefix: string, quote: string, value: string) => {
    if (isDangerousScheme(value)) {
      return `${prefix}${quote}#${quote}`;
    }
    return full;
  });
  out = out.replace(URL_ATTR_UNQUOTED, (full, prefix: string, value: string) => {
    if (isDangerousScheme(value)) {
      return `${prefix}#`;
    }
    return full;
  });
  return out;
}

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
      .replace(EVENT_HANDLER_ATTR, "");
    out = neutralizeUrlAttrs(out);
  }

  return out;
}
