/** Hide the homepage Community Shield countdown this long after kickoff. */
export const COMMUNITY_SHIELD_COUNTDOWN_RETIRE_MS = 3 * 60 * 60 * 1000;

/**
 * True while the Community Shield homepage countdown should render.
 * Retires automatically more than 3 hours after kickoffUtc.
 */
export function isCommunityShieldCountdownActive(
  kickoffUtc: string | null | undefined,
  nowMs: number,
): boolean {
  if (!kickoffUtc) return false;
  const kickoffMs = Date.parse(kickoffUtc);
  if (!Number.isFinite(kickoffMs)) return false;
  return nowMs <= kickoffMs + COMMUNITY_SHIELD_COUNTDOWN_RETIRE_MS;
}