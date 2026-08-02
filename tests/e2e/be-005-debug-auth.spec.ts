import { expect, test } from "@playwright/test";
import { gotoApp, preparePage } from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

/** Must match DEBUG_SECRET provided to the Playwright webServer process. */
const PROBE_SECRET = process.env.DEBUG_SECRET?.trim() || "rsr003-playwright-probe";

for (const viewport of VIEWPORTS) {
  test.describe(`BE-005/RSR-003 debug auth (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("fail-closed debug auth; hubs remain usable", async ({
      page,
      request,
    }) => {
      await preparePage(page);
      await gotoApp(page, "/en");
      await expect(page.locator('img[src="/logo.svg"]').first()).toBeVisible({
        timeout: 30_000,
      });

      const unauth = await request.get("/api/debug/wc26");
      expect(unauth.status()).toBe(401);
      const unauthBody = await unauth.text();
      expect(unauthBody).not.toContain(PROBE_SECRET);
      expect(unauthBody.toLowerCase()).not.toContain("cron_secret");
      expect(unauthBody).not.toMatch(/DEBUG_SECRET/i);

      const wrong = await request.get("/api/debug/wc26", {
        headers: { "x-debug-secret": "wrong-secret-probe" },
      });
      expect(wrong.status()).toBe(401);

      const cronBearer = await request.get("/api/debug/wc26", {
        headers: { Authorization: "Bearer cron-secret-probe" },
      });
      expect(cronBearer.status()).toBe(401);

      const cronHeader = await request.get("/api/debug/wc26", {
        headers: { "x-cron-secret": "cron-secret-probe" },
      });
      expect(cronHeader.status()).toBe(401);

      const apiFootballCron = await request.get(
        "/api/debug/api-football?endpoint=fixtures",
        {
          headers: { "x-cron-secret": "cron-secret-probe" },
        },
      );
      expect(apiFootballCron.status()).toBe(401);

      // Correct secret: auth passes. Omit endpoint so validation fails with 400
      // before any upstream football API call.
      const authorized = await request.get("/api/debug/api-football", {
        headers: { "x-debug-secret": PROBE_SECRET },
      });
      expect(authorized.status()).toBe(400);
      const authBody = await authorized.text();
      expect(authBody).not.toContain(PROBE_SECRET);
      expect(authBody).not.toMatch(/DEBUG_SECRET/i);

      await gotoApp(page, "/en/premier-league");
      await expect(page.locator("body")).toBeVisible();
      await expect(page).not.toHaveURL(/\/api\/debug\//);
    });
  });
}