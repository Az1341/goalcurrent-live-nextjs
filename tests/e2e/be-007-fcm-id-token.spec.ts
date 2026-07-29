import { expect, test } from "@playwright/test";
import { gotoApp, preparePage } from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`BE-007 FCM idToken gate (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("homepage usable; FCM subscribe without idToken returns 401", async ({
      page,
      request,
    }) => {
      await preparePage(page);
      await gotoApp(page, "/en");
      await expect(page.locator('img[src="/logo.svg"]').first()).toBeVisible({
        timeout: 30_000,
      });

      const unauth = await request.post("/api/firebase/fcm-token", {
        data: { token: "playwright-device-token", locale: "en" },
      });
      expect(unauth.status()).toBe(401);
      const body = await unauth.json();
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("missing_id_token");
    });
  });
}