import { expect, test } from "@playwright/test";
import {
  gotoApp,
  preparePage,
  STABLE_MATCH_FIXTURE_ID,
} from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

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
  test.describe(`BE-004 apiFixtureId ownership (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("match detail journey remains stable; unbound apiFixtureId never 5xx", async ({
      page,
      request,
    }) => {
      await preparePage(page);

      await page.route("**/api/wc26/match/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MATCH_DETAIL),
        });
      });

      await gotoApp(page, `/en/match/${STABLE_MATCH_FIXTURE_ID}`);
      await expect(page.locator("#match-header-title")).toBeVisible({
        timeout: 30_000,
      });

      // APIRequestContext bypasses page.route — hits the real ownership gate.
      const res = await request.get(
        `/api/wc26/match/${STABLE_MATCH_FIXTURE_ID}?apiFixtureId=999001`,
      );
      expect([200, 400]).toContain(res.status());
      expect(res.status()).toBeLessThan(500);
    });
  });
}
