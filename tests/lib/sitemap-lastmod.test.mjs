import test from "node:test";
import assert from "node:assert/strict";

import { collectSitemapPathSpecs } from "../../src/lib/seo/sitemap-entries.ts";

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
