import type { Metadata } from "next";
import FavouritesPageContent from "@/components/favourites/FavouritesPageContent";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    ...buildPageMetadata({
      title: "Favourites",
      description: `Your saved teams, matches, national sides and competitions on ${SITE_NAME}.`,
      path: "/favourites",
      locale,
    }),
    // Personal/local-only surface — same robots pattern as coming-soon stubs
    robots: { index: false, follow: true },
  };
}

export default function FavouritesPage() {
  return <FavouritesPageContent />;
}
