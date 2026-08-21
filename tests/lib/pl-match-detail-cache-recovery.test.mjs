import assert from "node:assert/strict";
import test from "node:test";

async function clearCaches() {
  const { apiCache } = await import("@/lib/server/cache");
  apiCache.clear();
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

  assert.equal(plMatchDetailFreshTtlMs({ fixture: { status: "LIVE" } }), PL_MATCH_LIVE_TTL_MS);
  assert.equal(plMatchDetailFreshTtlMs({ fixture: { status: "UPCOMING" } }), PL_MATCH_UPCOMING_TTL_MS);
  assert.equal(plMatchDetailFreshTtlMs({ fixture: { status: "FT" } }), PL_MATCH_FINISHED_TTL_MS);
});

test("getCachedPlMatchDetail returns warm cache without upstream", async () => {
  await clearCaches();
  const { setSuccessApiCache } = await import("@/lib/api-football/cache");
  const { getCachedPlMatchDetail, plMatchDetailCacheKey } = await import("@/lib/pl/match-detail-cache");

  const payload = {
    configured: true,
    league: "Premier League",
    leagueId: 39,
    season: 2026,
    fixtureId: 1557367,
    fixture: { fixtureId: 1557367, status: "LIVE", homeTeamName: "Arsenal", awayTeamName: "Coventry" },
    apiAvailable: true,
    events: [],
    lineups: { home: null, away: null },
    statistics: [],
    h2h: [],
    standingsSnapshot: [],
    source: "api-football",
    fetchedAt: "2026-08-21T19:00:00.000Z",
  };

  setSuccessApiCache(plMatchDetailCacheKey(1557367), payload, 30_000);
  const hit = await getCachedPlMatchDetail(1557367);
  assert.equal(hit.fixtureId, 1557367);
  assert.equal(hit.fixture?.status, "LIVE");
  assert.equal(hit.stale, undefined);
});

test("getCachedPlMatchDetail serves stale valid fixture during provider outage", async () => {
  await clearCaches();
  const { setSuccessApiCache, getStaleApiCache } = await import("@/lib/api-football/cache");
  const { getCached, apiCache } = await import("@/lib/server/cache");
  const { getCachedPlMatchDetail, plMatchDetailCacheKey } = await import("@/lib/pl/match-detail-cache");

  const key = plMatchDetailCacheKey(1557367);
  const stalePayload = {
    configured: true,
    league: "Premier League",
    leagueId: 39,
    season: 2026,
    fixtureId: 1557367,
    fixture: { fixtureId: 1557367, status: "LIVE", homeTeamName: "Arsenal", awayTeamName: "Coventry" },
    apiAvailable: true,
    events: [],
    lineups: { home: null, away: null },
    statistics: [],
    h2h: [],
    standingsSnapshot: [],
    source: "api-football",
    fetchedAt: "2026-08-21T19:00:00.000Z",
  };

  setSuccessApiCache(key, stalePayload, 1);
  await new Promise((resolve) => setTimeout(resolve, 5));
  apiCache.delete(key);
  assert.equal(getCached(key), null);
  assert.ok(getStaleApiCache(key));

  const previousKey = process.env.API_FOOTBALL_KEY;
  delete process.env.API_FOOTBALL_KEY;
  try {
    const body = await getCachedPlMatchDetail(1557367);
    assert.equal(body.stale, true);
    assert.equal(body.fixture?.homeTeamName, "Arsenal");
    assert.equal(body.fixture?.awayTeamName, "Coventry");
  } finally {
    if (previousKey === undefined) delete process.env.API_FOOTBALL_KEY;
    else process.env.API_FOOTBALL_KEY = previousKey;
  }
});
