import { NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { fetchSerieAStandings, serieAStandingsCacheControl } from "@/lib/serie-a/api";
import { respondDomesticStandings } from "@/lib/domestic-league/routes";

export const dynamic = "force-dynamic";

const CACHE_KEY = "api/serie-a/standings";

export async function GET(request: Request): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  const body = await fetchSerieAStandings();
  return respondDomesticStandings(CACHE_KEY, body, serieAStandingsCacheControl);
}
