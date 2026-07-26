import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { buildRobotsTxt } = await import(
  pathToFileURL(join(root, "src/lib/seo/robots-txt.ts")).href
);

/** True when robots.txt has a site-wide Disallow: / (not merely Disallow: /api/). */
function hasSiteWideDisallow(body) {
  return /^Disallow:\s*\/\s*$/m.test(body);
}

test("production Vercel robots remain crawlable with sitemaps", () => {
  const body = buildRobotsTxt({
    VERCEL_ENV: "production",
    NODE_ENV: "production",
  });
  assert.match(body, /User-agent:\s*\*/);
  assert.match(body, /^Allow:\s*\/\s*$/m);
  assert.match(body, /Disallow:\s*\/api\//);
  assert.match(body, /Sitemap:\s*https:\/\/goalcurrent\.live\/sitemap\.xml/);
  assert.match(body, /Sitemap:\s*https:\/\/goalcurrent\.live\/sitemap-news\.xml/);
  assert.equal(hasSiteWideDisallow(body), false);
});

test("preview robots disallow all and omit sitemap advertisements", () => {
  const body = buildRobotsTxt({ VERCEL_ENV: "preview", NODE_ENV: "production" });
  assert.match(body, /User-agent:\s*\*/);
  assert.equal(hasSiteWideDisallow(body), true);
  assert.equal(/^Allow:\s*\/\s*$/m.test(body), false);
  assert.equal(body.includes("Sitemap:"), false);
});

test("vercel development deploy robots disallow all", () => {
  const body = buildRobotsTxt({ VERCEL_ENV: "development" });
  assert.equal(hasSiteWideDisallow(body), true);
  assert.equal(body.includes("Sitemap:"), false);
});

test("local next dev robots disallow all", () => {
  const body = buildRobotsTxt({ NODE_ENV: "development" });
  assert.equal(hasSiteWideDisallow(body), true);
  assert.equal(body.includes("Sitemap:"), false);
});

test("production-like next start without VERCEL_ENV stays crawlable", () => {
  const body = buildRobotsTxt({ NODE_ENV: "production" });
  assert.match(body, /^Allow:\s*\/\s*$/m);
  assert.match(body, /Sitemap:/);
  assert.equal(hasSiteWideDisallow(body), false);
});

test("VERCEL_ENV production wins over NODE_ENV development", () => {
  const body = buildRobotsTxt({
    VERCEL_ENV: "production",
    NODE_ENV: "development",
  });
  assert.match(body, /^Allow:\s*\/\s*$/m);
  assert.equal(hasSiteWideDisallow(body), false);
  assert.match(body, /Sitemap:/);
});