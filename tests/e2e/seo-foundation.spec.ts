import { expect, test } from "@playwright/test";

test("Premier League hub exposes an apex canonical and stays indexable", async ({ page }) => {
  const response = await page.goto("/premier-league", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://goalcurrent.live/premier-league",
  );

  const robots = page.locator('meta[name="robots"]');
  if ((await robots.count()) > 0) {
    await expect(robots).not.toHaveAttribute("content", /noindex/i);
  }
});

test("retired Arabic and Persian locale URLs permanently consolidate to English", async ({ page }) => {
  await page.goto("/ar/articles", { waitUntil: "domcontentloaded" });
  expect(new URL(page.url()).pathname).toBe("/articles");

  await page.goto("/fa/premier-league/table", { waitUntil: "domcontentloaded" });
  expect(new URL(page.url()).pathname).toBe("/premier-league/table");
});

test("robots and sitemap advertise only the canonical apex origin", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const robotsBody = await robots.text();
  expect(robotsBody).toContain("Sitemap: https://goalcurrent.live/sitemap.xml");
  expect(robotsBody).not.toContain("www.goalcurrent.live");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(sitemap.headers()["content-type"]).toContain("application/xml");
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).toContain("https://goalcurrent.live/");
  expect(sitemapBody).not.toContain("https://www.goalcurrent.live/");
  expect(sitemapBody).not.toContain("/ar/");
  expect(sitemapBody).not.toContain("/fa/");
});

test("invalid Premier League match URLs return a real 404", async ({ request }) => {
  const response = await request.get("/premier-league/match/not-a-fixture");
  expect(response.status()).toBe(404);
  expect(await response.text()).toMatch(/noindex/i);
});

test("World Cup video page does not fall back to cross-sport content", async ({ page }) => {
  const response = await page.goto("/videos/world-cup", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: /World Cup 2026 Videos/i })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/ICC|T20|cricket|wicket|innings/i);
});
