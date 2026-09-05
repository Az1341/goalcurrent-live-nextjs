import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MatchPageClient from "@/app/[locale]/match/[fixtureId]/MatchPageClient";
import MatchOpenTracker from "@/components/analytics/MatchOpenTracker";
import MatchSeo from "@/components/seo/MatchSeo";
import ErrorBoundary from "@/components/system/ErrorBoundary";
import { WC26_FIXTURES, getFixtureById, getVenueById } from "@/data/wc26";
import { isKnownFixtureId, matchHref } from "@/lib/wc26-match";
import { resolveFixtureParticipantLabel } from "@/lib/wc26-live";
import { getSeoEffectiveFixtures } from "@/lib/wc26/seo-fixtures";
import { buildMatchMetadata } from "@/lib/page-metadata";
import {
  analyticsTeamLabel,
  buildMatchCentreDescription,
  buildStableMatchTitle,
} from "@/lib/seo/canonical-titles";
import { sportsEventStatus } from "@/lib/seo/sports-event-status";
import { isCompletedMatchStatus } from "@/lib/wc26-tournament-stats";
import { getScoreBatEmbedForFixture } from "@/lib/scorebat/getScoreBatEmbed";
import { absoluteUrl, SITE_NAME } from "@/lib/site-url";

type MatchPageProps = {
  params: Promise<{ fixtureId: string }>;
};

export function generateStaticParams() {
  return WC26_FIXTURES.map((fixture) => ({
    fixtureId: fixture.id,
  }));
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { fixtureId: rawId } = await params;
  const fixtureId = decodeURIComponent(rawId);
  const fixture = getFixtureById(fixtureId);

  if (!fixture) {
    return { title: "Match not found" };
  }

  const seoFixtures = getSeoEffectiveFixtures();
  const homeName = resolveFixtureParticipantLabel(fixture, "home", seoFixtures);
  const awayName = resolveFixtureParticipantLabel(fixture, "away", seoFixtures);
  const title = buildStableMatchTitle(homeName, awayName, fixtureId);

  return buildMatchMetadata({
    title,
    description: buildMatchCentreDescription(
      homeName,
      awayName,
      fixtureId,
      SITE_NAME,
    ),
    path: matchHref(fixtureId),
    ogImage: absoluteUrl("/icons/screenshot-desktop.png"),
  });
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { fixtureId: rawId } = await params;
  const fixtureId = decodeURIComponent(rawId);

  if (!isKnownFixtureId(fixtureId)) {
    notFound();
  }

  const fixture = getFixtureById(fixtureId)!;
  const seoFixtures = getSeoEffectiveFixtures();
  const effectiveFixture =
    seoFixtures.find((entry) => entry.id === fixtureId) ?? fixture;
  const homeName = resolveFixtureParticipantLabel(fixture, "home", seoFixtures);
  const awayName = resolveFixtureParticipantLabel(fixture, "away", seoFixtures);
  const venue = getVenueById(fixture.venueId);
  const scorebatHighlight = await getScoreBatEmbedForFixture(fixtureId);
  const matchPath = matchHref(fixtureId);
  const status = String(effectiveFixture.status);

  return (
    <ErrorBoundary>
      <MatchSeo
        event={{
          name: `${homeName} vs ${awayName}`,
          startDate: fixture.kickoffUtc,
          path: matchPath,
          homeTeamName: homeName,
          awayTeamName: awayName,
          venueName: venue?.name,
          city: venue?.city,
          country: venue?.country,
          competition: "FIFA World Cup 2026",
          organizerUrl: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026",
          eventStatus: sportsEventStatus(status),
          description: `FIFA World Cup 2026 archive - ${homeName} vs ${awayName}. Final result, fixture details and historical match context on ${SITE_NAME}.`,
          image: absoluteUrl("/icons/screenshot-desktop.png"),
        }}
        liveBlog={null}
        breadcrumbs={[
          { name: "World Cup 2026", path: "/worldcup2026" },
          { name: "Fixtures", path: "/worldcup2026/fixtures" },
          { name: `${homeName} vs ${awayName}`, path: matchPath },
        ]}
      />
      <MatchOpenTracker
        matchId={fixtureId}
        competition="FIFA World Cup 2026"
        homeTeam={analyticsTeamLabel(homeName)}
        awayTeam={analyticsTeamLabel(awayName)}
        matchStatus={isCompletedMatchStatus(status) ? status : String(effectiveFixture.status)}
      />
      <MatchPageClient fixtureId={fixtureId} scorebatHighlight={scorebatHighlight} />
    </ErrorBoundary>
  );
}
