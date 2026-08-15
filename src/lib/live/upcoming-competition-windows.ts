/**
 * Build opening-window cards for competitions with announced fixtures:
 * first kickoff day + the next calendar day (local), per competition.
 */

export type UpcomingCompKey = "community-shield" | "pl" | "ucl" | "facup" | "unl";

export type UpcomingMatchLink = {
  id: string;
  kickoffUtc: string;
  homeName: string;
  awayName: string;
  href: string;
  meta?: string;
  homeFlag?: string | null;
  awayFlag?: string | null;
  venueLabel?: string;
};

export type UpcomingCompetitionWindow = {
  key: UpcomingCompKey;
  label: string;
  hubHref: string;
  startDayLabel: string;
  matches: UpcomingMatchLink[];
};

type RawRow = {
  kickoffUtc: string;
  homeName: string;
  awayName: string;
  href: string;
  meta?: string;
  homeFlag?: string | null;
  awayFlag?: string | null;
  venueLabel?: string;
  id: string;
};

function localDayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addLocalDays(dayKey: string, delta: number): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  if (!y || !m || !d) return dayKey;
  const date = new Date(y, m - 1, d + delta);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function formatDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  if (!y || !m || !d) return dayKey;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function windowForCompetition(
  key: UpcomingCompKey,
  label: string,
  hubHref: string,
  rows: RawRow[],
  nowMs: number,
): UpcomingCompetitionWindow | null {
  const upcoming = rows
    .filter((row) => {
      const t = new Date(row.kickoffUtc).getTime();
      return Number.isFinite(t) && t >= nowMs - 3 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime());

  if (upcoming.length === 0) return null;

  const firstDay = localDayKey(upcoming[0].kickoffUtc);
  if (!firstDay) return null;
  const secondDay = addLocalDays(firstDay, 1);
  const allowed = new Set([firstDay, secondDay]);

  const matches = upcoming
    .filter((row) => allowed.has(localDayKey(row.kickoffUtc)))
    .slice(0, 12)
    .map((row) => ({
      id: row.id,
      kickoffUtc: row.kickoffUtc,
      homeName: row.homeName,
      awayName: row.awayName,
      href: row.href,
      meta: row.meta,
      homeFlag: row.homeFlag,
      awayFlag: row.awayFlag,
      venueLabel: row.venueLabel,
    }));

  if (matches.length === 0) return null;

  return {
    key,
    label,
    hubHref,
    startDayLabel: formatDayLabel(firstDay),
    matches,
  };
}

export function buildUpcomingCompetitionWindows(input: {
  communityShield?: Array<{
    fixtureId: number;
    kickoffUtc: string | null;
    homeTeamName: string;
    awayTeamName: string;
    venue?: string | null;
    status: string;
  }>;
  pl?: Array<{
    fixtureId: number;
    kickoffUtc: string;
    homeTeamName: string;
    awayTeamName: string;
    status: string;
  }>;
  unl?: Array<{
    fixtureId: number;
    kickoffUtc: string;
    homeTeamName: string;
    awayTeamName: string;
    homeTeamFlag?: string | null;
    awayTeamFlag?: string | null;
    groupId: string;
    status: string;
  }>;
  ucl?: Array<{
    fixtureId: number;
    kickoffUtc: string;
    homeTeamName: string;
    awayTeamName: string;
    status: string;
    round?: string | null;
  }>;
  facup?: Array<{
    fixtureId: number;
    kickoffUtc: string | null;
    homeTeamName: string;
    awayTeamName: string;
    status: string;
    roundLabel?: string | null;
    round?: string | null;
  }>;
  now?: Date;
}): UpcomingCompetitionWindow[] {
  const nowMs = (input.now ?? new Date()).getTime();
  const windows: UpcomingCompetitionWindow[] = [];

  if (input.communityShield?.length) {
    const w = windowForCompetition(
      "community-shield",
      "FA Community Shield",
      "/community-shield",
      input.communityShield
        .filter((row): row is typeof row & { kickoffUtc: string } => Boolean(row.kickoffUtc))
        .filter((row) => !["FT", "CANCELLED"].includes(row.status))
        .filter((row) => new Date(row.kickoffUtc).getTime() > nowMs)
        .map((row) => ({
          id: `community-shield-${row.fixtureId}`,
          kickoffUtc: row.kickoffUtc,
          homeName: row.homeTeamName,
          awayName: row.awayTeamName,
          href: "/community-shield",
          meta: "Season curtain-raiser",
          venueLabel: row.venue ?? undefined,
        })),
      nowMs,
    );
    if (w) windows.push(w);
  }

  if (input.pl?.length) {
    const w = windowForCompetition(
      "pl",
      "Premier League 26/27",
      "/premier-league/fixtures",
      input.pl.map((row) => ({
        id: `pl-${row.fixtureId}`,
        kickoffUtc: row.kickoffUtc,
        homeName: row.homeTeamName,
        awayName: row.awayTeamName,
        href: `/premier-league/match/${row.fixtureId}`,
      })),
      nowMs,
    );
    if (w) windows.push(w);
  }

  if (input.ucl?.length) {
    const w = windowForCompetition(
      "ucl",
      "Champions League",
      "/champions-league",
      input.ucl.map((row) => ({
        id: `ucl-${row.fixtureId}`,
        kickoffUtc: row.kickoffUtc,
        homeName: row.homeTeamName,
        awayName: row.awayTeamName,
        href: "/champions-league#ucl-fixtures",
        meta: row.round ?? undefined,
      })),
      nowMs,
    );
    if (w) windows.push(w);
  }

  if (input.facup?.length) {
    const w = windowForCompetition(
      "facup",
      "FA Cup",
      "/fa-cup",
      input.facup
        .filter((row): row is typeof row & { kickoffUtc: string } => Boolean(row.kickoffUtc))
        .map((row) => ({
          id: `facup-${row.fixtureId}`,
          kickoffUtc: row.kickoffUtc,
          homeName: row.homeTeamName,
          awayName: row.awayTeamName,
          href: "/fa-cup#facup-fixtures",
          meta: row.roundLabel || row.round || undefined,
        })),
      nowMs,
    );
    if (w) windows.push(w);
  }

  if (input.unl?.length) {
    const w = windowForCompetition(
      "unl",
      "Nations League 26/27",
      "/nations-league#unl-fixtures",
      input.unl.map((row) => ({
        id: `unl-${row.fixtureId}`,
        kickoffUtc: row.kickoffUtc,
        homeName: row.homeTeamName,
        awayName: row.awayTeamName,
        href: `/nations-league/match/${row.fixtureId}`,
        meta: row.groupId.toUpperCase(),
        homeFlag: row.homeTeamFlag,
        awayFlag: row.awayTeamFlag,
      })),
      nowMs,
    );
    if (w) windows.push(w);
  }

  windows.sort((a, b) => {
    const at = new Date(a.matches[0].kickoffUtc).getTime();
    const bt = new Date(b.matches[0].kickoffUtc).getTime();
    return at - bt;
  });

  return windows;
}
