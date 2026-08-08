import type { Metadata } from "next";
import UnderConstruction from "@/components/UnderConstruction";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME } from "@/lib/site-url";

const PL_LINKS = [
  { href: "/premier-league/table", label: "Table 26/27" },
  { href: "/premier-league", label: "PL Home" },
  { href: "/premier-league/fixtures", label: "Fixtures 26/27" },
];

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Premier League Table 2025/26",
    description: `Final Premier League 2025/26 standings archive on ${SITE_NAME}.`,
    path: "/premier-league/2025-26/table",
    locale,
  });
}

export default function PremierLeague2526TablePage() {
  return (
    <UnderConstruction
      title="Premier League Table 2025/26"
      emoji="📋"
      description={`The archived 2025/26 Premier League table will be published on ${SITE_NAME} when the season data is ready.`}
      links={PL_LINKS}
      backHref="/premier-league/table"
      backLabel="← Current PL Table 26/27"
    />
  );
}
