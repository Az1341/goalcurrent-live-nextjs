import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const libTestsDir = dirname(fileURLToPath(import.meta.url));
const root = join(libTestsDir, "..", "..");

const STATIC_NAMED_TS_IMPORT =
  /^import\s+\{[^}]+\}\s+from\s+["'][^"']+\.ts["']\s*;/m;

test("lib unit tests do not statically named-import TypeScript modules", () => {
  const files = readdirSync(libTestsDir).filter((name) => name.endsWith(".test.mjs"));
  const offenders = [];
  for (const file of files) {
    const source = readFileSync(join(libTestsDir, file), "utf8");
    if (STATIC_NAMED_TS_IMPORT.test(source)) {
      offenders.push(file);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `static named imports of .ts fail under tsx/Node ESM linking: ${offenders.join(", ")}`,
  );
});

test("tsx dynamic import exposes the four previously unlinked named exports", async () => {
  const canonical = await import(
    pathToFileURL(join(root, "src/lib/seo/canonical-host.ts")).href
  );
  const sitemap = await import(
    pathToFileURL(join(root, "src/lib/seo/sitemap-entries.ts")).href
  );
  const relevance = await import(
    pathToFileURL(join(root, "src/lib/video-relevance.ts")).href
  );
  const youtube = await import(
    pathToFileURL(join(root, "src/lib/youtube-videos.ts")).href
  );

  assert.equal(typeof canonical.canonicalHostRedirectUrl, "function");
  assert.equal(typeof canonical.removedLocaleRedirectPath, "function");
  assert.equal(typeof sitemap.collectSitemapPathSpecs, "function");
  assert.equal(typeof relevance.filterRelevantFootballVideos, "function");
  assert.equal(typeof relevance.isRelevantFootballVideo, "function");
  assert.equal(typeof youtube.isYouTubeLiveSearchEnabled, "function");
});