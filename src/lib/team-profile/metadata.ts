import type { Metadata } from "next";
import type { PlClub } from "@/data/pl-clubs";
import type { Team } from "@/types/team";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME } from "@/lib/site-url";
import { clubHref } from "@/lib/team-profile/club-slug";
import { teamHref } from "@/lib/wc26-teams";

export function buildPlClubMetadata(club: PlClub, locale: string): Metadata {
  const title = `${club.name} News, Fixtures, Transfers & Results | ${SITE_NAME}`;
  return buildPageMetadata({
    title,
    description: `${club.name} - latest Premier League results, fixtures, form, league position, transfer rumours, injuries and news for the 2026/27 season on ${SITE_NAME}.`,
    path: clubHref(club.slug),
    absoluteTitle: true,
    locale,
  });
}

export function buildWc26TeamMetadata(team: Team, locale: string): Metadata {
  const title = `${team.name} World Cup 2026 Team News, Fixtures & Results | ${SITE_NAME}`;
  return buildPageMetadata({
    title,
    description: `${team.name} at FIFA World Cup 2026 - fixtures, group standings, squad news, results, history and tournament updates on ${SITE_NAME}.`,
    path: teamHref(team.id),
    absoluteTitle: true,
    locale,
  });
}
