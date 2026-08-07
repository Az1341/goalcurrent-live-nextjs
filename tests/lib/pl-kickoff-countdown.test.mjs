import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const countdownMod = pathToFileURL(
  join(root, "src/lib/home/pl-kickoff-countdown.ts"),
).href;
const featuredMod = pathToFileURL(
  join(root, "src/lib/home/featured-selection.ts"),
).href;

function row(overrides) {
  return {
    fixtureId: 1,
    kickoffUtc: "2026-08-21T19:00:00.000Z",
    matchweek: 1,
    round: "Regular Season - 1",
    venue: null,
    homeTeamId: 42,
    homeTeamName: "Arsenal",
    homeTeamLogo: null,
    awayTeamId: 55,
    awayTeamName: "Coventry",
    awayTeamLogo: null,
    status: "UPCOMING",
    statusShort: "NS",
    elapsed: null,
    homeScore: null,
    awayScore: null,
    broadcaster: "",
    ...overrides,
  };
}

test("splitCountdownParts floors days hours minutes without going negative", async () => {
  const { splitCountdownParts } = await import(countdownMod);
  assert.deepEqual(splitCountdownParts(0), { days: 0, hours: 0, minutes: 0 });
  assert.deepEqual(splitCountdownParts(-5_000), { days: 0, hours: 0, minutes: 0 });
  assert.deepEqual(
    splitCountdownParts(2 * 86_400_000 + 3 * 3_600_000 + 14 * 60_000 + 59_000),
    { days: 2, hours: 3, minutes: 14 },
  );
});

test("selectNextPlUpcomingFixture picks earliest upcoming by kickoffUtc", async () => {
  const { selectNextPlUpcomingFixture } = await import(featuredMod);
  const now = Date.parse("2026-08-07T12:00:00.000Z");
  const next = selectNextPlUpcomingFixture(
    [
      row({
        fixtureId: 2,
        kickoffUtc: "2026-08-22T14:00:00.000Z",
        homeTeamName: "Chelsea",
        awayTeamName: "Liverpool",
      }),
      row({
        fixtureId: 1,
        kickoffUtc: "2026-08-21T19:00:00.000Z",
        homeTeamName: "Arsenal",
        awayTeamName: "Coventry",
      }),
      row({
        fixtureId: 3,
        status: "FT",
        kickoffUtc: "2026-08-01T15:00:00.000Z",
        homeTeamName: "Past",
        awayTeamName: "Done",
      }),
      row({
        fixtureId: 4,
        status: "LIVE",
        kickoffUtc: "2026-08-07T11:00:00.000Z",
        homeTeamName: "Live",
        awayTeamName: "Now",
      }),
    ],
    now,
  );
  assert.ok(next);
  assert.equal(next.fixtureId, 1);
  assert.equal(next.homeTeamName, "Arsenal");
  assert.equal(next.awayTeamName, "Coventry");
  assert.equal(next.kickoffUtc, "2026-08-21T19:00:00.000Z");
});

test("selectNextPlUpcomingFixture returns undefined when none upcoming", async () => {
  const { selectNextPlUpcomingFixture } = await import(featuredMod);
  const now = Date.parse("2026-08-07T12:00:00.000Z");
  assert.equal(
    selectNextPlUpcomingFixture(
      [
        row({ status: "FT", kickoffUtc: "2026-08-01T15:00:00.000Z" }),
        row({ status: "LIVE", kickoffUtc: "2026-08-07T11:00:00.000Z" }),
      ],
      now,
    ),
    undefined,
  );
});