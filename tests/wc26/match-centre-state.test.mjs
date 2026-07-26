import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const {
  shouldShowUpcomingCountdown,
  shouldShowLiveMatchCard,
} = await import(pathToFileURL(join(root, "src/lib/wc26-live.ts")).href);

const baseFixture = {
  id: "fixture-test",
  homeTeamId: "nor",
  awayTeamId: "eng",
  venueId: "miami",
  kickoffUtc: "2099-01-01T20:00:00.000Z",
  status: "scheduled",
  stage: "quarter-final",
  matchNumber: 99,
};

test("upcoming countdown only before kick-off", () => {
  assert.equal(shouldShowUpcomingCountdown(baseFixture), true);
  assert.equal(
    shouldShowUpcomingCountdown({
      ...baseFixture,
      kickoffUtc: "2020-01-01T20:00:00.000Z",
    }),
    false,
  );
});

test("live card only for true in-play status (not kick-off alone)", () => {
  assert.equal(shouldShowLiveMatchCard(baseFixture), false);
  assert.equal(
    shouldShowLiveMatchCard({ ...baseFixture, status: "2h", elapsed: 67 }),
    true,
  );
  assert.equal(
    shouldShowLiveMatchCard({
      ...baseFixture,
      kickoffUtc: "2020-01-01T20:00:00.000Z",
    }),
    false,
  );
  assert.equal(
    shouldShowLiveMatchCard({ ...baseFixture, status: "FT", homeScore: 1, awayScore: 0 }),
    false,
  );
});

test("kickoff passed scheduled knockout is upcoming until provider marks live", async () => {
  const { buildHomepageMatchView } = await import(
    pathToFileURL(join(root, "src/lib/wc26-live.ts")).href
  );

  const view = buildHomepageMatchView({
    id: "fixture-103",
    homeTeamId: "fra",
    awayTeamId: "eng",
    venueId: "venue-miami",
    kickoffUtc: "2020-01-01T20:00:00.000Z",
    status: "scheduled",
    stage: "third-place",
    matchNumber: 103,
  });

  assert.equal(view.matchClass, "upcoming");
  assert.notEqual(view.statusLabel.toLowerCase(), "live");
});