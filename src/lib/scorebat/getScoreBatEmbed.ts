import "server-only";
import { getFixtureById, getTeamById } from "@/data/wc26";
import { parseScoreBatEmbedUrl } from "@/lib/scorebat/parse-embed";
import { fetchScoreBatFeed } from "@/lib/scorebat/request";
import type { ScoreBatHighlight } from "@/lib/scorebat/types";

type ScoreBatItem = {
  title: string;
  embed: string;
};

type ScoreBatResponse = {
  response?: ScoreBatItem[];
};

function normalizeTeamToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+(national team|u23|u21)$/i, "")
    .trim();
}

function titleMatchesFixture(
  title: string,
  homeTeamName: string,
  awayTeamName: string,
): boolean {
  const normalizedTitle = title.toLowerCase();
  const home = normalizeTeamToken(homeTeamName);
  const away = normalizeTeamToken(awayTeamName);
  return normalizedTitle.includes(home) && normalizedTitle.includes(away);
}

export async function getScoreBatEmbed(
  homeTeamName: string,
  awayTeamName: string,
): Promise<ScoreBatHighlight | null> {
  if (!homeTeamName || !awayTeamName) {
    return null;
  }

  try {
    const res = await fetchScoreBatFeed({
      next: { revalidate: 300 },
    });
    if (!res?.ok) {
      return null;
    }

    const data = (await res.json()) as ScoreBatResponse;
    const items = data.response ?? [];

    const matchItem = items.find((item) =>
      titleMatchesFixture(item.title, homeTeamName, awayTeamName),
    );

    if (!matchItem?.embed?.trim()) {
      return null;
    }

    const embedUrl = parseScoreBatEmbedUrl(matchItem.embed);
    if (!embedUrl) {
      return null;
    }

    return {
      title: matchItem.title.trim() || `${homeTeamName} vs ${awayTeamName}`,
      embedUrl,
    };
  } catch {
    return null;
  }
}

/** Resolve ScoreBat highlights for a local WC26 fixture id. */
export async function getScoreBatEmbedForFixture(
  fixtureId: string,
): Promise<ScoreBatHighlight | null> {
  const fixture = getFixtureById(fixtureId);
  if (!fixture) {
    return null;
  }

  const home = getTeamById(fixture.homeTeamId);
  const away = getTeamById(fixture.awayTeamId);
  if (!home || !away) {
    return null;
  }

  return getScoreBatEmbed(home.name, away.name);
}