import { test, expect } from "@playwright/test";
import { preparePage, gotoApp, waitForShell } from "./helpers/test-utils";

async function switchLocale(
  page: import("@playwright/test").Page,
  code: "ES" | "EN" | "FR" | "DE",
) {
  const languageButton = page.getByRole("button", { name: /Language|Langue|Idioma/i });
  await languageButton.hover();
  const option = page.getByRole("menuitem", { name: code, exact: true });
  await expect(option).toBeVisible({ timeout: 10_000 });
  await option.click();
}

test.describe("Locale switcher", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("switches to Spanish and back to English", async ({ page }) => {
    await gotoApp(page, "/");

    await switchLocale(page, "ES");
    await expect(page).toHaveURL(/\/es(\/|$)/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await waitForShell(page);
    await expect(
      page.getByRole("navigation", { name: /Main navigation|Navegación principal/i }),
    ).toBeVisible();

    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/(en\/)?$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });

  test("switches to French on favourites page", async ({ page }) => {
    await gotoApp(page, "/favourites");

    await switchLocale(page, "FR");
    await expect(page).toHaveURL(/\/fr\/favourites/);
    await waitForShell(page);
    await expect(
      page.getByRole("heading", { level: 1, name: /Favoris/i }),
    ).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Mobile bottom navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await preparePage(page);
  });

  test("bottom tabs navigate to scores and favourites", async ({ page }) => {
    await gotoApp(page, "/");

    const mobileNav = page.getByRole("navigation", {
      name: "Mobile bottom navigation",
    });
    await expect(mobileNav).toBeVisible();

    await mobileNav.getByRole("link", { name: /^Scores$/i }).click();
    await expect(page).toHaveURL(/\/live/);
    await waitForShell(page);

    await mobileNav.getByRole("link", { name: /Favourites|Favoris|Favoritos/i }).click();
    await expect(page).toHaveURL(/\/favourites/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Favourites|Favoris|Favoritos/i }),
    ).toBeVisible();
  });

  test("Competitions sheet opens from mobile tab bar", async ({ page }) => {
    await gotoApp(page, "/");

    const competitionsButton = page.getByRole("button", { name: /Competitions/i });
    await expect(competitionsButton).toBeVisible();
    await competitionsButton.click();
    await expect(page.locator("#gc-mobile-competitions-sheet")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('a[href="/community-shield"]').last()).toBeVisible();
  });

  test("More sheet opens from mobile tab bar", async ({ page }) => {
    await gotoApp(page, "/");

    const moreButton = page.getByRole("button", {
      name: /Open more navigation|Ouvrir|Abrir/i,
    });
    await expect(moreButton).toBeVisible();
    await moreButton.click();

    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("navigation", { name: /Open more navigation|Ouvrir|Abrir/i }),
    ).toBeVisible();
  });
});
