import type { MatchEventItem } from "@/types/match-detail";
import { resolveTimelineEventDisplay } from "@/components/match/timeline-event-badge";
import { formatEventMinute } from "@/lib/wc26-match";
import { sportsEventStatus } from "@/lib/seo/sports-event-status";

export type LiveBlogUpdate = {
  text: string;
  datePublished: string;
};

/** True when SportsEvent status is in-progress or completed (LIVE / FT family). */
export function isLiveBlogEligibleStatus(status: string): boolean {
  const schemaStatus = sportsEventStatus(status);
  return (
    schemaStatus === "https://schema.org/EventInProgress" ||
    schemaStatus === "https://schema.org/EventCompleted"
  );
}

/**
 * MatchEventItem has minute/extra only — no per-event ISO timestamp in the
 * shared match-detail type. datePublished is derived from kickoffUtc + elapsed
 * (plus stoppage extra when present).
 */
export function eventDatePublishedFromKickoff(
  kickoffUtc: string,
  minute: number | null,
  extra: number | null,
): string {
  const startMs = Date.parse(kickoffUtc);
  if (!Number.isFinite(startMs)) {
    return kickoffUtc;
  }
  const elapsedMinutes = (minute ?? 0) + (extra ?? 0);
  return new Date(startMs + elapsedMinutes * 60_000).toISOString();
}

export function formatLiveBlogEventText(event: MatchEventItem): string {
  const display = resolveTimelineEventDisplay(event);
  const minuteLabel = formatEventMinute(event.minute, event.extra);
  const symbol = display.badge.symbol?.trim() || "";
  const player = display.playerName?.trim() || "";

  if (player && symbol && minuteLabel) {
    return `${player} ${symbol} ${minuteLabel}'`;
  }
  if (player && minuteLabel) {
    return `${player} ${display.title} ${minuteLabel}'`;
  }
  if (symbol && minuteLabel) {
    return `${display.title} ${symbol} ${minuteLabel}'`;
  }
  if (minuteLabel) {
    return `${display.title} ${minuteLabel}'`;
  }
  return display.title;
}

export function buildLiveBlogUpdates(
  events: readonly MatchEventItem[],
  kickoffUtc: string,
): LiveBlogUpdate[] {
  const updates: LiveBlogUpdate[] = [];
  for (const event of events) {
    const text = formatLiveBlogEventText(event).trim();
    if (!text) continue;
    updates.push({
      text,
      datePublished: eventDatePublishedFromKickoff(
        kickoffUtc,
        event.minute,
        event.extra,
      ),
    });
  }
  return updates;
}

export function coverageEndTimeForFinishedMatch(
  kickoffUtc: string,
  durationMinutes = 120,
): string {
  const startMs = Date.parse(kickoffUtc);
  if (!Number.isFinite(startMs)) {
    return kickoffUtc;
  }
  return new Date(startMs + durationMinutes * 60_000).toISOString();
}
