import { expect, test } from "@playwright/test";
import { gotoApp, preparePage } from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`BE-005 debug auth (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("homepage remains usable; cron secret cannot open debug dump", async ({
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

      const cronBearer = await request.get("/api/debug/wc26", {
        headers: { Authorization: "Bearer cron-secret-probe" },
      });
      expect(cronBearer.status()).toBe(401);

      const cronHeader = await request.get("/api/debug/wc26", {
        headers: { "x-cron-secret": "cron-secret-probe" },
      });
      expect(cronHeader.status()).toBe(401);

      const apiFootball = await request.get(
        "/api/debug/api-football?endpoint=fixtures",
        {
          headers: { "x-cron-secret": "cron-secret-probe" },
        },
      );
      expect(apiFootball.status()).toBe(401);
    });
  });
}
