import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const {
  isCommunityShieldCountdownActive,
  COMMUNITY_SHIELD_COUNTDOWN_RETIRE_MS,
} = await import(
  pathToFileURL(join(root, "src/lib/home/community-shield-countdown.ts")).href
);

const { getCommunityShieldFixture } = await import(
  pathToFileURL(join(root, "src/lib/community-shield/fixtures-ssot.ts")).href
);

const KICKOFF_UTC = "2026-08-16T14:00:00.000Z";
const KICKOFF_MS = Date.parse(KICKOFF_UTC);

test("isCommunityShieldCountdownActive is true before and at kickoff", () => {
  assert.equal(isCommunityShieldCountdownActive(KICKOFF_UTC, KICKOFF_MS - 60_000), true);
  assert.equal(isCommunityShieldCountdownActive(KICKOFF_UTC, KICKOFF_MS), true);
});

test("isCommunityShieldCountdownActive stays true within 3h after kickoff", () => {
  assert.equal(
    isCommunityShieldCountdownActive(
      KICKOFF_UTC,
      KICKOFF_MS + COMMUNITY_SHIELD_COUNTDOWN_RETIRE_MS,
    ),
    true,
  );
  assert.equal(
    isCommunityShieldCountdownActive(
      KICKOFF_UTC,
      KICKOFF_MS + COMMUNITY_SHIELD_COUNTDOWN_RETIRE_MS - 1,
    ),
    true,
  );
});

test("isCommunityShieldCountdownActive hides more than 3h after kickoff", () => {
  assert.equal(
    isCommunityShieldCountdownActive(
      KICKOFF_UTC,
      KICKOFF_MS + COMMUNITY_SHIELD_COUNTDOWN_RETIRE_MS + 1,
    ),
    false,
  );
});

test("isCommunityShieldCountdownActive rejects missing or invalid kickoff", () => {
  assert.equal(isCommunityShieldCountdownActive(null, KICKOFF_MS), false);
  assert.equal(isCommunityShieldCountdownActive(undefined, KICKOFF_MS), false);
  assert.equal(isCommunityShieldCountdownActive("", KICKOFF_MS), false);
  assert.equal(isCommunityShieldCountdownActive("not-a-date", KICKOFF_MS), false);
});

test("SSOT kickoff drives homepage countdown window", () => {
  const fixture = getCommunityShieldFixture();
  assert.ok(fixture);
  assert.equal(fixture.kickoffUtc, KICKOFF_UTC);
  const before = Date.parse("2026-08-12T12:00:00.000Z");
  assert.equal(isCommunityShieldCountdownActive(fixture.kickoffUtc, before), true);
});

test("device-timezone: London 15:00, New York 10:00, Tokyo 23:00", () => {
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

test("HomeClient mounts CS countdown before PL countdown", () => {
  const src = readFileSync(
    join(root, "src/app/[locale]/HomeClient.tsx"),
    "utf8",
  );
  assert.match(src, /HomeCommunityShieldCountdown/);
  const csIdx = src.indexOf("<HomeCommunityShieldCountdown");
  const plIdx = src.indexOf("<HomePlKickoffCountdown");
  assert.ok(csIdx > 0 && plIdx > csIdx);
});

test("HomeCommunityShieldCountdown links to /community-shield and uses SSOT", () => {
  const src = readFileSync(
    join(root, "src/components/home/v5/HomeCommunityShieldCountdown.tsx"),
    "utf8",
  );
  assert.match(src, /getCommunityShieldFixture/);
  assert.match(src, /href=["']\/community-shield["']/);
  assert.match(src, /isCommunityShieldCountdownActive/);
  assert.match(src, /home\.communityShieldCountdown/);
});