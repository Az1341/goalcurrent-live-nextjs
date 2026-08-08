import type { Metadata } from "next";
import { buildComingSoonMetadata, ComingSoonPage } from "@/lib/coming-soon-page";

export const metadata: Metadata = buildComingSoonMetadata({
  title: "Clean Sheets",
  path: "/statistics/clean-sheets",
});

export default function StatisticsCleanSheetsPage() {
  return (
    <ComingSoonPage
      title="Clean Sheets"
      path="/statistics/clean-sheets"
      emoji="🧤"
      description="Clean sheets statistics are coming soon on GoalCurrent.live."
      links={[
        { href: "/statistics/teams", label: "Team Stats" },
        { href: "/premier-league/statistics", label: "PL Statistics" },
      ]}
    />
  );
}
