import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const entitiesMod = pathToFileURL(join(root, "src/lib/favourite-entities.ts")).href;
const favouritesMod = pathToFileURL(join(root, "src/lib/favourites.ts")).href;
const fixturesMod = pathToFileURL(join(root, "src/lib/favourite-fixtures.ts")).href;
const alertsMod = pathToFileURL(join(root, "src/lib/server/favourite-team-alerts.ts")).href;

test("favourite identities canonicalise exact aliases deterministically", async () => {
  const { canonicalizeFavouriteMatchId, canonicalPlTeamKey, canonicalUnlTeamKey } = await import(entitiesMod);
  assert.equal(canonicalizeFavouriteMatchId("PL:001557367"), "pl:1557367");
  assert.equal(canonicalizeFavouriteMatchId("cs:01582365"), "cs:1582365");
  assert.equal(canonicalPlTeamKey("Arsenal"), "club:pl:arsenal");
  assert.equal(canonicalUnlTeamKey(10), "national:unl:10");
});

test("normalised favourites dedupe repeated team and match keys", async () => {
  const { normalizeFavouritesState } = await import(favouritesMod);
  const state = normalizeFavouritesState({
    teams: ["club:pl:arsenal", "club:pl:Arsenal", "national:unl:10", "national:unl:10"],
    matches: ["pl:1557367", "PL:001557367", "cs:1582365", "cs:01582365"],
    competitions: ["pl", "pl"],
    teamNotifications: ["club:pl:arsenal", "club:pl:arsenal", "unknown"],
  });
  assert.deepEqual(state.teams, ["club:pl:arsenal", "national:unl:10"]);
  assert.deepEqual(state.matches, ["pl:1557367", "cs:1582365"]);
  assert.deepEqual(state.competitions, ["pl"]);
  assert.deepEqual(state.teamNotifications, ["club:pl:arsenal"]);
});

test("club and national-team catalog includes Arsenal, England and World Cup nations", async () => {
  const { getFavouriteTeamCatalog } = await import(entitiesMod);
  const catalog = getFavouriteTeamCatalog();
  assert.ok(catalog.some((team) => team.key === "club:pl:arsenal" && team.name === "Arsenal"));
  assert.ok(catalog.some((team) => team.name === "England" && team.kind === "national"));
  assert.ok(catalog.some((team) => team.name === "Argentina" && team.kind === "national"));
});

test("Arsenal next-match resolver picks Community Shield before Premier League then advances", async () => {
  const { getNextFavouriteTeamFixture } = await import(fixturesMod);
  const plFixtures = [
    {
      fixtureId: 926270001,
      kickoffUtc: "2026-08-21T19:00:00.000Z",
      matchweek: 1,
      round: "Regular Season - 1",
      venue: null,
      homeTeamId: 42,
      homeTeamName: "Arsenal",
      homeTeamLogo: null,
      awayTeamId: 183,
      awayTeamName: "Coventry",
      awayTeamLogo: null,
      status: "UPCOMING",
      statusShort: "NS",
      elapsed: null,
      homeScore: null,
      awayScore: null,
      broadcaster: "",
    },
  ];
  const beforeShield = Date.parse("2026-08-16T10:00:00.000Z");
  const afterShield = Date.parse("2026-08-16T15:00:00.000Z");
  const first = getNextFavouriteTeamFixture("club:pl:arsenal", plFixtures, [], beforeShield);
  assert.equal(first?.key, "cs:1582365");
  assert.equal(first?.homeTeamName, "Arsenal");
  const second = getNextFavouriteTeamFixture("club:pl:arsenal", plFixtures, [], afterShield);
  assert.equal(second?.key, "pl:926270001");
  assert.equal(second?.awayTeamName, "Coventry");
});

test("next-match resolver excludes finished and past fixtures", async () => {
  const { getNextFavouriteTeamFixture } = await import(fixturesMod);
  const now = Date.parse("2026-08-20T12:00:00.000Z");
  const fixtures = [
    {
      fixtureId: 1,
      kickoffUtc: "2026-08-20T10:00:00.000Z",
      matchweek: 1,
      round: null,
      venue: null,
      homeTeamId: 42,
      homeTeamName: "Arsenal",
      homeTeamLogo: null,
      awayTeamId: 50,
      awayTeamName: "Manchester City",
      awayTeamLogo: null,
      status: "FT",
      statusShort: "FT",
      elapsed: 90,
      homeScore: 1,
      awayScore: 1,
      broadcaster: "",
    },
    {
      fixtureId: 2,
      kickoffUtc: "2026-08-21T19:00:00.000Z",
      matchweek: 1,
      round: null,
      venue: null,
      homeTeamId: 42,
      homeTeamName: "Arsenal",
      homeTeamLogo: null,
      awayTeamId: 183,
      awayTeamName: "Coventry",
      awayTeamLogo: null,
      status: "UPCOMING",
      statusShort: "NS",
      elapsed: null,
      homeScore: null,
      awayScore: null,
      broadcaster: "",
    },
  ];
  const next = getNextFavouriteTeamFixture("club:pl:arsenal", fixtures, [], now);
  assert.equal(next?.fixtureId, 2);
});

test("hourly alert builder emits one due alert per team and fixture key", async () => {
  const { buildDueFavouriteTeamAlerts } = await import(alertsMod);
  const oneHourBeforeShield = Date.parse("2026-08-16T13:00:00.000Z");
  const alerts = buildDueFavouriteTeamAlerts(oneHourBeforeShield);
  const shield = alerts.filter((alert) => alert.fixtureKey === "cs:1582365");
  assert.equal(shield.length, 2);
  assert.equal(new Set(shield.map((alert) => alert.topic)).size, 2);
  assert.ok(shield.some((alert) => alert.teamKey === "club:pl:arsenal"));
});
