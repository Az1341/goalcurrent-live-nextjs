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
} = await import(
  pathToFileURL(join(root, "src/lib/community-shield/fixtures-ssot.ts")).href
);

const COMMUNITY_SHIELD_FIXTURE_ID_MIN = 880_160_001;
const PL_RANGE = [926_270_001, 926_270_380];

test("SSOT reader returns the single Community Shield fixture", () => {
  const fixtures = getCommunityShieldFixtures();
  assert.equal(fixtures.length, 1);
  const fixture = getCommunityShieldFixture();
  assert.ok(fixture);
  assert.equal(fixture.homeTeamName, "Manchester City");
  assert.equal(fixture.homeTeamId, 50);
  assert.equal(fixture.awayTeamName, "Arsenal");
  assert.equal(fixture.awayTeamId, 42);
  assert.equal(fixture.venue, "Principality Stadium, Cardiff");
  assert.equal(fixture.status, "UPCOMING");
  assert.equal(fixture.fixtureId, COMMUNITY_SHIELD_FIXTURE_ID_MIN);
  assert.equal(isCommunityShieldFixtureId(fixture.fixtureId), true);
  assert.equal(
    fixture.fixtureId >= PL_RANGE[0] && fixture.fixtureId <= PL_RANGE[1],
    false,
  );
});

test("TBC kickoff is null and does not invent a time", () => {
  const fixture = getCommunityShieldFixture();
  assert.equal(fixture.kickoffUtc, null);
  assert.equal(fixture.homeScore, null);
  assert.equal(fixture.awayScore, null);
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
  }
  const client = readFileSync(
    join(root, "src/components/community-shield/CommunityShieldHubClient.tsx"),
    "utf8",
  );
  assert.doesNotMatch(client, />Kick-off TBC</);
  assert.doesNotMatch(client, />Community Shield</);
});
