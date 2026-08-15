import { test, expect } from "@playwright/test";
import { preparePage, gotoApp } from "./helpers/test-utils";

test.describe("Articles hub", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("loads articles index", async ({ page }) => {
    await gotoApp(page, "/articles");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('a[href*="/articles/"]').first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("404 page", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("shows not found for unknown route", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist-404-test", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /not found/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("link", { name: /return home/i })).toBeVisible();
  });
});

test.describe("Premier League hub", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("loads PL landing page", async ({ page }) => {
    await gotoApp(page, "/premier-league");
    await expect(page.getByRole("heading", { name: /Premier League/i }).first()).toBeVisible({ timeout: 15_000 });
  });
});
