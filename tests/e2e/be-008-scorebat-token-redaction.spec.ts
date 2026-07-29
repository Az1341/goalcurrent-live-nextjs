import { expect, test } from "@playwright/test";
import { gotoApp, preparePage } from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const FORBIDDEN = ["SCOREBAT_API_TOKEN", "scorebat.com/video-api/v3/feed/?token="];

for (const viewport of VIEWPORTS) {
  test.describe(`BE-008 ScoreBat token hygiene (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("homepage usable; HTML does not expose ScoreBat feed token URLs", async ({
      page,
    }) => {
      await preparePage(page);
      await gotoApp(page, "/en");
      await expect(page.locator('img[src="/logo.svg"]').first()).toBeVisible({
        timeout: 30_000,
      });

      const html = await page.content();
      for (const fragment of FORBIDDEN) {
        expect(html, `must not contain ${fragment}`).not.toContain(fragment);
      }
    });
  });
}