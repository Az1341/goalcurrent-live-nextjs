export const FAVOURITES_STORAGE_KEY = "gc_favourites";

export const FAVOURITES_CHANGE_EVENT = "gc:favourites-change";

const MATCH_LABEL_MAX_LENGTH = 160;

export type FavouritesState = {
  teams: string[];
  matches: string[];
  competitions: string[];
  /** Display-only labels keyed by matchId. Never used as identifiers. */
  matchLabels: Record<string, string>;
};

const EMPTY_STATE: FavouritesState = {
  teams: [],
  matches: [],
  competitions: [],
  matchLabels: {},
};

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return [...new Set(value.filter((item): item is string => typeof item === "string" && item.trim() !== ""))];
}

function sanitizeMatchLabel(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const cleaned = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) {
    return null;
  }
  return cleaned.slice(0, MATCH_LABEL_MAX_LENGTH);
}

function normalizeMatchLabels(
  value: unknown,
  matchIds: readonly string[],
): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const allowed = new Set(matchIds);
  const record = value as Record<string, unknown>;
  const labels: Record<string, string> = {};
  for (const matchId of Object.keys(record)) {
    if (!allowed.has(matchId)) {
      continue;
    }
    const label = sanitizeMatchLabel(record[matchId]);
    if (label) {
      labels[matchId] = label;
    }
  }
  return labels;
}

function normalizeState(value: unknown): FavouritesState {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_STATE };
  }
  const record = value as Partial<FavouritesState> & {
    matchLabels?: unknown;
  };
  const teams = normalizeList(record.teams);
  const matches = normalizeList(record.matches);
  const competitions = normalizeList(record.competitions);
  return {
    teams,
    matches,
    competitions,
    matchLabels: normalizeMatchLabels(record.matchLabels, matches),
  };
}

function omitMatchLabel(
  labels: Record<string, string>,
  matchId: string,
): Record<string, string> {
  if (!(matchId in labels)) {
    return labels;
  }
  const next = { ...labels };
  delete next[matchId];
  return next;
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
    return normalizeState(JSON.parse(raw));
  } catch {
    return { ...EMPTY_STATE };
  }
}

function writeFavourites(state: FavouritesState): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(state));
    notifyChange();
  } catch {
    /* private mode */
  }
}

export function isTeamFavourited(teamId: string): boolean {
  return readFavourites().teams.includes(teamId);
}

export function isMatchFavourited(matchId: string): boolean {
  return readFavourites().matches.includes(matchId);
}

export function getFavouriteMatchLabel(matchId: string): string | null {
  const label = readFavourites().matchLabels[matchId];
  return label ? label : null;
}

export function toggleFavouriteTeam(teamId: string): boolean {
  const state = readFavourites();
  const isFav = state.teams.includes(teamId);
  const teams = isFav
    ? state.teams.filter((id) => id !== teamId)
    : [...state.teams, teamId];
  writeFavourites({ ...state, teams });
  return !isFav;
}

export function toggleFavouriteMatch(matchId: string, label?: string): boolean {
  const state = readFavourites();
  const isFav = state.matches.includes(matchId);
  if (isFav) {
    writeFavourites({
      ...state,
      matches: state.matches.filter((id) => id !== matchId),
      matchLabels: omitMatchLabel(state.matchLabels, matchId),
    });
    return false;
  }

  const sanitized = sanitizeMatchLabel(label);
  const matchLabels = { ...state.matchLabels };
  if (sanitized) {
    matchLabels[matchId] = sanitized;
  }
  writeFavourites({
    ...state,
    matches: [...state.matches, matchId],
    matchLabels,
  });
  return true;
}

export function removeFavouriteTeam(teamId: string): void {
  const state = readFavourites();
  if (!state.teams.includes(teamId)) {
    return;
  }
  writeFavourites({
    ...state,
    teams: state.teams.filter((id) => id !== teamId),
  });
}

export function removeFavouriteMatch(matchId: string): void {
  const state = readFavourites();
  if (!state.matches.includes(matchId)) {
    return;
  }
  writeFavourites({
    ...state,
    matches: state.matches.filter((id) => id !== matchId),
    matchLabels: omitMatchLabel(state.matchLabels, matchId),
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
