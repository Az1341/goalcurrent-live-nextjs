import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const sentryMod = pathToFileURL(join(root, "src/lib/sentry-config.ts")).href;

test("BE-009: redactSentryRequestHeaders removes cron and debug secrets", async () => {
  const { redactSentryRequestHeaders } = await import(sentryMod);
  const headers = {
    "content-type": "application/json",
    "x-cron-secret": "cron-secret-value",
    "x-debug-secret": "debug-secret-value",
    authorization: "Bearer keep-me-gone",
    cookie: "session=abc",
    "user-agent": "goalcurrent-test",
  };

  redactSentryRequestHeaders(headers);

  assert.equal(headers["content-type"], "application/json");
  assert.equal(headers["user-agent"], "goalcurrent-test");
  assert.equal("x-cron-secret" in headers, false);
  assert.equal("x-debug-secret" in headers, false);
  assert.equal("authorization" in headers, false);
  assert.equal("cookie" in headers, false);
});

test("BE-009: redaction is case-insensitive for header names", async () => {
  const { redactSentryRequestHeaders } = await import(sentryMod);
  const headers = {
    Authorization: "Bearer TOKEN",
    Cookie: "a=1",
    "X-Cron-Secret": "CRON",
    "X-Debug-Secret": "DEBUG",
    Accept: "application/json",
  };

  redactSentryRequestHeaders(headers);

  assert.equal("Authorization" in headers, false);
  assert.equal("Cookie" in headers, false);
  assert.equal("X-Cron-Secret" in headers, false);
  assert.equal("X-Debug-Secret" in headers, false);
  assert.equal(headers.Accept, "application/json");
});

test("BE-009: beforeSend redacts request headers on ErrorEvent", async () => {
  const { buildSentryInitOptions } = await import(sentryMod);
  const options = buildSentryInitOptions();
  assert.equal(typeof options.beforeSend, "function");

  const event = {
    request: {
      headers: {
        "x-cron-secret": "must-not-leave",
        "x-debug-secret": "must-not-leave-either",
        authorization: "Bearer x",
        cookie: "sid=1",
        host: "localhost",
      },
    },
  };

  const result = options.beforeSend(event, {});
  assert.equal(result, event);
  assert.equal("x-cron-secret" in event.request.headers, false);
  assert.equal("x-debug-secret" in event.request.headers, false);
  assert.equal("authorization" in event.request.headers, false);
  assert.equal("cookie" in event.request.headers, false);
  assert.equal(event.request.headers.host, "localhost");
});

test("BE-009: beforeSend tolerates missing request/headers", async () => {
  const { buildSentryInitOptions, redactSentryRequestHeaders } = await import(sentryMod);
  assert.equal(redactSentryRequestHeaders(undefined), undefined);

  const options = buildSentryInitOptions();
  assert.deepEqual(options.beforeSend({}, {}), {});
  assert.deepEqual(options.beforeSend({ request: {} }, {}), { request: {} });
});

test("BE-009: sentry-config source lists custom secret headers", () => {
  const src = readFileSync(join(root, "src/lib/sentry-config.ts"), "utf8");
  assert.match(src, /x-cron-secret/);
  assert.match(src, /x-debug-secret/);
  assert.match(src, /redactSentryRequestHeaders/);
});
