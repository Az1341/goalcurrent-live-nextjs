import { getTeamDisplayName } from "@/lib/teamIdentity";
import type { ScorerGoalEvent } from "@/lib/wc26-top-scorers";
import { getCached, setCached } from "@/lib/server/cache";
import type { Wc26SourceGoalFetchResult } from "./types";

const LIVESCORE_DATE_BASE =
  "https://prod-cdn-mev-api.livescore.com/v1/api/app/date";
const LIVESCORE_INCIDENTS_BASE =
  "https://prod-cdn-public-api.livescore.com/v1/api/app/incidents/soccer";

/** WC26 tournament window — do not walk calendar days past the final. */
export const LIVESCORE_TOURNAMENT_START = new Date("2026-06-11T00:00:00.000Z");
export const LIVESCORE_TOURNAMENT_END = new Date("2026-07-19T23:59:59.999Z");

/**
 * Explicit upstream budgets for one LiveScore Tier-2 fetch (BE-010).
 * Max total = date requests + incident requests.
 */
export const LIVESCORE_MAX_DATE_REQUESTS = 40;
export const LIVESCORE_MAX_INCIDENT_REQUESTS = 104;
export const LIVESCORE_INCIDENT_CONCURRENCY = 4;
export const LIVESCORE_MAX_UPSTREAM_REQUESTS =
  LIVESCORE_MAX_DATE_REQUESTS + LIVESCORE_MAX_INCIDENT_REQUESTS;

/** Scoped cache — WC26 LiveScore top-scorer goals only (no cross-competition). */
export const LIVESCORE_CACHE_KEY = "wc26:top-scorers:livescore:v1";
export const LIVESCORE_CACHE_TTL_MS = 5 * 60 * 1000;

type LiveScoreTeam = {
  Nm?: string;
};

type LiveScoreEvent = {
  Eid?: string;
  Epr?: number;
  Esid?: number;
  T1?: LiveScoreTeam[];
  T2?: LiveScoreTeam[];
};

type LiveScoreStage = {
  CompN?: string;
  Cnm?: string;
  Snm?: string;
  Events?: LiveScoreEvent[];
};

type LiveScoreDateResponse = {
  Stages?: LiveScoreStage[];
};

type LiveScoreIncident = {
  IT?: number;
  Pn?: string;
  Min?: number;
};

type LiveScoreIncidentsResponse = {
  Incs?: Record<string, LiveScoreIncident[]>;
};

type FinishedMatch = {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
};

export type LiveScoreFetchStats = {
  dateRequests: number;
  incidentRequests: number;
  totalUpstreamRequests: number;
  matchesFound: number;
  stoppedEarly: boolean;
};

let inflightFetch: Promise<Wc26SourceGoalFetchResult> | null = null;
let lastFetchStats: LiveScoreFetchStats | null = null;

/** Test/observability helper — last completed LiveScore upstream counters. */
export function getLastLiveScoreFetchStats(): LiveScoreFetchStats | null {
  return lastFetchStats;
}

/** Clears in-flight coalescing (tests). Cache clear via `apiCache.clear()`. */
export function resetLiveScoreInflightForTests(): void {
  inflightFetch = null;
  lastFetchStats = null;
}

function isWorldCupStage(stage: LiveScoreStage): boolean {
  const label = `${stage.CompN ?? ""} ${stage.Cnm ?? ""} ${stage.Snm ?? ""}`.toLowerCase();
  return label.includes("world cup") || label.includes("fifa");
}

function isFinishedEvent(event: LiveScoreEvent): boolean {
  return event.Epr === 2 || event.Esid === 6;
}

function formatDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Deterministic bounded date keys for the WC26 window.
 * Caps end at tournament final; truncates to most-recent MAX days if needed.
 */
export function buildLiveScoreTournamentDateKeys(
  now: Date = new Date(),
  options?: {
    maxDateRequests?: number;
    tournamentStart?: Date;
    tournamentEnd?: Date;
  },
): string[] {
  const maxDateRequests =
    options?.maxDateRequests ?? LIVESCORE_MAX_DATE_REQUESTS;
  const tournamentStart =
    options?.tournamentStart ?? LIVESCORE_TOURNAMENT_START;
  const tournamentEnd = options?.tournamentEnd ?? LIVESCORE_TOURNAMENT_END;

  const end =
    now < tournamentStart
      ? tournamentStart
      : now < tournamentEnd
        ? now
        : tournamentEnd;

  const keys: string[] = [];
  const cursor = new Date(tournamentStart);
  while (cursor <= end) {
    keys.push(formatDateKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  if (keys.length <= maxDateRequests) {
    return keys;
  }

  // Prefer most recent days within the budget (live tournament mid-window).
  return keys.slice(keys.length - maxDateRequests);
}

function isGoalIncident(incident: LiveScoreIncident): boolean {
  const type = incident.IT ?? 0;
  return type === 1 || type === 2 || type === 3;
}

function goalsFromIncidents(
  payload: LiveScoreIncidentsResponse,
  homeTeam: string,
  awayTeam: string,
): ScorerGoalEvent[] {
  const goals: ScorerGoalEvent[] = [];

  for (const [side, incidents] of Object.entries(payload.Incs ?? {})) {
    const teamName = side === "1" ? homeTeam : awayTeam;
    for (const incident of incidents) {
      if (!isGoalIncident(incident)) {
        continue;
      }
      const playerName = incident.Pn?.trim();
      if (!playerName) {
        continue;
      }
      goals.push({
        playerName,
        teamName: getTeamDisplayName(teamName) ?? teamName,
        isOwnGoal: incident.IT === 2,
      });
    }
  }

  return goals;
}

async function fetchIncidentsForEvent(
  eventId: string,
  homeTeam: string,
  awayTeam: string,
): Promise<ScorerGoalEvent[]> {
  try {
    const res = await fetch(
      `${LIVESCORE_INCIDENTS_BASE}/${encodeURIComponent(eventId)}?locale=en`,
      { next: { revalidate: 0 } },
    );
    if (!res.ok) {
      return [];
    }
    const json = (await res.json()) as LiveScoreIncidentsResponse;
    return goalsFromIncidents(json, homeTeam, awayTeam);
  } catch {
    return [];
  }
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  mapper: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index]!);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

async function fetchFinishedWorldCupEvents(
  now: Date = new Date(),
): Promise<{ matches: FinishedMatch[]; dateRequests: number; stoppedEarly: boolean }> {
  const matches: FinishedMatch[] = [];
  let dateRequests = 0;
  let stoppedEarly = false;

  // Newest-first so a truncated budget keeps recent finished matches.
  const dateKeys = [...buildLiveScoreTournamentDateKeys(now)].reverse();

  for (const dateKey of dateKeys) {
    if (matches.length >= LIVESCORE_MAX_INCIDENT_REQUESTS) {
      stoppedEarly = true;
      break;
    }
    if (dateRequests >= LIVESCORE_MAX_DATE_REQUESTS) {
      stoppedEarly = true;
      break;
    }

    dateRequests += 1;
    try {
      const res = await fetch(
        `${LIVESCORE_DATE_BASE}/${dateKey}/soccer/0?countryCode=US&locale=en`,
        { next: { revalidate: 0 } },
      );
      if (!res.ok) {
        continue;
      }

      const json = (await res.json()) as LiveScoreDateResponse;
      for (const stage of json.Stages ?? []) {
        if (!isWorldCupStage(stage)) {
          continue;
        }

        for (const event of stage.Events ?? []) {
          if (!isFinishedEvent(event)) {
            continue;
          }
          const eventId = event.Eid?.trim();
          const homeTeam = event.T1?.[0]?.Nm?.trim();
          const awayTeam = event.T2?.[0]?.Nm?.trim();
          if (!eventId || !homeTeam || !awayTeam) {
            continue;
          }
          matches.push({ eventId, homeTeam, awayTeam });
          if (matches.length >= LIVESCORE_MAX_INCIDENT_REQUESTS) {
            stoppedEarly = true;
            break;
          }
        }
        if (matches.length >= LIVESCORE_MAX_INCIDENT_REQUESTS) {
          break;
        }
      }
    } catch {
      continue;
    }
  }

  return { matches, dateRequests, stoppedEarly };
}

async function fetchLiveScoreWc26ScorerGoalsUncached(
  now: Date = new Date(),
): Promise<Wc26SourceGoalFetchResult> {
  try {
    const { matches, dateRequests, stoppedEarly } =
      await fetchFinishedWorldCupEvents(now);

    const incidentTargets = matches.slice(0, LIVESCORE_MAX_INCIDENT_REQUESTS);
    const incidentBudgetStopped =
      matches.length > incidentTargets.length || stoppedEarly;

    if (incidentTargets.length === 0) {
      lastFetchStats = {
        dateRequests,
        incidentRequests: 0,
        totalUpstreamRequests: dateRequests,
        matchesFound: 0,
        stoppedEarly: incidentBudgetStopped,
      };
      return { source: "livescore", available: true, goals: [] };
    }

    const goalLists = await mapWithConcurrency(
      incidentTargets,
      (match) =>
        fetchIncidentsForEvent(match.eventId, match.homeTeam, match.awayTeam),
      LIVESCORE_INCIDENT_CONCURRENCY,
    );

    const goals = goalLists.flat();
    lastFetchStats = {
      dateRequests,
      incidentRequests: incidentTargets.length,
      totalUpstreamRequests: dateRequests + incidentTargets.length,
      matchesFound: matches.length,
      stoppedEarly: incidentBudgetStopped,
    };

    return {
      source: "livescore",
      available: true,
      goals,
    };
  } catch {
    lastFetchStats = {
      dateRequests: 0,
      incidentRequests: 0,
      totalUpstreamRequests: 0,
      matchesFound: 0,
      stoppedEarly: false,
    };
    return { source: "livescore", available: false, goals: [] };
  }
}

/** LiveScore incidents feed for completed World Cup matches (budgeted, cached). */
export async function fetchLiveScoreWc26ScorerGoals(
  now: Date = new Date(),
): Promise<Wc26SourceGoalFetchResult> {
  const cached = getCached(LIVESCORE_CACHE_KEY);
  if (cached && typeof cached === "object" && cached !== null) {
    const typed = cached as Wc26SourceGoalFetchResult;
    if (typed.source === "livescore") {
      return typed;
    }
  }

  if (inflightFetch) {
    return inflightFetch;
  }

  inflightFetch = fetchLiveScoreWc26ScorerGoalsUncached(now)
    .then((result) => {
      setCached(LIVESCORE_CACHE_KEY, result, LIVESCORE_CACHE_TTL_MS);
      return result;
    })
    .finally(() => {
      inflightFetch = null;
    });

  return inflightFetch;
}
