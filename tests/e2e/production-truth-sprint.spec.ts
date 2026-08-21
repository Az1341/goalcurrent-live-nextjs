import { test, expect } from "@playwright/test";
import { preparePage, gotoApp } from "./helpers/test-utils";

test.describe("Production truth remediation sprint", () => {
  test("homepage prioritises current football and excludes WC26 archive content", async ({ page }) => {
    await preparePage(page);
    await gotoApp(page, "/");
    const leagues = page.getByRole("region", { name: /Teams & Leagues/i });
    await expect(
      leagues.getByRole("link", { name: /Premier League 26\/27/i }).first(),
    ).toBeVisible();
    await expect(page.getByText("World Cup 2026 Archive")).not.toBeVisible();
    await expect(page.getByText("Brazil")).not.toBeVisible();
  });

  test("live centre is competition-neutral after WC26 archive", async ({ page }) => {
    await preparePage(page);
    await gotoApp(page, "/live");
    await expect(
      page.getByRole("heading", { level: 1, name: /Live and upcoming/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: /World Cup 2026 Archive/i }),
    ).toHaveCount(0);
    await expect(
      page.getByText(
        /Next announced fixtures across Premier League, Champions League, FA Cup and Nations League/i,
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Upcoming competitions/i }),
    ).toBeVisible();
  });

  test("Premier League hub renders meaningful SSR shell content", async ({ page }) => {
    await preparePage(page);
    await gotoApp(page, "/premier-league");
    await expect(
      page.getByRole("heading", { name: /Premier League 2026\/27/i }),
    ).toBeVisible();
    await expect(page.getByText("Loading hub")).not.toBeVisible();
    await expect(page.getByText("Explore")).toBeVisible();
  });

  test("World Cup archive calendar defaults within tournament bounds", async ({ page }) => {
    await preparePage(page);
    await gotoApp(page, "/worldcup2026/fixtures");
    await expect(
      page.getByRole("paragraph").filter({ hasText: /^World Cup 2026 Archive$/ }),
    ).toBeVisible();
    await expect(page.getByText("Tuesday, 21 July 2026")).not.toBeVisible();
  });

  test("completed archived match avoids permanent loading header", async ({ page }) => {
    await preparePage(page);
    await gotoApp(page, "/match/fixture-091");
    await expect(page.getByText("Loading…")).not.toHaveCount(3);
    await expect(page.getByText(/Full Time|FT/i).first()).toBeVisible();
  });

  test("mobile bottom navigation remains usable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await preparePage(page);
    await gotoApp(page, "/");
    const mobileNav = page.getByRole("navigation", {
      name: "Mobile bottom navigation",
    });
    const scoresTab = mobileNav.getByRole("link", { name: /^Scores$/i });
    await expect(scoresTab).toBeVisible();
    await scoresTab.click();
    await expect(page).toHaveURL(/\/live/);
  });
});
