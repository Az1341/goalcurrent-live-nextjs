import { expect, test } from "@playwright/test";
import { gotoApp, preparePage } from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const PROBE_SECRET = process.env.DEBUG_SECRET?.trim() || "rsr003-playwright-probe";
const failClosed = (status: number) => [401, 429].includes(status);
const retired = (status: number) => [404, 410].includes(status);

const RETIRED_WC26_ROUTES = [
  "/api/debug/wc26",
  "/api/wc26/fixtures",
  "/api/wc26/knockout-fixtures",
  "/api/wc26/match/999999999",
  "/api/wc26/top-scorers",
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`BE-005/RSR-003 debug auth (${viewport.name})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("retired WC26 routes expose no usable live service", async ({ page, request }) => {
      await preparePage(page);
      await gotoApp(page, "/en");
      await expect(page.locator('img[src="/logo.svg"]').first()).toBeVisible({ timeout: 30_000 });

      for (const path of RETIRED_WC26_ROUTES) {
        const response = await request.get(path);
        expect(retired(response.status()), `${path} must remain retired`).toBe(true);

        const body = await response.text();
        expect(body).not.toContain(PROBE_SECRET);
        expect(body.toLowerCase()).not.toContain("cron_secret");
        expect(body).not.toMatch(/DEBUG_SECRET/i);
        expect(body).not.toMatch(/"matches"\s*:|"fixtureId"\s*:|api-football/i);
      }
    });

    test("remaining debug auth fails closed; current hub remains usable", async ({ page, request }) => {
      for (const response of [
        await request.get("/api/debug/api-football?endpoint=fixtures", {
          headers: { "x-cron-secret": "cron-secret-probe" },
        }),
        await request.get("/api/debug/api-football", {
          headers: { "x-debug-secret": "wrong-secret-probe" },
        }),
        await request.get("/api/debug/api-football", {
          headers: { Authorization: "Bearer cron-secret-probe" },
        }),
      ]) {
        expect(failClosed(response.status())).toBe(true);
        const body = await response.text();
        expect(body).not.toContain(PROBE_SECRET);
        expect(body).not.toMatch(/DEBUG_SECRET/i);
      }

      const authorized = await request.get("/api/debug/api-football", {
        headers: { "x-debug-secret": PROBE_SECRET },
      });
      if (process.env.DEBUG_SECRET?.trim()) {
        expect([400, 429]).toContain(authorized.status());
      } else {
        expect(failClosed(authorized.status())).toBe(true);
      }
      const authBody = await authorized.text();
      expect(authBody).not.toContain(PROBE_SECRET);
      expect(authBody).not.toMatch(/DEBUG_SECRET/i);

      await gotoApp(page, "/en/premier-league");
      await expect(page.locator("body")).toBeVisible();
      await expect(page).not.toHaveURL(/\/api\/debug\//);
    });
  });
}
