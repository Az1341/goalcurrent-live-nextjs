import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { collectSitemapPathSpecs } = await import(
  pathToFileURL(join(root, "src/lib/seo/sitemap-entries.ts")).href
);

test("static and generated football pages do not receive synthetic lastmod timestamps", () => {
  const specs = collectSitemapPathSpecs();

  for (const path of [
    "/",
    "/live",
    "/premier-league",
    "/premier-league/fixtures",
    "/worldcup2026",
  ]) {
    const spec = specs.find((item) => item.path === path);
    assert.ok(spec, `expected sitemap spec for ${path}`);
    assert.equal(spec.lastModified, undefined, `${path} must not invent lastmod`);
  }
});

test("sitemap paths remain unique at the logical-page level", () => {
  const specs = collectSitemapPathSpecs();
  const paths = specs.map((item) => item.path);
  assert.equal(new Set(paths).size, paths.length);
});

test("noindex competition hubs are excluded from the sitemap", () => {
  const paths = new Set(collectSitemapPathSpecs().map((item) => item.path));

  for (const path of ["/champions-league", "/fa-cup", "/nations-league"]) {
    assert.equal(paths.has(path), false, `${path} must stay out of sitemap while noindex`);
  }
});
