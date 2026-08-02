import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { wc26KnockoutFixturesQuerySchema } from "@/lib/validation/schemas";
import { captureRouteError } from "@/lib/log";
import {
  apiFootballErrorMessage,
  classifyApiFootballError,
} from "@/lib/api-football/errors";
import {
  fetchWc26KnockoutFixtures,
  fetchWc26KnockoutRound,
  isWc26KnockoutApiRound,
  type Wc26KnockoutApiFixture,
  type Wc26KnockoutApiRound,
} from "@/lib/server/wc26-knockout-fixtures";
import {
  isMissingApiKeyError,
  isWc26ApiConfigured,
  MissingApiKeyError,
} from "@/lib/server/wc26-api-football";

export const dynamic = "force-dynamic";

/** Public knockout fixtures contract — no diagnostic fetch logs (BE-011). */
export type Wc26KnockoutFixturesPublicResponse = {
  readonly fixtures: readonly Wc26KnockoutApiFixture[];
  readonly source: "api-football" | "static";
  readonly message?: string;
  readonly error?: string;
};

function publicJson(
  body: Wc26KnockoutFixturesPublicResponse,
  init?: { status?: number },
): NextResponse {
  return NextResponse.json(body, {
    status: init?.status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isKnockoutRound(value: string): value is Wc26KnockoutApiRound {
  return isWc26KnockoutApiRound(value);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, wc26KnockoutFixturesQuerySchema);
  if ("error" in validated) return validated.error;

  const round = validated.data.round ?? "";

  if (!isWc26ApiConfigured()) {
    return publicJson({
      fixtures: [],
      source: "static",
      message: "API key not configured — using local FIFA schedule",
    });
  }

  try {
    if (round && isKnockoutRound(round)) {
      const { fixtures } = await fetchWc26KnockoutRound(round);
      return publicJson({ fixtures, source: "api-football" });
    }

    const { fixtures } = await fetchWc26KnockoutFixtures();
    return publicJson({ fixtures, source: "api-football" });
  } catch (error) {
    if (
      error instanceof MissingApiKeyError ||
      isMissingApiKeyError(
        error instanceof Error ? error.message : "Unknown error",
      )
    ) {
      return publicJson({ fixtures: [], source: "static" });
    }

    const code = classifyApiFootballError(error);
    captureRouteError("api/wc26/knockout-fixtures", error);

    return publicJson(
      {
        error: code,
        message: apiFootballErrorMessage(code),
        fixtures: [],
        source: "static",
      },
      { status: code === "unknown_error" ? 500 : 503 },
    );
  }
}
