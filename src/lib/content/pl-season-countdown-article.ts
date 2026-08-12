import { PL_SEASON_START_ISO } from "@/lib/pl/constants";

/** Homepage / news-hub slug for the living PL season-return countdown preview. */
export const PL_SEASON_COUNTDOWN_ARTICLE_SLUG =
  "premier-league-2026-27-two-weeks-out" as const;

/** First publish instant (matches ARTICLE_INDEX "7 August 2026"). */
export const PL_SEASON_COUNTDOWN_ORIGINAL_PUBLISH_ISO =
  "2026-08-07T09:00:00.000Z";

const TITLE_SUFFIX =
  "Premier League 2026/27 Returns After Spain's World Cup Triumph";

function londonYmd(nowMs: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(nowMs));
}

/**
 * Calendar days remaining until Arsenal vs Coventry (London dates).
 * Aug 7 → 14, Aug 12 → 9, kickoff day / after → 0.
 */
export function daysUntilPlSeasonKickoff(nowMs: number = Date.now()): number {
  const kickoffMs = Date.parse(PL_SEASON_START_ISO);
  if (!Number.isFinite(kickoffMs) || nowMs >= kickoffMs) return 0;
  const today = Date.parse(`${londonYmd(nowMs)}T00:00:00.000Z`);
  const kickDay = Date.parse(`${londonYmd(kickoffMs)}T00:00:00.000Z`);
  return Math.max(0, Math.round((kickDay - today) / 86_400_000));
}

/** True while the countdown article should roll its homepage freshness daily. */
export function isPlSeasonCountdownRolling(nowMs: number = Date.now()): boolean {
  const kickoffMs = Date.parse(PL_SEASON_START_ISO);
  return Number.isFinite(kickoffMs) && nowMs < kickoffMs;
}

/**
 * Daily publish stamp for news cards (London calendar day @ 09:00Z).
 * Clamped to `nowMs` so morning requests never get a future dateTime.
 * Returns null after PL kickoff — callers keep the static ARTICLE_INDEX date.
 */
export function rollingPlSeasonCountdownPublishIso(
  nowMs: number = Date.now(),
): string | null {
  if (!isPlSeasonCountdownRolling(nowMs)) return null;
  const dayStampMs = Date.parse(`${londonYmd(nowMs)}T09:00:00.000Z`);
  if (!Number.isFinite(dayStampMs)) return null;
  return new Date(Math.min(dayStampMs, nowMs)).toISOString();
}

/** Dynamic headline so "Two Weeks" does not go stale on the homepage. */
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

/** Display date for the article hero byline (London). */
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