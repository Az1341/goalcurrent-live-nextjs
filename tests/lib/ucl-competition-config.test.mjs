import assert from "node:assert/strict";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

async function load() {
  const registry = await import(
    pathToFileURL(join(root, "src/lib/competitions/registry.ts")).href
  );
  const constants = await import(
    pathToFileURL(join(root, "src/lib/ucl/constants.ts")).href
  );
  const cache = await import(
    pathToFileURL(join(root, "src/lib/ucl/cache-keys.ts")).href
  );
  const contract = await import(
    pathToFileURL(join(root, "src/lib/ucl/contract.ts")).href
  );
  const canonical = await import(
    pathToFileURL(join(root, "src/lib/ucl/canonical.ts")).href
  );
  return { ...registry, ...constants, ...cache, ...contract, ...canonical };
}

test("UCL: league and season mapping", async () => {
  const { getCompetition, UCL_LEAGUE_ID, UCL_SEASON } = await load();
  const ucl = getCompetition("ucl");
  assert.equal(ucl.providerLeagueId, 2);
  assert.equal(ucl.providerLeagueId, UCL_LEAGUE_ID);
  assert.equal(ucl.activeSeason, 2026);
  assert.equal(ucl.activeSeason, UCL_SEASON);
  assert.equal(ucl.slug, "champions-league");
  assert.equal(ucl.competitionType, "cup");
});

test("UCL: route resolution separated from PL and WC26", async () => {
  const {
    getCompetition,
    getCompetitionBySlug,
    resolveCompetitionHubPath,
    competitionsShareProviderIdentity,
  } = await load();
  assert.equal(resolveCompetitionHubPath("ucl"), "/champions-league");
  assert.equal(resolveCompetitionHubPath("pl"), "/premier-league");
  assert.equal(resolveCompetitionHubPath("wc26"), "/worldcup2026");
  assert.equal(getCompetitionBySlug("champions-league")?.key, "ucl");
  assert.equal(getCompetitionBySlug("premier-league")?.key, "pl");
  assert.equal(getCompetition("pl").providerLeagueId, 39);
  assert.equal(getCompetition("wc26").providerLeagueId, 1);
  assert.equal(competitionsShareProviderIdentity("ucl", "pl"), false);
  assert.equal(competitionsShareProviderIdentity("ucl", "wc26"), false);
});

test("UCL: cache-key isolation from PL/WC26 prefixes", async () => {
  const { uclFixturesCacheKey, uclStandingsCacheKey, cacheKeyCompetitionPrefix } =
    await load();
  const fixturesKey = uclFixturesCacheKey();
  const standingsKey = uclStandingsCacheKey();
  assert.equal(fixturesKey, "ucl:fixtures:2:2026");
  assert.equal(standingsKey, "ucl:standings:2:2026");
  assert.equal(cacheKeyCompetitionPrefix(fixturesKey), "ucl");
  assert.notEqual(fixturesKey.includes("pl:"), true);
  assert.notEqual(fixturesKey.includes("wc26"), true);
  assert.notEqual(uclFixturesCacheKey(39, 2026), fixturesKey);
});

test("UCL: response ownership fields are competition-specific", async () => {
  const { getCompetition } = await load();
  const ucl = getCompetition("ucl");
  assert.equal(ucl.key, "ucl");
  assert.equal(ucl.matchPathPrefix, null);
  assert.ok(ucl.supportedSections.includes("fixtures"));
  assert.ok(ucl.supportedSections.includes("standings"));
  assert.equal(ucl.supportedSections.includes("match"), false);
});

test("UCL: stage and status mapping", async () => {
  const { mapUclFixtureStatus, mapUclStage, isFinishedUclStatus } = await load();
  assert.equal(mapUclFixtureStatus("ET"), "LIVE");
  assert.equal(mapUclFixtureStatus("AET"), "AET");
  assert.equal(mapUclFixtureStatus("PEN"), "PEN");
  assert.equal(mapUclFixtureStatus("PST"), "POSTPONED");
  assert.equal(mapUclFixtureStatus("CANC"), "CANCELLED");
  assert.equal(mapUclStage("League Stage - 1"), "league_phase");
  assert.equal(mapUclStage("Round of 16"), "round_of_16");
  assert.equal(mapUclStage("Quarter-finals"), "quarter_final");
  assert.equal(mapUclStage("Final"), "final");
  assert.equal(isFinishedUclStatus("AET"), true);
  assert.equal(isFinishedUclStatus("UPCOMING"), false);
});

test("UCL: standings availability and sanitised errors", async () => {
  const { uclStandingsSupported, sanitiseUclProviderError } = await load();
  assert.equal(uclStandingsSupported(10, "api-football"), true);
  assert.equal(uclStandingsSupported(0, "api-football"), false);
  assert.equal(uclStandingsSupported(10, "fallback"), false);
  assert.match(sanitiseUclProviderError("429 rate limit"), /rate-limited/i);
  assert.match(sanitiseUclProviderError("missing key"), /not configured/i);
  assert.equal(
    sanitiseUclProviderError("secret upstream stack").includes("secret"),
    false,
  );
});

test("UCL: canonical generation and no duplicate slug variants", async () => {
  const { uclCanonicalPath, isUclHubPath, resolveUclCanonicalFromSlug } =
    await load();
  assert.equal(uclCanonicalPath(), "/champions-league");
  assert.equal(isUclHubPath("/champions-league"), true);
  assert.equal(isUclHubPath("/es/champions-league"), true);
  assert.equal(isUclHubPath("/premier-league"), false);
  assert.equal(resolveUclCanonicalFromSlug("champions-league"), "/champions-league");
  assert.equal(resolveUclCanonicalFromSlug("premier-league"), null);
});

test("UCL: prevents PL/WC26 data leakage via registry identity", async () => {
  const { COMPETITIONS } = await load();
  const ids = Object.values(COMPETITIONS).map((c) => c.providerLeagueId);
  assert.deepEqual(new Set(ids).size, ids.length);
  assert.notEqual(COMPETITIONS.ucl.hubPath, COMPETITIONS.pl.hubPath);
  assert.notEqual(COMPETITIONS.ucl.hubPath, COMPETITIONS.wc26.hubPath);
});