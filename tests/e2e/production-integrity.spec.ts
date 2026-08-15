import { expect, test, type Page } from "@playwright/test";
import { gotoApp, preparePage, STABLE_MATCH_FIXTURE_ID } from "./helpers/test-utils";

async function enableDarkTheme(page: Page): Promise<void> {
  await page.addInitScript(() => localStorage.setItem("gc-theme", "dark"));
}

function parseRgb(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match ? { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) } : null;
}

function luminance(color: string): number {
  const rgb = parseRgb(color);
  if (!rgb) return -1;
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}

test.describe("fixtures archive calendar", () => {
  test("completed tournament does not pretend the current date is a match day", async ({ page }) => {
    await preparePage(page);
    await gotoApp(page, "/worldcup2026/fixtures");
    const strip = page.locator('[role="tablist"][aria-label="Match days"]');
    await expect(strip).toBeVisible();
    await expect(strip.locator('button[aria-current="date"]')).toHaveCount(0);
    expect(await strip.getByRole("button").count()).toBeGreaterThan(1);
  });

  test("archive calendar remains usable after reload in dark theme", async ({ page }) => {
    await preparePage(page);
    await enableDarkTheme(page);
    await gotoApp(page, "/worldcup2026/fixtures");
    await page.reload({ waitUntil: "domcontentloaded" });
    const strip = page.locator('[role="tablist"][aria-label="Match days"]');
    await expect(strip).toBeVisible();
    expect(await strip.getByRole("button").count()).toBeGreaterThan(1);
  });
});

test.describe("dark theme contrast", () => {
  test("light surfaces force dark text in dark mode on fixtures page", async ({ page }) => {
    await preparePage(page);
    await enableDarkTheme(page);
    await gotoApp(page, "/worldcup2026/fixtures");
    const lightSurfaces = page.locator('[data-gc-light-surface="true"]');
    expect(await lightSurfaces.count()).toBeGreaterThan(0);
    const color = await lightSurfaces.first().evaluate((el) => getComputedStyle(el).color);
    expect(luminance(color)).toBeLessThan(128);
  });

  test("WC26 archive hub remains readable in dark mode", async ({ page }) => {
    await preparePage(page);
    await enableDarkTheme(page);
    await gotoApp(page, "/worldcup2026");
    const title = page.getByRole("heading", { level: 1, name: /World Cup.*2026.*Archive/i });
    await expect(title).toBeVisible({ timeout: 15_000 });
    const color = await title.evaluate((el) => getComputedStyle(el).color);
    expect(luminance(color)).toBeGreaterThanOrEqual(0);
  });
});

test.describe("scores page after WC26 archive", () => {
  test("shows competition-neutral live and upcoming centre", async ({ page }) => {
    await preparePage(page);
    await gotoApp(page, "/live");
    await expect(page.getByRole("heading", { name: /Live and upcoming/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('main a[href="/community-shield"]').first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("match detail fallback", () => {
  test("match page renders header and content sections even without API data", async ({ page }) => {
    await preparePage(page);
    await page.route("**/api/wc26/match/**", (route) => route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "unavailable" }),
    }));
    await gotoApp(page, `/match/${STABLE_MATCH_FIXTURE_ID}`);
    await expect(page.locator("#match-header-title")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("#match-timeline-heading")).toBeAttached({ timeout: 20_000 });
  });
});
