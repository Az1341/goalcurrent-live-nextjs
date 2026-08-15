import { expect, test } from "@playwright/test";
import { gotoApp, preparePage } from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const PROBE_SECRET = process.env.DEBUG_SECRET?.trim() || "rsr003-playwright-probe";
const failClosed = (status: number) => [401, 429].includes(status);

for (const viewport of VIEWPORTS) {
  test.describe(`BE-005/RSR-003 debug auth (${viewport.name})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("fail-closed debug auth; hubs remain usable", async ({ page, request }) => {
      await preparePage(page);
      await gotoApp(page, "/en");
      await expect(page.locator('img[src="/logo.svg"]').first()).toBeVisible({ timeout: 30_000 });

      const unauth = await request.get("/api/debug/wc26");
      expect(failClosed(unauth.status())).toBe(true);
      const unauthBody = await unauth.text();
      expect(unauthBody).not.toContain(PROBE_SECRET);
      expect(unauthBody.toLowerCase()).not.toContain("cron_secret");
      expect(unauthBody).not.toMatch(/DEBUG_SECRET/i);

      for (const response of [
        await request.get("/api/debug/wc26", { headers: { "x-debug-secret": "wrong-secret-probe" } }),
        await request.get("/api/debug/wc26", { headers: { Authorization: "Bearer cron-secret-probe" } }),
        await request.get("/api/debug/wc26", { headers: { "x-cron-secret": "cron-secret-probe" } }),
        await request.get("/api/debug/api-football?endpoint=fixtures", { headers: { "x-cron-secret": "cron-secret-probe" } }),
      ]) {
        expect(failClosed(response.status())).toBe(true);
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
