import { test, expect } from "@playwright/test";
import { preparePage, gotoApp, waitForShell } from "./helpers/test-utils";

const MOBILE = { width: 390, height: 844 };

test.describe("Mobile critical football journeys", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await preparePage(page);
  });

  test("homepage through tabs, competitions, standings, more, and home return", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await gotoApp(page, "/");
    await waitForShell(page);
    await expect(page.locator("main").first()).toBeVisible();

    const mobileNav = page.getByRole("navigation", {
      name: "Mobile bottom navigation",
    });
    await expect(mobileNav).toBeVisible();

    await mobileNav.getByRole("link", { name: /^Scores$/i }).click();
    await expect(page).toHaveURL(/\/live/);
    await waitForShell(page);
    await expect(page.getByRole("heading", { name: /Live and upcoming/i })).toBeVisible();

    await gotoApp(page, "/");
    await waitForShell(page);
    await mobileNav.getByRole("button", { name: /Competitions/i }).click();
    const competitionSheet = page.locator("#gc-mobile-competitions-sheet");
    await expect(competitionSheet).toBeVisible({ timeout: 10_000 });
    await expect(competitionSheet.locator('a[href="/community-shield"]')).toBeVisible();

    await gotoApp(page, "/worldcup2026/standings");
    await waitForShell(page);
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page.locator("main")).toContainText(/Pts|Points|GD|Group/i);

    await gotoApp(page, "/");
    await waitForShell(page);
    const moreButton = page.getByRole("button", {
      name: /Open more navigation|Ouvrir|بیشتر/i,
    });
    await expect(moreButton).toBeVisible();
    await moreButton.click();
    const moreSheet = page.locator('[data-gc-chrome="more-sheet"]');
    await expect(moreSheet).toBeVisible({ timeout: 10_000 });

    await moreSheet.getByRole("button", { name: /Close|Fermer|بستن/i }).click();
    await expect(moreSheet).toBeHidden({ timeout: 10_000 });

    await mobileNav.getByRole("link", { name: /^Home$|خانه|Accueil/i }).click();
    await expect(page).toHaveURL(/\/(en\/)?$/);
    await waitForShell(page);

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth - doc.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);

    const fatal = consoleErrors.filter(
      (e) => !/favicon|ResizeObserver|Hydration|YOUTUBE_API_KEY|401/i.test(e),
    );
    expect(fatal, `console errors: ${fatal.join(" | ")}`).toEqual([]);
  });
});
