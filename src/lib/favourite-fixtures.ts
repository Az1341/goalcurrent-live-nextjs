import communityShieldPayload from "@/data/community-shield/fixtures-2026.json";
import type { PlFixtureRow } from "@/lib/pl/types";
import type { UnlFixtureRow } from "@/lib/unl/types";
import {
  canonicalizeFavouriteMatchId,
  parseFavouriteMatchId,
  resolveFavouriteTeam,
} from "@/lib/favourite-entities";

export type FavouriteFixtureView = {
  key: string;
  source: "pl" | "cs" | "unl";
  fixtureId: number;
  competition: string;
  kickoffUtc: string;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo: string | null;
  homeTeamFlag: string | null;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo: string | null;
  awayTeamFlag: string | null;
  status: string;
  statusShort: string;
  elapsed: number | null;
  homeScore: number | null;
  awayScore: number | null;
  href: string;
};

type CommunityShieldFixture = {
  fixtureId: number;
  kickoffUtc: string;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo: string | null;
  status: string;
  statusShort: string;
  elapsed: number | null;
  homeScore: number | null;
  awayScore: number | null;
};

const communityShieldFixtures = communityShieldPayload.fixtures as CommunityShieldFixture[];

function fromPl(fixture: PlFixtureRow): FavouriteFixtureView {
  return {
    key: `pl:${fixture.fixtureId}`,
    source: "pl",
    fixtureId: fixture.fixtureId,
    competition: "Premier League",
    kickoffUtc: fixture.kickoffUtc,
    homeTeamId: fixture.homeTeamId,
    homeTeamName: fixture.homeTeamName,
    homeTeamLogo: fixture.homeTeamLogo,
    homeTeamFlag: null,
    awayTeamId: fixture.awayTeamId,
    awayTeamName: fixture.awayTeamName,
    awayTeamLogo: fixture.awayTeamLogo,
    awayTeamFlag: null,
    status: fixture.status,
    statusShort: fixture.statusShort,
    elapsed: fixture.elapsed,
    homeScore: fixture.homeScore,
    awayScore: fixture.awayScore,
    href: `/premier-league/match/${fixture.fixtureId}`,
  };
}

function fromUnl(fixture: UnlFixtureRow): FavouriteFixtureView {
  return {
    key: `unl:${fixture.fixtureId}`,
    source: "unl",
    fixtureId: fixture.fixtureId,
    competition: "UEFA Nations League",
    kickoffUtc: fixture.kickoffUtc,
    homeTeamId: fixture.homeTeamId,
    homeTeamName: fixture.homeTeamName,
    homeTeamLogo: fixture.homeTeamLogo,
    homeTeamFlag: fixture.homeTeamFlag,
    awayTeamId: fixture.awayTeamId,
    awayTeamName: fixture.awayTeamName,
    awayTeamLogo: fixture.awayTeamLogo,
    awayTeamFlag: fixture.awayTeamFlag,
    status: fixture.status,
    statusShort: fixture.statusShort,
    elapsed: fixture.elapsed,
    homeScore: fixture.homeScore,
    awayScore: fixture.awayScore,
    href: `/nations-league/match/${fixture.fixtureId}`,
  };
}

function fromCommunityShield(fixture: CommunityShieldFixture): FavouriteFixtureView {
  return {
    key: `cs:${fixture.fixtureId}`,
    source: "cs",
    fixtureId: fixture.fixtureId,
    competition: "FA Community Shield",
    kickoffUtc: fixture.kickoffUtc,
    homeTeamId: fixture.homeTeamId,
    homeTeamName: fixture.homeTeamName,
    homeTeamLogo: fixture.homeTeamLogo,
    homeTeamFlag: null,
    awayTeamId: fixture.awayTeamId,
    awayTeamName: fixture.awayTeamName,
    awayTeamLogo: fixture.awayTeamLogo,
    awayTeamFlag: null,
    status: fixture.status,
    statusShort: fixture.statusShort,
    elapsed: fixture.elapsed,
    homeScore: fixture.homeScore,
    awayScore: fixture.awayScore,
    href: `/community-shield/match/${fixture.fixtureId}`,
  };
}

export function resolveFavouriteFixture(
  matchId: string,
  plFixtures: readonly PlFixtureRow[] = [],
  unlFixtures: readonly UnlFixtureRow[] = [],
): FavouriteFixtureView | null {
  const canonical = canonicalizeFavouriteMatchId(matchId);
  const parsed = parseFavouriteMatchId(canonical);
  const numericId = Number.parseInt(parsed.fixtureId, 10);
  if (!Number.isFinite(numericId)) return null;

  if (parsed.source === "pl") {
    const fixture = plFixtures.find((entry) => entry.fixtureId === numericId);
    return fixture ? fromPl(fixture) : null;
  }

  if (parsed.source === "cs") {
    const fixture = communityShieldFixtures.find(
      (entry) => entry.fixtureId === numericId,
    );
    return fixture ? fromCommunityShield(fixture) : null;
  }

  if (parsed.source === "unl") {
    const fixture = unlFixtures.find((entry) => entry.fixtureId === numericId);
    return fixture ? fromUnl(fixture) : null;
  }

  const plFixture = plFixtures.find((entry) => entry.fixtureId === numericId);
  if (plFixture) return fromPl(plFixture);
  const unlFixture = unlFixtures.find((entry) => entry.fixtureId === numericId);
  if (unlFixture) return fromUnl(unlFixture);
  const shieldFixture = communityShieldFixtures.find(
    (entry) => entry.fixtureId === numericId,
  );
  return shieldFixture ? fromCommunityShield(shieldFixture) : null;
}

function isUpcomingStatus(status: string): boolean {
  const normalized = status.trim().toUpperCase();
  return normalized === "UPCOMING" || normalized === "NS" || normalized === "TBD";
}

function teamNameMatches(candidate: string, names: readonly string[]): boolean {
  const normalized = candidate.trim().toLowerCase();
  return names.some((name) => {
    const value = name.trim().toLowerCase();
    return value === normalized || normalized.includes(value) || value.includes(normalized);
  });
}

export function getNextFavouriteTeamFixture(
  teamKey: string,
  plFixtures: readonly PlFixtureRow[],
  unlFixtures: readonly UnlFixtureRow[],
  nowMs = Date.now(),
): FavouriteFixtureView | null {
  const team = resolveFavouriteTeam(teamKey);
  if (!team) return null;

  if (team.kind === "club") {
    const names = [team.name, ...team.aliases];
    const plCandidates = plFixtures
      .filter((fixture) => {
        if (!isUpcomingStatus(fixture.status)) return false;
        const kickoff = new Date(fixture.kickoffUtc).getTime();
        if (!Number.isFinite(kickoff) || kickoff <= nowMs) return false;
        return (
          teamNameMatches(fixture.homeTeamName, names) ||
          teamNameMatches(fixture.awayTeamName, names)
        );
      })
      .map(fromPl);

    const shieldCandidates = communityShieldFixtures
      .filter((fixture) => {
        if (!isUpcomingStatus(fixture.status)) return false;
        const kickoff = new Date(fixture.kickoffUtc).getTime();
        if (!Number.isFinite(kickoff) || kickoff <= nowMs) return false;
        return (
          teamNameMatches(fixture.homeTeamName, names) ||
          teamNameMatches(fixture.awayTeamName, names)
        );
      })
      .map(fromCommunityShield);

    const candidates = [...shieldCandidates, ...plCandidates].sort(
      (a, b) =>
        new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
    );
    return candidates[0] ?? null;
  }

  const unlId = team.key.startsWith("national:unl:")
    ? Number.parseInt(team.key.slice("national:unl:".length), 10)
    : Number.NaN;
  if (!Number.isFinite(unlId)) return null;

  const candidates = unlFixtures
    .filter((fixture) => {
      if (!isUpcomingStatus(fixture.status)) return false;
      const kickoff = new Date(fixture.kickoffUtc).getTime();
      if (!Number.isFinite(kickoff) || kickoff <= nowMs) return false;
      return fixture.homeTeamId === unlId || fixture.awayTeamId === unlId;
    })
    .sort(
      (a, b) =>
        new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
    );
  return candidates[0] ? fromUnl(candidates[0]) : null;
}
