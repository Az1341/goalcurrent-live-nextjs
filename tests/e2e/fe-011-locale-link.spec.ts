import { expect, test } from "@playwright/test";
import { gotoApp, preparePage } from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`FE-011 locale Link (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("fa locale keeps prefix on PL hub table navigation", async ({
      page,
    }) => {
      await preparePage(page);
      await gotoApp(page, "/es/premier-league");
      await expect(
        page.getByRole("heading", { name: /Premier League/i }).first(),
      ).toBeVisible({ timeout: 30_000 });

      const tableLink = page.getByRole("link", { name: /Full table/i });
      await expect(tableLink).toBeVisible({ timeout: 30_000 });
      await tableLink.click();
      await expect(page).toHaveURL(/\/fa\/premier-league\/table\/?/);
      await expect(page).not.toHaveURL(/\/fa\/fa\//);
    });

    test("default locale PL hub table link stays unprefixed", async ({
      page,
    }) => {
      await preparePage(page);
      await gotoApp(page, "/en/premier-league");
      await expect(
        page.getByRole("heading", { name: /Premier League/i }).first(),
      ).toBeVisible({ timeout: 30_000 });

      const tableLink = page.getByRole("link", { name: /Full table/i });
      await expect(tableLink).toBeVisible({ timeout: 30_000 });
      await tableLink.click();
      await expect(page).toHaveURL(/\/premier-league\/table\/?$/);
      await expect(page).not.toHaveURL(/\/en\/premier-league\/table/);
    });

    test("fa locale keeps prefix from home news view-all link", async ({
      page,
    }) => {
      await preparePage(page);
      await gotoApp(page, "/fa");
      await expect(page.locator("[data-gc-home-v5]").first()).toBeVisible({
        timeout: 30_000,
      });

      const newsSection = page.locator("section").filter({
        has: page.locator("#home-news-heading"),
      });
      await expect(newsSection).toBeVisible({ timeout: 30_000 });
      const viewAll = newsSection.locator('a[href$="/news"]').first();
      await expect(viewAll).toBeVisible({ timeout: 20_000 });
      const href = await viewAll.getAttribute("href");
      expect(href).toMatch(/\/fa\/news\/?$/);

      await viewAll.click();
      await expect(page).toHaveURL(/\/fa\/news\/?/);
      await expect(page).not.toHaveURL(/\/fa\/fa\//);
    });
  });
}
