import type { Metadata } from "next";
import { buildComingSoonMetadata, ComingSoonPage } from "@/lib/coming-soon-page";

export const metadata: Metadata = buildComingSoonMetadata({
  title: "Player Rankings",
  path: "/statistics/player-rankings",
});

export default function StatisticsPlayerRankingsPage() {
  return (
    <ComingSoonPage
      title="Player Rankings"
      path="/statistics/player-rankings"
      emoji="🏅"
      description="Player rankings are coming soon on GoalCurrent.live."
      links={[
        { href: "/premier-league/statistics", label: "PL Statistics" },
        { href: "/premier-league/players", label: "PL Players" },
      ]}
    />
  );
}
