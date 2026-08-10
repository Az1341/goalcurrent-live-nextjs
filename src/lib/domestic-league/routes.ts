import { NextResponse } from "next/server";
import {
  GC_STALE_RESPONSE_HEADER,
  getStaleApiCache,
  setSuccessApiCache,
} from "@/lib/api-football/cache";
import type {
  DomesticLeagueFixturesResponse,
  DomesticLeagueStandingsResponse,
} from "@/lib/domestic-league/types";
import { captureRouteError } from "@/lib/log";

function failureHeaders(servingStale: boolean): Record<string, string> {
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (servingStale) {
    headers[GC_STALE_RESPONSE_HEADER] = "1";
  }
  return headers;
}

/** Align domestic error tags with PL/UCL `api/...` route labels when possible. */
function routeTagFromCacheKey(cacheKey: string): string {
  if (cacheKey.startsWith("api/")) {
    return cacheKey;
  }
  return `api/${cacheKey}`;
}

export function respondDomesticFixtures<T extends DomesticLeagueFixturesResponse>(
  cacheKey: string,
  body: T,
  cacheControl: (body: T) => string,
): NextResponse {
  if (!body.error) {
    setSuccessApiCache(cacheKey, body);
    return NextResponse.json(body, {
      headers: { "Cache-Control": cacheControl(body) },
    });
  }

  // Match PL/UCL: surface provider/route failures to Sentry before stale fallback.
  captureRouteError(routeTagFromCacheKey(cacheKey), body.error);

  const staleBody = getStaleApiCache<T>(cacheKey);
  if (staleBody) {
    return NextResponse.json(
      {
        ...staleBody,
        error: body.error,
        source: "fallback" as const,
        stale: true,
      },
      { status: 503, headers: failureHeaders(true) },
    );
  }

  return NextResponse.json(body, {
    status: 503,
    headers: failureHeaders(false),
  });
}

export function respondDomesticStandings<
  T extends DomesticLeagueStandingsResponse,
>(cacheKey: string, body: T, cacheControl: (body: T) => string): NextResponse {
  if (!body.error) {
    setSuccessApiCache(cacheKey, body);
    return NextResponse.json(body, {
      headers: { "Cache-Control": cacheControl(body) },
    });
  }

  captureRouteError(routeTagFromCacheKey(cacheKey), body.error);

  const staleBody = getStaleApiCache<T>(cacheKey);
  if (staleBody) {
    return NextResponse.json(
      {
        ...staleBody,
        error: body.error,
        source: "fallback" as const,
        stale: true,
      },
      { status: 503, headers: failureHeaders(true) },
    );
  }

  return NextResponse.json(body, {
    status: 503,
    headers: failureHeaders(false),
  });
}
