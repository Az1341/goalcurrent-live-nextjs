import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("Community Shield match detail API is fixture-bound and exposes match-day data", () => {
  const constants = read("src/lib/community-shield/constants.ts");
  const detail = read("src/lib/community-shield/match-detail.ts");
  const route = read("src/app/api/community-shield/match/[fixtureId]/route.ts");

  assert.match(constants, /COMMUNITY_SHIELD_LEAGUE_ID\s*=\s*528/);
  assert.match(constants, /COMMUNITY_SHIELD_FIXTURE_ID\s*=\s*1_582_365/);
  assert.match(detail, /isCommunityShieldFixtureId\(fixtureId\)/);
  assert.match(detail, /\/fixtures\/lineups\?fixture=/);
  assert.match(detail, /\/fixtures\/statistics\?fixture=/);
  assert.match(detail, /\/fixtures\/events\?fixture=/);
  assert.match(detail, /\/fixtures\/headtohead\?h2h=/);
  assert.match(route, /fetchCommunityShieldMatchDetail\(fixtureId\)/);
});

test("Community Shield hub renders pre-match history, line-ups, statistics and events", () => {
  const client = read("src/components/community-shield/CommunityShieldHubClient.tsx");
  assert.match(client, /Recent meetings/);
  assert.match(client, /Line-ups/);
  assert.match(client, /Match statistics/);
  assert.match(client, /Match events/);
  assert.match(client, /\/api\/community-shield\/match\//);
  assert.match(client, /latest\?\.status === ["']LIVE["'] \? 20_000 : 300_000/);
});

test("home countdown prioritises Community Shield then falls back to Premier League", () => {
  const countdown = read("src/components/home/v5/HomePlKickoffCountdown.tsx");
  assert.match(countdown, /useCommunityShieldFixture\(\)/);
  assert.match(countdown, /COMMUNITY_SHIELD_DISPLAY_TAIL_MS/);
  assert.match(countdown, /selectNextPlUpcomingFixture\(plFixtures, nowMs\)/);
  assert.match(countdown, /href:\s*["']\/community-shield["']/);
});

test("live upcoming competition list includes Community Shield and sorts by kickoff", () => {
  const windows = read("src/lib/live/upcoming-competition-windows.ts");
  const cards = read("src/components/live/UpcomingCompetitionCards.tsx");
  assert.match(windows, /"community-shield"/);
  assert.match(windows, /FA Community Shield/);
  assert.match(windows, /windows\.sort/);
  assert.match(cards, /\/api\/community-shield\/fixture/);
  assert.match(cards, /communityShield:\s*communityShield\?\.fixtures/);
});

test("mobile competitions lives in bottom navigation and pins Community Shield in the sheet", () => {
  const header = read("src/components/layout/MasterHeader.tsx");
  const responsive = read("src/components/layout/MasterHeaderResponsive.module.css");
  const bottom = read("src/components/layout/BottomTabBar.tsx");
  const sheet = read("src/components/layout/MobileCompetitionsSheet.tsx");

  assert.match(header, /desktopCompetitionOnly/);
  assert.match(responsive, /@media \(max-width: 768px\)/);
  assert.match(responsive, /display:\s*none/);
  assert.match(bottom, /MobileCompetitionsSheet/);
  assert.match(bottom, /gc-mobile-competitions-sheet/);
  assert.match(bottom, /setCompetitionsOpen\(true\)/);
  assert.match(sheet, /href=["']\/community-shield["']/);
  assert.match(sheet, /data-gc-mobile-community-shield=["']true["']/);
  assert.match(sheet, /t\(["']communityShield["']\)/);
});

test("homepage ads are visibly labelled, directly after hero and use non-PII attribution", () => {
  const home = read("src/app/[locale]/HomeClient.tsx");
  const promo = read("src/components/home/v5/HomeEcosystemPromo.tsx");
  const video = read("src/components/home/v5/HomeSepanaiVideoAd.tsx");
  const heroIndex = home.indexOf("<HomeHero");
  const promoIndex = home.indexOf("<HomeEcosystemPromo");
  const videoIndex = home.indexOf("<HomeSepanaiVideoAd");
  const matchesIndex = home.indexOf("<HomeTodaysMatches");

  assert.ok(heroIndex >= 0 && promoIndex > heroIndex && videoIndex > promoIndex && matchesIndex > videoIndex);
  assert.match(promo, />Advertisement</);
  assert.match(video, />Advertisement</);
  assert.doesNotMatch(promo, /OWNED ADVERTISEMENT|owned promotion/i);
  assert.doesNotMatch(video, /OWNED ADVERTISEMENT|owned promotion/i);
  assert.match(promo, /utm_source=goalcurrent/);
  assert.match(video, /utm_source=goalcurrent/);
  assert.doesNotMatch(promo + video, /[?&](email|user_id|uid|phone|device_id)=/i);
});

test("SEPANAI and FAMVI advertising always carries official brand marks", () => {
  const promo = read("src/components/home/v5/HomeEcosystemPromo.tsx");
  const liveAd = read("src/components/ads/LiveScoreAdUnit.tsx");
  const video = read("src/components/home/v5/HomeSepanaiVideoAd.tsx");

  assert.ok((promo.match(/\/sepanai-mark\.svg/g) ?? []).length >= 2);
  assert.match(promo, /\/famvi-wordmark-inline\.svg/);
  assert.ok((liveAd.match(/\/sepanai-mark\.svg/g) ?? []).length >= 2);
  assert.match(liveAd, /\/famvi-wordmark-inline\.svg/);
  assert.match(video, /\/sepanai-mark\.svg/);
});

test("SEPANAI video source is permitted by CSP and waits for user playback", () => {
  const video = read("src/components/home/v5/HomeSepanaiVideoAd.tsx");
  const csp = read("src/lib/security/csp.ts");

  assert.match(video, /SEPANAI\.COM_Product_Update_SocialMedia_1308206_1036\.mp4/);
  assert.match(video, /type=["']video\/mp4["']/);
  assert.match(video, /preload=["']none["']/);
  assert.doesNotMatch(video, /autoPlay|autoplay/);
  assert.match(csp, /MEDIA_SRC/);
  assert.match(csp, /https:\/\/www\.sepanai\.com/);
  assert.match(csp, /joinDirective\(["']media-src["'], MEDIA_SRC\)/);
});

test("header uses canonical SEPANAI.COM logo while footer attribution remains unchanged", () => {
  const header = read("src/components/layout/MasterHeader.tsx");
  const footer = read("src/components/layout/MasterFooter.tsx");

  assert.match(header, /Powered by/);
  assert.match(header, /SEPANAI\.COM/);
  assert.match(header, /sepanai-logo-official\.svg/);
  assert.match(header, /https:\/\/www\.sepanai\.com/);

  assert.match(footer, /Powered by/);
  assert.match(footer, /SEPANAI\.COM/);
  assert.match(footer, /sepanai-mark\.svg/);
  assert.match(footer, /https:\/\/www\.sepanai\.com/);
});
