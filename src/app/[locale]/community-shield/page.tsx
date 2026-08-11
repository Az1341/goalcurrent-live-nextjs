import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CommunityShieldHubClient from "@/components/community-shield/CommunityShieldHubClient";
import JsonLd from "@/components/seo/JsonLd";
import { ssotCommunityShieldFixturesResponse } from "@/lib/community-shield/api";
import { COMMUNITY_SHIELD_PATH } from "@/lib/community-shield/constants";
import { buildPageMetadata } from "@/lib/page-metadata";
import { sportsEventSchema } from "@/lib/seo/schema";
import { SITE_NAME } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "communityShield" });
  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription", { site: SITE_NAME }),
    path: COMMUNITY_SHIELD_PATH,
    locale,
  });
}

export default async function CommunityShieldPage({ params }: PageProps) {
  const { locale } = await params;
  const initialData = ssotCommunityShieldFixturesResponse();
  const fixture = initialData.fixtures[0] ?? null;

  const jsonLd = fixture
    ? sportsEventSchema({
        name: `${fixture.homeTeamName} vs ${fixture.awayTeamName}`,
        startDate: fixture.kickoffUtc ?? "2026-08-16",
        path: COMMUNITY_SHIELD_PATH,
        homeTeamName: fixture.homeTeamName,
        awayTeamName: fixture.awayTeamName,
        venueName: fixture.venue ?? "Principality Stadium",
        city: "Cardiff",
        country: "GB",
        competition: "FA Community Shield",
        locale,
        description: `FA Community Shield 2026 — ${fixture.homeTeamName} vs ${fixture.awayTeamName} at Principality Stadium, Cardiff. Kick-off 15:00 BST (14:00 UTC).`,
      })
    : null;

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <CommunityShieldHubClient initialData={initialData} />
    </>
  );
}
