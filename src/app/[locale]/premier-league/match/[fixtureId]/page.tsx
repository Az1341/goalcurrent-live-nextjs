import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MatchSeo from "@/components/seo/MatchSeo";
import PlMatchClient from "@/components/pl/PlMatchClient";
import { getCachedPlMatchDetail } from "@/lib/pl/match-detail";
import { buildMatchMetadata } from "@/lib/page-metadata";
import {
  buildLiveBlogUpdates,
  coverageEndTimeForFinishedMatch,
  isLiveBlogEligibleStatus,
} from "@/lib/seo/live-blog-updates";
import { SITE_NAME } from "@/lib/site-url";

type PlMatchPageProps = {
  params: Promise<{ locale: string; fixtureId: string }>;
};

function parseFixtureId(raw: string): number | null {
  const decoded = decodeURIComponent(raw);
  if (!/^\d+$/.test(decoded)) return null;
  const id = Number(decoded);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return id;
}

function plEventStatus(status: string): string {
  const normalized = status.trim().toUpperCase();
  if (normalized === "LIVE") return "https://schema.org/EventInProgress";
  if (normalized === "FT") return "https://schema.org/EventCompleted";
  if (normalized === "CANCELLED") return "https://schema.org/EventCancelled";
  if (normalized === "POSTPONED") return "https://schema.org/EventPostponed";
  return "https://schema.org/EventScheduled";
}

export async function generateMetadata({
  params,
}: PlMatchPageProps): Promise<Metadata> {
  const { locale, fixtureId: rawFixtureId } = await params;
  const fixtureId = parseFixtureId(rawFixtureId);
  if (fixtureId === null) {
    return { title: "Match not found", robots: { index: false, follow: false } };
  }

  const detail = await getCachedPlMatchDetail(fixtureId);
  const fixture = detail.fixture;

  if (!fixture) {
    if (detail.configured) {
      return {
        title: "Match not found",
        robots: { index: false, follow: false },
      };
    }

    return buildMatchMetadata({
      title: "Premier League Match",
      description: `Premier League match centre on ${SITE_NAME}.`,
      path: `/premier-league/match/${fixtureId}`,
      locale,
    });
  }

  const title = `${fixture.homeTeamName} vs ${fixture.awayTeamName}`;

  return buildMatchMetadata({
    title,
    description: `${title} — Premier League 2026/27 match centre with timeline, lineups, stats and H2H on ${SITE_NAME}.`,
    path: `/premier-league/match/${fixtureId}`,
    locale,
  });
}

export default async function PremierLeagueMatchPage({
  params,
}: PlMatchPageProps) {
  const { locale, fixtureId: rawFixtureId } = await params;
  void locale;
  const fixtureId = parseFixtureId(rawFixtureId);
  if (fixtureId === null) {
    notFound();
  }

  const detail = await getCachedPlMatchDetail(fixtureId);
  const fixture = detail.fixture;

  if (!fixture) {
    if (detail.configured) {
      notFound();
    }
    return <PlMatchClient fixtureId={fixtureId} />;
  }

  const path = `/premier-league/match/${fixtureId}`;

  const liveBlog = isLiveBlogEligibleStatus(fixture.status)
    ? (() => {
        const liveBlogUpdate = buildLiveBlogUpdates(
          detail.events,
          fixture.kickoffUtc,
        );
        if (liveBlogUpdate.length === 0) return null;
        const isFinished = fixture.status.trim().toUpperCase() === "FT";
        return {
          path,
          headline: `${fixture.homeTeamName} vs ${fixture.awayTeamName} — live updates`,
          coverageStartTime: fixture.kickoffUtc,
          ...(isFinished
            ? {
                coverageEndTime: coverageEndTimeForFinishedMatch(
                  fixture.kickoffUtc,
                ),
              }
            : {}),
          liveBlogUpdate,
        };
      })()
    : null;

  return (
    <>
      <MatchSeo
        event={{
          name: `${fixture.homeTeamName} vs ${fixture.awayTeamName}`,
          startDate: fixture.kickoffUtc,
          path,
          homeTeamName: fixture.homeTeamName,
          awayTeamName: fixture.awayTeamName,
          venueName: fixture.venue ?? undefined,
          competition: "Premier League",
          organizerUrl: "https://www.premierleague.com",
          eventStatus: plEventStatus(fixture.status),
          description: `Premier League — ${fixture.homeTeamName} vs ${fixture.awayTeamName}. Live match centre on ${SITE_NAME}.`,
        }}
        liveBlog={liveBlog}
        breadcrumbs={[
          { name: "Premier League", path: "/premier-league" },
          { name: "Fixtures", path: "/premier-league/fixtures" },
          {
            name: `${fixture.homeTeamName} vs ${fixture.awayTeamName}`,
            path,
          },
        ]}
      />
      <PlMatchClient fixtureId={fixtureId} />
    </>
  );
}
