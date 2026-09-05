import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { wc26ScoresQuerySchema } from "@/lib/validation/schemas";
import { logInfo } from "@/lib/log";
import { getCached, setCached } from "@/lib/server/cache";
import { buildConfirmedStaticApiMatches } from "@/lib/wc26/confirmed-results";
import type { Wc26ScoresApiResponse } from "@/types/fixture-overlay";

export const dynamic = "force-dynamic";

const ROUTE = "/api/wc26/scores";
const ARCHIVE_CACHE_TTL_MS = 86_400_000;
const ARCHIVE_CACHE_CONTROL = "s-maxage=86400, stale-while-revalidate=86400";

/** Stable cache key - /api/scores re-exports this handler but must share cache. */
function scoresCacheKey(request: NextRequest): string {
  return `${ROUTE}${request.nextUrl.search}`;
}

function archiveResponse(): Wc26ScoresApiResponse {
  return {
    matches: buildConfirmedStaticApiMatches(),
    fetchedAt: new Date().toISOString(),
    configured: false,
    phase: "archive-static",
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, wc26ScoresQuerySchema);
  if ("error" in validated) return validated.error;

  const cacheKey = scoresCacheKey(request);
  const cached = getCached(cacheKey);
  if (cached) {
    logInfo(ROUTE, "WC26 ARCHIVE CACHE HIT");
    return NextResponse.json(cached as Wc26ScoresApiResponse, {
      headers: { "Cache-Control": ARCHIVE_CACHE_CONTROL },
    });
  }

  logInfo(ROUTE, "WC26 ARCHIVE STATIC RESPONSE");
  const body = archiveResponse();
  setCached(cacheKey, body, ARCHIVE_CACHE_TTL_MS);

  return NextResponse.json(body, {
    headers: { "Cache-Control": ARCHIVE_CACHE_CONTROL },
  });
}
