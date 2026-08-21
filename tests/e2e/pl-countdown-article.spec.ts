import { test, expect } from "@playwright/test";
import { preparePage, gotoApp } from "./helpers/test-utils";

const ARTICLE_PATH = "/articles/premier-league-2026-27-two-weeks-out";

/** Headline patterns that should appear while pre-kickoff or on kickoff day. */
const VALID_HEADLINE_RX = /to Kick-Off|Kick-Off Day/i;

/** Body timing phrases — one of these should always appear in the article body. */
const VALID_BODY_TIMING_RX = /kicks off (today|tomorrow|in \d+ days)/i;

/** "7 August 2026" must never appear stale in the live H1. */
const STALE_DATE_RX = /Two Weeks to Kick-Off/i;

test.describe("PL countdown article — desktop journey", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("article route loads and returns 200", async ({ page }) => {
    const response = await page.goto(ARTICLE_PATH, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
  });

  test("H1 is visible and contains a valid countdown headline", async ({ page }) => {
    await gotoApp(page, ARTICLE_PATH);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible({ timeout: 15_000 });
    const text = await h1.textContent();
    expect(text).toMatch(VALID_HEADLINE_RX);
    expect(text).toMatch(/Premier League 2026\/27/);
  });

  test("article body contains fresh timing copy", async ({ page }) => {
    await gotoApp(page, ARTICLE_PATH);
    const body = page.locator("article");
    await expect(body).toBeVisible({ timeout: 15_000 });
    const bodyText = await body.textContent();
    expect(bodyText).toMatch(VALID_BODY_TIMING_RX);
  });

  test("H1 does not show stale 'Two Weeks' copy after that day has passed", async ({ page }) => {
    await gotoApp(page, ARTICLE_PATH);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible({ timeout: 15_000 });
    const text = await h1.textContent() ?? "";
    // On days after Aug 7, the headline must have updated beyond "Two Weeks"
    // unless today genuinely is 14 days before kickoff.
    const todayMs = Date.now();
    const kickoffMs = Date.parse("2026-08-21T19:00:00.000Z");
    const daysLeft = Math.max(0, Math.round((Date.parse("2026-08-21T00:00:00.000Z") - Date.parse(new Date(todayMs).toLocaleDateString("en-CA", { timeZone: "Europe/London" }) + "T00:00:00.000Z")) / 86_400_000));
    if (daysLeft !== 14) {
      // "Two Weeks" would be factually wrong — must not appear as full headline
      expect(text).not.toMatch(STALE_DATE_RX);
    }
  });

  test("article has no horizontal overflow at 1280px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoApp(page, ARTICLE_PATH);
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test("article is discoverable from /articles index", async ({ page }) => {
    await gotoApp(page, "/articles");
    const link = page.locator(`a[href*="premier-league-2026-27-two-weeks-out"]`).first();
    await expect(link).toBeVisible({ timeout: 15_000 });
  });

  test("no console errors on article page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await gotoApp(page, ARTICLE_PATH);
    // Allow tiny grace period for any deferred scripts
    await page.waitForTimeout(500);
    const featureErrors = errors.filter(
      (e) => !e.includes("Extension context") && !e.includes("Non-Error exception"),
    );
    expect(featureErrors).toHaveLength(0);
  });
});

test.describe("PL countdown article — mobile 390px viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("article loads at 390px and H1 is visible", async ({ page }) => {
    await gotoApp(page, ARTICLE_PATH);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible({ timeout: 15_000 });
    const text = await h1.textContent();
    expect(text).toMatch(VALID_HEADLINE_RX);
  });

  test("no horizontal overflow at 390px", async ({ page }) => {
    await gotoApp(page, ARTICLE_PATH);
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test("hero image is visible and renders within viewport at 390px", async ({ page }) => {
    await gotoApp(page, ARTICLE_PATH);
    const hero = page.locator("img").first();
    await expect(hero).toBeVisible({ timeout: 15_000 });
    const box = await hero.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(395);
    }
  });

  test("body timing copy visible on mobile", async ({ page }) => {
    await gotoApp(page, ARTICLE_PATH);
    const body = page.locator("article");
    await expect(body).toBeVisible({ timeout: 15_000 });
    const bodyText = await body.textContent();
    expect(bodyText).toMatch(VALID_BODY_TIMING_RX);
  });
});

test.describe("Community Shield countdown regression guard", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("homepage still loads and renders kickoff countdown section", async ({ page }) => {
    await gotoApp(page, "/");
    // The kickoff countdown section should still exist on the homepage
    const section = page.locator("section").filter({ hasText: /Arsenal|Premier League|Community Shield/i }).first();
    await expect(section).toBeVisible({ timeout: 20_000 });
  });
});
