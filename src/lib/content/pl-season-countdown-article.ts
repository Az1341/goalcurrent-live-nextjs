import { PL_SEASON_START_ISO } from "@/lib/pl/constants";

/** Homepage / news-hub slug for the living PL season-return countdown preview. */
export const PL_SEASON_COUNTDOWN_ARTICLE_SLUG =
  "premier-league-2026-27-two-weeks-out" as const;

/** Original publish ISO (matches ARTICLE_INDEX "7 August 2026"). */
export const PL_SEASON_COUNTDOWN_ORIGINAL_PUBLISH_ISO =
  "2026-08-07T09:00:00.000Z";

const TITLE_SUFFIX =
  "Premier League 2026/27 Returns After Spain's World Cup Triumph";

/**
 * London calendar date as YYYY-MM-DD using Intl for DST-correct results.
 * Used for day-boundary calculations without depending on system locale.
 */
function londonYmd(nowMs: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(nowMs));
}

/**
 * Calendar days remaining until PL season opener (Arsenal vs Coventry) in
 * London local dates. Returns 0 on kickoff day and beyond.
 *
 * Examples (all London calendar dates):
 *   7 Aug 뿯↽ 14, 12 Aug 뿯↽ 9, 20 Aug 뿯↽ 1, 21 Aug onward 뿯↽ 0
 */
export function daysUntilPlSeasonKickoff(nowMs: number = Date.now()): number {
  const kickoffMs = Date.parse(PL_SEASON_START_ISO);
  if (!Number.isFinite(kickoffMs) || nowMs >= kickoffMs) return 0;
  const today = Date.parse(`${londonYmd(nowMs)}T00:00:00.000Z`);
  const kickDay = Date.parse(`${londonYmd(kickoffMs)}T00:00:00.000Z`);
  return Math.max(0, Math.round((kickDay - today) / 86_400_000));
}

/** True while the countdown article should roll its freshness daily (pre-kickoff). */
export function isPlSeasonCountdownRolling(nowMs: number = Date.now()): boolean {
  const kickoffMs = Date.parse(PL_SEASON_START_ISO);
  return Number.isFinite(kickoffMs) && nowMs < kickoffMs;
}

/**
 * Fresh publish stamp for news cards (London calendar day @ 09:00 UTC).
 * Clamped to nowMs so pre-09:00 requests never get a future timestamp.
 * Returns null after PL kickoff — callers should fall back to the static
 * ARTICLE_INDEX date.
 */
export function rollingPlSeasonCountdownPublishIso(
  nowMs: number = Date.now(),
): string | null {
  if (!isPlSeasonCountdownRolling(nowMs)) return null;
  const dayStampMs = Date.parse(`${londonYmd(nowMs)}T09:00:00.000Z`);
  if (!Number.isFinite(dayStampMs)) return null;
  return new Date(Math.min(dayStampMs, nowMs)).toISOString();
}

/**
 * Dynamic headline that stays accurate as kickoff approaches.
 *
 * States:
 *   14 days  뿯↽ "Two Weeks to Kick-Off — ..."
 *   N days   뿯↽ "N Days to Kick-Off — ..."
 *   1 day    뿯↽ "1 Day to Kick-Off — ..."
 *   0 days   뿯↽ "Kick-Off Day — ..."
 */
export function plSeasonCountdownHeadline(nowMs: number = Date.now()): string {
  const days = daysUntilPlSeasonKickoff(nowMs);
  if (days <= 0) {
    return `Kick-Off Day — ${TITLE_SUFFIX}`;
  }
  if (days === 1) {
    return `1 Day to Kick-Off — ${TITLE_SUFFIX}`;
  }
  if (days === 14) {
    return `Two Weeks to Kick-Off — ${TITLE_SUFFIX}`;
  }
  return `${days} Days to Kick-Off — ${TITLE_SUFFIX}`;
}

/**
 * Inline timing phrase for article body copy.
 *
 * States:
 *   0 days  뿯↽ "kicks off today"
 *   1 day   뿯↽ "kicks off tomorrow"
 *   N days  뿯↽ "kicks off in N days"
 */
export function plSeasonCountdownBodyTiming(nowMs: number = Date.now()): string {
  const days = daysUntilPlSeasonKickoff(nowMs);
  if (days <= 0) return "kicks off today";
  if (days === 1) return "kicks off tomorrow";
  return `kicks off in ${days} days`;
}

/** Display date for the article hero byline (London). Rolls until kickoff. */
export function plSeasonCountdownDisplayDate(
  nowMs: number = Date.now(),
): string {
  if (!isPlSeasonCountdownRolling(nowMs)) {
    return "7 August 2026";
  }
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(nowMs));
}
