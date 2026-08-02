import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const idMod = pathToFileURL(join(root, "src/lib/server/wc26-api-fixture-id.ts")).href;
const regMod = pathToFileURL(join(root, "src/lib/server/wc26-api-fixture-registry.ts")).href;
const detailMod = pathToFileURL(join(root, "src/lib/server/wc26-match-detail.ts")).href;

test("BE-004: classify rejects registry-mismatched apiFixtureId", async () => {
  const { classifyKnownWc26ApiFixtureId } = await import(idMod);
  const trust = classifyKnownWc26ApiFixtureId(999001, 100001);
  assert.equal(trust.action, "reject");
  if (trust.action === "reject") {
    assert.equal(trust.reason, "registry_mismatch");
  }
});

test("BE-004: classify accepts registry-bound apiFixtureId", async () => {
  const { classifyKnownWc26ApiFixtureId } = await import(idMod);
  const trust = classifyKnownWc26ApiFixtureId(100001, 100001);
  assert.equal(trust.action, "use");
  if (trust.action === "use") {
    assert.equal(trust.apiFixtureId, 100001);
  }
});

test("BE-004: classify requires verify when unregistered", async () => {
  const { classifyKnownWc26ApiFixtureId } = await import(idMod);
  const trust = classifyKnownWc26ApiFixtureId(100001, undefined);
  assert.equal(trust.action, "verify");
});

test("BE-004: ownership bind requires WC league/season and local fixture map", async () => {
  const {
    isWc26ApiFixtureOwnershipBound,
    WC26_API_LEAGUE_ID,
    WC26_API_SEASON,
  } = await import(idMod);

  const bound = {
    fixture: { id: 555001, date: "2026-06-11T19:00:00+00:00" },
    league: { id: WC26_API_LEAGUE_ID, season: WC26_API_SEASON },
    teams: { home: { name: "Mexico" }, away: { name: "South Africa" } },
  };
  assert.equal(isWc26ApiFixtureOwnershipBound("fixture-001", bound), true);

  assert.equal(
    isWc26ApiFixtureOwnershipBound("fixture-001", {
      ...bound,
      league: { id: 39, season: WC26_API_SEASON },
    }),
    false,
    "Premier League id must not bind to WC26",
  );

  assert.equal(
    isWc26ApiFixtureOwnershipBound("fixture-001", {
      ...bound,
      teams: { home: { name: "Brazil" }, away: { name: "Morocco" } },
    }),
    false,
    "Wrong teams must not bind",
  );
});

test("BE-004: resolveTrusted rejects registry mismatch", async () => {
  const { registerWc26ApiFixtureIds } = await import(regMod);
  const { resolveTrustedWc26ApiFixtureId } = await import(detailMod);

  registerWc26ApiFixtureIds([
    {
      fixtureId: "fixture-001",
      matchNumber: 1,
      status: "FT",
      statusShort: "FT",
      elapsed: null,
      homeScore: 1,
      awayScore: 0,
      kickoffUtc: "2026-06-11T19:00:00.000Z",
      apiFixtureId: 100001,
    },
  ]);

  const rejected = await resolveTrustedWc26ApiFixtureId("fixture-001", 999001);
  assert.equal(rejected.ok, false);
  if (!rejected.ok) {
    assert.equal(rejected.code, "api_fixture_mismatch");
  }

  const accepted = await resolveTrustedWc26ApiFixtureId("fixture-001", 100001);
  assert.equal(accepted.ok, true);
  if (accepted.ok) {
    assert.equal(accepted.apiFixtureId, 100001);
  }
});

test("BE-004: match route uses resolveTrustedWc26ApiFixtureId", async () => {
  const fs = await import("node:fs");
  const route = fs.readFileSync(
    join(root, "src/app/api/wc26/match/[fixtureId]/route.ts"),
    "utf8",
  );
  assert.match(route, /resolveTrustedWc26ApiFixtureId/);
  assert.doesNotMatch(
    route,
    /parseOptionalApiFixtureId\([\s\S]*?\)\s*\?\?\s*getRegisteredWc26ApiFixtureId/,
  );
});
