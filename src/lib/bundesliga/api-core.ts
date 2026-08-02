import {
  BUNDESLIGA_LEAGUE_ID,
  BUNDESLIGA_LEAGUE_NAME,
  BUNDESLIGA_SEASON,
} from "@/lib/bundesliga/constants";
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

export function isBundesligaApiConfigured(): boolean {
  return isApiFootballConfigured();
}

export { isAuthErrorMessage as isAuthError, isQuotaErrorMessage as isQuotaError };

export type BundesligaApiEnvelope<TData> = {
  configured: boolean;
  league: typeof BUNDESLIGA_LEAGUE_NAME;
  leagueId: typeof BUNDESLIGA_LEAGUE_ID;
  season: typeof BUNDESLIGA_SEASON;
  source: PlStandingsSource;
  fetchedAt: string;
  error?: string;
} & TData;

export function bundesligaBaseEnvelope<TData>(
  source: PlStandingsSource,
  data: TData,
  overrides: Partial<BundesligaApiEnvelope<TData>> = {},
): BundesligaApiEnvelope<TData> {
  return {
    configured: isBundesligaApiConfigured(),
    league: BUNDESLIGA_LEAGUE_NAME,
    leagueId: BUNDESLIGA_LEAGUE_ID,
    season: BUNDESLIGA_SEASON,
    source,
    fetchedAt: new Date().toISOString(),
    ...data,
    ...overrides,
  };
}

export function bundesligaGenericCacheControl(
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

export function toClientSafeApiFootballFetchFailure(
  error: unknown,
  context = "bundesliga/api-core",
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
      "bundesliga/api-core/apiFootballFetch",
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
      "bundesliga/api-core/apiFootballFetchAllPages",
    );
  }
}
