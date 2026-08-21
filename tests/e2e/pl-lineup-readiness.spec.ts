import { test, expect, type Page } from "@playwright/test";
import { preparePage, gotoApp, runAxeScan } from "./helpers/test-utils";

// DKAMS-GC-PL-LINEUP-READINESS-20260821-192822
// Deterministic coverage for the Premier League match-centre lineup badge.
// The dashboard previously labelled a match "CONFIRMED" whenever either
// side had any lineup object, even a malformed/empty one. These tests pin
// the corrected three-state (CONFIRMED / PARTIAL / PENDING) contract.
const FIXTURE_ID = 1557367;

function baseFixture() {
  return {
    fixtureId: FIXTURE_ID,
    kickoffUtc: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    matchweek: 1,
    round: "Regular Season - 1",
    venue: "Emirates Stadium, London",
    homeTeamId: 42,
    homeTeamName: "Arsenal",
    homeTeamLogo: null,
    awayTeamId: 1346,
    awayTeamName: "Coventry",
    awayTeamLogo: null,
    status: "UPCOMING",
    statusShort: "NS",
    elapsed: null,
    homeScore: null,
    awayScore: null,
    broadcaster: "UK: Sky Sports",
    referee: null,
    venueCity: "London",
  };
}

function confirmedSide(teamName: string) {
  return {
    teamName,
    formation: "4-3-3",
    coach: `${teamName} coach`,
    startXI: Array.from({ length: 11 }, (_, index) => ({
      name: `${teamName} Player ${index + 1}`,
      number: index + 1,
      position: "MF",
    })),
    substitutes: [],
  };
}

function baseMatchResponse(lineups: {
  home: ReturnType<typeof confirmedSide> | null;
  away: ReturnType<typeof confirmedSide> | null;
}) {
  return {
    configured: true,
    league: "Premier League",
    leagueId: 39,
    season: 2026,
    fixtureId: FIXTURE_ID,
    fixture: baseFixture(),
    apiAvailable: true,
    events: [],
    lineups,
    statistics: [],
    h2h: [],
    standingsSnapshot: [],
    source: "api-football",
    fetchedAt: new Date().toISOString(),
  };
}

async function mockMatchDetail(page: Page, body: unknown): Promise<void> {
  await page.route(`**/api/pl/match/${FIXTURE_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

test.describe("Premier League match centre — lineup readiness", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("desktop: renders both team names and the confirmed XI when both sides are supplied", async ({ page }) => {
    await mockMatchDetail(
      page,
      baseMatchResponse({ home: confirmedSide("Arsenal"), away: confirmedSide("Coventry") }),
    );

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await gotoApp(page, `/premier-league/match/${FIXTURE_ID}`);

    const dashboard = page.locator("[data-gc-live-match-dashboard]");
    await expect(dashboard).toBeVisible({ timeout: 30_000 });
    await expect(dashboard.getByText("Arsenal").first()).toBeVisible();
    await expect(dashboard.getByText("Coventry").first()).toBeVisible();
    await expect(dashboard.getByText("CONFIRMED", { exact: true })).toBeVisible();
    await expect(dashboard.getByText("Arsenal Player 1", { exact: true })).toBeVisible();
    await expect(dashboard.getByText("Coventry Player 1", { exact: true })).toBeVisible();

    await runAxeScan(page, "pl-match-confirmed-lineup");
    expect(consoleErrors).toEqual([]);
  });

  test("desktop: pending state renders correctly when no lineup is supplied", async ({ page }) => {
    await mockMatchDetail(page, baseMatchResponse({ home: null, away: null }));

    await gotoApp(page, `/premier-league/match/${FIXTURE_ID}`);

    const dashboard = page.locator("[data-gc-live-match-dashboard]");
    await expect(dashboard).toBeVisible({ timeout: 30_000 });
    await expect(dashboard.getByText("PENDING", { exact: true })).toBeVisible();
    await expect(dashboard.getByText("Line-up pending").first()).toBeVisible();
    // A partial or fabricated confirmation must never appear for an empty payload.
    await expect(dashboard.getByText("CONFIRMED", { exact: true })).toHaveCount(0);
  });

  test("desktop: one-sided lineup is reported as PARTIAL, never fabricated as CONFIRMED", async ({ page }) => {
    await mockMatchDetail(
      page,
      baseMatchResponse({ home: confirmedSide("Arsenal"), away: null }),
    );

    await gotoApp(page, `/premier-league/match/${FIXTURE_ID}`);

    const dashboard = page.locator("[data-gc-live-match-dashboard]");
    await expect(dashboard).toBeVisible({ timeout: 30_000 });
    await expect(dashboard.getByText("PARTIAL", { exact: true })).toBeVisible();
    await expect(dashboard.getByText("CONFIRMED", { exact: true })).toHaveCount(0);
    // Team identity for both sides must remain visible even while partial.
    await expect(dashboard.getByText("Arsenal").first()).toBeVisible();
    await expect(dashboard.getByText("Coventry").first()).toBeVisible();
  });

  test("mobile 390px: no horizontal overflow and team identity remains readable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockMatchDetail(
      page,
      baseMatchResponse({ home: confirmedSide("Arsenal"), away: confirmedSide("Coventry") }),
    );

    await gotoApp(page, `/premier-league/match/${FIXTURE_ID}`);

    const dashboard = page.locator("[data-gc-live-match-dashboard]");
    await expect(dashboard).toBeVisible({ timeout: 30_000 });
    await expect(dashboard.getByText("Arsenal").first()).toBeVisible();
    await expect(dashboard.getByText("Coventry").first()).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
