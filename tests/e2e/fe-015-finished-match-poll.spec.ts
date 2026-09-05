import { expect, test } from "@playwright/test";
import { gotoApp, preparePage, STABLE_MATCH_FIXTURE_ID } from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`FE-015 retired WC26 match polling (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("finished match detail never starts retired provider polling", async ({
      page,
    }) => {
      await preparePage(page);

      const retiredHits: string[] = [];
      page.on("request", (req) => {
        const url = req.url();
        if (url.includes("/api/wc26/") && !url.includes("/api/wc26/scores")) {
          retiredHits.push(url);
        }
      });

      await gotoApp(page, `/en/match/${STABLE_MATCH_FIXTURE_ID}`);
      await expect(page.locator("#match-header-title")).toBeVisible({
        timeout: 30_000,
      });

      await page.waitForTimeout(3_000);
      expect(retiredHits).toEqual([]);
    });
  });
}
