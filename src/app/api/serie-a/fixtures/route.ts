import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { fetchSerieAFixtures, serieAFixturesCacheControl } from "@/lib/serie-a/api";
import { respondDomesticFixtures } from "@/lib/domestic-league/routes";

export const dynamic = "force-dynamic";

const ROUTE = "/api/serie-a/fixtures";
const CACHE_KEY = "serie-a-fixtures";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  const body = await fetchSerieAFixtures();
  return respondDomesticFixtures(CACHE_KEY, body, serieAFixturesCacheControl);
}
