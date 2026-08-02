import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const routeHref = pathToFileURL(
  join(root, "src/app/api/wc26/knockout-fixtures/route.ts"),
).href;
const routePath = join(root, "src/app/api/wc26/knockout-fixtures/route.ts");
const fixturesLibPath = join(
  root,
  "src/lib/server/wc26-knockout-fixtures.ts",
);

const FORBIDDEN_PUBLIC = [
  "API URL",
  "x-apisports-key",
  "sk_live_",
  "Bearer secret",
  "node_modules/",
  "API_FOOTBALL_KEY",
];

function assertNoDiagnosticLeak(body, label) {
  const text = JSON.stringify(body);
  assert.equal("logs" in body, false, `${label}: logs field must be absent`);
  for (const fragment of FORBIDDEN_PUBLIC) {
    assert.equal(
      text.includes(fragment),
      false,
      `${label}: must not contain ${fragment}`,
    );
  }
}

async function loadRoute() {
  return import(`${routeHref}?t=${Date.now()}`);
}

test("BE-011: public route source never serialises diagnostic logs", () => {
  const src = readFileSync(routePath, "utf8");
  assert.match(src, /Wc26KnockoutFixturesPublicResponse/);
  assert.match(src, /no diagnostic fetch logs/i);
  assert.equal(/logs\s*:/.test(src), false, "route must not assign logs:");
  assert.equal(src.includes("logs: ["), false);
  assert.equal(src.includes("logs,"), false);
});

test("BE-011: fetch helpers keep diagnostics server-side only", () => {
  const src = readFileSync(fixturesLibPath, "utf8");
  assert.match(src, /logKnockoutFetch/);
  assert.match(src, /never returned on the public API/);
  assert.match(src, /return \{ fixtures \}/);
  assert.equal(/return \{[\s\S]*\blogs\b/.test(src), false);
});

test("BE-011: unconfigured API response has fixtures/source and no logs", async () => {
  const prev = process.env.API_FOOTBALL_KEY;
  delete process.env.API_FOOTBALL_KEY;
  try {
    const { GET } = await loadRoute();
    const res = await GET(
      new Request("http://localhost/api/wc26/knockout-fixtures"),
    );
    const body = await res.json();
    assert.equal(Array.isArray(body.fixtures), true);
    assert.equal(body.source, "static");
    assertNoDiagnosticLeak(body, "unconfigured");
  } finally {
    if (prev === undefined) delete process.env.API_FOOTBALL_KEY;
    else process.env.API_FOOTBALL_KEY = prev;
  }
});

test("BE-011: empty upstream simulation exposes no diagnostic logs", async () => {
  const prevKey = process.env.API_FOOTBALL_KEY;
  const prevSim = process.env.API_FOOTBALL_SIMULATE;
  const prevNode = process.env.NODE_ENV;
  process.env.API_FOOTBALL_KEY = "test-key-not-secret-for-unit";
  process.env.API_FOOTBALL_SIMULATE = "empty";
  process.env.NODE_ENV = "test";
  try {
    const { GET } = await loadRoute();
    const res = await GET(
      new Request("http://localhost/api/wc26/knockout-fixtures"),
    );
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.source, "api-football");
    assert.equal(Array.isArray(body.fixtures), true);
    assert.equal(body.fixtures.length, 0);
    assertNoDiagnosticLeak(body, "empty-sim");
  } finally {
    if (prevKey === undefined) delete process.env.API_FOOTBALL_KEY;
    else process.env.API_FOOTBALL_KEY = prevKey;
    if (prevSim === undefined) delete process.env.API_FOOTBALL_SIMULATE;
    else process.env.API_FOOTBALL_SIMULATE = prevSim;
    if (prevNode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNode;
  }
});

test("BE-011: partial round query still omits diagnostic logs", async () => {
  const prevKey = process.env.API_FOOTBALL_KEY;
  const prevSim = process.env.API_FOOTBALL_SIMULATE;
  const prevNode = process.env.NODE_ENV;
  process.env.API_FOOTBALL_KEY = "test-key-not-secret-for-unit";
  process.env.API_FOOTBALL_SIMULATE = "empty";
  process.env.NODE_ENV = "test";
  try {
    const { GET } = await loadRoute();
    const res = await GET(
      new Request(
        "http://localhost/api/wc26/knockout-fixtures?round=Round%20of%2032",
      ),
    );
    const body = await res.json();
    assert.equal(body.source, "api-football");
    assert.ok(Array.isArray(body.fixtures));
    assertNoDiagnosticLeak(body, "round-query");
  } finally {
    if (prevKey === undefined) delete process.env.API_FOOTBALL_KEY;
    else process.env.API_FOOTBALL_KEY = prevKey;
    if (prevSim === undefined) delete process.env.API_FOOTBALL_SIMULATE;
    else process.env.API_FOOTBALL_SIMULATE = prevSim;
    if (prevNode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNode;
  }
});

test("BE-011: total upstream failure omits raw provider diagnostics", async () => {
  const prevKey = process.env.API_FOOTBALL_KEY;
  const prevSim = process.env.API_FOOTBALL_SIMULATE;
  const prevNode = process.env.NODE_ENV;
  process.env.API_FOOTBALL_KEY = "test-key-not-secret-for-unit";
  process.env.API_FOOTBALL_SIMULATE = "500";
  process.env.NODE_ENV = "test";
  try {
    const { GET } = await loadRoute();
    const res = await GET(
      new Request("http://localhost/api/wc26/knockout-fixtures"),
    );
    const body = await res.json();
    assert.ok(res.status === 500 || res.status === 503);
    assert.equal(Array.isArray(body.fixtures), true);
    assert.equal(body.fixtures.length, 0);
    assertNoDiagnosticLeak(body, "upstream-fail");
    if (body.message) {
      assert.equal(String(body.message).includes("Simulated"), false);
      assert.equal(String(body.message).includes("API_FOOTBALL"), false);
    }
  } finally {
    if (prevKey === undefined) delete process.env.API_FOOTBALL_KEY;
    else process.env.API_FOOTBALL_KEY = prevKey;
    if (prevSim === undefined) delete process.env.API_FOOTBALL_SIMULATE;
    else process.env.API_FOOTBALL_SIMULATE = prevSim;
    if (prevNode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNode;
  }
});

test("BE-011: successful mapped fixtures keep identity fields without logs", async () => {
  const prevKey = process.env.API_FOOTBALL_KEY;
  const prevSim = process.env.API_FOOTBALL_SIMULATE;
  const prevNode = process.env.NODE_ENV;
  process.env.API_FOOTBALL_KEY = "test-key-not-secret-for-unit";
  delete process.env.API_FOOTBALL_SIMULATE;
  process.env.NODE_ENV = "test";

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        response: [
          {
            fixture: {
              id: 900073,
              date: "2026-06-28T16:00:00+00:00",
              status: { short: "NS" },
            },
            league: { round: "Round of 32" },
            teams: { home: { name: "Morocco" }, away: { name: "Scotland" } },
            venue: { name: "Test Venue", city: "Test City" },
          },
        ],
        results: 1,
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );

  try {
    const { GET } = await loadRoute();
    const res = await GET(
      new Request(
        "http://localhost/api/wc26/knockout-fixtures?round=Round%20of%2032",
      ),
    );
    const body = await res.json();
    assert.equal(body.source, "api-football");
    assertNoDiagnosticLeak(body, "success");
    assert.ok(Array.isArray(body.fixtures));
    if (body.fixtures.length > 0) {
      const row = body.fixtures[0];
      assert.equal(typeof row.apiFixtureId, "number");
      assert.equal(typeof row.fixtureId, "string");
      assert.equal(typeof row.matchNumber, "number");
      assert.ok(row.matchNumber >= 73);
      assert.equal(typeof row.homeTeam, "string");
      assert.equal(typeof row.awayTeam, "string");
      assert.equal(typeof row.kickoffUtc, "string");
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (prevKey === undefined) delete process.env.API_FOOTBALL_KEY;
    else process.env.API_FOOTBALL_KEY = prevKey;
    if (prevSim === undefined) delete process.env.API_FOOTBALL_SIMULATE;
    else process.env.API_FOOTBALL_SIMULATE = prevSim;
    if (prevNode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNode;
  }
});

test("BE-011: NODE_ENV=production cannot restore public logs via simulate flags", () => {
  const src = readFileSync(routePath, "utf8");
  assert.equal(src.includes("API_FOOTBALL_SIMULATE"), false);
  assert.equal(src.includes("DEBUG_LOGS"), false);
  assert.equal(src.includes("INCLUDE_LOGS"), false);
  assert.match(src, /publicJson/);
});

test("BE-011: public response type matches runtime keys", async () => {
  const { GET } = await loadRoute();
  const prev = process.env.API_FOOTBALL_KEY;
  delete process.env.API_FOOTBALL_KEY;
  try {
    const res = await GET(
      new Request("http://localhost/api/wc26/knockout-fixtures"),
    );
    const body = await res.json();
    const keys = Object.keys(body).sort();
    for (const key of keys) {
      assert.ok(
        ["fixtures", "source", "message", "error"].includes(key),
        `unexpected public key: ${key}`,
      );
    }
    assert.ok(keys.includes("fixtures"));
    assert.ok(keys.includes("source"));
  } finally {
    if (prev === undefined) delete process.env.API_FOOTBALL_KEY;
    else process.env.API_FOOTBALL_KEY = prev;
  }
});

test("BE-010 regression: LiveScore budget constants remain", () => {
  const src = readFileSync(
    join(root, "src/lib/server/wc26-top-scorers-sources/livescore.ts"),
    "utf8",
  );
  assert.match(src, /LIVESCORE_MAX_UPSTREAM_REQUESTS/);
  assert.match(src, /LIVESCORE_MAX_DATE_REQUESTS\s*=\s*40/);
});

test("BE-009 regression: Sentry redacts cron/debug headers", async () => {
  const href = pathToFileURL(join(root, "src/lib/sentry-config.ts")).href;
  const { redactSentryRequestHeaders } = await import(href);
  const headers = {
    "x-cron-secret": "c",
    "x-debug-secret": "d",
    authorization: "Bearer x",
    cookie: "a=1",
    accept: "application/json",
  };
  redactSentryRequestHeaders(headers);
  assert.equal("x-cron-secret" in headers, false);
  assert.equal("authorization" in headers, false);
  assert.equal(headers.accept, "application/json");
});

test("BE-008 regression: ScoreBat token redaction", async () => {
  const href = pathToFileURL(join(root, "src/lib/scorebat/request.ts")).href;
  const { redactScoreBatUrl, buildScoreBatFeedUrl } = await import(href);
  const url = buildScoreBatFeedUrl("secret-token-value");
  assert.equal(redactScoreBatUrl(url).includes("secret-token-value"), false);
});

test("BE-007 regression: FCM idToken gate present", () => {
  const src = readFileSync(
    join(root, "src/app/api/firebase/fcm-token/route.ts"),
    "utf8",
  );
  assert.match(src, /requireFcmIdToken/);
  assert.match(src, /401/);
});

test("BE-006 regression: client-safe auth message helper", async () => {
  const href = pathToFileURL(join(root, "src/lib/api-football/errors.ts")).href;
  const mod = await import(href);
  const msg = mod.apiFootballClientAuthErrorMessage();
  assert.equal(String(msg).includes("API_FOOTBALL_KEY"), false);
});
