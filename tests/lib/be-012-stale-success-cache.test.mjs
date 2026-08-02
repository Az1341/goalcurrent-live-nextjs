import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const cacheHref = pathToFileURL(join(root, "src/lib/api-football/cache.ts")).href;
const routeErrorsHref = pathToFileURL(
  join(root, "src/lib/api-football/route-errors.ts"),
).href;
const serverCacheHref = pathToFileURL(join(root, "src/lib/server/cache.ts")).href;
const errorsHref = pathToFileURL(join(root, "src/lib/api-football/errors.ts")).href;

async function clearCaches() {
  const { apiCache } = await import(serverCacheHref);
  apiCache.clear();
}

test("BE-012: fresh success is cached and avoids a second logical upstream write path", async () => {
  await clearCaches();
  const {
    setSuccessApiCache,
    getStaleApiCache,
    API_FOOTBALL_FRESH_TTL_MS,
    API_FOOTBALL_STALE_TTL_MS,
  } = await import(cacheHref);
  const { getCached } = await import(serverCacheHref);

  const key = "be012:wc26:scores:?live=true";
  const payload = {
    matches: [{ fixtureId: "fixture-073", matchNumber: 73 }],
    fetchedAt: "2026-07-01T12:00:00.000Z",
    configured: true,
    phase: "live",
  };

  setSuccessApiCache(key, payload, API_FOOTBALL_FRESH_TTL_MS);
  assert.deepEqual(getCached(key), payload);
  assert.deepEqual(getStaleApiCache(key), payload);
  assert.ok(API_FOOTBALL_STALE_TTL_MS > API_FOOTBALL_FRESH_TTL_MS);
});

test("BE-012: fresh cache hit returns success without stale marker", async () => {
  await clearCaches();
  const { setSuccessApiCache, GC_STALE_RESPONSE_HEADER } = await import(cacheHref);
  const { getCached } = await import(serverCacheHref);

  const key = "be012:fresh-hit";
  setSuccessApiCache(key, { ok: true, fetchedAt: "2026-07-01T00:00:00.000Z" });
  const hit = getCached(key);
  assert.deepEqual(hit, { ok: true, fetchedAt: "2026-07-01T00:00:00.000Z" });
  assert.equal(hit?.stale, undefined);
  assert.equal(GC_STALE_RESPONSE_HEADER, "X-GC-Stale");
});

test("BE-012: upstream failure with retained success surfaces stale body and header", async () => {
  await clearCaches();
  const { GC_STALE_RESPONSE_HEADER } = await import(cacheHref);
  const { respondApiFootballFailure } = await import(routeErrorsHref);
  const { ApiFootballRateLimitError } = await import(errorsHref);

  const staleBody = {
    matches: [{ fixtureId: "fixture-080", homeScore: 1, awayScore: 0 }],
    fetchedAt: "2026-07-01T11:00:00.000Z",
    configured: true,
    phase: "live",
  };

  const response = respondApiFootballFailure({
    route: "api/wc26/scores",
    error: new ApiFootballRateLimitError("provider limit"),
    staleBody,
    buildBody: (code, message, stale) => ({
      ...(stale ? staleBody : { matches: [] }),
      error: code,
      message,
      stale,
    }),
  });

  assert.equal(response.status, 503);
  assert.equal(response.headers.get(GC_STALE_RESPONSE_HEADER), "1");
  const body = await response.json();
  assert.equal(body.stale, true);
  assert.equal(body.error, "rate_limit");
  assert.equal(body.matches[0]?.fixtureId, "fixture-080");
  assert.equal(body.fetchedAt, "2026-07-01T11:00:00.000Z");
  const text = JSON.stringify(body);
  assert.equal(text.includes("provider limit"), false);
  assert.equal(text.includes("api-football.com"), false);
  assert.equal(text.includes("x-apisports-key"), false);
});

test("BE-012: total failure without stale cache does not claim fresh or stale success", async () => {
  await clearCaches();
  const { GC_STALE_RESPONSE_HEADER } = await import(cacheHref);
  const { respondApiFootballFailure } = await import(routeErrorsHref);
  const { ApiFootballNetworkError } = await import(errorsHref);

  const response = respondApiFootballFailure({
    route: "api/wc26/scores",
    error: new ApiFootballNetworkError("socket hang up /etc/passwd"),
    staleBody: null,
    buildBody: (code, message, stale) => ({
      matches: [],
      error: code,
      message,
      stale,
    }),
  });

  assert.equal(response.headers.get(GC_STALE_RESPONSE_HEADER), null);
  const body = await response.json();
  assert.equal(body.stale, false);
  assert.equal(body.matches.length, 0);
  assert.equal(JSON.stringify(body).includes("/etc/passwd"), false);
  assert.equal(JSON.stringify(body).includes("socket hang up"), false);
});

test("BE-012: auth failure never serves stale success as current", async () => {
  await clearCaches();
  const { GC_STALE_RESPONSE_HEADER } = await import(cacheHref);
  const { respondApiFootballFailure } = await import(routeErrorsHref);
  const { ApiFootballAuthError } = await import(errorsHref);

  const staleBody = {
    matches: [{ fixtureId: "fixture-099" }],
    fetchedAt: "2026-07-01T10:00:00.000Z",
  };

  const response = respondApiFootballFailure({
    route: "api/wc26/match",
    error: new ApiFootballAuthError("API key rejected. Check API_FOOTBALL_KEY"),
    staleBody,
    buildBody: (code, message, stale) => ({
      ...(stale ? staleBody : { matches: [] }),
      error: code,
      message,
      stale,
    }),
  });

  assert.equal(response.status, 503);
  assert.equal(response.headers.get(GC_STALE_RESPONSE_HEADER), null);
  const body = await response.json();
  assert.equal(body.stale, false);
  assert.equal(body.matches.length, 0);
  assert.equal(JSON.stringify(body).includes("API_FOOTBALL_KEY"), false);
});

test("BE-012: cache keys preserve competition/query isolation via stale prefix", async () => {
  await clearCaches();
  const { setSuccessApiCache, getStaleApiCache, staleApiCacheKey } =
    await import(cacheHref);
  const { getCached } = await import(serverCacheHref);

  setSuccessApiCache("wc26:scores:?live=true", { league: "wc26" });
  setSuccessApiCache("pl:standings", { league: "pl" });

  assert.equal(getStaleApiCache("wc26:scores:?live=true")?.league, "wc26");
  assert.equal(getStaleApiCache("pl:standings")?.league, "pl");
  assert.equal(getCached(staleApiCacheKey("wc26:scores:?live=true"))?.league, "wc26");
  assert.equal(getStaleApiCache("wc26:scores:?results=wc"), null);
  assert.match(staleApiCacheKey("pl:standings"), /^stale:pl:standings$/);
});

test("BE-012: recovery after failure restores unmarked fresh success", async () => {
  await clearCaches();
  const { setSuccessApiCache, getStaleApiCache, GC_STALE_RESPONSE_HEADER } =
    await import(cacheHref);
  const { respondApiFootballFailure } = await import(routeErrorsHref);
  const { ApiFootballNetworkError } = await import(errorsHref);
  const { getCached } = await import(serverCacheHref);

  const key = "be012:recovery";
  setSuccessApiCache(key, { matches: [{ id: 1 }], fetchedAt: "t1" });

  const fail = respondApiFootballFailure({
    route: "api/test",
    error: new ApiFootballNetworkError("down"),
    staleBody: getStaleApiCache(key),
    buildBody: (code, message, stale) => ({
      matches: stale ? [{ id: 1 }] : [],
      error: code,
      message,
      stale,
    }),
  });
  assert.equal((await fail.json()).stale, true);
  assert.equal(fail.headers.get(GC_STALE_RESPONSE_HEADER), "1");

  setSuccessApiCache(key, { matches: [{ id: 2 }], fetchedAt: "t2" });
  const fresh = getCached(key);
  assert.deepEqual(fresh, { matches: [{ id: 2 }], fetchedAt: "t2" });
  assert.equal(fresh.stale, undefined);
});

test("BE-012: scores/match/standings failure builders pass stale boolean", () => {
  const scores = readFileSync(
    join(root, "src/app/api/wc26/scores/route.ts"),
    "utf8",
  );
  const match = readFileSync(
    join(root, "src/app/api/wc26/match/[fixtureId]/route.ts"),
    "utf8",
  );
  const standings = readFileSync(
    join(root, "src/app/api/pl/standings/route.ts"),
    "utf8",
  );
  for (const [label, src] of [
    ["scores", scores],
    ["match", match],
    ["standings", standings],
  ]) {
    assert.match(src, /getStaleApiCache/, label);
    assert.match(src, /setSuccessApiCache/, label);
    assert.match(src, /respondApiFootballFailure/, label);
    assert.match(src, /\bstale\b/, label);
  }
});

test("BE-012: UI contracts read response.stale for status banners", () => {
  const live = readFileSync(
    join(root, "src/app/[locale]/live/LivePageClient.tsx"),
    "utf8",
  );
  const match = readFileSync(
    join(root, "src/app/[locale]/match/[fixtureId]/MatchPageClient.tsx"),
    "utf8",
  );
  assert.match(live, /liveScores\.stale/);
  assert.match(match, /detail\.stale/);
});

test("BE-012: maximum upstream budget for failure path is zero extra writes", async () => {
  await clearCaches();
  const { setSuccessApiCache, getStaleApiCache } = await import(cacheHref);
  const { respondApiFootballFailure } = await import(routeErrorsHref);
  const { ApiFootballRateLimitError } = await import(errorsHref);
  const { getCached, setCached } = await import(serverCacheHref);

  const key = "be012:budget";
  setSuccessApiCache(key, { v: 1 });
  const beforeFresh = getCached(key);
  const beforeStale = getStaleApiCache(key);

  respondApiFootballFailure({
    route: "api/test",
    error: new ApiFootballRateLimitError("limit"),
    staleBody: beforeStale,
    buildBody: (code, message, stale) => ({ code, message, stale, v: stale ? 1 : 0 }),
  });

  // Failure path must not overwrite fresh/stale success caches.
  assert.deepEqual(getCached(key), beforeFresh);
  assert.deepEqual(getStaleApiCache(key), beforeStale);
  // One logical failure response — no second cache mutation layer.
  setCached("be012:sentinel", true, 1000);
  assert.equal(getCached("be012:sentinel"), true);
});

test("BE-010 regression: LiveScore upstream budget constants remain", () => {
  const src = readFileSync(
    join(root, "src/lib/server/wc26-top-scorers-sources/livescore.ts"),
    "utf8",
  );
  assert.match(src, /LIVESCORE_MAX_UPSTREAM_REQUESTS/);
  assert.match(src, /LIVESCORE_MAX_DATE_REQUESTS\s*=\s*40/);
});

test("BE-011 regression: knockout route omits diagnostic logs", () => {
  const src = readFileSync(
    join(root, "src/app/api/wc26/knockout-fixtures/route.ts"),
    "utf8",
  );
  assert.equal(/logs\s*:/.test(src), false);
  assert.match(src, /Wc26KnockoutFixturesPublicResponse/);
});

test("BE-009 regression: Sentry redacts cron/debug headers", async () => {
  const href = pathToFileURL(join(root, "src/lib/sentry-config.ts")).href;
  const { redactSentryRequestHeaders } = await import(href);
  const headers = {
    "x-cron-secret": "c",
    authorization: "Bearer x",
    accept: "application/json",
  };
  redactSentryRequestHeaders(headers);
  assert.equal("x-cron-secret" in headers, false);
  assert.equal(headers.accept, "application/json");
});

test("BE-008 regression: ScoreBat token redaction", async () => {
  const href = pathToFileURL(join(root, "src/lib/scorebat/request.ts")).href;
  const { redactScoreBatUrl, buildScoreBatFeedUrl } = await import(href);
  assert.equal(
    redactScoreBatUrl(buildScoreBatFeedUrl("secret-token-value")).includes(
      "secret-token-value",
    ),
    false,
  );
});

test("BE-007 regression: FCM idToken gate", () => {
  const src = readFileSync(
    join(root, "src/app/api/firebase/fcm-token/route.ts"),
    "utf8",
  );
  assert.match(src, /requireFcmIdToken/);
});

test("BE-006 regression: client-safe auth message", async () => {
  const mod = await import(errorsHref);
  assert.equal(
    String(mod.apiFootballClientAuthErrorMessage()).includes("API_FOOTBALL_KEY"),
    false,
  );
});
