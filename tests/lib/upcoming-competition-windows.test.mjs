import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { buildUpcomingCompetitionWindows } = await import(
  pathToFileURL(join(root, "src/lib/live/upcoming-competition-windows.ts")).href
);

function shieldRow(overrides = {}) {
  return {
    fixtureId: 1582365,
    kickoffUtc: "2026-09-01T14:00:00.000Z",
    homeTeamName: "Arsenal",
    awayTeamName: "Manchester City",
    venue: "Principality Stadium, Cardiff",
    status: "UPCOMING",
    ...overrides,
  };
}

test("future Community Shield appears in upcoming windows", () => {
  const now = new Date("2026-08-21T12:00:00.000Z");
  const windows = buildUpcomingCompetitionWindows({
    communityShield: [shieldRow({ kickoffUtc: "2026-09-01T14:00:00.000Z" })],
    now,
  });
  assert.equal(windows.length, 1);
  assert.equal(windows[0].key, "community-shield");
  assert.equal(windows[0].hubHref, "/community-shield");
  assert.equal(windows[0].matches[0].homeName, "Arsenal");
});

test("FT Community Shield is excluded from upcoming windows", () => {
  const now = new Date("2026-08-21T12:00:00.000Z");
  const windows = buildUpcomingCompetitionWindows({
    communityShield: [
      shieldRow({
        kickoffUtc: "2026-09-01T14:00:00.000Z",
        status: "FT",
      }),
    ],
    now,
  });
  assert.deepEqual(windows, []);
});

test("cancelled Community Shield is excluded from upcoming windows", () => {
  const now = new Date("2026-08-21T12:00:00.000Z");
  const windows = buildUpcomingCompetitionWindows({
    communityShield: [
      shieldRow({
        kickoffUtc: "2026-09-01T14:00:00.000Z",
        status: "CANCELLED",
      }),
    ],
    now,
  });
  assert.deepEqual(windows, []);
});

test("past-kickoff Community Shield is excluded even when status is still UPCOMING", () => {
  const now = new Date("2026-08-21T12:00:00.000Z");
  const windows = buildUpcomingCompetitionWindows({
    communityShield: [
      shieldRow({
        kickoffUtc: "2026-08-16T14:00:00.000Z",
        status: "UPCOMING",
      }),
    ],
    now,
  });
  assert.deepEqual(windows, []);
});
