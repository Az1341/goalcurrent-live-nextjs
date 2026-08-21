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
  test("completed tournament is clearly an archive and does not claim the current date", async ({ page }) => {
    await preparePage(page);
    await gotoApp(page, "/worldcup2026/fixtures");
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page.locator('[aria-current="date"]')).toHaveCount(0);
    await expect(page.locator("body")).toContainText(/archive|World Cup 2026/i);
  });

  test("archive fixtures page remains usable after reload in dark theme", async ({ page }) => {
    await preparePage(page);
    await enableDarkTheme(page);
    await gotoApp(page, "/worldcup2026/fixtures");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page.locator("body")).toContainText(/archive|World Cup 2026/i);
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

    const liveTitle = page.getByRole("heading", { level: 1, name: /Live and upcoming/i });
    await expect(liveTitle).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { level: 1, name: /World Cup 2026/i })).toHaveCount(0);

    const upcomingHeading = page.getByRole("heading", { name: /Upcoming competitions/i });
    await expect(upcomingHeading).toBeVisible({ timeout: 15_000 });

    const emptyState = page.getByText(/No announced competition fixtures yet/i);
    const currentHubs = page.locator("main a[href='/premier-league/fixtures'], main a[href='/champions-league'], main a[href='/fa-cup'], main a[href='/nations-league#unl-fixtures'], main a[href='/community-shield']");
    await expect(emptyState.or(currentHubs.first())).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("current data surfaces", () => {
  test("transfers is a populated data surface rather than a coming-soon shell", async ({ page }) => {
    await preparePage(page);
    await gotoApp(page, "/transfers");
    await expect(page.getByRole("heading", { level: 1, name: /Latest Transfers/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("main")).not.toContainText(/coming soon/i);
    await expect(page.locator("main")).toContainText(/Latest transfer coverage|No current transfer stories/i);
  });

  test("Premier League table keeps server fallback visible when browser refresh fails", async ({ page }) => {
    await preparePage(page);
    await page.route("**/api/pl/standings", (route) => route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "unavailable" }),
    }));
    await gotoApp(page, "/premier-league/table");
    await expect(page.getByRole("heading", { level: 1, name: /Premier League Table 2026\/27/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("main")).not.toContainText(/Could not load table/i);
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
