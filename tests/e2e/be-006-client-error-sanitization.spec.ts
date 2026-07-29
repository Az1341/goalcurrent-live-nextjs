import { expect, test } from "@playwright/test";
import { gotoApp, preparePage } from "./helpers/test-utils";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const PUBLIC_JSON_ROUTES = [
  "/api/pl/fixtures",
  "/api/pl/standings",
  "/api/wc26/scores",
] as const;

const FORBIDDEN = [
  "API_FOOTBALL_KEY",
  "Check API_FOOTBALL_KEY",
  "API key rejected",
  "API key invalid",
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`BE-006 client error sanitization (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test("homepage usable; public API envelopes omit auth/key fingerprints", async ({
      page,
      request,
    }) => {
      await preparePage(page);
      await gotoApp(page, "/en");
      await expect(page.locator('img[src="/logo.svg"]').first()).toBeVisible({
        timeout: 30_000,
      });

      for (const route of PUBLIC_JSON_ROUTES) {
        const res = await request.get(route);
        expect(res.status(), `${route} status`).toBeLessThan(600);
        const text = await res.text();
        for (const fragment of FORBIDDEN) {
          expect(text, `${route} must not contain ${fragment}`).not.toContain(
            fragment,
          );
        }
      }
    });
  });
}