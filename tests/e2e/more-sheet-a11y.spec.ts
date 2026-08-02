import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { preparePage, gotoApp, waitForShell } from "./helpers/test-utils";

const MOBILE = { width: 390, height: 844 };

async function openMoreSheet(page: import("@playwright/test").Page) {
  const moreButton = page.getByRole("button", {
    name: /Open more navigation/i,
  });
  await expect(moreButton).toBeVisible();
  await moreButton.focus();
  await expect(moreButton).toBeFocused();
  await moreButton.press("Enter");
  const dialog = page.getByRole("dialog", { name: /^More$/i });
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  return { moreButton, dialog };
}

test.describe("FE-007 More sheet accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await preparePage(page);
  });

  test("opens with dialog semantics, traps focus, Escape restores trigger", async ({
    page,
  }) => {
    await gotoApp(page, "/");
    await waitForShell(page);

    const { moreButton, dialog } = await openMoreSheet(page);

    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(
      dialog.getByRole("button", { name: /Close menu/i }),
    ).toBeVisible();

    await expect
      .poll(async () => {
        return dialog.evaluate((node) => node.contains(document.activeElement));
      })
      .toBe(true);

    const homeTab = page
      .getByRole("navigation", { name: "Mobile bottom navigation" })
      .getByRole("link", { name: /^Home$/i });

    for (let i = 0; i < 40; i += 1) {
      await page.keyboard.press("Tab");
      const homeFocused = await homeTab.evaluate(
        (el) => el === document.activeElement,
      );
      expect(homeFocused, "Home tab focused on Tab cycle " + (i + 1)).toBe(
        false,
      );
      const inside = await dialog.evaluate((node) =>
        node.contains(document.activeElement),
      );
      expect(inside, "focus left dialog on Tab cycle " + (i + 1)).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden({ timeout: 10_000 });
    await expect(moreButton).toBeFocused();
  });

  test("close button dismisses and restores focus to More trigger", async ({
    page,
  }) => {
    await gotoApp(page, "/");
    await waitForShell(page);
    const { moreButton, dialog } = await openMoreSheet(page);

    await dialog.getByRole("button", { name: /Close menu/i }).click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });
    await expect(moreButton).toBeFocused();

    await moreButton.press("Enter");
    await expect(
      page.getByRole("dialog", { name: /^More$/i }),
    ).toBeVisible();
  });

  test("axe scan of open More sheet has no serious/critical dialog failures", async ({
    page,
  }) => {
    await gotoApp(page, "/");
    await waitForShell(page);
    await openMoreSheet(page);

    const results = await new AxeBuilder({ page })
      .include('[data-gc-chrome="more-sheet"]')
      .analyze();

    const blocking = results.violations.filter(
      (v) =>
        (v.impact === "serious" || v.impact === "critical") &&
        v.id !== "color-contrast",
    );
    expect(
      blocking,
      blocking.map((v) => v.id + ": " + v.help).join(" | "),
    ).toEqual([]);
  });
});