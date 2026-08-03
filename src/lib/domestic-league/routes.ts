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

function failureHeaders(servingStale: boolean): Record<string, string> {
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (servingStale) {
    headers[GC_STALE_RESPONSE_HEADER] = "1";
  }
  return headers;
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
