/**
 * FE-012 structural article HTML sanitiser (Sprint 021-R3).
 * Uses sanitize-html (htmlparser2) - not regex-primary.
 *
 * Security contract (allowlist only; everything else discarded):
 * - Elements: p, h1-h6, ul, ol, li, em, strong, blockquote, br, a
 * - Attributes: a[href], a[title] only
 * - URL schemes on href: http, https, and relative paths (no scheme)
 * - Protocol-relative URLs rejected
 * - javascript:/data:/vbscript: rejected by parser + scheme filter
 * - No style, class, event handlers, SVG/MathML, iframe/object/embed/form/script
 * - Fail-closed: exceptions return empty string
 */

import sanitizeHtml from "sanitize-html";

export const ARTICLE_ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "em",
  "strong",
  "blockquote",
  "br",
  "a",
] as const;

export const ARTICLE_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "title"],
};

export const ARTICLE_ALLOWED_SCHEMES = ["http", "https"] as const;

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...ARTICLE_ALLOWED_TAGS],
  allowedAttributes: ARTICLE_ALLOWED_ATTRIBUTES,
  allowedSchemes: [...ARTICLE_ALLOWED_SCHEMES],
  allowedSchemesByTag: {
    a: [...ARTICLE_ALLOWED_SCHEMES],
  },
  allowedSchemesAppliedToAttributes: ["href"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    a: (_tagName, attribs) => {
      const next: Record<string, string> = {};
      if (typeof attribs.href === "string" && attribs.href.length > 0) {
        next.href = attribs.href;
      }
      if (typeof attribs.title === "string" && attribs.title.length > 0) {
        next.title = attribs.title;
      }
      return { tagName: "a", attribs: next };
    },
  },
};

export function sanitizeArticleHtml(html: string): string {
  if (!html) {
    return "";
  }

  try {
    return sanitizeHtml(html, SANITIZE_OPTIONS);
  } catch {
    return "";
  }
}