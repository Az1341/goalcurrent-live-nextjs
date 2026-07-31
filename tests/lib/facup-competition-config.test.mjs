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
    pathToFileURL(join(root, "src/lib/facup/constants.ts")).href
  );
  const cache = await import(
    pathToFileURL(join(root, "src/lib/facup/cache-keys.ts")).href
  );
  const sharedCache = await import(
    pathToFileURL(join(root, "src/lib/competitions/cache-keys.ts")).href
  );
  const uclCache = await import(
    pathToFileURL(join(root, "src/lib/ucl/cache-keys.ts")).href
  );
  const contract = await import(
    pathToFileURL(join(root, "src/lib/facup/contract.ts")).href
  );
  const canonical = await import(
    pathToFileURL(join(root, "src/lib/facup/canonical.ts")).href
  );
  return {
    ...registry,
    ...constants,
    ...cache,
    ...sharedCache,
    ...uclCache,
    ...contract,
    ...canonical,
  };
}

test("FA Cup: registry identity and knockout_cup type", async () => {
  const {
    getCompetition,
    competitionSupportsStandings,
    FACUP_LEAGUE_ID,
    FACUP_SEASON,
    FACUP_DATASETS,
  } = await load();
  const facup = getCompetition("facup");
  assert.equal(facup.key, "facup");
  assert.equal(facup.displayName, "FA Cup");
  assert.equal(facup.shortName, "FA Cup");
  assert.equal(facup.slug, "fa-cup");
  assert.equal(facup.providerLeagueId, 45);
  assert.equal(facup.providerLeagueId, FACUP_LEAGUE_ID);
  assert.equal(facup.activeSeason, 2026);
  assert.equal(facup.activeSeason, FACUP_SEASON);
  assert.equal(facup.competitionType, "knockout_cup");
  assert.equal(facup.standingsSupported, false);
  assert.equal(competitionSupportsStandings("facup"), false);
  assert.equal(FACUP_DATASETS.standings, false);
  assert.equal(FACUP_DATASETS.fixtures, true);
  assert.equal(FACUP_DATASETS.results, true);
  assert.equal(FACUP_DATASETS.events, false);
  assert.equal(FACUP_DATASETS.lineups, false);
  assert.equal(FACUP_DATASETS.statistics, false);
  assert.ok(facup.supportedSections.includes("fixtures"));
  assert.ok(facup.supportedSections.includes("results"));
  assert.equal(facup.supportedSections.includes("standings"), false);
  assert.equal(facup.matchPathPrefix, null);
});

test("FA Cup: route resolution and ownership isolation", async () => {
  const {
    getCompetition,
    getCompetitionBySlug,
    resolveCompetitionHubPath,
    competitionsShareProviderIdentity,
  } = await load();
  assert.equal(resolveCompetitionHubPath("facup"), "/fa-cup");
  assert.equal(getCompetitionBySlug("fa-cup")?.key, "facup");
  assert.equal(getCompetitionBySlug("champions-league")?.key, "ucl");
  assert.equal(competitionsShareProviderIdentity("facup", "pl"), false);
  assert.equal(competitionsShareProviderIdentity("facup", "wc26"), false);
  assert.equal(competitionsShareProviderIdentity("facup", "ucl"), false);
  assert.notEqual(getCompetition("facup").providerLeagueId, getCompetition("pl").providerLeagueId);
  assert.notEqual(getCompetition("facup").providerLeagueId, getCompetition("ucl").providerLeagueId);
});

test("FA Cup: cache-key isolation from PL, WC26 and UCL", async () => {
  const {
    facupFixturesCacheKey,
    uclFixturesCacheKey,
    competitionResourceCacheKey,
    cacheKeyCompetitionPrefix,
  } = await load();
  const key = facupFixturesCacheKey();
  assert.equal(key, "facup:fixtures:45:2026");
  assert.equal(cacheKeyCompetitionPrefix(key), "facup");
  assert.equal(uclFixturesCacheKey(), "ucl:fixtures:2:2026");
  assert.notEqual(key, uclFixturesCacheKey());
  assert.notEqual(key, competitionResourceCacheKey("pl", "fixtures", 39, 2026));
  assert.notEqual(key, competitionResourceCacheKey("wc26", "fixtures", 1, 2026));
  assert.equal(key.startsWith("ucl:"), false);
  assert.equal(key.includes("pl:"), false);
});

test("FA Cup: round normalisation and unknown fallback", async () => {
  const { mapFacupRound, groupFacupFixturesByRound } = await load();
  assert.equal(mapFacupRound("Extra Preliminary Round").kind, "qualifying");
  assert.equal(mapFacupRound("1st Round").kind, "first_round");
  assert.equal(mapFacupRound("2nd Round").kind, "second_round");
  assert.equal(mapFacupRound("3rd Round").kind, "third_round");
  assert.equal(mapFacupRound("4th Round").kind, "fourth_round");
  assert.equal(mapFacupRound("5th Round").kind, "fifth_round");
  assert.equal(mapFacupRound("Quarter-finals").kind, "quarter_final");
  assert.equal(mapFacupRound("Semi-finals").kind, "semi_final");
  assert.equal(mapFacupRound("Final").kind, "final");
  assert.equal(mapFacupRound("3rd Round - Replay").isReplay, true);
  assert.equal(mapFacupRound("Mystery Phase").kind, "other");
  assert.equal(mapFacupRound(null).kind, "other");
  const groups = groupFacupFixturesByRound([
    {
      fixtureId: 1,
      kickoffUtc: null,
      round: "Final",
      roundKind: "final",
      roundLabel: "Final",
      venue: null,
      homeTeamId: 1,
      homeTeamName: "A",
      homeTeamLogo: null,
      awayTeamId: 2,
      awayTeamName: "B",
      awayTeamLogo: null,
      status: "FT",
      statusShort: "FT",
      elapsed: null,
      homeScore: 1,
      awayScore: 0,
      penaltyHome: null,
      penaltyAway: null,
      isReplay: false,
    },
  ]);
  assert.equal(groups[0].roundKind, "final");
});

test("FA Cup: fixture status mapping including ET/PEN/PST/CANC/ABD", async () => {
  const {
    mapFacupFixtureStatus,
    isFinishedFacupStatus,
    facupStandingsSupported,
    sanitiseFacupProviderError,
  } = await load();
  assert.equal(mapFacupFixtureStatus("ET"), "LIVE");
  assert.equal(mapFacupFixtureStatus("AET"), "AET");
  assert.equal(mapFacupFixtureStatus("PEN"), "PEN");
  assert.equal(mapFacupFixtureStatus("PST"), "POSTPONED");
  assert.equal(mapFacupFixtureStatus("CANC"), "CANCELLED");
  assert.equal(mapFacupFixtureStatus("ABD"), "ABANDONED");
  assert.equal(isFinishedFacupStatus("AET"), true);
  assert.equal(isFinishedFacupStatus("PEN"), true);
  assert.equal(isFinishedFacupStatus("ABANDONED"), false);
  assert.equal(facupStandingsSupported(), false);
  assert.match(sanitiseFacupProviderError("429 rate limit"), /rate-limited/i);
  assert.match(sanitiseFacupProviderError("missing key"), /not configured/i);
  assert.equal(
    sanitiseFacupProviderError("secret upstream stack").includes("secret"),
    false,
  );
});

test("FA Cup: stale/failure sanitisation and provider response ownership", async () => {
  const { getCompetition, sanitiseFacupProviderError } = await load();
  const facup = getCompetition("facup");
  const owned = {
    competitionKey: "facup",
    leagueId: facup.providerLeagueId,
    season: facup.activeSeason,
    standingsSupported: false,
    stale: true,
    error: "provider down",
  };
  assert.equal(owned.competitionKey, "facup");
  assert.equal(owned.leagueId, 45);
  assert.equal(owned.season, 2026);
  assert.equal(owned.standingsSupported, false);
  assert.equal(owned.stale, true);
  assert.match(sanitiseFacupProviderError(owned.error), /temporarily unavailable/i);
  assert.notEqual(owned.competitionKey, "ucl");
  assert.notEqual(owned.leagueId, 2);
  assert.notEqual(owned.leagueId, 39);
});

test("FA Cup: canonical generation without slug variants", async () => {
  const { facupCanonicalPath, isFacupHubPath, resolveFacupCanonicalFromSlug } =
    await load();
  assert.equal(facupCanonicalPath(), "/fa-cup");
  assert.equal(isFacupHubPath("/fa-cup"), true);
  assert.equal(isFacupHubPath("/en/fa-cup"), true);
  assert.equal(isFacupHubPath("/champions-league"), false);
  assert.equal(resolveFacupCanonicalFromSlug("fa-cup"), "/fa-cup");
  assert.equal(resolveFacupCanonicalFromSlug("champions-league"), null);
});

test("FA Cup: prevents cross-competition leakage via registry identity", async () => {
  const { COMPETITIONS } = await load();
  const ids = Object.values(COMPETITIONS).map((c) => c.providerLeagueId);
  assert.deepEqual(new Set(ids).size, ids.length);
  assert.notEqual(COMPETITIONS.facup.hubPath, COMPETITIONS.ucl.hubPath);
  assert.notEqual(COMPETITIONS.facup.hubPath, COMPETITIONS.pl.hubPath);
  assert.notEqual(COMPETITIONS.facup.hubPath, COMPETITIONS.wc26.hubPath);
  assert.equal(COMPETITIONS.facup.standingsSupported, false);
  assert.equal(COMPETITIONS.ucl.standingsSupported, true);
});