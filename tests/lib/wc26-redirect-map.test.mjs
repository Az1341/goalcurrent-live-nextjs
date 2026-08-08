import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const config = readFileSync(join(root, "next.config.ts"), "utf8");

function assertRedirect(source, destination) {
  assert.match(
    config,
    new RegExp(
      `source:\\s*"${source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?destination:\\s*"${destination.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`,
    ),
    `missing redirect ${source} → ${destination}`,
  );
}

test("evidence-backed WC26 / video redirects remain permanent singles", () => {
  assertRedirect("/video/:path*", "/videos/:path*");
  assertRedirect("/worldcup2026/favourites", "/favourites");
  assertRedirect("/worldcup2026/match/:fixtureId", "/match/:fixtureId");
  assertRedirect(
    "/news/alireza-beiranvand-iran-world-cup-hero",
    "/articles/alireza-beiranvand-iran-world-cup-hero",
  );
});

test("statistics stub hubs redirect to premier-league statistics", () => {
  assertRedirect("/statistics/top-scorers", "/premier-league/statistics");
  assertRedirect("/statistics/assists", "/premier-league/statistics");
  assertRedirect("/statistics/disciplinary", "/premier-league/statistics");
});

test("redirect map does not dump World Cup URLs to homepage", () => {
  assert.doesNotMatch(
    config,
    /source:\s*"\/worldcup2026"[^\n]*\n[^\n]*destination:\s*"\/"/,
  );
});

test("archive hub internal article links use retained destinations", () => {
  const archive = readFileSync(
    join(root, "src/lib/wc26/archive.ts"),
    "utf8",
  );
  assert.match(archive, /\/articles\/spain-world-cup-2026-champion-masterclass/);
  assert.match(archive, /\/worldcup2026\/match\/fixture-104/);
});