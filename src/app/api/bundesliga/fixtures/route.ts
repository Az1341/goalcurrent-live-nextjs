import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { fetchBundesligaFixtures, bundesligaFixturesCacheControl } from "@/lib/bundesliga/api";
import { respondDomesticFixtures } from "@/lib/domestic-league/routes";

export const dynamic = "force-dynamic";

const ROUTE = "/api/bundesliga/fixtures";
const CACHE_KEY = "bundesliga-fixtures";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  const body = await fetchBundesligaFixtures();
  return respondDomesticFixtures(CACHE_KEY, body, bundesligaFixturesCacheControl);
}
