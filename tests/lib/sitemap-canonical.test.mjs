import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { collectSitemapPathSpecs } = await import(
  pathToFileURL(join(root, "src/lib/seo/sitemap-entries.ts")).href
);

test("sitemap includes canonical /match paths and excludes redirect hub match paths", () => {
  const specs = collectSitemapPathSpecs(new Date("2026-07-26T00:00:00.000Z"));
  const paths = specs.map((s) => s.path);
  assert.ok(paths.some((p) => p.startsWith("/match/")));
  assert.equal(
    paths.some((p) => p.startsWith("/worldcup2026/match/")),
    false,
  );
});