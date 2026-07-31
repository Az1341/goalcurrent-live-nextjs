import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const sanitizeHref = pathToFileURL(join(root, "src/lib/sanitize-article-html.ts")).href;
const serializeHref = pathToFileURL(join(root, "src/lib/seo/serialize-json-ld.ts")).href;

async function load() {
  const [{ sanitizeArticleHtml }, { serializeJsonLd }] = await Promise.all([
    import(sanitizeHref),
    import(serializeHref),
  ]);
  return { sanitizeArticleHtml, serializeJsonLd };
}

function ampEntityColonHref() {
  return "<a href=\"javascript" + String.fromCharCode(38) + "#58;alert(1)\">link</a>";
}

test("FE-012 R3: strips lower-case script elements", async () => {
  const { sanitizeArticleHtml } = await load();
  const clean = sanitizeArticleHtml('<p>Hi</p><script>alert(1)</script><p>Bye</p>');
  assert.equal(/script/i.test(clean), false);
  assert.match(clean, /Hi/);
  assert.match(clean, /Bye/);
});

test("FE-012 R3: strips mixed-case SCRIPT elements", async () => {
  const { sanitizeArticleHtml } = await load();
  const clean = sanitizeArticleHtml("<p>A</p><ScRiPt>alert(1)</sCrIpT><p>B</p>");
  assert.equal(/script/i.test(clean), false);
});

test("FE-012 R3: strips event-handler attributes", async () => {
  const { sanitizeArticleHtml } = await load();
  const clean = sanitizeArticleHtml('<p onclick="alert(1)" onmouseover="alert(2)">Click</p>');
  assert.equal(/on\w+\s*=/i.test(clean), false);
  assert.match(clean, /Click/);
});

test("FE-012 R3: rejects javascript: URLs", async () => {
  const { sanitizeArticleHtml } = await load();
  const clean = sanitizeArticleHtml('<a href="javascript:alert(1)">link</a>');
  assert.equal(/javascript/i.test(clean), false);
  assert.equal(/href=/i.test(clean), false);
});

test("FE-012 R3: rejects mixed-case JavaScript: URLs", async () => {
  const { sanitizeArticleHtml } = await load();
  const clean = sanitizeArticleHtml('<a href="JaVaScRiPt:alert(1)">link</a>');
  assert.equal(/javascript/i.test(clean), false);
  assert.equal(/href=/i.test(clean), false);
});

test("FE-012 R3: rejects whitespace/control javascript bypasses", async () => {
  const { sanitizeArticleHtml } = await load();
  const dirty = "<a href=\"java" + String.fromCharCode(9) + "script:alert(1)\">link</a>";
  const clean = sanitizeArticleHtml(dirty);
  assert.equal(/href=/i.test(clean), false);
});

test("FE-012 R3: rejects entity-encoded javascript bypasses", async () => {
  const { sanitizeArticleHtml } = await load();
  const clean = sanitizeArticleHtml(ampEntityColonHref());
  assert.equal(/javascript/i.test(clean), false);
  assert.equal(/href=/i.test(clean), false);
});

test("FE-012 R3: rejects data: and vbscript: URLs", async () => {
  const { sanitizeArticleHtml } = await load();
  const a = sanitizeArticleHtml('<a href="data:text/html,x">x</a>');
  const b = sanitizeArticleHtml('<a href="vbscript:msgbox(1)">x</a>');
  assert.equal(/href=/i.test(a), false);
  assert.equal(/href=/i.test(b), false);
});

test("FE-012 R3: rejects protocol-relative URLs", async () => {
  const { sanitizeArticleHtml } = await load();
  const clean = sanitizeArticleHtml('<a href="//evil.example">x</a>');
  assert.equal(/href=/i.test(clean), false);
});

test("FE-012 R3: strips iframe object embed form", async () => {
  const { sanitizeArticleHtml } = await load();
  const dirty =
    '<iframe src="x"></iframe><object data="x"></object><embed src="x"><form action="x"><input></form><p>ok</p>';
  const clean = sanitizeArticleHtml(dirty);
  assert.equal(/iframe|object|embed|form|input/i.test(clean), false);
  assert.match(clean, /ok/);
});

test("FE-012 R3: strips SVG and MathML payloads", async () => {
  const { sanitizeArticleHtml } = await load();
  const dirty = '<svg onload=alert(1)></svg><math><mi onclick=alert(1)>x</mi></math><p>ok</p>';
  const clean = sanitizeArticleHtml(dirty);
  assert.equal(/svg|math|onload|onclick/i.test(clean), false);
  assert.match(clean, /ok/);
});

test("FE-012 R3: strips style elements and style attributes", async () => {
  const { sanitizeArticleHtml } = await load();
  const clean = sanitizeArticleHtml('<style>body{color:red}</style><p style="color:red">x</p>');
  assert.equal(/style/i.test(clean), false);
  assert.match(clean, /<p>x<\/p>/);
});

test("FE-012 R3: nested malformed script cannot recover executable markup", async () => {
  const { sanitizeArticleHtml } = await load();
  const clean = sanitizeArticleHtml("<scr<script>ipt>alert(1)</script>");
  // Structural parse may leave inert text residue; executable tags must not remain.
  assert.equal(/<\/?script\b/i.test(clean), false);
  assert.equal(/javascript\s*:/i.test(clean), false);
  assert.equal(/on\w+\s*=/i.test(clean), false);
});

test("FE-012 R3: dangerous attributes on permitted elements are removed", async () => {
  const { sanitizeArticleHtml } = await load();
  const clean = sanitizeArticleHtml('<a href="/ok" onclick="alert(1)" class="x" data-x="1">go</a>');
  assert.equal(/onclick|class=|data-/i.test(clean), false);
  assert.match(clean, /href="\/ok"/);
});

test("FE-012 R3: target and rel from input are stripped", async () => {
  const { sanitizeArticleHtml } = await load();
  const clean = sanitizeArticleHtml('<a href="/x" target="_blank" rel="noopener">x</a>');
  assert.equal(/target=|rel=/i.test(clean), false);
  assert.match(clean, /href="\/x"/);
});

test("FE-012 R3: preserves legitimate article formatting", async () => {
  const { sanitizeArticleHtml } = await load();
  const html =
    "<h2>Title</h2><p>Body <strong>bold</strong> and <em>i</em>.</p><ul><li>one</li></ul><ol><li>two</li></ol><blockquote>q</blockquote><br /><a href=\"/articles\">in</a><a href=\"https://example.com\" title=\"t\">ex</a>";
  const clean = sanitizeArticleHtml(html);
  assert.match(clean, /<h2>Title<\/h2>/);
  assert.match(clean, /<strong>bold<\/strong>/);
  assert.match(clean, /<em>i<\/em>/);
  assert.match(clean, /<ul>/);
  assert.match(clean, /<ol>/);
  assert.match(clean, /<blockquote>/);
  assert.match(clean, /href="\/articles"/);
  assert.match(clean, /href="https:\/\/example.com"/);
  assert.match(clean, /title="t"/);
});

test("FE-012 R3: empty input and fail-closed empty string", async () => {
  const { sanitizeArticleHtml } = await load();
  assert.equal(sanitizeArticleHtml(""), "");
});

test("FE-012 R3: JSON-LD escapes script terminators", async () => {
  const { serializeJsonLd } = await load();
  const serialized = serializeJsonLd({
    name: '</script><script>alert(1)</script>',
  });
  assert.equal(/<\/script>/i.test(serialized), false);
  assert.match(serialized, /\\u003c/);
});

test("FE-012 R3: JSON-LD escapes mixed-case terminators in objects/arrays", async () => {
  const { serializeJsonLd } = await load();
  const serialized = serializeJsonLd({
    nested: { x: "</ScRiPt>" },
    arr: ["</SCRIPT>", { y: "<script>" }],
  });
  assert.equal(/</.test(serialized), false);
  assert.deepEqual(JSON.parse(serialized).arr[0], "</SCRIPT>");
});

test("FE-012 R3: JSON-LD escapes U+2028 and U+2029", async () => {
  const { serializeJsonLd } = await load();
  const serialized = serializeJsonLd({
    line: "a\u2028b\u2029c",
  });
  assert.equal(serialized.includes("\u2028"), false);
  assert.equal(serialized.includes("\u2029"), false);
  assert.match(serialized, /\\u2028/);
  assert.match(serialized, /\\u2029/);
  assert.equal(JSON.parse(serialized).line, "a\u2028b\u2029c");
});

test("FE-012 R3: JSON-LD preserves ampersands and remains parseable", async () => {
  const { serializeJsonLd } = await load();
  const data = { name: "A & B < C > D" };
  const serialized = serializeJsonLd(data);
  assert.deepEqual(JSON.parse(serialized), data);
});

test("FE-012 R3: ArticleBodyWithAd consumes sanitizeArticleHtml only", async () => {
  const src = readFileSync(join(root, "src/components/articles/ArticleBodyWithAd.tsx"), "utf8");
  assert.match(src, /sanitizeArticleHtml/);
  assert.equal(src.includes("__html: html"), false);
  assert.equal(src.includes("JSON.stringify"), false);
});

test("FE-012 R3: JsonLd and JsonLdScript consume serializeJsonLd only", async () => {
  const jsonLd = readFileSync(join(root, "src/components/seo/JsonLd.tsx"), "utf8");
  const jsonLdScript = readFileSync(join(root, "src/components/seo/JsonLdScript.tsx"), "utf8");
  assert.match(jsonLd, /serializeJsonLd/);
  assert.match(jsonLdScript, /serializeJsonLd/);
  assert.equal(jsonLd.includes("JSON.stringify(data)"), false);
  assert.equal(jsonLdScript.includes("JSON.stringify(data)"), false);
});

test("FE-012 R3: article slug page no longer injects inline style HTML", async () => {
  const src = readFileSync(
    join(root, "src/app/[locale]/articles/[slug]/page.tsx"),
    "utf8",
  );
  assert.match(src, /ArticleBodyWithAd html=\{article\.content\}/);
  assert.equal(src.includes('style="font-size:18px'), false);
});

test("FE-012 R3: sanitiser uses sanitize-html structural parser", async () => {
  const src = readFileSync(join(root, "src/lib/sanitize-article-html.ts"), "utf8");
  assert.match(src, /from ["']sanitize-html["']/);
  assert.match(src, /allowedTags/);
  assert.match(src, /allowProtocolRelative:\s*false/);
});