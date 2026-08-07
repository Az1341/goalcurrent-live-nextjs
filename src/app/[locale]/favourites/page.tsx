import type { Metadata } from "next";
import FavouritesPageContent from "@/components/favourites/FavouritesPageContent";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME } from "@/lib/site-url";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Favourites",
    description:
      `Your saved teams, matches, national sides and competitions on ${SITE_NAME}.`,
    path: "/favourites",
  }),
  // Personal/local-only surface — same robots pattern as coming-soon stubs
  robots: { index: false, follow: true },
};

export default function FavouritesPage() {
  return <FavouritesPageContent />;
}
