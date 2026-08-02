import { getPlSsotFixtures } from "@/lib/pl/fixtures-ssot";
import type { PlFixtureRow } from "@/lib/pl/types";
import { getUnlSsotFixtures } from "@/lib/unl/fixtures-ssot";
import { formatUnlHostLabel } from "@/lib/unl/host-country";
import type { UnlFixtureRow } from "@/lib/unl/types";
import type { UclFixtureRow } from "@/lib/ucl/types";
import type { FacupFixtureRow } from "@/lib/facup/types";

export type CalendarCompetitionKey = "pl" | "ucl" | "facup" | "unl";

export type CalendarFixture = {
  id: string;
  competitionKey: CalendarCompetitionKey;
  competitionLabel: string;
  kickoffUtc: string;
  homeName: string;
  awayName: string;
  status: string;
  href: string;
  groupLabel?: string;
  /** Host country / venue country label when known. */
  venueLabel?: string;
  homeFlag?: string | null;
  awayFlag?: string | null;
};

const LABELS: Record<CalendarCompetitionKey, string> = {
  pl: "Premier League",
  ucl: "Champions League",
  facup: "FA Cup",
  unl: "Nations League 26/27",
};

function fromUnlRow(row: UnlFixtureRow): CalendarFixture {
  return {
    id: `unl-${row.fixtureId}`,
    competitionKey: "unl",
    competitionLabel: LABELS.unl,
    kickoffUtc: row.kickoffUtc,
    homeName: row.homeTeamName,
    awayName: row.awayTeamName,
    status: row.status,
    href: `/nations-league/match/${row.fixtureId}`,
    groupLabel: row.groupId.toUpperCase(),
    venueLabel: formatUnlHostLabel(row.homeTeamName, row.homeTeamFlag),
    homeFlag: row.homeTeamFlag,
    awayFlag: row.awayTeamFlag,
  };
}

function fromPlRow(row: PlFixtureRow): CalendarFixture {
  return {
    id: `pl-${row.fixtureId}`,
    competitionKey: "pl",
    competitionLabel: LABELS.pl,
    kickoffUtc: row.kickoffUtc,
    homeName: row.homeTeamName,
    awayName: row.awayTeamName,
    status: row.status,
    href: `/premier-league/match/${row.fixtureId}`,
  };
}

export function getUnlCalendarFixtures(): CalendarFixture[] {
  return getUnlSsotFixtures().map(fromUnlRow);
}

export function getPlCalendarFixtures(locale = "en-GB"): CalendarFixture[] {
  return getPlSsotFixtures(locale).map(fromPlRow);
}

export function normalizeUnlApiFixtures(
  fixtures: readonly UnlFixtureRow[],
): CalendarFixture[] {
  return fixtures.map(fromUnlRow);
}

export function normalizePlApiFixtures(
  fixtures: readonly PlFixtureRow[],
): CalendarFixture[] {
  return fixtures.map(fromPlRow);
}

export function normalizeUclApiFixtures(
  fixtures: readonly UclFixtureRow[],
): CalendarFixture[] {
  return fixtures.map((row) => ({
    id: `ucl-${row.fixtureId}`,
    competitionKey: "ucl" as const,
    competitionLabel: LABELS.ucl,
    kickoffUtc: row.kickoffUtc,
    homeName: row.homeTeamName,
    awayName: row.awayTeamName,
    status: row.status,
    href: "/champions-league",
    groupLabel: row.round ?? undefined,
  }));
}

export function normalizeFacupApiFixtures(
  fixtures: readonly FacupFixtureRow[],
): CalendarFixture[] {
  return fixtures
    .filter((row): row is FacupFixtureRow & { kickoffUtc: string } =>
      Boolean(row.kickoffUtc),
    )
    .map((row) => ({
      id: `facup-${row.fixtureId}`,
      competitionKey: "facup" as const,
      competitionLabel: LABELS.facup,
      kickoffUtc: row.kickoffUtc,
      homeName: row.homeTeamName,
      awayName: row.awayTeamName,
      status: row.status,
      href: "/fa-cup",
      groupLabel: row.roundLabel || row.round || undefined,
    }));
}

export function yearMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function localDateKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function shiftYearMonth(ym: string, delta: number): string {
  const [yRaw, mRaw] = ym.split("-");
  const y = Number(yRaw);
  const m = Number(mRaw);
  if (!y || !m) return ym;
  const d = new Date(y, m - 1 + delta, 1);
  return yearMonthKey(d);
}

export function formatYearMonthLabel(ym: string): string {
  const [yRaw, mRaw] = ym.split("-");
  const y = Number(yRaw);
  const m = Number(mRaw);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}