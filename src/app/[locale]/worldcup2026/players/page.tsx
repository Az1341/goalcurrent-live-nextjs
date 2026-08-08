import type { Metadata } from "next";
import {
  buildComingSoonMetadata,
  ComingSoonPage,
} from "@/lib/coming-soon-page";

export const metadata: Metadata = buildComingSoonMetadata({
  title: "World Cup 2026 Archive · Players",
  path: "/worldcup2026/players",
});

export default function WorldCupPlayersPage() {
  return (
    <ComingSoonPage
      title="World Cup 2026 Archive · Players"
      path="/worldcup2026/players"
      emoji="👤"
      description="Detailed World Cup 2026 player profiles are not published in this archive yet. Top scorers remain available from tournament statistics."
      links={[
        { href: "/worldcup2026/teams", label: "Teams" },
        { href: "/premier-league/statistics", label: "PL Statistics" },
        { href: "/worldcup2026", label: "World Cup 2026 Archive" },
      ]}
      backHref="/worldcup2026"
      backLabel="← World Cup 2026 Archive"
    />
  );
}