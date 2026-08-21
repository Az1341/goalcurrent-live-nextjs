import { test, expect, type Page } from "@playwright/test";
import { preparePage, gotoApp, waitForShell } from "./helpers/test-utils";

const EVIDENCE_DIR = "reports/evidence/DKAMS-GC-ISSUE66-RECOVERY-FAVOURITES-001";
const PL_FIXTURE_ID = 926270001;
const PL_MATCH_ID = `pl:${PL_FIXTURE_ID}`;
const HOME_TEAM = "Arsenal";
const AWAY_TEAM = "Coventry";
const MATCH_LABEL = `${HOME_TEAM} vs ${AWAY_TEAM}`;

const PL_FIXTURES_BODY = {
  configured: true,
  league: "Premier League",
  leagueId: 39,
  season: 2026,
  source: "fallback",
  fetchedAt: "2026-08-21T12:00:00.000Z",
  fixtures: [
    {
      fixtureId: PL_FIXTURE_ID,
      kickoffUtc: "2026-12-25T15:00:00.000Z",
      matchweek: 1,
      round: "Regular Season - 1",
      venue: "Emirates Stadium",
      homeTeamId: 42,
      homeTeamName: HOME_TEAM,
      homeTeamLogo: null,
      awayTeamId: 183,
      awayTeamName: AWAY_TEAM,
      awayTeamLogo: null,
      status: "UPCOMING",
      statusShort: "NS",
      elapsed: null,
      homeScore: null,
      awayScore: null,
      broadcaster: "Sky Sports",
    },
  ],
};

const CS_EMPTY_BODY = {
  configured: true,
  competition: "FA Community Shield",
  season: 2026,
  fixtures: [],
  source: "fallback",
  fetchedAt: "2026-08-21T12:00:00.000Z",
};

async function mockDeterministicPlSurface(page: Page): Promise<void> {
  await page.route("**/api/pl/fixtures", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(PL_FIXTURES_BODY),
    });
  });
  await page.route("**/api/community-shield/fixture", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(CS_EMPTY_BODY),
    });
  });
}

test.describe("Issue #66 PL favourite identity", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
    await mockDeterministicPlSurface(page);
  });

  test("favourite a PL match, see team names on Favourites, persist, then remove", async ({
    page,
  }) => {
    await gotoApp(page, "/");

    const addButton = page.getByRole("button", {
      name: `Add ${MATCH_LABEL} to favourites`,
    });
    await expect(addButton.first()).toBeVisible({ timeout: 30_000 });
    await addButton.first().click();

    await page.waitForFunction(
      (matchId) => {
        const raw = localStorage.getItem("gc_favourites");
        if (!raw) return false;
        try {
          const state = JSON.parse(raw) as {
            matches?: string[];
            matchLabels?: Record<string, string>;
          };
          return (
            Array.isArray(state.matches) &&
            state.matches.includes(matchId) &&
            state.matchLabels?.[matchId] === "Arsenal vs Coventry"
          );
        } catch {
          return false;
        }
      },
      PL_MATCH_ID,
      { timeout: 10_000 },
    );

    await gotoApp(page, "/favourites");
    const favMatches = page.getByRole("region", { name: "Favourite matches" });
    await expect(favMatches).toBeVisible();

    const savedLabel = favMatches.locator("[data-gc-fav-match-label]");
    await expect(savedLabel).toHaveText(MATCH_LABEL);
    await expect(savedLabel).not.toHaveText(PL_MATCH_ID);
    await expect(favMatches.getByText(HOME_TEAM)).toBeVisible();
    await expect(favMatches.getByText(AWAY_TEAM)).toBeVisible();
    await expect(favMatches.getByText(`Saved match (${PL_MATCH_ID})`)).toHaveCount(0);
    await expect(favMatches.getByRole("button", { name: "Remove" })).toBeVisible();

    await page.screenshot({
      path: `${EVIDENCE_DIR}/favourites-desktop.png`,
      fullPage: true,
    });

    await page.reload();
    await waitForShell(page);
    await expect(favMatches.locator("[data-gc-fav-match-label]")).toHaveText(MATCH_LABEL);

    await favMatches.getByRole("button", { name: "Remove" }).click();
    await expect(favMatches.getByText(MATCH_LABEL)).toHaveCount(0);
    await expect(page.getByText("No matches saved yet.")).toBeVisible();
  });

  test("legacy payload without labels does not show the raw PL id as identity", async ({
    page,
  }) => {
    await page.addInitScript((matchId) => {
      localStorage.setItem(
        "gc_favourites",
        JSON.stringify({
          teams: [],
          matches: [matchId],
          competitions: [],
        }),
      );
    }, PL_MATCH_ID);

    await gotoApp(page, "/favourites");
    const favMatches = page.getByRole("region", { name: "Favourite matches" });
    await expect(favMatches).toBeVisible();
    await expect(favMatches.getByText(`Saved match (${PL_MATCH_ID})`)).toHaveCount(0);
    await expect(favMatches.getByText(PL_MATCH_ID, { exact: true })).toHaveCount(0);
    await expect(favMatches.getByText("No longer available")).toBeVisible();
    await expect(favMatches.getByRole("button", { name: "Remove" })).toBeVisible();
  });

  test("malformed matchLabels metadata does not break the Favourites page", async ({
    page,
  }) => {
    await page.addInitScript((matchId) => {
      localStorage.setItem(
        "gc_favourites",
        JSON.stringify({
          teams: [],
          matches: [matchId],
          competitions: ["wc26"],
          matchLabels: ["not-an-object"],
        }),
      );
    }, PL_MATCH_ID);

    await gotoApp(page, "/favourites");
    await expect(page.getByRole("heading", { level: 1, name: "Favourites" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Favourite competitions" })).toBeVisible();
    await expect(page.getByText("FIFA World Cup 2026")).toBeVisible();
    await expect(page.getByRole("button", { name: "Remove" }).first()).toBeVisible();
  });
});

test.describe("Issue #66 PL favourite identity — mobile 390x844", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await preparePage(page);
    await mockDeterministicPlSurface(page);
  });

  test("saved match label remains readable with Remove reachable and no overflow", async ({
    page,
  }) => {
    await page.addInitScript((payload) => {
      localStorage.setItem("gc_favourites", JSON.stringify(payload));
    }, {
      teams: [],
      matches: [PL_MATCH_ID],
      competitions: [],
      matchLabels: { [PL_MATCH_ID]: MATCH_LABEL },
    });

    await gotoApp(page, "/favourites");
    const favMatches = page.getByRole("region", { name: "Favourite matches" });
    const savedLabel = favMatches.locator("[data-gc-fav-match-label]");
    await expect(savedLabel).toBeVisible();
    await expect(savedLabel).toHaveText(MATCH_LABEL);

    const remove = favMatches.getByRole("button", { name: "Remove" });
    await expect(remove).toBeVisible();
    const box = await savedLabel.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(390);
    }

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: `${EVIDENCE_DIR}/favourites-mobile-390.png`,
      fullPage: true,
    });
  });
});