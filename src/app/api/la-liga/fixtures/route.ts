import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { fetchLaLigaFixtures, laLigaFixturesCacheControl } from "@/lib/la-liga/api";
import { respondDomesticFixtures } from "@/lib/domestic-league/routes";

export const dynamic = "force-dynamic";

const CACHE_KEY = "la-liga-fixtures";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  const body = await fetchLaLigaFixtures();
  return respondDomesticFixtures(CACHE_KEY, body, laLigaFixturesCacheControl);
}
