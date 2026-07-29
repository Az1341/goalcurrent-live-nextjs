import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const livescoreHref = pathToFileURL(
  join(root, "src/lib/server/wc26-top-scorers-sources/livescore.ts"),
).href;
const cacheHref = pathToFileURL(join(root, "src/lib/server/cache.ts")).href;
const normalizeHref = pathToFileURL(
  join(root, "src/lib/server/wc26-top-scorers-sources/normalize.ts"),
).href;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function datePayload(events) {
  return {
    Stages: [
      {
        CompN: "FIFA World Cup",
        Cnm: "World Cup",
        Snm: "Group",
        Events: events,
      },
    ],
  };
}

async function loadLiveScoreModule() {
  const cacheMod = await import(cacheHref);
  cacheMod.apiCache.clear();
  const mod = await import(livescoreHref);
  mod.resetLiveScoreInflightForTests();
  return { ...mod, apiCache: cacheMod.apiCache };
}

test("BE-010: date keys are deterministic, capped, and do not walk past tournament end", async () => {
  const { buildLiveScoreTournamentDateKeys, LIVESCORE_MAX_DATE_REQUESTS } =
    await loadLiveScoreModule();

  const mid = buildLiveScoreTournamentDateKeys(
    new Date("2026-06-20T12:00:00.000Z"),
  );
  assert.equal(mid[0], "20260611");
  assert.equal(mid[mid.length - 1], "20260620");
  assert.ok(mid.length <= LIVESCORE_MAX_DATE_REQUESTS);

  const afterFinal = buildLiveScoreTournamentDateKeys(
    new Date("2026-07-29T12:00:00.000Z"),
  );
  assert.equal(afterFinal[afterFinal.length - 1], "20260719");
  assert.equal(afterFinal.includes("20260720"), false);
  assert.equal(afterFinal.includes("20260729"), false);
  assert.ok(afterFinal.length <= LIVESCORE_MAX_DATE_REQUESTS);

  const again = buildLiveScoreTournamentDateKeys(
    new Date("2026-07-29T12:00:00.000Z"),
  );
  assert.deepEqual(again, afterFinal);

  const truncated = buildLiveScoreTournamentDateKeys(
    new Date("2026-07-19T12:00:00.000Z"),
    { maxDateRequests: 5 },
  );
  assert.deepEqual(truncated, [
    "20260715",
    "20260716",
    "20260717",
    "20260718",
    "20260719",
  ]);
});

test("BE-010: one logical LiveScore fetch cannot exceed the upstream budget", async () => {
  const {
    fetchLiveScoreWc26ScorerGoals,
    LIVESCORE_MAX_DATE_REQUESTS,
    LIVESCORE_MAX_INCIDENT_REQUESTS,
    LIVESCORE_MAX_UPSTREAM_REQUESTS,
    getLastLiveScoreFetchStats,
  } = await loadLiveScoreModule();

  let dateHits = 0;
  let incidentHits = 0;
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("/date/")) {
      dateHits += 1;
      const day = url.match(/\/date\/(\d{8})\//)?.[1] ?? "20260611";
      // Emit one finished match per day to pressure the incident budget.
      return jsonResponse(
        datePayload([
          {
            Eid: `e-${day}`,
            Epr: 2,
            T1: [{ Nm: "Brazil" }],
            T2: [{ Nm: "France" }],
          },
        ]),
      );
    }
    if (url.includes("/incidents/")) {
      incidentHits += 1;
      return jsonResponse({
        Incs: {
          "1": [{ IT: 1, Pn: "Player A", Min: 10 }],
        },
      });
    }
    return jsonResponse({}, 404);
  };

  try {
    const result = await fetchLiveScoreWc26ScorerGoals(
      new Date("2026-07-29T00:00:00.000Z"),
    );
    assert.equal(result.source, "livescore");
    assert.equal(result.available, true);
    assert.ok(dateHits <= LIVESCORE_MAX_DATE_REQUESTS);
    assert.ok(incidentHits <= LIVESCORE_MAX_INCIDENT_REQUESTS);
    assert.ok(dateHits + incidentHits <= LIVESCORE_MAX_UPSTREAM_REQUESTS);

    const stats = getLastLiveScoreFetchStats();
    assert.ok(stats);
    assert.ok(stats.totalUpstreamRequests <= LIVESCORE_MAX_UPSTREAM_REQUESTS);
    assert.equal(stats.dateRequests, dateHits);
    assert.equal(stats.incidentRequests, incidentHits);
    assert.ok(result.goals.length > 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("BE-010: processing stops when incident budget is satisfied (no further day fan-out)", async () => {
  const {
    fetchLiveScoreWc26ScorerGoals,
    LIVESCORE_MAX_INCIDENT_REQUESTS,
    getLastLiveScoreFetchStats,
  } = await loadLiveScoreModule();

  let dateHits = 0;
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("/date/")) {
      dateHits += 1;
      // Flood many finished matches in the first day response.
      const events = Array.from({ length: LIVESCORE_MAX_INCIDENT_REQUESTS + 20 }, (_, i) => ({
        Eid: `flood-${i}`,
        Epr: 2,
        T1: [{ Nm: "Spain" }],
        T2: [{ Nm: "Germany" }],
      }));
      return jsonResponse(datePayload(events));
    }
    if (url.includes("/incidents/")) {
      return jsonResponse({
        Incs: { "1": [{ IT: 1, Pn: "Flood Scorer", Min: 1 }] },
      });
    }
    return jsonResponse({}, 404);
  };

  try {
    await fetchLiveScoreWc26ScorerGoals(new Date("2026-07-01T00:00:00.000Z"));
    const stats = getLastLiveScoreFetchStats();
    assert.ok(stats);
    assert.equal(stats.incidentRequests, LIVESCORE_MAX_INCIDENT_REQUESTS);
    assert.equal(dateHits, 1, "must stop requesting additional days once incident budget is full");
    assert.equal(stats.stoppedEarly, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("BE-010: empty and malformed provider responses remain safely handled", async () => {
  const { fetchLiveScoreWc26ScorerGoals } = await loadLiveScoreModule();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("/date/")) {
      if (url.includes("20260611")) {
        return jsonResponse({ Stages: null });
      }
      if (url.includes("20260612")) {
        return new Response("not-json", {
          status: 200,
          headers: { "content-type": "text/plain" },
        });
      }
      if (url.includes("20260613")) {
        return jsonResponse({
          Stages: [{ CompN: "Premier League", Events: [{ Eid: "x", Epr: 2 }] }],
        });
      }
      return jsonResponse({ Stages: [] });
    }
    return jsonResponse({}, 500);
  };

  try {
    const result = await fetchLiveScoreWc26ScorerGoals(
      new Date("2026-06-14T00:00:00.000Z"),
    );
    assert.equal(result.source, "livescore");
    assert.equal(result.available, true);
    assert.deepEqual(result.goals, []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("BE-010: partial provider failures remain safely handled", async () => {
  const { fetchLiveScoreWc26ScorerGoals } = await loadLiveScoreModule();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("/date/")) {
      if (url.includes("20260615")) {
        throw new Error("network down");
      }
      if (url.includes("20260616")) {
        return jsonResponse(
          datePayload([
            {
              Eid: "ok-1",
              Epr: 2,
              T1: [{ Nm: "Argentina" }],
              T2: [{ Nm: "Croatia" }],
            },
          ]),
        );
      }
      return jsonResponse(datePayload([]));
    }
    if (url.includes("ok-1")) {
      return jsonResponse({
        Incs: { "1": [{ IT: 1, Pn: "Messi", Min: 45 }] },
      });
    }
    if (url.includes("/incidents/")) {
      throw new Error("incident fail");
    }
    return jsonResponse({}, 404);
  };

  try {
    const result = await fetchLiveScoreWc26ScorerGoals(
      new Date("2026-06-16T00:00:00.000Z"),
    );
    assert.equal(result.available, true);
    assert.equal(result.goals.length, 1);
    assert.equal(result.goals[0]?.playerName, "Messi");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("BE-010: total provider failure preserves livescore response contract", async () => {
  const { fetchLiveScoreWc26ScorerGoals } = await loadLiveScoreModule();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => {
    throw new Error("total outage");
  };

  try {
    const result = await fetchLiveScoreWc26ScorerGoals(
      new Date("2026-06-20T00:00:00.000Z"),
    );
    // Per-day catch keeps available:true with empty goals when every day throws.
    assert.equal(result.source, "livescore");
    assert.equal(typeof result.available, "boolean");
    assert.ok(Array.isArray(result.goals));
    assert.deepEqual(result.goals, []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("BE-010: concurrent identical calls do not multiply identical Tier-2 work", async () => {
  const { fetchLiveScoreWc26ScorerGoals } = await loadLiveScoreModule();
  let dateHits = 0;
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("/date/")) {
      dateHits += 1;
      await new Promise((r) => setTimeout(r, 25));
      return jsonResponse(
        datePayload([
          {
            Eid: "concurrent-1",
            Epr: 2,
            T1: [{ Nm: "England" }],
            T2: [{ Nm: "USA" }],
          },
        ]),
      );
    }
    if (url.includes("/incidents/")) {
      return jsonResponse({
        Incs: { "2": [{ IT: 1, Pn: "Kane", Min: 12 }] },
      });
    }
    return jsonResponse({}, 404);
  };

  try {
    const now = new Date("2026-06-12T00:00:00.000Z");
    const [a, b] = await Promise.all([
      fetchLiveScoreWc26ScorerGoals(now),
      fetchLiveScoreWc26ScorerGoals(now),
    ]);
    assert.equal(a.goals[0]?.playerName, "Kane");
    assert.equal(b.goals[0]?.playerName, "Kane");
    // Without coalescing, two callers would each walk the same days.
    assert.equal(dateHits, 2, "expected one coalesced day walk for two concurrent callers");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("BE-010: cache keys cannot leak across competition or season scope", async () => {
  const {
    LIVESCORE_CACHE_KEY,
    fetchLiveScoreWc26ScorerGoals,
    apiCache,
  } = await loadLiveScoreModule();

  assert.match(LIVESCORE_CACHE_KEY, /wc26/);
  assert.match(LIVESCORE_CACHE_KEY, /top-scorers/);
  assert.match(LIVESCORE_CACHE_KEY, /livescore/);
  assert.equal(LIVESCORE_CACHE_KEY.includes("premier"), false);
  assert.equal(LIVESCORE_CACHE_KEY.includes("pl:"), false);

  const originalFetch = globalThis.fetch;
  let hits = 0;
  globalThis.fetch = async (input) => {
    const url = String(input);
    hits += 1;
    if (url.includes("/date/")) {
      return jsonResponse(datePayload([]));
    }
    return jsonResponse({}, 404);
  };

  try {
    await fetchLiveScoreWc26ScorerGoals(new Date("2026-06-11T00:00:00.000Z"));
    const firstHits = hits;
    await fetchLiveScoreWc26ScorerGoals(new Date("2026-06-11T00:00:00.000Z"));
    assert.equal(hits, firstHits, "second call must hit scoped cache");
    assert.ok(apiCache.has(LIVESCORE_CACHE_KEY));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("BE-010: top-scorer order and football statistics remain correct from LiveScore goals", async () => {
  const { fetchLiveScoreWc26ScorerGoals } = await loadLiveScoreModule();
  const { mergeTopScorerRowsFromSources } = await import(normalizeHref);
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("/date/")) {
      return jsonResponse(
        datePayload([
          {
            Eid: "m1",
            Epr: 2,
            T1: [{ Nm: "Portugal" }],
            T2: [{ Nm: "Morocco" }],
          },
        ]),
      );
    }
    if (url.includes("incidents/soccer/m1")) {
      return jsonResponse({
        Incs: {
          "1": [
            { IT: 1, Pn: "Ronaldo", Min: 10 },
            { IT: 1, Pn: "Ronaldo", Min: 55 },
            { IT: 2, Pn: "Own Goal Guy", Min: 70 },
          ],
          "2": [{ IT: 1, Pn: "Hakimi", Min: 80 }],
        },
      });
    }
    return jsonResponse({}, 404);
  };

  try {
    const source = await fetchLiveScoreWc26ScorerGoals(
      new Date("2026-06-11T00:00:00.000Z"),
    );
    const rows = mergeTopScorerRowsFromSources([source]);
    assert.equal(rows[0]?.playerName, "Ronaldo");
    assert.equal(rows[0]?.goals, 2);
    assert.equal(rows[0]?.rank, 1);
    const hakimi = rows.find((r) => r.playerName === "Hakimi");
    assert.ok(hakimi);
    assert.equal(hakimi.goals, 1);
    const og = rows.find((r) => r.playerName === "Own Goal Guy");
    assert.ok(og);
    assert.equal(og.ownGoals, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("BE-010: Tier-1 success path does not invoke Tier-2 LiveScore fan-out (source contract)", () => {
  const pipeline = readFileSync(
    join(root, "src/lib/server/wc26-top-scorers.ts"),
    "utf8",
  );
  const tier1Idx = pipeline.indexOf("fetchApiFootballWc26TopScorers");
  const tier2Idx = pipeline.indexOf("fetchMultiSourceWc26TopScorers");
  assert.ok(tier1Idx >= 0);
  assert.ok(tier2Idx > tier1Idx);
  assert.match(
    pipeline,
    /if \(apiFootball\.scorers\.length > 0\)[\s\S]*return response;[\s\S]*fetchMultiSourceWc26TopScorers/,
  );

  const multi = readFileSync(
    join(root, "src/lib/server/wc26-top-scorers-sources/index.ts"),
    "utf8",
  );
  assert.match(multi, /fetchLiveScoreWc26ScorerGoals/);
  assert.match(multi, /Tier 2/);
});

test("BE-010: LiveScore source remains WC26-scoped and budget constants are explicit", () => {
  const src = readFileSync(
    join(root, "src/lib/server/wc26-top-scorers-sources/livescore.ts"),
    "utf8",
  );
  assert.match(src, /LIVESCORE_MAX_DATE_REQUESTS\s*=\s*40/);
  assert.match(src, /LIVESCORE_MAX_INCIDENT_REQUESTS\s*=\s*104/);
  assert.match(src, /LIVESCORE_MAX_UPSTREAM_REQUESTS/);
  assert.match(src, /LIVESCORE_CACHE_KEY\s*=\s*"wc26:top-scorers:livescore:v1"/);
  assert.match(src, /isWorldCupStage/);
  assert.equal(src.includes("premier-league"), false);
  assert.equal(src.includes("/api/pl/"), false);
});

test("BE-009 regression: Sentry redacts cron and debug secret headers", async () => {
  const sentryHref = pathToFileURL(join(root, "src/lib/sentry-config.ts")).href;
  const { redactSentryRequestHeaders } = await import(sentryHref);
  const headers = {
    "x-cron-secret": "cron",
    "x-debug-secret": "debug",
    authorization: "Bearer x",
    cookie: "a=1",
    accept: "application/json",
  };
  redactSentryRequestHeaders(headers);
  assert.equal("x-cron-secret" in headers, false);
  assert.equal("x-debug-secret" in headers, false);
  assert.equal("authorization" in headers, false);
  assert.equal("cookie" in headers, false);
  assert.equal(headers.accept, "application/json");
});

test("BE-008 regression: ScoreBat token redaction still present", async () => {
  const requestHref = pathToFileURL(join(root, "src/lib/scorebat/request.ts")).href;
  const { redactScoreBatUrl, buildScoreBatFeedUrl } = await import(requestHref);
  const url = buildScoreBatFeedUrl("secret-token-value");
  assert.equal(redactScoreBatUrl(url).includes("secret-token-value"), false);
});

test("BE-007 regression: FCM subscribe requires verified idToken (source contract)", () => {
  const src = readFileSync(
    join(root, "src/app/api/firebase/fcm-token/route.ts"),
    "utf8",
  );
  assert.match(src, /requireFcmIdToken/);
  assert.match(src, /verifyIdToken|idToken/);
  assert.match(src, /401/);
});

test("BE-006 regression: client error sanitisation helpers remain", async () => {
  const errorsHref = pathToFileURL(
    join(root, "src/lib/api-football/errors.ts"),
  ).href;
  const errorsMod = await import(errorsHref);
  assert.equal(typeof errorsMod.apiFootballClientAuthErrorMessage, "function");
  assert.equal(
    typeof errorsMod.apiFootballClientSafeFetchFailureMessage,
    "function",
  );
  const authMsg = errorsMod.apiFootballClientAuthErrorMessage();
  assert.equal(String(authMsg).includes("API_FOOTBALL_KEY"), false);
  assert.equal(String(authMsg).includes("API key rejected"), false);
});
