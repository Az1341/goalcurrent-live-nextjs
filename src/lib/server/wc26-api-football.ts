import { ApiFootballAuthError } from "@/lib/api-football/errors";
import { buildConfirmedStaticApiMatches } from "@/lib/wc26/confirmed-results";
import type { Wc26ApiMatch } from "@/types/fixture-overlay";

export class MissingApiKeyError extends ApiFootballAuthError {
  constructor() {
    super("MISSING_API_KEY");
    this.name = "MissingApiKeyError";
  }
}

export function isMissingApiKeyError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("missing application key") ||
    lower.includes("application key missing")
  );
}

/**
 * WC26 is complete and archived. Keep API-Football available for active
 * competitions, but never configure or call the provider from WC26 code again.
 */
export function isWc26ApiConfigured(): boolean {
  return false;
}

export function isTournamentLive(): boolean {
  return false;
}

export async function fetchFinishedWc26Matches(): Promise<Wc26ApiMatch[]> {
  return [...buildConfirmedStaticApiMatches()];
}

export async function fetchLiveWc26Matches(): Promise<Wc26ApiMatch[]> {
  return [];
}
