import { NextResponse } from "next/server";
import { GC_STALE_RESPONSE_HEADER } from "@/lib/api-football/cache";
import {
  ApiFootballAuthError,
  apiFootballClientAuthErrorMessage,
  apiFootballErrorMessage,
  classifyApiFootballError,
  type ApiFootballErrorCode,
} from "@/lib/api-football/errors";
import { captureRouteError } from "@/lib/log";

type RespondOptions<T> = {
  route: string;
  error: unknown;
  staleBody?: T | null;
  buildBody: (code: ApiFootballErrorCode, message: string, stale: boolean) => T;
  cacheControl?: string;
};

function failureHeaders(
  cacheControl: string,
  servingStale: boolean,
): Record<string, string> {
  const headers: Record<string, string> = { "Cache-Control": cacheControl };
  // BE-012 — mark retained success payloads so clients never treat them as fresh.
  if (servingStale) {
    headers[GC_STALE_RESPONSE_HEADER] = "1";
  }
  return headers;
}

export function respondApiFootballFailure<T extends Record<string, unknown>>({
  route,
  error,
  staleBody,
  buildBody,
  cacheControl = "no-store",
}: RespondOptions<T>): NextResponse {
  if (error instanceof ApiFootballAuthError) {
    // Detail stays server-side (captureRouteError); clients get a generic envelope.
    // Auth failures do not serve stale success payloads.
    captureRouteError(route, error);
    return NextResponse.json(
      buildBody("unknown_error", apiFootballClientAuthErrorMessage(), false),
      { status: 503, headers: failureHeaders(cacheControl, false) },
    );
  }

  const code = classifyApiFootballError(error);
  captureRouteError(route, error);

  const message = apiFootballErrorMessage(code);
  const servingStale = Boolean(staleBody);
  const body = servingStale
    ? buildBody(code, message, true)
    : buildBody(code, message, false);

  const status = code === "unknown_error" ? 500 : 503;
  return NextResponse.json(body, {
    status,
    headers: failureHeaders(cacheControl, servingStale),
  });
}