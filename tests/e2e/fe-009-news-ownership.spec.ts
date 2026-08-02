import { expect, test } from "@playwright/test";
import { gotoApp, preparePage } from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`FE-009 news ownership (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("news hub renders from shared feed owner", async ({ page }) => {
      await preparePage(page);
      await gotoApp(page, "/en/news");

      await expect(
        page.getByRole("heading", { name: /Latest Football News/i }),
      ).toBeVisible();

      // Either articles or the explicit error state — never a blank crash.
      const hasCards = await page.locator("main a, main article").count();
      const hasError = await page
        .getByText("Unable to load data. Please try again shortly.")
        .count();
      expect(hasCards + hasError).toBeGreaterThan(0);
    });
  });
}
