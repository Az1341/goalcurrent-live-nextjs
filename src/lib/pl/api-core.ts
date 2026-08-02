import {
  PL_LEAGUE_ID,
  PL_LEAGUE_NAME,
  PL_SEASON,
} from "@/lib/pl/constants";
import {
  apiFootballFetch as fetchApiFootball,
  apiFootballFetchAllPages as fetchAllApiFootballPages,
  isApiFootballConfigured,
} from "@/lib/api-football/client";
import {
  ApiFootballAuthError,
  ApiFootballNetworkError,
  ApiFootballRateLimitError,
  apiFootballClientSafeFetchFailureMessage,
  isAuthErrorMessage,
  isQuotaErrorMessage,
} from "@/lib/api-football/errors";
import { logError } from "@/lib/log";
import type { PlStandingsSource } from "@/lib/pl/types";

export function getApiKey(): string | undefined {
  return process.env.API_FOOTBALL_KEY?.trim() || undefined;
}

export function isPlApiConfigured(): boolean {
  return isApiFootballConfigured();
}

export { isAuthErrorMessage as isAuthError, isQuotaErrorMessage as isQuotaError };

export type PlApiEnvelope<TData> = {
  configured: boolean;
  league: typeof PL_LEAGUE_NAME;
  leagueId: typeof PL_LEAGUE_ID;
  season: typeof PL_SEASON;
  source: PlStandingsSource;
  fetchedAt: string;
  error?: string;
} & TData;

export function plBaseEnvelope<TData>(
  source: PlStandingsSource,
  data: TData,
  overrides: Partial<PlApiEnvelope<TData>> = {},
): PlApiEnvelope<TData> {
  return {
    configured: isPlApiConfigured(),
    league: PL_LEAGUE_NAME,
    leagueId: PL_LEAGUE_ID,
    season: PL_SEASON,
    source,
    fetchedAt: new Date().toISOString(),
    ...data,
    ...overrides,
  };
}

export function plGenericCacheControl(
  configured: boolean,
  hasData: boolean,
  source: PlStandingsSource,
): string {
  if (!configured) return "no-store";
  if (hasData && source === "api-football") {
    return "s-maxage=300, stale-while-revalidate=60";
  }
  return "s-maxage=3600, stale-while-revalidate=300";
}

export type ApiFootballFetchResult<T> =
  | { ok: true; data: T; results: number }
  | { ok: false; kind: "unconfigured" }
  | {
      ok: false;
      kind: "auth" | "quota" | "api" | "network";
      message: string;
    };

/**
 * Map a thrown provider/network error to a client-safe fetch failure.
 * Original exception text is retained only via server-side logError.
 */
export function toClientSafeApiFootballFetchFailure(
  error: unknown,
  context = "pl/api-core",
): Extract<ApiFootballFetchResult<unknown>, { ok: false }> {
  logError(context, error);

  if (error instanceof ApiFootballRateLimitError) {
    return {
      ok: false,
      kind: "quota",
      message: apiFootballClientSafeFetchFailureMessage("quota"),
    };
  }
  if (error instanceof ApiFootballAuthError) {
    return {
      ok: false,
      kind: "auth",
      message: apiFootballClientSafeFetchFailureMessage("auth"),
    };
  }
  if (error instanceof ApiFootballNetworkError) {
    return {
      ok: false,
      kind: "network",
      message: apiFootballClientSafeFetchFailureMessage("network"),
    };
  }
  return {
    ok: false,
    kind: "api",
    message: apiFootballClientSafeFetchFailureMessage("api"),
  };
}

export async function apiFootballFetch<T>(
  path: string,
): Promise<ApiFootballFetchResult<T>> {
  if (!isApiFootballConfigured()) {
    return { ok: false, kind: "unconfigured" };
  }

  try {
    const result = await fetchApiFootball<T>(path);
    return { ok: true, data: result.data, results: result.results };
  } catch (error) {
    return toClientSafeApiFootballFetchFailure(
      error,
      "pl/api-core/apiFootballFetch",
    );
  }
}

export async function apiFootballFetchAllPages<TItem>(
  buildPath: (page: number) => string,
): Promise<ApiFootballFetchResult<TItem[]>> {
  if (!isApiFootballConfigured()) {
    return { ok: false, kind: "unconfigured" };
  }

  try {
    const result = await fetchAllApiFootballPages<TItem>(buildPath);
    return { ok: true, data: result.data, results: result.results };
  } catch (error) {
    return toClientSafeApiFootballFetchFailure(
      error,
      "pl/api-core/apiFootballFetchAllPages",
    );
  }
}
