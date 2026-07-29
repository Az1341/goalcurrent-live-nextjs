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

const FORBIDDEN_CLIENT_FRAGMENTS = [
  "Check API_FOOTBALL_KEY",
  "API key rejected",
  "API key invalid",
  "API key rejected. Check API_FOOTBALL_KEY",
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

test("BE-006: client auth message is generic (no env/key fingerprint)", async () => {
  const { apiFootballClientAuthErrorMessage } = await import(errorsMod);
  const message = apiFootballClientAuthErrorMessage();
  assert.equal(typeof message, "string");
  assert.ok(message.length > 0);
  assertNoForbiddenClientText(message, "apiFootballClientAuthErrorMessage()");
  assert.equal(message.includes("API_FOOTBALL_KEY"), false);
});

test("BE-006: AuthError response envelope sanitizes provider detail", async () => {
  const { ApiFootballAuthError } = await import(errorsMod);
  const { apiFootballClientAuthErrorMessage } = await import(errorsMod);
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
  assert.equal(body.stale, false);
  assertNoForbiddenClientText(JSON.stringify(body), "AuthError JSON body");
  assert.equal(JSON.stringify(body).includes("API_FOOTBALL_KEY"), false);
});

test("BE-006: non-auth failures still use classified client-safe messages", async () => {
  const { ApiFootballRateLimitError, apiFootballErrorMessage } =
    await import(errorsMod);
  const { respondApiFootballFailure } = await import(routeErrorsMod);

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
  assertNoForbiddenClientText(JSON.stringify(body), "rate_limit JSON body");
});

test("BE-006: PL auth client paths no longer hardcode env fingerprints", () => {
  const apiCore = readFileSync(join(root, "src/lib/pl/api-core.ts"), "utf8");
  const plApi = readFileSync(join(root, "src/lib/pl/api.ts"), "utf8");
  const routeErrors = readFileSync(
    join(root, "src/lib/api-football/route-errors.ts"),
    "utf8",
  );

  assert.match(apiCore, /apiFootballClientAuthErrorMessage/);
  assert.match(plApi, /apiFootballClientAuthErrorMessage/);
  assert.match(routeErrors, /apiFootballClientAuthErrorMessage/);
  assert.equal(
    routeErrors.includes("error.message"),
    false,
    "AuthError branch must not pass error.message to clients",
  );

  assertNoForbiddenClientText(apiCore, "api-core.ts source");
  assertNoForbiddenClientText(plApi, "pl/api.ts source");
});