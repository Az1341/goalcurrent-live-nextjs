import { expect, test } from "@playwright/test";
import { gotoApp, preparePage } from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`FE-004 non-live route polling (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("about page does not request WC26 live scores", async ({ page }) => {
      const liveScoreHits: string[] = [];
      page.on("request", (req) => {
        const url = req.url();
        if (url.includes("/api/wc26/scores") && url.includes("live=true")) {
          liveScoreHits.push(url);
        }
      });

      await preparePage(page);
      await gotoApp(page, "/en/about");
      await page.waitForTimeout(2000);

      expect(
        liveScoreHits,
        "Non-live /about must not start WC26 live score polls",
      ).toEqual([]);
    });
  });
}
