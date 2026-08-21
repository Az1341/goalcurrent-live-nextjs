import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const routeHref = pathToFileURL(join(root, "src/app/api/health/route.ts")).href;

test("health route reports readiness without calling API-Football", async () => {
  const previousKey = process.env.API_FOOTBALL_KEY;
  const previousSha = process.env.VERCEL_GIT_COMMIT_SHA;
  process.env.API_FOOTBALL_KEY = "configured-for-test";
  process.env.VERCEL_GIT_COMMIT_SHA = "abcdef123456";

  try {
    const { GET } = await import(routeHref);
    const response = GET();
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(body.status, "ok");
    assert.equal(body.service, "goalcurrent.live");
    assert.equal(body.version, "abcdef1");
    assert.equal(body.checks.apiFootball, "configured");
    assert.match(body.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  } finally {
    if (previousKey === undefined) delete process.env.API_FOOTBALL_KEY;
    else process.env.API_FOOTBALL_KEY = previousKey;
    if (previousSha === undefined) delete process.env.VERCEL_GIT_COMMIT_SHA;
    else process.env.VERCEL_GIT_COMMIT_SHA = previousSha;
  }
});

test("health route fails honestly when API-Football is not configured", async () => {
  const previousKey = process.env.API_FOOTBALL_KEY;
  delete process.env.API_FOOTBALL_KEY;

  try {
    const { GET } = await import(routeHref);
    const response = GET();
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.status, "degraded");
    assert.equal(body.checks.web, "ok");
    assert.equal(body.checks.apiFootball, "not_configured");
  } finally {
    if (previousKey === undefined) delete process.env.API_FOOTBALL_KEY;
    else process.env.API_FOOTBALL_KEY = previousKey;
  }
});
