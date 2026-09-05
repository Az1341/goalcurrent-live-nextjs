import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { wc26FixturesQuerySchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, wc26FixturesQuerySchema);
  if ("error" in validated) return validated.error;

  return NextResponse.json([], {
    headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400" },
  });
}
