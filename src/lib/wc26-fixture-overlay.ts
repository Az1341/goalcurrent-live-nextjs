import { WC26_FIXTURES } from "@/data/wc26";
import { applyAllConfirmedResults } from "@/lib/wc26/confirmed-results";
import { isCompletedMatchStatus } from "@/lib/wc26-tournament-stats";
import type { Fixture, FixtureStatus } from "@/types/fixture";
import type { FixtureOverlayEntry } from "@/types/fixture-overlay";
import type { TeamId } from "@/types/team";

export const WC26_FIXTURES_UPDATED_EVENT = "wc26:fixtures-updated";

/** Fixture with optional runtime overlay fields merged from API sync. */
export type EffectiveFixture = Fixture & {
  readonly homeScore?: number;
  readonly awayScore?: number;
  readonly elapsed?: number | null;
  readonly apiFixtureId?: number;
  /** API-synced participants — used instead of bracket labels when present. */
  readonly overlayHomeTeamId?: TeamId;
  readonly overlayAwayTeamId?: TeamId;
  readonly penaltiesHome?: number;
  readonly penaltiesAway?: number;
};

type OverlayState = Record<string, FixtureOverlayEntry>;

let overlay: OverlayState = {};

function notifyFixtureUpdate(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(WC26_FIXTURES_UPDATED_EVENT));
}

function toFixtureStatus(status: string): FixtureStatus | string {
  const normalized = status.trim().toLowerCase();
  if (
    normalized === "scheduled" ||
    normalized === "postponed" ||
    normalized === "cancelled"
  ) {
    return normalized;
  }
  return status;
}

function entryFromStatus(status: string): FixtureOverlayEntry {
  return { status };
}

/** Replace the full runtime overlay (for API sync). */
export function setFixtureOverlay(next: OverlayState): void {
  overlay = { ...next };
  notifyFixtureUpdate();
}

/** Merge partial overlay updates from API sync. */
export function mergeFixtureOverlay(partial: OverlayState): void {
  overlay = { ...overlay, ...partial };
  notifyFixtureUpdate();
}

const LIVE_OVERLAY_STATUSES = new Set([
  "live",
  "1h",
  "2h",
  "ht",
  "et",
  "penalties",
]);

function isLiveOverlayEntry(entry: FixtureOverlayEntry): boolean {
  return LIVE_OVERLAY_STATUSES.has(entry.status.trim().toLowerCase());
}

/**
 * Replace live overlay entries — clears stale live slots before merging.
 * Transient empty payloads are ignored so last-known live rows survive API blips.
 * Use {@link clearLiveFixtureOverlay} for an intentional confirmed-empty live set.
 */
export function replaceLiveFixtureOverlay(partial: OverlayState): void {
  if (Object.keys(partial).length === 0) {
    return;
  }
  const next: OverlayState = { ...overlay };
  for (const [fixtureId, entry] of Object.entries(next)) {
    if (isLiveOverlayEntry(entry)) {
      delete next[fixtureId];
    }
  }
  overlay = { ...next, ...partial };
  notifyFixtureUpdate();
}

/** Remove only in-play overlay rows (confirmed empty live set). */
export function clearLiveFixtureOverlay(): void {
  const next: OverlayState = { ...overlay };
  let changed = false;
  for (const [fixtureId, entry] of Object.entries(next)) {
    if (isLiveOverlayEntry(entry)) {
      delete next[fixtureId];
      changed = true;
    }
  }
  if (!changed) {
    return;
  }
  overlay = next;
  notifyFixtureUpdate();
}

/** @deprecated Use mergeFixtureOverlay — status-only partial merge. */
export function mergeFixtureStatusOverlay(
  partial: Readonly<Record<string, string>>,
): void {
  const mapped: OverlayState = {};
  for (const [fixtureId, status] of Object.entries(partial)) {
    mapped[fixtureId] = entryFromStatus(status);
  }
  mergeFixtureOverlay(mapped);
}

/** @deprecated Use setFixtureOverlay — status-only full replace. */
export function setFixtureStatusOverlay(next: Readonly<Record<string, string>>): void {
  const mapped: OverlayState = {};
  for (const [fixtureId, status] of Object.entries(next)) {
    mapped[fixtureId] = entryFromStatus(status);
  }
  setFixtureOverlay(mapped);
}

/** Clear overlay — revert to static scheduled fixtures. */
export function clearFixtureOverlay(): void {
  overlay = {};
  notifyFixtureUpdate();
}

/** @deprecated Use clearFixtureOverlay */
export function clearFixtureStatusOverlay(): void {
  clearFixtureOverlay();
}

/** Current overlay snapshot (for debugging/tests). */
export function getFixtureOverlaySnapshot(): Readonly<OverlayState> {
  return overlay;
}

/** WC26 fixtures with runtime overlay applied — status and optional scores. */
export function getEffectiveFixtures(): readonly EffectiveFixture[] {
  const merged =
    Object.keys(overlay).length === 0
      ? WC26_FIXTURES
      : WC26_FIXTURES.map((fixture) => {
    const entry = overlay[fixture.id];
    if (!entry) {
      return fixture;
    }

    return {
      ...fixture,
      status: toFixtureStatus(entry.status) as FixtureStatus,
      ...(entry.homeScore !== undefined ? { homeScore: entry.homeScore } : {}),
      ...(entry.awayScore !== undefined ? { awayScore: entry.awayScore } : {}),
      ...(entry.elapsed !== undefined ? { elapsed: entry.elapsed } : {}),
      ...(entry.apiFixtureId !== undefined ? { apiFixtureId: entry.apiFixtureId } : {}),
      ...(entry.homeTeamId !== undefined
        ? { overlayHomeTeamId: entry.homeTeamId }
        : {}),
      ...(entry.awayTeamId !== undefined
        ? { overlayAwayTeamId: entry.awayTeamId }
        : {}),
      ...(entry.kickoffUtc !== undefined ? { kickoffUtc: entry.kickoffUtc } : {}),
      ...(entry.penaltiesHome !== undefined ? { penaltiesHome: entry.penaltiesHome } : {}),
      ...(entry.penaltiesAway !== undefined ? { penaltiesAway: entry.penaltiesAway } : {}),
    };
  });

  return applyAllConfirmedResults(merged);
}

export function getFixtureScore(
  fixture: EffectiveFixture,
): { home: number; away: number } | null {
  if (
    typeof fixture.homeScore === "number" &&
    typeof fixture.awayScore === "number"
  ) {
    return { home: fixture.homeScore, away: fixture.awayScore };
  }
  return null;
}

/** True when overlay status or synced scores indicate a finished match. */
export function isEffectiveFixtureCompleted(
  fixture: EffectiveFixture,
  now: Date = new Date(),
): boolean {
  if (isCompletedMatchStatus(fixture.status)) {
    return true;
  }
  const score = getFixtureScore(fixture);
  if (score === null) {
    return false;
  }
  // Knockout with API scores — static FIFA kickoff may be a later slot than the real match.
  if (fixture.apiFixtureId != null && fixture.stage !== "group") {
    return true;
  }
  return new Date(fixture.kickoffUtc).getTime() <= now.getTime();
}
