import { test, expect } from "@playwright/test";
import { gotoApp, preparePage, waitForShell } from "./helpers/test-utils";

test.describe("Team favourites and saved-match integrity", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("mobile user can support Arsenal once and it persists without duplicates", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoApp(page, "/favourites");

    const search = page.getByRole("searchbox", { name: /Add a club or national team/i });
    await search.fill("Arsenal");
    const arsenal = page.getByRole("button", { name: /Arsenal.*Add/i });
    await expect(arsenal).toBeVisible();
    await arsenal.click();

    await expect(page.getByText("Arsenal", { exact: true }).first()).toBeVisible();
    await page.reload();
    await waitForShell(page);

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gc_favourites") || "{}"));
    expect(stored.teams).toEqual(["club:pl:arsenal"]);
  });

  test("national teams can be favourited directly", async ({ page }) => {
    await gotoApp(page, "/favourites");
    const search = page.getByRole("searchbox", { name: /Add a club or national team/i });
    await search.fill("England");
    const england = page.getByRole("button", { name: /England.*Add/i });
    await expect(england).toBeVisible();
    await england.click();

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gc_favourites") || "{}"));
    expect(stored.teams).toHaveLength(1);
    expect(stored.teams[0]).toMatch(/^(national:unl:|eng$)/);
  });

  test("legacy Community Shield favourite renders real teams and never exposes raw id", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "gc_favourites",
        JSON.stringify({
          teams: [],
          matches: ["cs:1582365", "cs:01582365"],
          competitions: [],
        }),
      );
    });
    await gotoApp(page, "/favourites");

    await expect(page.getByText("Arsenal", { exact: true })).toBeVisible();
    await expect(page.getByText("Manchester City", { exact: true })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("cs:1582365");
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gc_favourites") || "{}"));
    expect(stored.matches).toEqual(["cs:1582365"]);
  });

  test("unknown old match shows a recoverable message without exposing provider id", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "gc_favourites",
        JSON.stringify({
          teams: [],
          matches: ["pl:1557367"],
          competitions: [],
        }),
      );
    });
    await gotoApp(page, "/favourites");

    await expect(page.locator("body")).not.toContainText("pl:1557367");
    await expect(page.getByText(/Saved Premier League match unavailable/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Remove" })).toBeVisible();
  });

  test("Arsenal club profile exposes a direct support control", async ({ page }) => {
    await gotoApp(page, "/premier-league/clubs/arsenal");
    const button = page.getByRole("button", { name: /Add Arsenal to favourites/i });
    await expect(button).toBeVisible();
    await button.click();
    await expect(page.getByRole("button", { name: /Remove Arsenal from favourites/i })).toHaveAttribute("aria-pressed", "true");
  });
});
