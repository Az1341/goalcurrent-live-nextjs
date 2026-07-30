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

test("FE-012: strips script tags from article HTML (XSS fixture)", async () => {
  const { sanitizeArticleHtml } = await load();
  const dirty = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
  const clean = sanitizeArticleHtml(dirty);
  assert.equal(clean.includes("<script"), false);
  assert.equal(clean.includes("alert"), false);
  assert.match(clean, /Hello/);
  assert.match(clean, /World/);
});

test("FE-012: strips event-handler attributes (XSS fixture)", async () => {
  const { sanitizeArticleHtml } = await load();
  const dirty = '<p onclick="alert(1)">Click</p><img src="x" onerror="alert(2)">';
  const clean = sanitizeArticleHtml(dirty);
  assert.equal(/on\w+\s*=/i.test(clean), false);
  assert.match(clean, /Click/);
});

test("FE-012: neutralises javascript: URLs (XSS fixture)", async () => {
  const { sanitizeArticleHtml } = await load();
  const dirty = '<a href="javascript:alert(1)">link</a>';
  const clean = sanitizeArticleHtml(dirty);
  assert.equal(/javascript\s*:/i.test(clean), false);
  assert.match(clean, /href=["']#/);
});

test("FE-012: preserves normal editorial markup (default)", async () => {
  const { sanitizeArticleHtml } = await load();
  const html =
    '<h2>Title</h2><p>Body <strong>bold</strong> and <a href="/articles">link</a>.</p>';
  assert.equal(sanitizeArticleHtml(html), html);
});

test("FE-012: empty input returns empty string", async () => {
  const { sanitizeArticleHtml } = await load();
  assert.equal(sanitizeArticleHtml(""), "");
});

test("FE-012: escapes script breakout in JSON-LD (XSS fixture)", async () => {
  const { serializeJsonLd } = await load();
  const data = {
    "@type": "Article",
    name: '</script><script>alert("xss")</script>',
  };
  const serialized = serializeJsonLd(data);
  assert.equal(serialized.includes("</script>"), false);
  assert.match(serialized, /\\u003c/);
  assert.equal(/<\/script>/i.test(serialized), false);
});

test("FE-012: serialises ordinary JSON-LD without corruption", async () => {
  const { serializeJsonLd } = await load();
  const data = {
    "@type": "WebSite",
    name: "GoalCurrent",
    url: "https://example.com",
  };
  assert.deepEqual(JSON.parse(serializeJsonLd(data)), data);
});

test("FE-012: escapes any < character in JSON-LD strings", async () => {
  const { serializeJsonLd } = await load();
  const data = { name: "a < b" };
  const serialized = serializeJsonLd(data);
  assert.equal(serialized.includes("<"), false);
  assert.equal(JSON.parse(serialized).name, "a < b");
});

test("FE-012: ArticleBodyWithAd and JsonLd sinks wire helpers", async () => {
  const article = readFileSync(
    join(root, "src/components/articles/ArticleBodyWithAd.tsx"),
    "utf8",
  );
  const jsonLd = readFileSync(join(root, "src/components/seo/JsonLd.tsx"), "utf8");
  const jsonLdScript = readFileSync(
    join(root, "src/components/seo/JsonLdScript.tsx"),
    "utf8",
  );
  assert.match(article, /sanitizeArticleHtml/);
  assert.match(jsonLd, /serializeJsonLd/);
  assert.match(jsonLdScript, /serializeJsonLd/);
  assert.equal(article.includes("__html: html"), false);
  assert.equal(jsonLd.includes("JSON.stringify(data)"), false);
  assert.equal(jsonLdScript.includes("JSON.stringify(data)"), false);
});

test("FE-012 R2: neutralises javascript HTML-entity scheme (assurance)", async () => {
  const { sanitizeArticleHtml } = await load();
  const dirty = "<a href=\"javascript&#58;alert(1)\">link</a>";
  const clean = sanitizeArticleHtml(dirty);
  assert.equal(/javascript/i.test(clean), false);
  assert.match(clean, /href=["']#/);
});

test("FE-012 R2: neutralises whitespace-obfuscated javascript scheme (assurance)", async () => {
  const { sanitizeArticleHtml } = await load();
  const dirty = "<a href=\"java\tscript:alert(1)\">link</a>";
  const clean = sanitizeArticleHtml(dirty);
  assert.equal(/javascript/i.test(clean.replace(/[\t\n\r ]+/g, "")), false);
  assert.match(clean, /href=["']#/);
});

test("FE-012 R2: strips uppercase SCRIPT elements (assurance)", async () => {
  const { sanitizeArticleHtml } = await load();
  const dirty = "<p>A</p><SCRIPT>alert(1)</SCRIPT><p>B</p>";
  const clean = sanitizeArticleHtml(dirty);
  assert.equal(/script/i.test(clean), false);
  assert.match(clean, /A/);
  assert.match(clean, /B/);
});

test("FE-012 R2: strips svg/iframe sinks (assurance)", async () => {
  const { sanitizeArticleHtml } = await load();
  const dirty =
    '<svg onload=alert(1)></svg><iframe src="javascript:alert(1)"></iframe><p>ok</p>';
  const clean = sanitizeArticleHtml(dirty);
  assert.equal(/svg|iframe|javascript|onload/i.test(clean), false);
  assert.match(clean, /ok/);
});

