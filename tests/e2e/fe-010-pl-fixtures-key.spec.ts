import { expect, test } from "@playwright/test";
import { gotoApp, preparePage } from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`FE-010 PL fixtures key (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("homepage and PL hub share one /api/pl/fixtures network key", async ({
      page,
    }) => {
      const fixtureHits: string[] = [];
      page.on("request", (req) => {
        const url = req.url();
        if (url.includes("/api/pl/fixtures")) {
          const path = new URL(url).pathname;
          fixtureHits.push(path);
        }
      });

      await preparePage(page);
      await gotoApp(page, "/en");
      await expect(page.locator("[data-gc-home-v5]").first()).toBeVisible({
        timeout: 30_000,
      });

      await gotoApp(page, "/en/premier-league");
      await expect(
        page.getByRole("heading", { name: /Premier League/i }).first(),
      ).toBeVisible({ timeout: 30_000 });

      for (const path of fixtureHits) {
        expect(path).toBe("/api/pl/fixtures");
      }
      expect(new Set(fixtureHits).size).toBeLessThanOrEqual(1);
    });
  });
}
