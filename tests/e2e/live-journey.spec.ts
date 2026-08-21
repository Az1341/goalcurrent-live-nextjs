import { test, expect, type Page } from "@playwright/test";
import { preparePage, gotoApp, runAxeScan, waitForShell } from "./helpers/test-utils";

function futureKickoffUtc(daysAhead = 14): string {
  return new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();
}

async function mockFutureCommunityShieldFixture(page: Page): Promise<void> {
  await page.route("**/api/community-shield/fixture", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        configured: true,
        competition: "FA Community Shield",
        season: 2026,
        source: "fallback",
        fetchedAt: new Date().toISOString(),
        fixtures: [
          {
            fixtureId: 1582365,
            kickoffUtc: futureKickoffUtc(14),
            matchweek: null,
            round: "Final",
            venue: "Principality Stadium, Cardiff",
            homeTeamId: 42,
            homeTeamName: "Arsenal",
            homeTeamLogo: null,
            awayTeamId: 50,
            awayTeamName: "Manchester City",
            awayTeamLogo: null,
            status: "UPCOMING",
            statusShort: "NS",
            elapsed: null,
            homeScore: null,
            awayScore: null,
            broadcaster: null,
          },
        ],
      }),
    });
  });
}

test.describe("Scores journey", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("homepage to scores to a current competition hub", async ({ page }) => {
    await mockFutureCommunityShieldFixture(page);
    await gotoApp(page, "/");
    await runAxeScan(page, "homepage-start");

    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Scores", exact: true })
      .click();
    await expect(page).toHaveURL(/\/live/);
    await waitForShell(page);

    await expect(
      page.getByRole("heading", { name: /Live and upcoming/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: /Upcoming competitions/i }),
    ).toBeVisible({ timeout: 30_000 });

    const competitionLink = page.locator('main a[href="/community-shield"]').first();
    await expect(competitionLink).toBeVisible({ timeout: 30_000 });
    await runAxeScan(page, "scores-centre");

    await competitionLink.click();
    await expect(page).toHaveURL(/\/community-shield/);
    await waitForShell(page);
    await expect(page.getByText(/Arsenal/i).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Manchester City/i).first()).toBeVisible();

    await runAxeScan(page, "community-shield");
  });
});
