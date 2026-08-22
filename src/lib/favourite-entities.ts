import { PL_CLUBS_2026 } from "@/data/pl-clubs";
import { WC26_TEAMS, getFixtureById, getTeamById } from "@/data/wc26";
import { getUnlGroups } from "@/lib/unl/groups-ssot";

export type FavouriteTeamKind = "club" | "national";

export type FavouriteTeamEntity = {
  key: string;
  name: string;
  kind: FavouriteTeamKind;
  competition: string;
  href: string | null;
  logo: string | null;
  flagCode: string | null;
  aliases: readonly string[];
};

export type FavouriteMatchSource = "pl" | "cs" | "unl" | "wc26" | "unknown";

export type ResolvedFavouriteMatch = {
  key: string;
  source: FavouriteMatchSource;
  fixtureId: string;
  competition: string;
  href: string | null;
};

const MATCH_PREFIXES = new Set(["pl", "cs", "unl"]);

export function canonicalPlTeamKey(slug: string): string {
  return `club:pl:${slug.trim().toLowerCase()}`;
}

export function canonicalUnlTeamKey(teamId: number | string): string {
  return `national:unl:${String(teamId).trim()}`;
}

export function canonicalizeFavouriteTeamKey(input: string): string {
  const value = input.trim();
  if (!value) return value;

  if (value.startsWith("club:pl:")) {
    const slug = value.slice("club:pl:".length).trim().toLowerCase();
    return slug ? canonicalPlTeamKey(slug) : value;
  }

  if (value.startsWith("national:unl:")) {
    const rawId = value.slice("national:unl:".length).trim();
    return rawId ? canonicalUnlTeamKey(rawId) : value;
  }

  return value;
}

export function canonicalizeFavouriteMatchId(input: string): string {
  const value = input.trim();
  if (!value) return value;

  const separator = value.indexOf(":");
  if (separator > 0) {
    const prefix = value.slice(0, separator).toLowerCase();
    const rawId = value.slice(separator + 1).trim();
    if (MATCH_PREFIXES.has(prefix) && /^\d+$/.test(rawId)) {
      return `${prefix}:${String(Number.parseInt(rawId, 10))}`;
    }
  }

  return value;
}

export function parseFavouriteMatchId(input: string): ResolvedFavouriteMatch {
  const key = canonicalizeFavouriteMatchId(input);
  const separator = key.indexOf(":");
  if (separator > 0) {
    const prefix = key.slice(0, separator) as FavouriteMatchSource;
    const fixtureId = key.slice(separator + 1);
    if (prefix === "pl") {
      return {
        key,
        source: "pl",
        fixtureId,
        competition: "Premier League",
        href: `/premier-league/match/${fixtureId}`,
      };
    }
    if (prefix === "cs") {
      return {
        key,
        source: "cs",
        fixtureId,
        competition: "FA Community Shield",
        href: "/community-shield",
      };
    }
    if (prefix === "unl") {
      return {
        key,
        source: "unl",
        fixtureId,
        competition: "UEFA Nations League",
        href: `/nations-league/match/${fixtureId}`,
      };
    }
  }

  const wc26Fixture = getFixtureById(key);
  return {
    key,
    source: wc26Fixture ? "wc26" : "unknown",
    fixtureId: key,
    competition: wc26Fixture ? "World Cup 2026" : "Saved match",
    href: wc26Fixture ? `/worldcup2026/match/${key}` : null,
  };
}

export function getFavouriteTeamCatalog(): FavouriteTeamEntity[] {
  const clubs: FavouriteTeamEntity[] = PL_CLUBS_2026.map((club) => ({
    key: canonicalPlTeamKey(club.slug),
    name: club.name,
    kind: "club",
    competition: "Premier League",
    href: `/premier-league/clubs/${club.slug}`,
    logo: null,
    flagCode: null,
    aliases: [club.shortName],
  }));

  const nationalByName = new Map<string, FavouriteTeamEntity>();
  for (const group of getUnlGroups()) {
    for (const team of group.teams) {
      const entity: FavouriteTeamEntity = {
        key: canonicalUnlTeamKey(team.teamId),
        name: team.name,
        kind: "national",
        competition: "UEFA Nations League",
        href: `/nations-league/league/${group.league}/group/${group.groupId.slice(1)}`,
        logo: team.logo,
        flagCode: team.flagCode,
        aliases: [],
      };
      nationalByName.set(team.name.trim().toLowerCase(), entity);
    }
  }

  for (const team of WC26_TEAMS) {
    const nameKey = team.name.trim().toLowerCase();
    if (nationalByName.has(nameKey)) continue;
    nationalByName.set(nameKey, {
      key: team.id,
      name: team.name,
      kind: "national",
      competition: "World Cup 2026",
      href: `/worldcup2026/teams/${team.id}`,
      logo: null,
      flagCode: team.flagCode,
      aliases: team.aliases,
    });
  }

  return [...clubs, ...nationalByName.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

const FAVOURITE_TEAM_CATALOG = getFavouriteTeamCatalog();
const FAVOURITE_TEAM_BY_KEY = new Map(
  FAVOURITE_TEAM_CATALOG.map((team) => [team.key, team] as const),
);

export function resolveFavouriteTeam(input: string): FavouriteTeamEntity | null {
  const key = canonicalizeFavouriteTeamKey(input);
  const direct = FAVOURITE_TEAM_BY_KEY.get(key);
  if (direct) return direct;

  const legacy = getTeamById(key);
  if (!legacy) return null;
  return {
    key,
    name: legacy.name,
    kind: "national",
    competition: "World Cup 2026",
    href: `/worldcup2026/teams/${legacy.id}`,
    logo: null,
    flagCode: legacy.flagCode,
    aliases: legacy.aliases,
  };
}

export function isKnownFavouriteTeamKey(input: string): boolean {
  return resolveFavouriteTeam(input) !== null;
}

export function teamTopicForFavouriteKey(input: string): string | null {
  const team = resolveFavouriteTeam(input);
  if (!team) return null;
  const safe = team.key
    .toLowerCase()
    .replace(/[^a-z0-9-_.~%]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return safe ? `gc-team-${safe}`.slice(0, 900) : null;
}
