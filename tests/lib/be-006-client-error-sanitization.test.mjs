import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const errorsMod = pathToFileURL(join(root, "src/lib/api-football/errors.ts")).href;
const routeErrorsMod = pathToFileURL(
  join(root, "src/lib/api-football/route-errors.ts"),
).href;
const apiCoreMod = pathToFileURL(join(root, "src/lib/pl/api-core.ts")).href;

const FORBIDDEN_CLIENT_FRAGMENTS = [
  "Check API_FOOTBALL_KEY",
  "API key rejected",
  "API key invalid",
  "API key rejected. Check API_FOOTBALL_KEY",
  "AuthError",
  "at Object.<anonymous>",
  "node_modules/",
  "sk_live_",
  "Bearer secret-token",
];

function assertNoForbiddenClientText(text, label) {
  for (const fragment of FORBIDDEN_CLIENT_FRAGMENTS) {
    assert.equal(
      text.includes(fragment),
      false,
      `${label} must not expose "${fragment}"`,
    );
  }
}

test("BE-006: client auth message is exact and generic", async () => {
  const { apiFootballClientAuthErrorMessage } = await import(errorsMod);
  const message = apiFootballClientAuthErrorMessage();
  assert.equal(message, "Live data is temporarily unavailable.");
  assertNoForbiddenClientText(message, "auth message");
  assert.equal(message.includes("API_FOOTBALL_KEY"), false);
});

test("BE-006: AuthError and Check API_FOOTBALL_KEY are sanitised in route envelope", async () => {
  const { ApiFootballAuthError, apiFootballClientAuthErrorMessage } =
    await import(errorsMod);
  const { respondApiFootballFailure } = await import(routeErrorsMod);

  const response = respondApiFootballFailure({
    route: "test/be-006",
    error: new ApiFootballAuthError(
      "API key rejected. Check API_FOOTBALL_KEY. Status 403",
    ),
    buildBody: (code, message, stale) => ({
      ok: false,
      errorCode: code,
      error: message,
      stale,
    }),
  });

  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.error, apiFootballClientAuthErrorMessage());
  assert.equal(body.errorCode, "unknown_error");
  assertNoForbiddenClientText(JSON.stringify(body), "AuthError JSON body");
});

test("BE-006: raw quota/rate-limit provider text is sanitised", async () => {
  const {
    ApiFootballRateLimitError,
    apiFootballClientSafeFetchFailureMessage,
    apiFootballErrorMessage,
  } = await import(errorsMod);
  const { toClientSafeApiFootballFetchFailure } = await import(apiCoreMod);
  const { respondApiFootballFailure } = await import(routeErrorsMod);

  const fetchFail = toClientSafeApiFootballFetchFailure(
    new ApiFootballRateLimitError(
      "upstream ratelimit detail request limit 429 body={...}",
    ),
  );
  assert.equal(fetchFail.ok, false);
  if (fetchFail.ok) return;
  assert.equal(fetchFail.kind, "quota");
  assert.equal(
    fetchFail.message,
    apiFootballClientSafeFetchFailureMessage("quota"),
  );
  assert.equal(fetchFail.message, apiFootballErrorMessage("rate_limit"));
  assertNoForbiddenClientText(JSON.stringify(fetchFail), "quota fetch fail");

  const response = respondApiFootballFailure({
    route: "test/be-006-rate",
    error: new ApiFootballRateLimitError("upstream ratelimit detail"),
    buildBody: (code, message, stale) => ({
      errorCode: code,
      error: message,
      stale,
    }),
  });
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.errorCode, "rate_limit");
  assert.equal(body.error, apiFootballErrorMessage("rate_limit"));
});

test("BE-006: raw provider API / unknown / stack / credential text is sanitised", async () => {
  const { apiFootballClientSafeFetchFailureMessage } = await import(errorsMod);
  const { toClientSafeApiFootballFetchFailure } = await import(apiCoreMod);

  const cases = [
    new Error("provider response body: {\"errors\":{\"plan\":\"upgrade\"}}"),
    new Error("Unexpected token at Object.<anonymous> (node_modules/x.js:1:1)"),
    new Error("Authorization Bearer secret-token sk_live_abcdef"),
    "non-error thrown string with Check API_FOOTBALL_KEY",
  ];

  for (const err of cases) {
    const fail = toClientSafeApiFootballFetchFailure(err, "test/be-006-api");
    assert.equal(fail.ok, false);
    if (fail.ok) continue;
    assert.equal(fail.kind, "api");
    assert.equal(
      fail.message,
      apiFootballClientSafeFetchFailureMessage("api"),
    );
    assertNoForbiddenClientText(JSON.stringify(fail), "api fail");
  }
});

test("BE-006: raw network exception text is sanitised", async () => {
  const {
    ApiFootballNetworkError,
    apiFootballClientSafeFetchFailureMessage,
  } = await import(errorsMod);
  const { toClientSafeApiFootballFetchFailure } = await import(apiCoreMod);

  const fail = toClientSafeApiFootballFetchFailure(
    new ApiFootballNetworkError("ECONNRESET socket hang up /etc/passwd"),
  );
  assert.equal(fail.ok, false);
  if (fail.ok) return;
  assert.equal(fail.kind, "network");
  assert.equal(
    fail.message,
    apiFootballClientSafeFetchFailureMessage("network"),
  );
  assertNoForbiddenClientText(JSON.stringify(fail), "network fail");
});

test("BE-006: HTTP status semantics preserved for route envelopes", async () => {
  const {
    ApiFootballAuthError,
    ApiFootballRateLimitError,
    ApiFootballNetworkError,
  } = await import(errorsMod);
  const { respondApiFootballFailure } = await import(routeErrorsMod);

  const auth = respondApiFootballFailure({
    route: "t",
    error: new ApiFootballAuthError("x"),
    buildBody: (c, m, s) => ({ c, m, s }),
  });
  assert.equal(auth.status, 503);

  const rate = respondApiFootballFailure({
    route: "t",
    error: new ApiFootballRateLimitError("x"),
    buildBody: (c, m, s) => ({ c, m, s }),
  });
  assert.equal(rate.status, 503);

  const network = respondApiFootballFailure({
    route: "t",
    error: new ApiFootballNetworkError("x"),
    buildBody: (c, m, s) => ({ c, m, s }),
  });
  assert.equal(network.status, 503);

  const unknown = respondApiFootballFailure({
    route: "t",
    error: new Error("boom"),
    buildBody: (c, m, s) => ({ c, m, s }),
  });
  assert.equal(unknown.status, 500);
});

test("BE-006: server-side diagnostics retained via logError for fetch failures", async () => {
  const { ApiFootballAuthError } = await import(errorsMod);
  const { toClientSafeApiFootballFetchFailure } = await import(apiCoreMod);

  const original = console.error;
  const seen = [];
  console.error = (...args) => {
    seen.push(args.map(String).join(" "));
  };
  try {
    toClientSafeApiFootballFetchFailure(
      new ApiFootballAuthError("API key rejected. Check API_FOOTBALL_KEY."),
      "test/be-006-diag",
    );
  } finally {
    console.error = original;
  }

  assert.ok(
    seen.some((line) => line.includes("test/be-006-diag")),
    "logError context must appear",
  );
  assert.ok(
    seen.some((line) => line.includes("Check API_FOOTBALL_KEY")),
    "original diagnostic detail must remain server-side",
  );
});

test("BE-006: mapFetchError and helpers never pass raw error.message to clients", () => {
  const apiCore = readFileSync(join(root, "src/lib/pl/api-core.ts"), "utf8");
  const endpoints = readFileSync(join(root, "src/lib/pl/endpoints.ts"), "utf8");
  const routeErrors = readFileSync(
    join(root, "src/lib/api-football/route-errors.ts"),
    "utf8",
  );

  assert.match(apiCore, /toClientSafeApiFootballFetchFailure/);
  assert.match(apiCore, /apiFootballClientSafeFetchFailureMessage/);
  assert.match(apiCore, /logError/);
  assert.equal(
    /kind:\s*"quota",\s*message:\s*error\.message/.test(apiCore),
    false,
  );
  assert.equal(
    /return \{ ok: false, kind: "api", message \}/.test(apiCore),
    false,
  );

  assert.match(endpoints, /apiFootballClientSafeFetchFailureMessage\(result\.kind\)/);
  assert.equal(endpoints.includes("error: result.message"), false);

  assert.equal(
    routeErrors.includes("error.message"),
    false,
    "AuthError branch must not pass error.message to clients",
  );
});