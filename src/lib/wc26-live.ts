import type { Fixture, FixtureStatus } from "@/types/fixture";
import type { TeamId } from "@/types/team";
import { getTeamById, getVenueById, groupLabel } from "@/data/wc26";
import { isKnockoutPlaceholderTeam } from "@/data/wc26/knockout-fixtures";
import {
  getEffectiveFixtures,
  getFixtureScore,
  isEffectiveFixtureCompleted,
  type EffectiveFixture,
} from "@/lib/wc26-fixture-overlay";
import { FIFA_ROUND_OF_32_TEMPLATES } from "@/lib/wc26/fifa-bracket-mapping";
import {
  buildKnockoutBracketRounds,
  resolveBracketMatch,
  teamDisplayName,
} from "@/lib/wc26-standings";
import {
  formatKickoffLocal,
  formatKickoffLocalTime,
} from "@/lib/formatKickoffLocal";
import { localDateKey } from "@/lib/wc26-fixtures-page";
import {
  findLiveSimultaneousFinalRoundGroup,
  isSimultaneousFinalMatchdayFixture,
} from "@/lib/wc26-final-matchday";
import { isCompletedMatchStatus } from "@/lib/wc26-tournament-stats";
import { getConfirmedKnockoutPairingByFixtureId } from "@/lib/wc26/knockout-confirmed-pairings";
import type { Wc26GroupId } from "@/types/group";
const LIVE_STATUSES = new Set([
  "live",
  "in play",
  "in-play",
  "1h",
  "2h",
  "ht",
  "halftime",
  "half-time",
  "et",
  "extra time",
  "penalties",
]);

function normalizeStatus(status: string): string {
  return status.trim().toLowerCase();
}

/** True when a fixture status represents a match in progress. */
export function isLiveMatchStatus(status: FixtureStatus | string): boolean {
  if (isCompletedMatchStatus(status)) {
    return false;
  }
  return LIVE_STATUSES.has(normalizeStatus(String(status)));
}

/** Kick-off time has passed (match window started). */
export function isFixtureKickoffPassed(
  fixture: Pick<EffectiveFixture, "kickoffUtc">,
  nowMs: number = Date.now(),
): boolean {
  const kickoffMs = new Date(fixture.kickoffUtc).getTime();
  return Number.isFinite(kickoffMs) && kickoffMs <= nowMs;
}

/** Pre-match countdown — only before kick-off on fixtures still scheduled. */
export function shouldShowUpcomingCountdown(fixture: EffectiveFixture): boolean {
  if (isLiveMatchStatus(fixture.status)) {
    return false;
  }
  if (isEffectiveFixtureCompleted(fixture)) {
    return false;
  }
  return !isFixtureKickoffPassed(fixture);
}

/** Compact live row only when status is a true in-progress state. */
export function shouldShowLiveMatchCard(fixture: EffectiveFixture): boolean {
  if (isEffectiveFixtureCompleted(fixture)) {
    return false;
  }
  return isLiveMatchStatus(fixture.status);
}

export type LiveFixtureBuckets = {
  readonly live: readonly EffectiveFixture[];
  readonly today: readonly EffectiveFixture[];
  readonly upcoming: readonly EffectiveFixture[];
  readonly completed: readonly EffectiveFixture[];
};

function sortByKickoffAsc(a: Fixture, b: Fixture): number {
  return new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime();
}

function sortByKickoffDesc(a: Fixture, b: Fixture): number {
  return new Date(b.kickoffUtc).getTime() - new Date(a.kickoffUtc).getTime();
}

/** Partition effective fixtures into Live Match Centre sections. */
export function partitionFixturesForLiveCentre(
  fixtures: readonly EffectiveFixture[],
  now: Date = new Date(),
): LiveFixtureBuckets {
  const live: EffectiveFixture[] = [];
  const today: EffectiveFixture[] = [];
  const upcoming: EffectiveFixture[] = [];
  const completed: EffectiveFixture[] = [];

  const todayKey = localDateKey(now.toISOString());

  for (const fixture of fixtures) {
    const { status } = fixture;

    if (isLiveMatchStatus(status)) {
      live.push(fixture);
      const kickoffKey = localDateKey(fixture.kickoffUtc);
      if (kickoffKey === todayKey) {
        today.push(fixture);
      }
      continue;
    }

    if (isEffectiveFixtureCompleted(fixture, now)) {
      completed.push(fixture);
      continue;
    }

    // Kickoff-passed without a live/completed status stays in today/upcoming
    // buckets — never treat schedule lag as LIVE.
    const kickoffAt = new Date(fixture.kickoffUtc);
    const kickoffKey = localDateKey(fixture.kickoffUtc);
    if (kickoffKey === todayKey) {
      today.push(fixture);
    } else if (kickoffAt.getTime() > now.getTime()) {
      upcoming.push(fixture);
    }
  }

  live.sort(sortByKickoffAsc);
  today.sort(sortByKickoffAsc);
  upcoming.sort(sortByKickoffAsc);
  completed.sort(sortByKickoffDesc);

  return { live, today, upcoming, completed };
}

/** Next scheduled kickoff (excludes live/completed). */
export function findNextUpcomingMatch(
  fixtures: readonly EffectiveFixture[],
  now: Date = new Date(),
): EffectiveFixture | undefined {
  const nowMs = now.getTime();

  const candidates = fixtures.filter((fixture) => {
    if (isLiveMatchStatus(fixture.status)) {
      return false;
    }
    if (isEffectiveFixtureCompleted(fixture, now)) {
      return false;
    }
    const kickoffMs = new Date(fixture.kickoffUtc).getTime();
    return kickoffMs > nowMs;
  });

  candidates.sort(sortByKickoffAsc);
  return candidates[0];
}

/** Human-readable period label — e.g. "2nd Half", "Half Time", "Full Time". */
export function formatPeriodLabel(status: FixtureStatus | string): string {
  const normalized = normalizeStatus(String(status));
  switch (normalized) {
    case "1h": return "1st Half";
    case "2h": return "2nd Half";
    case "ht": case "halftime": case "half-time": return "Half Time";
    case "et": case "extra time": return "Extra Time";
    case "penalties": return "Penalties";
    case "ft": case "finished": case "full-time": case "completed": return "Full Time";
    case "aet": return "After Extra Time";
    case "pen": return "Penalties";
    case "live": return "Live";
    case "scheduled": return "Scheduled";
    default: return String(status).toUpperCase();
  }
}

/** Human-readable status label — no scores. */
export function formatFixtureStatusLabel(status: FixtureStatus | string): string {
  const normalized = normalizeStatus(String(status));

  switch (normalized) {
    case "scheduled":
      return "Scheduled";
    case "postponed":
      return "Postponed";
    case "cancelled":
      return "Cancelled";
    case "live":
      return "Live";
    case "ht":
    case "halftime":
    case "half-time":
      return "Half Time";
    case "1h":
      return "1st Half";
    case "2h":
      return "2nd Half";
    case "ft":
    case "finished":
    case "full-time":
    case "completed":
      return "Full Time";
    case "aet":
      return "AET";
    case "pen":
      return "Penalties";
    case "et":
    case "extra time":
      return "Extra Time";
    case "penalties":
      return "Penalties";
    case "canc":
    case "abd":
      return "Cancelled";
    case "pst":
      return "Postponed";
    default:
      return String(status).toUpperCase();
  }
}

/** Compact ticker/pill labels — FT, AET, PEN, LIVE, PST, CANC. */
export function formatCompactFixtureStatusLabel(
  status: FixtureStatus | string,
): string {
  const normalized = normalizeStatus(String(status));
  switch (normalized) {
    case "aet":
      return "AET";
    case "pen":
    case "penalties":
      return "PEN";
    case "ft":
    case "finished":
    case "full-time":
    case "completed":
      return "FT";
    case "postponed":
    case "pst":
      return "PST";
    case "cancelled":
    case "canc":
    case "abd":
      return "CANC";
    case "scheduled":
      return "SCHED";
    case "1h":
      return "1H";
    case "2h":
      return "2H";
    case "ht":
    case "halftime":
    case "half-time":
      return "HT";
    case "et":
    case "extra time":
      return "ET";
    case "live":
    case "in play":
    case "in-play":
      return "LIVE";
    default:
      return formatFixtureStatusLabel(status);
  }
}

export type HomepageMatchClass = "live" | "ft" | "upcoming";

export type HomepageMatchView = {
  readonly fixtureId: string;
  readonly homeTeamId: TeamId;
  readonly awayTeamId: TeamId;
  readonly homeName: string;
  readonly awayName: string;
  readonly matchClass: HomepageMatchClass;
  readonly statusLabel: string;
  readonly score: { home: number; away: number } | null;
  readonly kickoffUtc: string;
  readonly kickoffLabel: string;
  readonly venueLabel: string;
  readonly roundLabel: string;
  readonly elapsed: number | null;
};

function classifyHomepageMatch(
  fixture: EffectiveFixture,
  now: Date = new Date(),
): HomepageMatchClass {
  if (isLiveMatchStatus(fixture.status)) {
    return "live";
  }
  if (isEffectiveFixtureCompleted(fixture, now)) {
    return "ft";
  }
  return "upcoming";
}

function homepageStatusLabel(fixture: EffectiveFixture, matchClass: HomepageMatchClass): string {
  if (matchClass === "live") {
    return formatFixtureStatusLabel(fixture.status);
  }
  if (matchClass === "ft") {
    return formatCompactFixtureStatusLabel(fixture.status);
  }
  return formatKickoffLocalTime(fixture.kickoffUtc);
}

export type ResolvedFixtureParticipant = {
  readonly label: string;
  readonly teamId: TeamId;
};

function participantFromTeamId(teamId: TeamId): ResolvedFixtureParticipant {
  const name = getTeamById(teamId)?.name?.trim();
  return {
    label: name || teamDisplayName(teamId),
    teamId,
  };
}

function isBracketPlaceholderLabel(label: string): boolean {
  const trimmed = label.trim();
  return (
    trimmed === "TBD" ||
    trimmed.startsWith("Winner Match") ||
    trimmed.startsWith("Loser Match") ||
    trimmed.startsWith("Winner Group") ||
    trimmed.startsWith("Runner-up Group") ||
    trimmed.startsWith("Best 3rd")
  );
}

function knockoutFixtureHasApiTruth(fixture: EffectiveFixture): boolean {
  return (
    isLiveMatchStatus(fixture.status) ||
    isCompletedMatchStatus(fixture.status) ||
    getFixtureScore(fixture) !== null ||
    fixture.apiFixtureId != null ||
    Boolean(fixture.overlayHomeTeamId && fixture.overlayAwayTeamId)
  );
}

/** Resolved display label and team id for flags — bracket slots use real id when known. */
export function resolveFixtureParticipant(
  fixture: EffectiveFixture,
  side: "home" | "away",
  allFixtures: readonly EffectiveFixture[],
): ResolvedFixtureParticipant {
  const confirmedPairing = getConfirmedKnockoutPairingByFixtureId(fixture.id);
  if (confirmedPairing) {
    const teamId =
      side === "home" ? confirmedPairing.homeTeamId : confirmedPairing.awayTeamId;
    return participantFromTeamId(teamId);
  }

  const overlayTeamId =
    side === "home" ? fixture.overlayHomeTeamId : fixture.overlayAwayTeamId;
  if (overlayTeamId && !isKnockoutPlaceholderTeam(overlayTeamId)) {
    return participantFromTeamId(overlayTeamId);
  }

  const fallbackId = side === "home" ? fixture.homeTeamId : fixture.awayTeamId;

  if (!isKnockoutPlaceholderTeam(fallbackId)) {
    return participantFromTeamId(fallbackId);
  }

  const skipBracketTemplate =
    fixture.stage !== "group" && knockoutFixtureHasApiTruth(fixture);

  if (fixture.stage !== "group" && fixture.matchNumber && !skipBracketTemplate) {
    const ro32Template = FIFA_ROUND_OF_32_TEMPLATES.find(
      (template) => template.matchNumber === fixture.matchNumber,
    );
    if (ro32Template) {
      const resolved = resolveBracketMatch(ro32Template, allFixtures);
      const slot = side === "home" ? resolved.home : resolved.away;
      if (slot.label.trim()) {
        return { label: slot.label, teamId: slot.teamId ?? fallbackId };
      }
    }

    for (const round of buildKnockoutBracketRounds(allFixtures)) {
      const match = round.matches.find(
        (entry) => entry.matchNumber === fixture.matchNumber,
      );
      if (match) {
        const slot = side === "home" ? match.home : match.away;
        if (slot.label.trim()) {
          return { label: slot.label, teamId: slot.teamId ?? fallbackId };
        }
      }
    }

    if (isKnockoutPlaceholderTeam(fallbackId)) {
      return {
        label: `Winner Match ${fixture.matchNumber}`,
        teamId: fallbackId,
      };
    }
  }

  if (skipBracketTemplate) {
    const latePairing = getConfirmedKnockoutPairingByFixtureId(fixture.id);
    if (latePairing) {
      const teamId =
        side === "home" ? latePairing.homeTeamId : latePairing.awayTeamId;
      return participantFromTeamId(teamId);
    }
    return { label: "TBD", teamId: fallbackId };
  }

  if (isKnockoutPlaceholderTeam(fallbackId)) {
    return { label: "TBD", teamId: fallbackId };
  }

  return { label: teamDisplayName(fallbackId), teamId: fallbackId };
}

/** Human-readable team label — never blank for unconfirmed knockout slots. */
export function resolveFixtureParticipantLabel(
  fixture: EffectiveFixture,
  side: "home" | "away",
  allFixtures: readonly EffectiveFixture[],
): string {
  return resolveFixtureParticipant(fixture, side, allFixtures).label;
}

export function buildHomepageMatchView(
  fixture: EffectiveFixture,
  allFixtures: readonly EffectiveFixture[] = getEffectiveFixtures(),
): HomepageMatchView {
  const venue = getVenueById(fixture.venueId);
  const matchClass = classifyHomepageMatch(fixture);
  const roundLabel = fixture.groupId
    ? groupLabel(fixture.groupId)
    : fixture.stage.replace(/-/g, " ");

  const home = resolveFixtureParticipant(fixture, "home", allFixtures);
  const away = resolveFixtureParticipant(fixture, "away", allFixtures);

  return {
    fixtureId: fixture.id,
    homeTeamId: home.teamId,
    awayTeamId: away.teamId,
    homeName: home.label,
    awayName: away.label,
    matchClass,
    statusLabel: homepageStatusLabel(fixture, matchClass),
    score: getFixtureScore(fixture),
    kickoffUtc: fixture.kickoffUtc,
    kickoffLabel: formatKickoffLocal(fixture.kickoffUtc),
    venueLabel: venue ? `${venue.name}, ${venue.city}` : "",
    roundLabel,
    elapsed: fixture.elapsed ?? null,
  };
}

export type FeaturedFixtureSelection = {
  readonly mode: "single" | "simultaneous";
  readonly fixtures: readonly EffectiveFixture[];
  readonly groupId?: Wc26GroupId;
};

function featuredCandidateFixtures(
  fixtures: readonly EffectiveFixture[],
): readonly EffectiveFixture[] {
  const buckets = partitionFixturesForLiveCentre(fixtures);
  return [...buckets.live, ...buckets.today, ...buckets.upcoming];
}

/** All non-finished fixtures that share the seed kickoff slot (2+ → dual featured hero). */
function findSimultaneousKickoffPeers(
  fixtures: readonly EffectiveFixture[],
  seed: EffectiveFixture,
): readonly EffectiveFixture[] {
  const peers = featuredCandidateFixtures(fixtures).filter(
    (fixture) => fixture.kickoffUtc === seed.kickoffUtc,
  );

  if (peers.length < 2) {
    return [seed];
  }

  return [...peers].sort(sortByKickoffAsc);
}

function dedupeFeaturedFixtures(
  fixtures: readonly EffectiveFixture[],
  allFixtures: readonly EffectiveFixture[],
): readonly EffectiveFixture[] {
  const seenIds = new Set<string>();
  const seenTeamPairs = new Set<string>();
  const seenLabelPairs = new Set<string>();
  const unique: EffectiveFixture[] = [];

  for (const fixture of fixtures) {
    if (seenIds.has(fixture.id)) {
      continue;
    }

    const home = resolveFixtureParticipant(fixture, "home", allFixtures);
    const away = resolveFixtureParticipant(fixture, "away", allFixtures);
    const pairKey = [home.teamId, away.teamId].sort().join("|");
    const labelKey = [home.label, away.label]
      .map((label) => label.trim().toLowerCase())
      .sort()
      .join("|");
    if (seenTeamPairs.has(pairKey) || seenLabelPairs.has(labelKey)) {
      continue;
    }

    seenIds.add(fixture.id);
    seenTeamPairs.add(pairKey);
    seenLabelPairs.add(labelKey);
    unique.push(fixture);
  }

  return unique;
}

export type SelectFeaturedOptions = {
  /** When false, never fall back to latest completed result (production-truth default). */
  readonly allowCompletedFallback?: boolean;
};

/** Featured: simultaneous kickoff slots (2+), else first live/today/upcoming. */
export function selectFeaturedFixtures(
  fixtures: readonly EffectiveFixture[],
  options: SelectFeaturedOptions = {},
): FeaturedFixtureSelection {
  const allowCompletedFallback = options.allowCompletedFallback ?? false;
  const liveFinal = findLiveSimultaneousFinalRoundGroup(fixtures);
  if (liveFinal) {
    const deduped = dedupeFeaturedFixtures(liveFinal.fixtures, fixtures);
    if (deduped.length >= 2) {
      return {
        mode: "simultaneous",
        fixtures: deduped,
        groupId: liveFinal.groupId,
      };
    }
    if (deduped.length === 1) {
      return { mode: "single", fixtures: deduped };
    }
  }

  const seed = selectFeaturedFixture(fixtures, { allowCompletedFallback });
  if (!seed) {
    return { mode: "single", fixtures: [] };
  }

  if (
    seed.stage === "group" &&
    seed.groupId &&
    isSimultaneousFinalMatchdayFixture(seed, fixtures)
  ) {
    const peers = dedupeFeaturedFixtures(
      findSimultaneousKickoffPeers(fixtures, seed),
      fixtures,
    );
    if (peers.length >= 2) {
      return {
        mode: "simultaneous",
        fixtures: peers,
        groupId: seed.groupId,
      };
    }
  }

  return { mode: "single", fixtures: [seed] };
}

function featuredLivePriority(fixture: EffectiveFixture): number {
  if (getConfirmedKnockoutPairingByFixtureId(fixture.id)) {
    return 2;
  }
  if (fixture.overlayHomeTeamId && fixture.overlayAwayTeamId) {
    return 1;
  }
  return 0;
}

/** Featured: first live, else next kickoff today/upcoming, optionally latest result. */
export function selectFeaturedFixture(
  fixtures: readonly EffectiveFixture[],
  options: SelectFeaturedOptions = {},
): EffectiveFixture | undefined {
  const allowCompletedFallback = options.allowCompletedFallback ?? false;
  const buckets = partitionFixturesForLiveCentre(fixtures);
  if (buckets.live.length > 0) {
    const sorted = [...buckets.live].sort((left, right) => {
      const priorityDelta = featuredLivePriority(right) - featuredLivePriority(left);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      return sortByKickoffAsc(left, right);
    });
    return sorted[0];
  }
  if (buckets.today[0]) {
    return buckets.today[0];
  }
  if (buckets.upcoming[0]) {
    return buckets.upcoming[0];
  }
  return allowCompletedFallback ? buckets.completed[0] : undefined;
}

/** Homepage live football rows — live, recent FT, then upcoming (excludes featured). */
export function selectHomepageFixtures(
  fixtures: readonly EffectiveFixture[],
  excludeFixtureIds: readonly string[] = [],
  limit = 6,
): readonly HomepageMatchView[] {
  const exclude = new Set(excludeFixtureIds);
  const buckets = partitionFixturesForLiveCentre(fixtures);
  const ordered = [
    ...buckets.live,
    ...buckets.completed,
    ...buckets.today,
    ...buckets.upcoming,
  ];

  const seen = new Set<string>();
  const views: HomepageMatchView[] = [];

  for (const fixture of ordered) {
    if (exclude.has(fixture.id) || seen.has(fixture.id)) {
      continue;
    }
    const view = buildHomepageMatchView(fixture, fixtures);
    if (view.matchClass === "ft" && !view.score) {
      continue;
    }
    seen.add(fixture.id);
    views.push(view);
    if (views.length >= limit) {
      break;
    }
  }

  return views;
}

/** Homepage upcoming rows — today + future kickoffs (excludes featured). */
export function selectUpcomingHomepageFixtures(
  fixtures: readonly EffectiveFixture[],
  excludeFixtureIds: readonly string[] = [],
  limit = 6,
): readonly HomepageMatchView[] {
  const exclude = new Set(excludeFixtureIds);
  const buckets = partitionFixturesForLiveCentre(fixtures);
  const ordered = [...buckets.today, ...buckets.upcoming];
  const views: HomepageMatchView[] = [];

  for (const fixture of ordered) {
    if (exclude.has(fixture.id)) {
      continue;
    }
    const view = buildHomepageMatchView(fixture, fixtures);
    if (view.matchClass !== "upcoming") {
      continue;
    }
    views.push(view);
    if (views.length >= limit) {
      break;
    }
  }

  return views;
}

/** Header ribbon ticker — live + recent full-time results only. */
export function selectRibbonFixtures(
  fixtures: readonly EffectiveFixture[],
  limit = 8,
): readonly HomepageMatchView[] {
  const buckets = partitionFixturesForLiveCentre(fixtures);
  const ordered = [...buckets.live, ...buckets.completed];

  const seen = new Set<string>();
  const seenLabelPairs = new Set<string>();
  const views: HomepageMatchView[] = [];

  for (const fixture of ordered) {
    if (seen.has(fixture.id)) {
      continue;
    }

    const view = buildHomepageMatchView(fixture, fixtures);
    const labelKey = [view.homeName, view.awayName]
      .map((label) => label.trim().toLowerCase())
      .sort()
      .join("|");
    if (seenLabelPairs.has(labelKey)) {
      continue;
    }
    if (
      view.homeName === "TBD" ||
      view.awayName === "TBD" ||
      view.homeName.startsWith("Winner Match") ||
      view.awayName.startsWith("Winner Match") ||
      isBracketPlaceholderLabel(view.homeName) ||
      isBracketPlaceholderLabel(view.awayName)
    ) {
      continue;
    }

    if (view.matchClass === "ft") {
      if (!view.score) {
        continue;
      }
    }

    seen.add(fixture.id);
    seenLabelPairs.add(labelKey);
    views.push(view);
    if (views.length >= limit) {
      break;
    }
  }

  return views;
}
