import type { Metadata } from "next";
import JsonLdScript from "@/components/seo/JsonLdScript";
import VenuesSection from "@/components/wc26/VenuesSection";
import Wc26SectionPage from "@/components/wc26/Wc26SectionPage";
import { WC26_VENUES } from "@/data/wc26";
import { buildPageMetadata } from "@/lib/page-metadata";
import { getWc26Section } from "@/lib/wc26-sections";
import { buildVenueDescription, getVenueStats } from "@/lib/wc26-venue-stats";

const section = getWc26Section("venues")!;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: `${section.label} — World Cup 2026 Archive`,
    description: section.description,
    path: section.href,
    locale,
  });
}
function venuesStructuredData(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "FIFA World Cup 2026 host venues",
    numberOfItems: WC26_VENUES.length,
    itemListElement: WC26_VENUES.map((venue, index) => {
      const stats = getVenueStats(venue.id);
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SportsActivityLocation",
          name: venue.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: venue.city,
            addressCountry: venue.country,
          },
          ...(venue.capacity != null
            ? { maximumAttendeeCapacity: venue.capacity }
            : {}),
          description: buildVenueDescription(venue, stats),
        },
      };
    }),
  };
}

export default function VenuesPage() {
  return (
    <>
      <JsonLdScript data={venuesStructuredData()} />
      <Wc26SectionPage
        breadcrumb={section.breadcrumb}
        titleHighlight={section.titleHighlight}
        intro={section.description}
      >
        <VenuesSection />
      </Wc26SectionPage>
    </>
  );
}
