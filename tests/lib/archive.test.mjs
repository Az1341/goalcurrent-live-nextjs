import assert from "node:assert/strict";
import test from "node:test";

const {
  WC26_ARCHIVE_DATA_AS_OF,
  WC26_ARCHIVE_LABEL,
  formatArchiveScoreLine,
  getWc26ArchiveFinalSummary,
  isWc26TournamentComplete,
} = await import("@/lib/wc26/archive");

test("archive label and data-as-of constants are set", () => {
  assert.equal(WC26_ARCHIVE_LABEL, "World Cup 2026 Archive");
  assert.equal(WC26_ARCHIVE_DATA_AS_OF, "2026-07-19");
});

test("tournament is complete from verified final SSOT", () => {
  assert.equal(isWc26TournamentComplete(), true);
});

test("archive final summary matches confirmed Match 104", () => {
  const summary = getWc26ArchiveFinalSummary();
  assert.ok(summary);
  assert.equal(summary.fixtureId, "fixture-104");
  assert.equal(summary.matchNumber, 104);
  assert.equal(summary.winnerTeamId, "esp");
  assert.equal(summary.runnerUpTeamId, "arg");
  assert.equal(summary.homeScore, 1);
  assert.equal(summary.awayScore, 0);
  assert.equal(summary.matchStatus, "aet");
  assert.equal(summary.winnerName, "Spain");
  assert.equal(summary.runnerUpName, "Argentina");
  assert.match(formatArchiveScoreLine(summary), /1.+0/);
  assert.match(formatArchiveScoreLine(summary), /AET/);
});

const { getSiteLeadCompetition } = await import("@/lib/competitions/registry");
const {
  selectHomeFeaturedContent,
  isUpcomingFixtureStatus,
  isFeaturedMatchEligible,
} = await import("@/lib/home/featured-selection");
const { getSeoEffectiveFixtures } = await import("@/lib/wc26/seo-fixtures");
const {
  buildCalendarDays,
  pickDefaultDateKey,
} = await import("@/lib/wc26-fixtures-page");
const { getTournamentCompletionSummary } = await import(
  "@/lib/wc26-tournament-stats"
);
const { selectFeaturedFixture } = await import("@/lib/wc26-live");

test("site lead competition is PL after WC26 archive completion", () => {
  assert.equal(getSiteLeadCompetition(), "pl");
});

test("featured selection excludes completed WC26 matches post-archive", () => {
  const fixtures = getSeoEffectiveFixtures();
  const selection = selectHomeFeaturedContent(fixtures);
  assert.equal(selection.wc26Selection.fixtures.length, 0);
  assert.equal(selection.featuredMatch, undefined);
});

test("selectFeaturedFixture does not fall back to completed by default", () => {
  const fixtures = getSeoEffectiveFixtures();
  assert.equal(selectFeaturedFixture(fixtures), undefined);
});

test("tournament completion totals are internally consistent", () => {
  const summary = getTournamentCompletionSummary();
  assert.equal(summary.total, 104);
  assert.equal(summary.played, 104);
  assert.equal(summary.remaining, 0);
  assert.equal(summary.complete, true);
});

test("archive calendar days do not extend beyond tournament end", () => {
  const fixtures = getSeoEffectiveFixtures();
  const days = buildCalendarDays(fixtures, new Date("2026-08-01T12:00:00.000Z"));
  const lastDay = days[days.length - 1]?.dateKey;
  assert.ok(lastDay);
  assert.ok(lastDay <= WC26_ARCHIVE_DATA_AS_OF);
});

test("archive default calendar date is the final match day", () => {
  const fixtures = getSeoEffectiveFixtures();
  const days = buildCalendarDays(fixtures, new Date("2026-08-01T12:00:00.000Z"));
  const defaultKey = pickDefaultDateKey(days, new Date("2026-08-01T12:00:00.000Z"));
  assert.equal(defaultKey, WC26_ARCHIVE_DATA_AS_OF);
});

test("completed statuses are not classified as upcoming", () => {
  assert.equal(isUpcomingFixtureStatus("ft", "2026-07-19T19:00:00.000Z"), false);
});

test("featured eligibility rejects full-time rows", () => {
  assert.equal(
    isFeaturedMatchEligible({
      fixtureId: "fixture-104",
      homeTeamId: "esp",
      awayTeamId: "arg",
      homeName: "Spain",
      awayName: "Argentina",
      matchClass: "ft",
      statusLabel: "FT",
      score: { home: 1, away: 0 },
      kickoffUtc: "2026-07-19T19:00:00.000Z",
      kickoffLabel: "",
      venueLabel: "",
      roundLabel: "",
      elapsed: null,
    }),
    false,
  );
});