import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { wc26KnockoutFixturesQuerySchema } from "@/lib/validation/schemas";
import type { Wc26KnockoutApiFixture } from "@/lib/server/wc26-knockout-fixtures";

export const dynamic = "force-dynamic";

/** Public knockout fixtures contract - WC26 is archived, so no provider calls. */
export type Wc26KnockoutFixturesPublicResponse = {
  readonly fixtures: readonly Wc26KnockoutApiFixture[];
  readonly source: "api-football" | "static";
  readonly message?: string;
  readonly error?: string;
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, wc26KnockoutFixturesQuerySchema);
  if ("error" in validated) return validated.error;

  return NextResponse.json(
    {
      fixtures: [],
      source: "static",
      message: "WC26 is complete and archived; live provider requests are disabled.",
    } satisfies Wc26KnockoutFixturesPublicResponse,
    { headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400" } },
  );
}
