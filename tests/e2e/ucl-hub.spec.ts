import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const mockFixtures = {
  configured: true,
  competitionKey: "ucl",
  league: "UEFA Champions League",
  leagueId: 2,
  season: 2026,
  source: "api-football",
  fetchedAt: "2026-07-31T12:00:00.000Z",
  fixtures: [
    {
      fixtureId: 900001,
      kickoffUtc: "2026-09-16T19:00:00.000Z",
      round: "League Stage - 1",
      stage: "league_phase",
      venue: "Test Arena",
      homeTeamId: 1,
      homeTeamName: "Alpha FC",
      homeTeamLogo: null,
      awayTeamId: 2,
      awayTeamName: "Beta United",
      awayTeamLogo: null,
      status: "UPCOMING",
      statusShort: "NS",
      elapsed: null,
      homeScore: null,
      awayScore: null,
      aggregateHome: null,
      aggregateAway: null,
      penaltyHome: null,
      penaltyAway: null,
    },
    {
      fixtureId: 900002,
      kickoffUtc: "2026-07-01T19:00:00.000Z",
      round: "League Stage - 1",
      stage: "league_phase",
      venue: "Test Arena",
      homeTeamId: 3,
      homeTeamName: "Gamma City",
      homeTeamLogo: null,
      awayTeamId: 4,
      awayTeamName: "Delta Town",
      awayTeamLogo: null,
      status: "FT",
      statusShort: "FT",
      elapsed: null,
      homeScore: 2,
      awayScore: 1,
      aggregateHome: null,
      aggregateAway: null,
      penaltyHome: null,
      penaltyAway: null,
    },
  ],
};

const mockStandings = {
  configured: true,
  competitionKey: "ucl",
  league: "UEFA Champions League",
  leagueId: 2,
  season: 2026,
  standingsAvailable: true,
  source: "api-football",
  fetchedAt: "2026-07-31T12:00:00.000Z",
  standings: [
    {
      rank: 1,
      teamId: 1,
      teamName: "Alpha FC",
      teamLogo: null,
      played: 1,
      win: 1,
      draw: 0,
      lose: 0,
      goalsFor: 2,
      goalsAgainst: 0,
      goalDiff: 2,
      points: 3,
      form: "W",
      description: null,
      group: null,
    },
  ],
};

for (const viewport of VIEWPORTS) {
  test.describe(`UCL hub (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("loads identity, fixtures, results, standings with mocked provider", async ({
      page,
    }) => {
      await page.route("**/api/ucl/fixtures**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockFixtures),
        });
      });
      await page.route("**/api/ucl/standings**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockStandings),
        });
      });

      await page.goto("/champions-league");

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        /UEFA Champions League/i,
      );
      await expect(page.getByRole("heading", { name: "Fixtures" })).toBeVisible();
      await expect(page.getByLabel("Fixtures", { exact: true }).getByText("Alpha FC")).toBeVisible();
      await expect(page.getByLabel("Fixtures", { exact: true }).getByText("Beta United")).toBeVisible();
      await expect(page.getByRole("heading", { name: "Recent results" })).toBeVisible();
      await expect(page.getByText("Gamma City")).toBeVisible();
      await expect(page.getByRole("heading", { name: "Standings" })).toBeVisible();
      await expect(page.getByRole("table")).toBeVisible();

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > doc.clientWidth + 1;
      });
      expect(overflow).toBe(false);

      await page.keyboard.press("Tab");
      const activeTag = await page.evaluate(() => document.activeElement?.tagName);
      expect(activeTag).toBeTruthy();
    });

    test("shows unavailable standings and empty fixtures understandably", async ({
      page,
    }) => {
      await page.route("**/api/ucl/fixtures**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...mockFixtures,
            fixtures: [],
            source: "fallback",
          }),
        });
      });
      await page.route("**/api/ucl/standings**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...mockStandings,
            standings: [],
            standingsAvailable: false,
            source: "fallback",
          }),
        });
      });

      await page.goto("/champions-league");
      await expect(page.getByText("No upcoming fixtures")).toBeVisible();
      await expect(page.getByText("Standings unavailable")).toBeVisible();
    });

    test("shows understandable error state", async ({ page }) => {
      await page.route("**/api/ucl/fixtures**", async (route) => {
        await route.fulfill({ status: 500, body: "nope" });
      });
      await page.route("**/api/ucl/standings**", async (route) => {
        await route.fulfill({ status: 500, body: "nope" });
      });

      await page.goto("/champions-league");
      await expect(page.getByTestId("ucl-hub-error")).toBeVisible();
      await expect(page.getByTestId("ucl-hub-error")).toContainText(/Could not load hub/i);
    });

    test("locale-safe path works", async ({ page }) => {
      await page.route("**/api/ucl/fixtures**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockFixtures),
        });
      });
      await page.route("**/api/ucl/standings**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockStandings),
        });
      });

      await page.goto("/es/champions-league");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        /UEFA Champions League/i,
      );
    });
  });
}