/**
 * Derive UNL group tables from finished fixtures (SSOT / provider rows).
 */

import { isFinishedUnlStatus } from "@/lib/unl/contract";
import { getUnlGroup } from "@/lib/unl/groups-ssot";
import type { UnlGroupId, UnlLeagueId } from "@/lib/unl/constants";
import type { UnlFixtureRow, UnlStandingRow } from "@/lib/unl/types";

type Acc = {
  teamId: number;
  teamName: string;
  teamLogo: string | null;
  teamFlag: string | null;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: string[];
};

function emptyAcc(
  teamId: number,
  teamName: string,
  teamLogo: string | null,
  teamFlag: string | null,
): Acc {
  return {
    teamId,
    teamName,
    teamLogo,
    teamFlag,
    played: 0,
    win: 0,
    draw: 0,
    lose: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    form: [],
  };
}

function applyResult(acc: Acc, gf: number, ga: number): void {
  acc.played += 1;
  acc.goalsFor += gf;
  acc.goalsAgainst += ga;
  if (gf > ga) {
    acc.win += 1;
    acc.points += 3;
    acc.form.push("W");
  } else if (gf < ga) {
    acc.lose += 1;
    acc.form.push("L");
  } else {
    acc.draw += 1;
    acc.points += 1;
    acc.form.push("D");
  }
}

function sortStandings(rows: UnlStandingRow[]): UnlStandingRow[] {
  const sorted = [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });
  return sorted.map((row, index) => ({ ...row, rank: index + 1 }));
}

/**
 * Build a group table from finished matches in `fixtures` for `groupId`.
 * When no finished results exist, returns all group teams with 0 pts.
 */
export function computeStandingsFromFixtures(
  fixtures: UnlFixtureRow[],
  groupId: string,
): UnlStandingRow[] {
  const group = getUnlGroup(groupId);
  if (!group) return [];

  const league = group.league as UnlLeagueId;
  const gid = group.groupId as UnlGroupId;
  const byId = new Map<number, Acc>();

  for (const team of group.teams) {
    byId.set(
      team.teamId,
      emptyAcc(team.teamId, team.name, team.logo, team.flagCode),
    );
  }

  const finished = fixtures.filter(
    (f) =>
      f.groupId === gid &&
      isFinishedUnlStatus(f.status) &&
      f.homeScore != null &&
      f.awayScore != null,
  );

  for (const match of finished) {
    let home = byId.get(match.homeTeamId);
    if (!home) {
      home = emptyAcc(
        match.homeTeamId,
        match.homeTeamName,
        match.homeTeamLogo,
        match.homeTeamFlag,
      );
      byId.set(match.homeTeamId, home);
    }
    let away = byId.get(match.awayTeamId);
    if (!away) {
      away = emptyAcc(
        match.awayTeamId,
        match.awayTeamName,
        match.awayTeamLogo,
        match.awayTeamFlag,
      );
      byId.set(match.awayTeamId, away);
    }
    applyResult(home, match.homeScore as number, match.awayScore as number);
    applyResult(away, match.awayScore as number, match.homeScore as number);
  }

  const rows: UnlStandingRow[] = Array.from(byId.values()).map((acc) => ({
    rank: 0,
    teamId: acc.teamId,
    teamName: acc.teamName,
    teamLogo: acc.teamLogo,
    teamFlag: acc.teamFlag,
    played: acc.played,
    win: acc.win,
    draw: acc.draw,
    lose: acc.lose,
    goalsFor: acc.goalsFor,
    goalsAgainst: acc.goalsAgainst,
    goalDiff: acc.goalsFor - acc.goalsAgainst,
    points: acc.points,
    form: acc.form.length ? acc.form.slice(-5).join("") : null,
    description: null,
    groupId: gid,
    league,
    group: group.label,
  }));

  return sortStandings(rows);
}