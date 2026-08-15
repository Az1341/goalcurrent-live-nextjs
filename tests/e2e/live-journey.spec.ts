import { test, expect } from "@playwright/test";
import { preparePage, gotoApp, runAxeScan, waitForShell } from "./helpers/test-utils";

test.describe("Scores journey", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("homepage to scores to Community Shield", async ({ page }) => {
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

    const shieldLink = page.locator('main a[href="/community-shield"]').first();
    await expect(shieldLink).toBeVisible({ timeout: 30_000 });
    await runAxeScan(page, "scores-centre");

    await shieldLink.click();
    await expect(page).toHaveURL(/\/community-shield/);
    await waitForShell(page);
    await expect(page.getByText(/Arsenal/i).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Manchester City/i).first()).toBeVisible();

    await runAxeScan(page, "community-shield");
  });
});
