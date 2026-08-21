import { NextRequest, NextResponse } from "next/server";
import { respondError } from "@/lib/api/response";
import { GC_STALE_RESPONSE_HEADER } from "@/lib/api-football/cache";
import { captureRouteError } from "@/lib/log";
import {
  getCachedPlMatchDetail,
  plMatchCacheControl,
} from "@/lib/pl/match-detail";
import { fixtureIdParamSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ fixtureId: string }>;
};

function resolveRequestLocale(request: NextRequest): string {
  return (
    request.headers.get("accept-language")?.split(",")[0]?.trim() ?? "en-GB"
  );
}

function parseFixtureId(raw: string): number | null {
  const parsed = fixtureIdParamSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { fixtureId: rawId } = await params;
  const fixtureId = parseFixtureId(rawId);

  if (fixtureId === null) {
    return respondError("invalid_fixture_id", "Invalid fixture id.", 400);
  }

  try {
    const body = await getCachedPlMatchDetail(
      fixtureId,
      resolveRequestLocale(request),
    );

    const headers: Record<string, string> = {
      "Cache-Control": body.fixture
        ? plMatchCacheControl(body)
        : "no-store",
    };
    if (body.stale) {
      headers[GC_STALE_RESPONSE_HEADER] = "1";
    }

    if (!body.fixture) {
      return NextResponse.json(body, {
        status: body.error?.includes("not found") ? 404 : 200,
        headers,
      });
    }

    return NextResponse.json(body, { headers });
  } catch (error) {
    captureRouteError("api/pl/match", error);
    return NextResponse.json(
      {
        configured: Boolean(process.env.API_FOOTBALL_KEY?.trim()),
        league: "Premier League",
        leagueId: 39,
        season: 2026,
        fixtureId,
        fixture: null,
        apiAvailable: false,
        events: [],
        lineups: { home: null, away: null },
        statistics: [],
        h2h: [],
        standingsSnapshot: [],
        source: "fallback",
        fetchedAt: new Date().toISOString(),
        error: "Failed to fetch match detail.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}