import plFixturesPayload from "@/data/pl/fixtures-2026-27.json";
import unlFixturesPayload from "@/data/unl/fixtures-2026-27.json";
import communityShieldPayload from "@/data/community-shield/fixtures-2026.json";
import { PL_CLUBS_2026 } from "@/data/pl-clubs";
import {
  canonicalPlTeamKey,
  canonicalUnlTeamKey,
  teamTopicForFavouriteKey,
} from "@/lib/favourite-entities";

export type FavouriteTeamAlert = {
  teamKey: string;
  topic: string;
  fixtureKey: string;
  title: string;
  body: string;
  href: string;
  kickoffUtc: string;
};

type StaticClubFixture = {
  fixtureId: number;
  kickoffUtc: string;
  homeTeamName: string;
  awayTeamName: string;
  status: string;
};

type StaticNationalFixture = StaticClubFixture & {
  homeTeamId: number;
  awayTeamId: number;
};

function isDue(kickoffUtc: string, status: string, nowMs: number): boolean {
  const normalizedStatus = status.trim().toUpperCase();
  if (!["UPCOMING", "NS", "TBD"].includes(normalizedStatus)) return false;
  const kickoffMs = new Date(kickoffUtc).getTime();
  if (!Number.isFinite(kickoffMs)) return false;
  const minutesUntil = (kickoffMs - nowMs) / 60_000;
  // Hourly cron: a 60-minute half-open window guarantees at most one normal
  // scheduled run per fixture while covering kickoffs at any minute of the hour.
  return minutesUntil >= 30 && minutesUntil < 90;
}

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function clubKeyForTeamName(name: string): string | null {
  const target = normalizeName(name);
  const club = PL_CLUBS_2026.find((entry) => {
    const names = [entry.name, entry.shortName];
    return names.some((candidate) => {
      const normalized = normalizeName(candidate);
      return normalized === target || normalized.includes(target) || target.includes(normalized);
    });
  });
  return club ? canonicalPlTeamKey(club.slug) : null;
}

function buildAlert(
  teamKey: string,
  fixtureKey: string,
  homeTeamName: string,
  awayTeamName: string,
  kickoffUtc: string,
  href: string,
): FavouriteTeamAlert | null {
  const topic = teamTopicForFavouriteKey(teamKey);
  if (!topic) return null;
  return {
    teamKey,
    topic,
    fixtureKey,
    title: "Next match reminder",
    body: `${homeTeamName} vs ${awayTeamName} kicks off soon.`,
    href,
    kickoffUtc,
  };
}

export function buildDueFavouriteTeamAlerts(
  nowMs = Date.now(),
): FavouriteTeamAlert[] {
  const alerts: FavouriteTeamAlert[] = [];
  const plFixtures = plFixturesPayload.fixtures as StaticClubFixture[];
  const communityShieldFixtures =
    communityShieldPayload.fixtures as StaticClubFixture[];
  const unlFixtures = unlFixturesPayload.fixtures as StaticNationalFixture[];

  for (const fixture of communityShieldFixtures) {
    if (!isDue(fixture.kickoffUtc, fixture.status, nowMs)) continue;
    const fixtureKey = `cs:${fixture.fixtureId}`;
    const href = "/community-shield";
    for (const teamName of [fixture.homeTeamName, fixture.awayTeamName]) {
      const teamKey = clubKeyForTeamName(teamName);
      if (!teamKey) continue;
      const alert = buildAlert(
        teamKey,
        fixtureKey,
        fixture.homeTeamName,
        fixture.awayTeamName,
        fixture.kickoffUtc,
        href,
      );
      if (alert) alerts.push(alert);
    }
  }

  for (const fixture of plFixtures) {
    if (!isDue(fixture.kickoffUtc, fixture.status, nowMs)) continue;
    const fixtureKey = `pl:${fixture.fixtureId}`;
    const href = `/premier-league/match/${fixture.fixtureId}`;
    for (const teamName of [fixture.homeTeamName, fixture.awayTeamName]) {
      const teamKey = clubKeyForTeamName(teamName);
      if (!teamKey) continue;
      const alert = buildAlert(
        teamKey,
        fixtureKey,
        fixture.homeTeamName,
        fixture.awayTeamName,
        fixture.kickoffUtc,
        href,
      );
      if (alert) alerts.push(alert);
    }
  }

  for (const fixture of unlFixtures) {
    if (!isDue(fixture.kickoffUtc, fixture.status, nowMs)) continue;
    const fixtureKey = `unl:${fixture.fixtureId}`;
    const href = `/nations-league/match/${fixture.fixtureId}`;
    for (const teamId of [fixture.homeTeamId, fixture.awayTeamId]) {
      const teamKey = canonicalUnlTeamKey(teamId);
      const alert = buildAlert(
        teamKey,
        fixtureKey,
        fixture.homeTeamName,
        fixture.awayTeamName,
        fixture.kickoffUtc,
        href,
      );
      if (alert) alerts.push(alert);
    }
  }

  const unique = new Map<string, FavouriteTeamAlert>();
  for (const alert of alerts) {
    unique.set(`${alert.topic}:${alert.fixtureKey}`, alert);
  }
  return [...unique.values()];
}
