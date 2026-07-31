import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const mockFixtures = {
  configured: true,
  competitionKey: "facup",
  league: "FA Cup",
  leagueId: 45,
  season: 2026,
  standingsSupported: false,
  source: "api-football",
  fetchedAt: "2026-07-31T12:00:00.000Z",
  fixtures: [
    {
      fixtureId: 910001,
      kickoffUtc: "2026-11-08T15:00:00.000Z",
      round: "1st Round",
      roundKind: "first_round",
      roundLabel: "1st Round",
      venue: "Test Ground",
      homeTeamId: 1,
      homeTeamName: "Non League FC",
      homeTeamLogo: null,
      awayTeamId: 2,
      awayTeamName: "League Side",
      awayTeamLogo: null,
      status: "UPCOMING",
      statusShort: "NS",
      elapsed: null,
      homeScore: null,
      awayScore: null,
      penaltyHome: null,
      penaltyAway: null,
      isReplay: false,
    },
    {
      fixtureId: 910002,
      kickoffUtc: "2026-01-10T15:00:00.000Z",
      round: "3rd Round",
      roundKind: "third_round",
      roundLabel: "3rd Round",
      venue: "Old Trafford",
      homeTeamId: 3,
      homeTeamName: "United A",
      homeTeamLogo: null,
      awayTeamId: 4,
      awayTeamName: "City B",
      awayTeamLogo: null,
      status: "AET",
      statusShort: "AET",
      elapsed: null,
      homeScore: 2,
      awayScore: 1,
      penaltyHome: null,
      penaltyAway: null,
      isReplay: false,
    },
    {
      fixtureId: 910003,
      kickoffUtc: "2026-02-01T17:30:00.000Z",
      round: "4th Round",
      roundKind: "fourth_round",
      roundLabel: "4th Round",
      venue: "Wembley",
      homeTeamId: 5,
      homeTeamName: "Reds",
      homeTeamLogo: null,
      awayTeamId: 6,
      awayTeamName: "Blues",
      awayTeamLogo: null,
      status: "PEN",
      statusShort: "PEN",
      elapsed: null,
      homeScore: 1,
      awayScore: 1,
      penaltyHome: 5,
      penaltyAway: 4,
      isReplay: false,
    },
  ],
};

for (const viewport of VIEWPORTS) {
  test.describe(`FA Cup hub (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("loads identity, fixtures, results, rounds without standings", async ({
      page,
    }) => {
      await page.route("**/api/facup/fixtures**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockFixtures),
        });
      });

      await page.goto("/fa-cup");

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(/FA Cup/i);
      await expect(
        page.getByRole("heading", { name: "Upcoming fixtures" }),
      ).toBeVisible();
      await expect(
        page.getByLabel("Upcoming fixtures", { exact: true }).getByText("Non League FC"),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Recent results" }),
      ).toBeVisible();
      await expect(
        page.getByLabel("Recent results", { exact: true }).getByText("United A"),
      ).toBeVisible();
      await expect(
        page.getByLabel("Recent results", { exact: true }).getByText("AET", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByLabel("Recent results", { exact: true }).getByText("PEN", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByLabel("Recent results", { exact: true }).getByText("(5-4 p)"),
      ).toBeVisible();
      await expect(page.getByRole("heading", { name: "By round" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "1st Round", level: 3 })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Standings" })).toHaveCount(0);
      await expect(page.getByRole("table")).toHaveCount(0);

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > doc.clientWidth + 1;
      });
      expect(overflow).toBe(false);

      await page.keyboard.press("Tab");
      const activeTag = await page.evaluate(() => document.activeElement?.tagName);
      expect(activeTag).toBeTruthy();
    });

    test("shows empty state", async ({ page }) => {
      await page.route("**/api/facup/fixtures**", async (route) => {
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

      await page.goto("/fa-cup");
      await expect(page.getByText("No upcoming fixtures")).toBeVisible();
      await expect(page.getByText("No results yet")).toBeVisible();
      await expect(page.getByTestId("facup-empty-rounds")).toBeVisible();
    });

    test("shows stale state", async ({ page }) => {
      await page.route("**/api/facup/fixtures**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...mockFixtures,
            stale: true,
            source: "fallback",
            error: "upstream timeout",
          }),
        });
      });

      await page.goto("/fa-cup");
      await expect(page.getByTestId("facup-hub-stale")).toBeVisible();
      await expect(page.getByTestId("facup-hub-error")).toBeVisible();
    });

    test("shows understandable error state", async ({ page }) => {
      await page.route("**/api/facup/fixtures**", async (route) => {
        await route.fulfill({ status: 500, body: "nope" });
      });

      await page.goto("/fa-cup");
      await expect(page.getByTestId("facup-hub-error")).toBeVisible();
      await expect(page.getByTestId("facup-hub-error")).toContainText(
        /Could not load hub/i,
      );
    });

    test("locale-safe path works", async ({ page }) => {
      await page.route("**/api/facup/fixtures**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockFixtures),
        });
      });

      await page.goto("/fa/fa-cup");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(/FA Cup/i);
    });
  });
}