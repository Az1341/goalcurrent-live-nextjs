import { expect, test } from "@playwright/test";
import { gotoApp, preparePage, STABLE_MATCH_FIXTURE_ID } from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const FINISHED_SCORES = {
  matches: [
    {
      fixtureId: STABLE_MATCH_FIXTURE_ID,
      matchNumber: 1,
      status: "FT",
      statusShort: "FT",
      elapsed: null,
      homeScore: 2,
      awayScore: 1,
      kickoffUtc: "2026-06-11T19:00:00Z",
      apiFixtureId: 900001,
    },
  ],
  fetchedAt: "2026-07-26T12:00:00.000Z",
  configured: true,
};

const MATCH_DETAIL = {
  fixtureId: STABLE_MATCH_FIXTURE_ID,
  configured: true,
  apiAvailable: true,
  fetchedAt: "2026-07-26T12:00:00.000Z",
  events: [],
  lineups: { home: null, away: null },
  statistics: [],
  playerStats: [],
};

for (const viewport of VIEWPORTS) {
  test.describe(`FE-015 finished-match poll stop (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("finished match detail does not keep polling after settle", async ({
      page,
    }) => {
      await preparePage(page);

      await page.route("**/api/wc26/scores**", async (route) => {
        const url = route.request().url();
        if (url.includes("live=true")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(FINISHED_SCORES),
          });
          return;
        }
        await route.continue();
      });

      await page.route("**/api/wc26/match/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MATCH_DETAIL),
        });
      });

      const matchHits: string[] = [];
      page.on("request", (req) => {
        if (req.url().includes("/api/wc26/match/")) {
          matchHits.push(req.url());
        }
      });

      await gotoApp(page, `/en/match/${STABLE_MATCH_FIXTURE_ID}`);
      await expect(page.locator("#match-header-title")).toBeVisible({
        timeout: 30_000,
      });

      await page.waitForTimeout(3_000);
      const settled = matchHits.length;
      expect(settled, "expected at least one initial match-detail fetch").toBeGreaterThan(
        0,
      );

      await page.waitForTimeout(16_000);
      expect(
        matchHits.length,
        `finished match must not 15s-poll (settled=${settled}, after=${matchHits.length})`,
      ).toBe(settled);
    });
  });
}
