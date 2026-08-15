import { test, expect, type Page, type TestInfo } from "@playwright/test";
import {
  preparePage,
  STABLE_MATCH_FIXTURE_ID,
  VISUAL_VIEWPORTS,
  gotoApp,
} from "./helpers/test-utils";

const PAGES = [
  { name: "homepage", path: "/" },
  { name: "wc26-standings", path: "/worldcup2026/standings" },
  { name: "match-detail", path: `/match/${STABLE_MATCH_FIXTURE_ID}` },
] as const;

async function expectNoDocumentOverflow(page: Page): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));

  expect(
    dimensions.documentWidth,
    `document width ${dimensions.documentWidth}px exceeds ${dimensions.viewportWidth}px viewport`,
  ).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
}

async function attachVisualEvidence(
  page: Page,
  testInfo: TestInfo,
  name: string,
  viewportWidth: number,
): Promise<void> {
  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach(`${name}-${viewportWidth}.png`, {
    body: screenshot,
    contentType: "image/png",
  });
}

async function waitForHomepageStable(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Live Football/i, {
    timeout: 30_000,
  });
  await page
    .locator('section[aria-labelledby="home-news-heading"]')
    .waitFor({ state: "visible", timeout: 30_000 });
  await expect(page.locator('[class*="animate-skeleton-shimmer"]')).toHaveCount(0, {
    timeout: 30_000,
  });
}

async function assertHomepageContract(page: Page, viewportWidth: number): Promise<void> {
  await waitForHomepageStable(page);
  await expect(page.locator("body")).toContainText(/Community Shield/i);
  await expect(page.locator("body")).toContainText(/Advertisement/i);
  await expect(page.locator("body")).toContainText(/SEPANAI\.COM/i);
  await expect(page.locator("body")).toContainText(/SocialMedia/i);
  await expect(page.locator("body")).toContainText(/FAMVI/i);
  await expect(page.locator("body")).toContainText(/Your Family.?s Chief of Staff/i);
  await expect(page.locator('img[src="/sepanai-mark.svg"]').first()).toBeVisible();
  await expect(page.locator('img[src="/famvi-wordmark-inline.svg"]').first()).toBeVisible();
  await expect(page.locator("video").first()).toBeVisible();
  await expectNoDocumentOverflow(page);

  if (viewportWidth === 390) {
    await expect(page.locator('[data-gc-mobile-nav], nav[aria-label*="mobile" i]').first()).toBeVisible();
  }
}

async function assertArchiveContract(page: Page): Promise<void> {
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("body")).toContainText(/World Cup/i);
  await expect(page.locator("body")).toContainText(/standings/i);
  await expectNoDocumentOverflow(page);
}

async function assertMatchContract(page: Page): Promise<void> {
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("#match-header-title")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("#match-timeline-heading")).toBeAttached({ timeout: 20_000 });
  await expectNoDocumentOverflow(page);
}

test.describe("Visual release contract", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  for (const viewportWidth of VISUAL_VIEWPORTS) {
    for (const { name, path } of PAGES) {
      test(`${name} at ${viewportWidth}px`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width: viewportWidth, height: 900 });
        await gotoApp(page, path);

        if (name === "homepage") {
          await assertHomepageContract(page, viewportWidth);
        } else if (name === "wc26-standings") {
          await assertArchiveContract(page);
        } else {
          await assertMatchContract(page);
        }

        await attachVisualEvidence(page, testInfo, name, viewportWidth);
      });
    }
  }
});
