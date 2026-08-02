import type { Fixture, FixtureStage } from "@/types/fixture";
import { venueLocalDateKey } from "@/lib/wc26/time-converter";
import type { Wc26GroupId } from "@/types/group";
import { WC26_GROUP_IDS } from "@/types/group";
import { getTeamById, getVenueById } from "@/data/wc26";
import {
  formatKickoffLocalTime,
  formatDeviceTimezoneShort,
} from "@/lib/formatKickoffLocal";
import {
  formatFixtureStatusLabel,
  isLiveMatchStatus,
} from "@/lib/wc26-live";
import { isEffectiveFixtureCompleted } from "@/lib/wc26-fixture-overlay";
import {
  isWc26TournamentComplete,
  WC26_ARCHIVE_DATA_AS_OF,
} from "@/lib/wc26/archive";
import {
  getUkBroadcaster,
  ukBroadcasterChannels,
} from "@/data/wc26/uk-broadcasters";

export type FixtureStatusFilter = "" | "upcoming" | "live" | "ft";

export type FixturePageFilters = {
  search: string;
  groupId: "" | Wc26GroupId;
  stage: "" | FixtureStage;
  status: FixtureStatusFilter;
  dateKey: string;
};

export type CalendarDay = {
  dateKey: string;
  count: number;
  dow: string;
  dayNum: number;
  month: string;
};

export const WC26_TV_REGIONS = [
  { code: "GB", label: "United Kingdom — BBC / ITV" },
  { code: "US", label: "United States — FOX / Telemundo" },
  { code: "CA", label: "Canada — CTV / TSN / RDS" },
  { code: "AU", label: "Australia — SBS" },
  { code: "DE", label: "Germany — ARD / ZDF" },
  { code: "FR", label: "France — TF1 / M6 / beIN" },
] as const;

export type Wc26TvRegionCode = (typeof WC26_TV_REGIONS)[number]["code"];

const TV_BY_REGION: Record<Wc26TvRegionCode, readonly string[]> = {
  GB: ["BBC", "ITV"],
  US: ["FOX", "Telemundo"],
  CA: ["CTV", "TSN", "RDS"],
  AU: ["SBS"],
  DE: ["ARD", "ZDF"],
  FR: ["TF1", "M6", "beIN"],
};

export function getTvChannels(region: Wc26TvRegionCode): readonly string[] {
  return TV_BY_REGION[region] ?? TV_BY_REGION.GB;
}

export function isWc26TvRegionCode(value: string): value is Wc26TvRegionCode {
  return (WC26_TV_REGIONS as readonly { code: string }[]).some(
    (entry) => entry.code === value,
  );
}

export function formatTvBroadcastLine(region: Wc26TvRegionCode): string {
  return getTvChannels(region).join(" / ");
}

export function getTvBroadcastDisplay(region: Wc26TvRegionCode | null): {
  available: boolean;
  line: string;
  regionalLine: string;
} {
  if (!region || !isWc26TvRegionCode(region)) {
    return {
      available: false,
      line: "Broadcast information unavailable for your region",
      regionalLine: "Broadcast information unavailable for your region",
    };
  }
  const channels = getTvChannels(region);
  if (channels.length === 0) {
    return {
      available: false,
      line: "Broadcast information unavailable for your region",
      regionalLine: "Broadcast information unavailable for your region",
    };
  }
  const line = channels.join(" / ");
  return {
    available: true,
    line,
    regionalLine: `Regional coverage: ${line}`,
  };
}

export type MatchTvBroadcastDisplay = {
  available: boolean;
  line: string;
  regionalLine: string;
  label: "Watch on:" | "Regional coverage:";
  channels: readonly string[];
  fixtureSpecific: boolean;
};

export function getMatchTvChannels(
  region: Wc26TvRegionCode,
  matchNumber?: number,
): readonly string[] {
  if (region === "GB" && matchNumber !== undefined) {
    const uk = getUkBroadcaster(matchNumber);
    if (uk) {
      return ukBroadcasterChannels(uk);
    }
  }
  return getTvChannels(region);
}

export function getMatchTvBroadcastDisplay(
  region: Wc26TvRegionCode | null,
  matchNumber?: number,
): MatchTvBroadcastDisplay {
  const unavailable: MatchTvBroadcastDisplay = {
    available: false,
    line: "Broadcast information unavailable for your region",
    regionalLine: "Broadcast information unavailable for your region",
    label: "Regional coverage:",
    channels: [],
    fixtureSpecific: false,
  };

  if (!region || !isWc26TvRegionCode(region)) {
    return unavailable;
  }

  if (region === "GB" && matchNumber !== undefined) {
    const uk = getUkBroadcaster(matchNumber);
    if (uk) {
      const channels = ukBroadcasterChannels(uk);
      const line = channels.join(" / ");
      return {
        available: true,
        line,
        regionalLine: `Watch on: ${line}`,
        label: "Watch on:",
        channels,
        fixtureSpecific: true,
      };
    }
  }

  const regional = getTvBroadcastDisplay(region);
  return {
    ...regional,
    label: "Regional coverage:",
    channels: getTvChannels(region),
    fixtureSpecific: false,
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local calendar date key (YYYY-MM-DD) for a UTC kickoff in the visitor timezone. */
export function localDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Calendar date for fixtures — knockout uses FIFA stadium-local date. */
export function fixtureCalendarDateKey(fixture: Fixture): string {
  if (fixture.stage === "group") {
    return localDateKey(fixture.kickoffUtc);
  }
  return venueLocalDateKey(fixture.kickoffUtc, fixture.venueId);
}

export function formatLocalKickoff(iso: string): string {
  return formatKickoffLocalTime(iso);
}

export function formatVisitorTimezone(): string {
  return formatDeviceTimezoneShort();
}

const calendarDateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const calendarDowFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
});

const calendarMonthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
});

export function formatLongLocalDate(dateKey: string): string {
  return calendarDateFormatter.format(new Date(`${dateKey}T12:00:00`));
}

export function shortDayParts(dateKey: string): {
  dow: string;
  dayNum: number;
  month: string;
} {
  const d = new Date(`${dateKey}T12:00:00`);
  return {
    dow: calendarDowFormatter.format(d),
    dayNum: d.getDate(),
    month: calendarMonthFormatter.format(d),
  };
}

export function formatStageLabel(stage: FixtureStage): string {
  if (stage === "group") {
    return "Group Stage";
  }
  return stage
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export type FixtureMatchClass = "live" | "ft" | "upcoming";

export function classifyFixtureMatch(
  fixture: Fixture & { readonly homeScore?: number; readonly awayScore?: number },
): FixtureMatchClass {
  if (isLiveMatchStatus(fixture.status)) {
    return "live";
  }
  if (isEffectiveFixtureCompleted(fixture)) {
    return "ft";
  }
  return "upcoming";
}

export function fixtureStatusBadgeLabel(fixture: Fixture): string {
  const matchClass = classifyFixtureMatch(fixture);
  if (matchClass === "live") {
    return formatFixtureStatusLabel(fixture.status);
  }
  if (matchClass === "ft") {
    return formatFixtureStatusLabel(fixture.status);
  }
  return `${formatLocalKickoff(fixture.kickoffUtc)} ${formatVisitorTimezone()}`;
}

function compareDateKeys(a: string, b: string): number {
  return a.localeCompare(b);
}

function minDateKey(a: string, b: string): string {
  return compareDateKeys(a, b) <= 0 ? a : b;
}

function maxDateKey(a: string, b: string): string {
  return compareDateKeys(a, b) >= 0 ? a : b;
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const cursor = new Date(`${dateKey}T12:00:00`);
  cursor.setDate(cursor.getDate() + days);
  return localDateKey(cursor.toISOString());
}

/** Build scrollable calendar days from first fixture through API max or today + 90 days. */
export function buildCalendarDays(
  fixtures: readonly Fixture[],
  now: Date = new Date(),
): CalendarDay[] {
  const counts = new Map<string, number>();
  for (const fixture of fixtures) {
    const key = fixtureCalendarDateKey(fixture);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const todayKey = localDateKey(now.toISOString());
  const archiveComplete = isWc26TournamentComplete();
  const extendedMaxKey = archiveComplete
    ? WC26_ARCHIVE_DATA_AS_OF
    : addDaysToDateKey(todayKey, 90);

  const fixtureKeys = [...counts.keys()].sort(compareDateKeys);
  const apiMinKey = fixtureKeys[0] ?? todayKey;
  const apiMaxKey = fixtureKeys[fixtureKeys.length - 1] ?? todayKey;
  const minKey = archiveComplete ? apiMinKey : minDateKey(apiMinKey, todayKey);
  const maxKey = archiveComplete
    ? minDateKey(apiMaxKey, WC26_ARCHIVE_DATA_AS_OF)
    : maxDateKey(apiMaxKey, extendedMaxKey);

  const days: CalendarDay[] = [];
  const cursor = new Date(`${minKey}T12:00:00`);
  const end = new Date(`${maxKey}T12:00:00`);

  while (cursor <= end) {
    const dateKey = localDateKey(cursor.toISOString());
    const parts = shortDayParts(dateKey);
    days.push({
      dateKey,
      count: counts.get(dateKey) ?? 0,
      dow: parts.dow,
      dayNum: parts.dayNum,
      month: parts.month,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function pickDefaultDateKey(
  days: readonly CalendarDay[],
  now: Date = new Date(),
): string {
  if (days.length === 0) {
    return "";
  }

  if (isWc26TournamentComplete()) {
    const lastWithFixtures = [...days].reverse().find((day) => day.count > 0);
    return lastWithFixtures?.dateKey ?? days[days.length - 1].dateKey;
  }

  const todayKey = localDateKey(now.toISOString());
  if (days.some((d) => d.dateKey === todayKey)) {
    return todayKey;
  }
  const future = days.find((d) => d.dateKey >= todayKey);
  return future?.dateKey ?? days[0].dateKey;
}

export function getDistinctStages(
  fixtures: readonly Fixture[],
): readonly FixtureStage[] {
  const stages = new Set<FixtureStage>();
  for (const fixture of fixtures) {
    stages.add(fixture.stage);
  }
  return [...stages].sort();
}

export function fixtureSearchHaystack(fixture: Fixture): string {
  const home = getTeamById(fixture.homeTeamId);
  const away = getTeamById(fixture.awayTeamId);
  const venue = getVenueById(fixture.venueId);
  return [
    home?.name,
    away?.name,
    home?.code,
    away?.code,
    venue?.name,
    venue?.city,
    fixture.groupId,
    fixture.stage,
    String(fixture.matchNumber),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterFixturesForPage(
  fixtures: readonly Fixture[],
  filters: FixturePageFilters,
): Fixture[] {
  const query = filters.search.trim().toLowerCase();

  return fixtures.filter((fixture) => {
    if (filters.dateKey && fixtureCalendarDateKey(fixture) !== filters.dateKey) {
      return false;
    }

    if (filters.groupId && fixture.groupId !== filters.groupId) {
      return false;
    }

    if (filters.stage && fixture.stage !== filters.stage) {
      return false;
    }

    if (filters.status) {
      const matchClass = classifyFixtureMatch(fixture);
      if (filters.status === "ft" && matchClass !== "ft") {
        return false;
      }
      if (filters.status === "live" && matchClass !== "live") {
        return false;
      }
      if (filters.status === "upcoming" && matchClass !== "upcoming") {
        return false;
      }
    }

    if (query && !fixtureSearchHaystack(fixture).includes(query)) {
      return false;
    }

    return true;
  });
}

export function sortFixturesByKickoff(fixtures: readonly Fixture[]): Fixture[] {
  return [...fixtures].sort((a, b) => {
    if (a.stage !== "group" && b.stage !== "group") {
      return a.matchNumber - b.matchNumber;
    }
    return (
      new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime() ||
      a.matchNumber - b.matchNumber
    );
  });
}

export function isWc26GroupFilter(value: string): value is Wc26GroupId {
  return (WC26_GROUP_IDS as readonly string[]).includes(value);
}
