import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const matchDetailHref = pathToFileURL(join(root, "src/lib/pl/match-detail.ts")).href;
const cacheHref = pathToFileURL(join(root, "src/lib/api-football/cache.ts")).href;
const serverCacheHref = pathToFileURL(join(root, "src/lib/server/cache.ts")).href;

async function clearCaches() {
  const { apiCache } = await import(serverCacheHref);
  apiCache.clear();
}

test("plMatchDetailCacheKey is fixture-scoped", async () => {
  const { plMatchDetailCacheKey } = await import(matchDetailHref);
  assert.equal(plMatchDetailCacheKey(12345), "pl:match:12345");
});

test("plMatchDetailFreshTtlMs uses shorter TTL for LIVE", async () => {
  const {
    plMatchDetailFreshTtlMs,
    PL_MATCH_LIVE_TTL_MS,
    PL_MATCH_UPCOMING_TTL_MS,
    PL_MATCH_FINISHED_TTL_MS,
  } = await import(matchDetailHref);

  assert.equal(
    plMatchDetailFreshTtlMs({ fixture: { status: "LIVE" } }),
    PL_MATCH_LIVE_TTL_MS,
  );
  assert.equal(
    plMatchDetailFreshTtlMs({ fixture: { status: "UPCOMING" } }),
    PL_MATCH_UPCOMING_TTL_MS,
  );
  assert.equal(
    plMatchDetailFreshTtlMs({ fixture: { status: "FT" } }),
    PL_MATCH_FINISHED_TTL_MS,
  );
});

test("getCachedPlMatchDetail returns warm fresh cache without upstream", async () => {
  await clearCaches();
  const { setSuccessApiCache } = await import(cacheHref);
  const {
    getCachedPlMatchDetail,
    plMatchDetailCacheKey,
  } = await import(matchDetailHref);

  const payload = {
    configured: true,
    league: "Premier League",
    leagueId: 39,
    season: 2026,
    fixtureId: 999001,
    fixture: {
      id: 999001,
      status: "LIVE",
      homeTeamName: "A",
      awayTeamName: "B",
    },
    apiAvailable: true,
    events: [],
    lineups: { home: null, away: null },
    statistics: [],
    h2h: [],
    standingsSnapshot: [],
    source: "api-football",
    fetchedAt: "2026-08-12T12:00:00.000Z",
  };

  setSuccessApiCache(plMatchDetailCacheKey(999001), payload, 30_000);
  const hit = await getCachedPlMatchDetail(999001);
  assert.equal(hit.fixtureId, 999001);
  assert.equal(hit.fixture?.status, "LIVE");
  assert.equal(hit.stale, undefined);
});

test("getCachedPlMatchDetail serves stale success when upstream returns empty", async () => {
  await clearCaches();
  const { setSuccessApiCache, getStaleApiCache } = await import(cacheHref);
  const { getCached, apiCache } = await import(serverCacheHref);
  const {
    getCachedPlMatchDetail,
    plMatchDetailCacheKey,
  } = await import(matchDetailHref);

  const key = plMatchDetailCacheKey(999002);
  const stalePayload = {
    configured: true,
    league: "Premier League",
    leagueId: 39,
    season: 2026,
    fixtureId: 999002,
    fixture: {
      id: 999002,
      status: "LIVE",
      homeTeamName: "C",
      awayTeamName: "D",
    },
    apiAvailable: true,
    events: [{ type: "Goal" }],
    lineups: { home: null, away: null },
    statistics: [],
    h2h: [],
    standingsSnapshot: [],
    source: "api-football",
    fetchedAt: "2026-08-12T11:00:00.000Z",
  };

  // Seed only the long-lived stale key (fresh already expired / missing).
  setSuccessApiCache(key, stalePayload, 1);
  await new Promise((r) => setTimeout(r, 5));
  // Drop fresh key if still present so getCached misses; keep stale: key.
  apiCache.delete(key);
  assert.equal(getCached(key), null);
  assert.ok(getStaleApiCache(key));

  // Without API key, fetchPlMatchDetail returns empty configured:false envelope —
  // getCachedPlMatchDetail should still surface stale fixture.
  const prev = process.env.API_FOOTBALL_KEY;
  delete process.env.API_FOOTBALL_KEY;
  try {
    const body = await getCachedPlMatchDetail(999002);
    assert.equal(body.stale, true);
    assert.equal(body.fixture?.id, 999002);
    assert.equal(body.fixture?.homeTeamName, "C");
  } finally {
    if (prev === undefined) delete process.env.API_FOOTBALL_KEY;
    else process.env.API_FOOTBALL_KEY = prev;
  }
});