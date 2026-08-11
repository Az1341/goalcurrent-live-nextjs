import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const {
  getCommunityShieldFixture,
  getCommunityShieldFixtures,
  isCommunityShieldFixtureId,
  COMMUNITY_SHIELD_FIXTURE_ID,
} = await import(
  pathToFileURL(join(root, "src/lib/community-shield/fixtures-ssot.ts")).href
);

const PL_RANGE = [926_270_001, 926_270_380];
const KICKOFF_UTC = "2026-08-16T14:00:00.000Z";

test("SSOT reader returns the confirmed Community Shield fixture", () => {
  const fixtures = getCommunityShieldFixtures();
  assert.equal(fixtures.length, 1);
  const fixture = getCommunityShieldFixture();
  assert.ok(fixture);
  assert.equal(fixture.homeTeamName, "Arsenal");
  assert.equal(fixture.homeTeamId, 42);
  assert.equal(fixture.awayTeamName, "Manchester City");
  assert.equal(fixture.awayTeamId, 50);
  assert.equal(fixture.venue, "Principality Stadium, Cardiff");
  assert.equal(fixture.status, "UPCOMING");
  assert.equal(fixture.statusShort, "NS");
  assert.equal(fixture.fixtureId, COMMUNITY_SHIELD_FIXTURE_ID);
  assert.equal(fixture.fixtureId, 1_582_365);
  assert.equal(isCommunityShieldFixtureId(fixture.fixtureId), true);
  assert.equal(isCommunityShieldFixtureId(880_160_001), false);
  assert.equal(
    fixture.fixtureId >= PL_RANGE[0] && fixture.fixtureId <= PL_RANGE[1],
    false,
  );
});

test("kickoffUtc is the confirmed 14:00 UTC / 15:00 BST instant", () => {
  const fixture = getCommunityShieldFixture();
  assert.equal(fixture.kickoffUtc, KICKOFF_UTC);
  assert.equal(fixture.homeScore, null);
  assert.equal(fixture.awayScore, null);
  assert.notEqual(fixture.kickoffUtc, null);
});

test("device-timezone override: London shows 15:00, New York 10:00, Tokyo 23:00", () => {
  const instant = new Date(KICKOFF_UTC);
  const hourIn = (timeZone) =>
    Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .formatToParts(instant)
        .find((p) => p.type === "hour")?.value,
    );
  assert.equal(hourIn("Europe/London"), 15);
  assert.equal(hourIn("America/New_York"), 10);
  assert.equal(hourIn("Asia/Tokyo"), 23);
});

test("hub page SSR-seeds via ssotCommunityShieldFixturesResponse and SWR fallbackData", () => {
  const page = readFileSync(
    join(root, "src/app/[locale]/community-shield/page.tsx"),
    "utf8",
  );
  const client = readFileSync(
    join(root, "src/components/community-shield/CommunityShieldHubClient.tsx"),
    "utf8",
  );
  const hook = readFileSync(
    join(root, "src/lib/client/useCommunityShieldFixture.ts"),
    "utf8",
  );
  assert.match(page, /ssotCommunityShieldFixturesResponse\s*\(/);
  assert.match(page, /CommunityShieldHubClient\s+initialData=\{initialData\}/);
  assert.doesNotMatch(page, /HomeClient/);
  assert.match(client, /useCommunityShieldFixture\(\s*initialData\s*\)/);
  assert.match(client, /useTranslations\(\s*["']communityShield["']\s*\)/);
  assert.match(client, /kickoffTbc/);
  assert.match(client, /toLocaleString\(locale/);
  assert.match(hook, /fallbackData:\s*initialData/);
});

test("translations exist in all 6 locales and are not English-only hardcoded in client", () => {
  for (const locale of ["en", "fr", "de", "es", "it", "nl"]) {
    const messages = JSON.parse(
      readFileSync(join(root, `messages/${locale}.json`), "utf8"),
    );
    assert.ok(messages.communityShield, `missing communityShield in ${locale}`);
    assert.ok(messages.communityShield.kickoffTbc);
    assert.ok(messages.communityShield.title);
    assert.doesNotMatch(
      messages.communityShield.metaDescription,
      /\bTBC\b/i,
      `${locale} metaDescription still says TBC`,
    );
  }
  const client = readFileSync(
    join(root, "src/components/community-shield/CommunityShieldHubClient.tsx"),
    "utf8",
  );
  assert.doesNotMatch(client, />Kick-off TBC</);
  assert.doesNotMatch(client, />Community Shield</);
});
