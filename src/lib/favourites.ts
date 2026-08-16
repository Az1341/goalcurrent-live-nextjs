import {
  canonicalizeFavouriteMatchId,
  canonicalizeFavouriteTeamKey,
} from "@/lib/favourite-entities";

export const FAVOURITES_STORAGE_KEY = "gc_favourites";

export const FAVOURITES_CHANGE_EVENT = "gc:favourites-change";

export type FavouritesState = {
  teams: string[];
  matches: string[];
  competitions: string[];
  teamNotifications: string[];
};

const EMPTY_STATE: FavouritesState = {
  teams: [],
  matches: [],
  competitions: [],
  teamNotifications: [],
};

function normalizeList(
  value: unknown,
  canonicalize: (value: string) => string = (item) => item.trim(),
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => canonicalize(item))
    .filter((item) => item !== "");
  return [...new Set(normalized)];
}

export function normalizeFavouritesState(value: unknown): FavouritesState {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_STATE };
  }
  const record = value as Partial<FavouritesState>;
  const teams = normalizeList(record.teams, canonicalizeFavouriteTeamKey);
  const teamSet = new Set(teams);
  return {
    teams,
    matches: normalizeList(record.matches, canonicalizeFavouriteMatchId),
    competitions: normalizeList(record.competitions),
    teamNotifications: normalizeList(
      record.teamNotifications,
      canonicalizeFavouriteTeamKey,
    ).filter((teamKey) => teamSet.has(teamKey)),
  };
}

function notifyChange(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(FAVOURITES_CHANGE_EVENT));
}

/** Read favourites from localStorage (client only). */
export function readFavourites(): FavouritesState {
  if (typeof window === "undefined") {
    return { ...EMPTY_STATE };
  }
  try {
    const raw = localStorage.getItem(FAVOURITES_STORAGE_KEY);
    if (!raw) {
      return { ...EMPTY_STATE };
    }
    const normalized = normalizeFavouritesState(JSON.parse(raw));
    const serialized = JSON.stringify(normalized);
    if (serialized !== raw) {
      localStorage.setItem(FAVOURITES_STORAGE_KEY, serialized);
    }
    return normalized;
  } catch {
    return { ...EMPTY_STATE };
  }
}

function writeFavourites(state: FavouritesState): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      FAVOURITES_STORAGE_KEY,
      JSON.stringify(normalizeFavouritesState(state)),
    );
    notifyChange();
  } catch {
    /* private mode */
  }
}

export function reconcileFavouriteMatchAliases(
  plFixtureIds: readonly number[],
  unlFixtureIds: readonly number[],
): void {
  if (typeof window === "undefined") return;
  const state = readFavourites();
  const plIds = new Set(plFixtureIds);
  const unlIds = new Set(unlFixtureIds);
  const canonicalMatches = state.matches.map((matchId) => {
    const canonical = canonicalizeFavouriteMatchId(matchId);
    if (canonical.includes(":")) return canonical;
    if (!/^\d+$/.test(canonical)) return canonical;
    const numericId = Number.parseInt(canonical, 10);
    if (plIds.has(numericId)) return `pl:${numericId}`;
    if (unlIds.has(numericId)) return `unl:${numericId}`;
    if (numericId === 1582365) return `cs:${numericId}`;
    return canonical;
  });
  const deduped = [...new Set(canonicalMatches)];
  if (
    deduped.length !== state.matches.length ||
    deduped.some((value, index) => value !== state.matches[index])
  ) {
    writeFavourites({ ...state, matches: deduped });
  }
}

export function isTeamFavourited(teamId: string): boolean {
  return readFavourites().teams.includes(canonicalizeFavouriteTeamKey(teamId));
}

export function isMatchFavourited(matchId: string): boolean {
  return readFavourites().matches.includes(canonicalizeFavouriteMatchId(matchId));
}

export function isTeamNotificationEnabled(teamId: string): boolean {
  return readFavourites().teamNotifications.includes(
    canonicalizeFavouriteTeamKey(teamId),
  );
}

export function toggleFavouriteTeam(teamId: string): boolean {
  const canonicalTeamId = canonicalizeFavouriteTeamKey(teamId);
  const state = readFavourites();
  const isFav = state.teams.includes(canonicalTeamId);
  const teams = isFav
    ? state.teams.filter((id) => id !== canonicalTeamId)
    : [...state.teams, canonicalTeamId];
  const teamNotifications = isFav
    ? state.teamNotifications.filter((id) => id !== canonicalTeamId)
    : state.teamNotifications;
  writeFavourites({ ...state, teams, teamNotifications });
  return !isFav;
}

export function toggleFavouriteMatch(matchId: string): boolean {
  const canonicalMatchId = canonicalizeFavouriteMatchId(matchId);
  const state = readFavourites();
  const isFav = state.matches.includes(canonicalMatchId);
  const matches = isFav
    ? state.matches.filter((id) => id !== canonicalMatchId)
    : [...state.matches, canonicalMatchId];
  writeFavourites({ ...state, matches });
  return !isFav;
}

export function setTeamNotificationEnabled(
  teamId: string,
  enabled: boolean,
): boolean {
  const canonicalTeamId = canonicalizeFavouriteTeamKey(teamId);
  const state = readFavourites();
  if (!state.teams.includes(canonicalTeamId)) {
    return false;
  }
  const teamNotifications = enabled
    ? [...new Set([...state.teamNotifications, canonicalTeamId])]
    : state.teamNotifications.filter((id) => id !== canonicalTeamId);
  writeFavourites({ ...state, teamNotifications });
  return enabled;
}

export function removeFavouriteTeam(teamId: string): void {
  const canonicalTeamId = canonicalizeFavouriteTeamKey(teamId);
  const state = readFavourites();
  if (!state.teams.includes(canonicalTeamId)) {
    return;
  }
  writeFavourites({
    ...state,
    teams: state.teams.filter((id) => id !== canonicalTeamId),
    teamNotifications: state.teamNotifications.filter(
      (id) => id !== canonicalTeamId,
    ),
  });
}

export function removeFavouriteMatch(matchId: string): void {
  const canonicalMatchId = canonicalizeFavouriteMatchId(matchId);
  const state = readFavourites();
  if (!state.matches.includes(canonicalMatchId)) {
    return;
  }
  writeFavourites({
    ...state,
    matches: state.matches.filter((id) => id !== canonicalMatchId),
  });
}

export function removeFavouriteCompetition(competitionId: string): void {
  const state = readFavourites();
  if (!state.competitions.includes(competitionId)) {
    return;
  }
  writeFavourites({
    ...state,
    competitions: state.competitions.filter((id) => id !== competitionId),
  });
}
