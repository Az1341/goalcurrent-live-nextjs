import { getTeamDisplayName } from "@/lib/teamIdentity";
import { fetchScoreBatFeed } from "@/lib/scorebat/request";
import type { ScorerGoalEvent } from "@/lib/wc26-top-scorers";
import type { Wc26SourceGoalFetchResult } from "./types";

type ScoreBatMatch = {
  title?: string;
  competition?: string;
  homeTeam?: { name?: string };
  awayTeam?: { name?: string };
  videos?: Array<{ title?: string }>;
};

type ScoreBatResponse = {
  response?: ScoreBatMatch[];
};

function isWorldCupCompetition(label: string): boolean {
  const normalized = label.toLowerCase();
  return (
    normalized.includes("world cup") ||
    normalized.includes("fifa") ||
    normalized.includes("wc 2026") ||
    normalized.includes("worldcup")
  );
}

function parseGoalVideoTitle(
  title: string,
  homeTeam: string,
  awayTeam: string,
): ScorerGoalEvent | null {
  const normalized = title.trim();
  if (!/goal/i.test(normalized)) {
    return null;
  }

  const patterns = [
    /^goal[!:\s-]+(.+?)(?:\s*\(|$)/i,
    /^(.+?)\s*[-–]\s*goal/i,
    /goal\s+by\s+(.+?)(?:\s*\(|$)/i,
  ];

  let playerName: string | null = null;
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]?.trim()) {
      playerName = match[1].trim();
      break;
    }
  }

  if (!playerName) {
    return null;
  }

  const teamHint = normalized.toLowerCase();
  let teamName = homeTeam;
  if (teamHint.includes(awayTeam.toLowerCase())) {
    teamName = awayTeam;
  } else if (!teamHint.includes(homeTeam.toLowerCase())) {
    teamName = homeTeam;
  }

  return {
    playerName,
    teamName: getTeamDisplayName(teamName) ?? teamName,
    isOwnGoal: /own\s*goal/i.test(normalized),
  };
}

function goalsFromScoreBatMatch(match: ScoreBatMatch): ScorerGoalEvent[] {
  const homeTeam = match.homeTeam?.name?.trim() ?? "";
  const awayTeam = match.awayTeam?.name?.trim() ?? "";
  if (!homeTeam || !awayTeam) {
    return [];
  }

  const goals: ScorerGoalEvent[] = [];
  for (const video of match.videos ?? []) {
    const title = video.title?.trim();
    if (!title) {
      continue;
    }
    const parsed = parseGoalVideoTitle(title, homeTeam, awayTeam);
    if (parsed) {
      goals.push(parsed);
    }
  }

  return goals;
}

/** ScoreBat video feed — goal clips for World Cup matches. */
export async function fetchScoreBatWc26ScorerGoals(): Promise<Wc26SourceGoalFetchResult> {
  try {
    const res = await fetchScoreBatFeed({
      next: { revalidate: 0 },
    });
    if (!res?.ok) {
      return { source: "scorebat", available: false, goals: [] };
    }

    const json = (await res.json()) as ScoreBatResponse;
    const goals: ScorerGoalEvent[] = [];

    for (const match of json.response ?? []) {
      const competition = match.competition ?? match.title ?? "";
      if (!isWorldCupCompetition(competition)) {
        continue;
      }
      goals.push(...goalsFromScoreBatMatch(match));
    }

    return {
      source: "scorebat",
      available: true,
      goals,
    };
  } catch {
    return { source: "scorebat", available: false, goals: [] };
  }
}
