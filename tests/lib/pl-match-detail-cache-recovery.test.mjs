import assert from "node:assert/strict";
import test from "node:test";

function matchPayload(overrides = {}) {
  return {
    configured: true,
    league: "Premier League",
    leagueId: 39,
    season: 2026,
    fixtureId: 1557367,
    fixture: {
      fixtureId: 1557367,
      kickoffUtc: "2026-08-21T19:00:00.000Z",
      matchweek: 1,
      round: "Regular Season - 1",
      venue: "Emirates Stadium, London",
      referee: null,
      homeTeamId: 42,
      homeTeamName: "Arsenal",
      homeTeamLogo: null,
      awayTeamId: 200,
      awayTeamName: "Coventry",
      awayTeamLogo: null,
      status: "LIVE",
      statusShort: "1H",
      elapsed: 15,
      homeScore: 0,
      awayScore: 0,
      broadcaster: null,
    },
    apiAvailable: true,
    events: [],
    lineups: { home: null, away: null },
    statistics: [],
    h2h: [],
    standingsSnapshot: [],
    source: "api-football",
    fetchedAt: "2026-08-21T19:15:00.000Z",
    ...overrides,
  };
}

test("plMatchDetailCacheKey is fixture-scoped", async () => {
  const { plMatchDetailCacheKey } = await import("@/lib/pl/match-detail-cache");
  assert.equal(plMatchDetailCacheKey(1557367), "pl:match:1557367");
});

test("plMatchDetailFreshTtlMs uses status-aware TTLs", async () => {
  const {
    plMatchDetailFreshTtlMs,
    PL_MATCH_LIVE_TTL_MS,
    PL_MATCH_UPCOMING_TTL_MS,
    PL_MATCH_FINISHED_TTL_MS,
  } = await import("@/lib/pl/match-detail-cache");

  assert.equal(plMatchDetailFreshTtlMs(matchPayload()), PL_MATCH_LIVE_TTL_MS);
  assert.equal(
    plMatchDetailFreshTtlMs(
      matchPayload({ fixture: { ...matchPayload().fixture, status: "UPCOMING" } }),
    ),
    PL_MATCH_UPCOMING_TTL_MS,
  );
  assert.equal(
    plMatchDetailFreshTtlMs(
      matchPayload({ fixture: { ...matchPayload().fixture, status: "FT" } }),
    ),
    PL_MATCH_FINISHED_TTL_MS,
  );
});

test("stale retained match detail is never CDN cached", async () => {
  const { plMatchDetailResponseCacheControl } = await import("@/lib/pl/match-detail-cache");
  assert.equal(
    plMatchDetailResponseCacheControl(matchPayload({ stale: true })),
    "no-store",
  );
});

test("fresh live match detail keeps the normal short CDN policy", async () => {
  const { plMatchDetailResponseCacheControl } = await import("@/lib/pl/match-detail-cache");
  assert.equal(
    plMatchDetailResponseCacheControl(matchPayload()),
    "s-maxage=30, stale-while-revalidate=15",
  );
});

test("primePlMatchDetailCache makes a verified fixture available as a fresh hit", async () => {
  const { apiCache } = await import("@/lib/server/cache");
  const {
    getCachedPlMatchDetail,
    primePlMatchDetailCache,
  } = await import("@/lib/pl/match-detail-cache");
  apiCache.clear();

  primePlMatchDetailCache(matchPayload());
  const hit = await getCachedPlMatchDetail(1557367);

  assert.equal(hit.fixtureId, 1557367);
  assert.equal(hit.fixture?.status, "LIVE");
  assert.equal(hit.fixture?.homeTeamName, "Arsenal");
  assert.equal(hit.fixture?.awayTeamName, "Coventry");
  assert.equal(hit.stale, undefined);
});

test("resolvePlMatchDetailFallback serves retained fixture for provider outage", async () => {
  const { resolvePlMatchDetailFallback } = await import("@/lib/pl/match-detail-cache");
  const stale = matchPayload();
  const failure = matchPayload({
    fixture: null,
    apiAvailable: false,
    source: "fallback",
    error: "Live data is temporarily unavailable due to provider rate limits.",
  });

  const body = resolvePlMatchDetailFallback(failure, stale);
  assert.equal(body.stale, true);
  assert.equal(body.apiAvailable, false);
  assert.equal(body.fixture?.homeTeamName, "Arsenal");
  assert.equal(body.fixture?.awayTeamName, "Coventry");
  assert.match(body.error ?? "", /provider rate limits/i);
});

test("resolvePlMatchDetailFallback preserves definitive fixture not-found", async () => {
  const { resolvePlMatchDetailFallback } = await import("@/lib/pl/match-detail-cache");
  const failure = matchPayload({
    fixture: null,
    apiAvailable: true,
    source: "api-football",
    error: "Fixture not found for Premier League 2026/27.",
  });

  const body = resolvePlMatchDetailFallback(failure, matchPayload());
  assert.equal(body.fixture, null);
  assert.equal(body.stale, undefined);
  assert.match(body.error ?? "", /Fixture not found/);
});
