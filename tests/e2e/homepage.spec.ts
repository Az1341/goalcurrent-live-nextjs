import { test, expect } from "@playwright/test";
import { preparePage, gotoApp, runAxeScan } from "./helpers/test-utils";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("loads hero and primary navigation", async ({ page }) => {
    await gotoApp(page, "/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Live Football/i,
    );
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Scores", exact: true }),
    ).toBeVisible();
    await expect(page.locator('img[src="/logo.svg"]')).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /Latest News/i }),
    ).toBeVisible({ timeout: 30_000 });

    await runAxeScan(page, "homepage");
  });
});
