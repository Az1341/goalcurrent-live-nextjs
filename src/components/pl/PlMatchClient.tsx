"use client";

import useSWR from "swr";
import { Link } from "@/i18n/navigation";
import { fetcher, LIVE_MATCH_SWR_OPTIONS } from "@/lib/client/fetcher";
import type { PlMatchApiResponse } from "@/lib/pl/types";
import LiveMatchDashboard from "@/components/match/LiveMatchDashboard";
import styles from "./PlMatch.module.css";
import { PlErrorPanel, PlLoadingPanel } from "./PlShared";

const PL_COMPETITION = "Premier League 2026/27";

function formatKickoff(kickoffUtc: string): string {
  const date = new Date(kickoffUtc);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

type PlMatchClientProps = {
  fixtureId: number;
};

export default function PlMatchClient({ fixtureId }: PlMatchClientProps) {
  const invalidId = !Number.isFinite(fixtureId) || fixtureId <= 0;
  const { data, error, isLoading } = useSWR<PlMatchApiResponse>(
    invalidId ? null : `/api/pl/match/${fixtureId}`,
    fetcher,
    LIVE_MATCH_SWR_OPTIONS,
  );

  const fixture = data?.fixture ?? null;
  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : "Unknown error"
    : invalidId
      ? "Invalid match link."
      : data && !data.fixture
        ? data.error ?? "Match not found."
        : null;

  if (isLoading) {
    return (
      <main className={styles.plPage}>
        <PlLoadingPanel title="Loading match" text="Fetching match centre…" />
      </main>
    );
  }

  if (errorMessage || !fixture || !data) {
    return (
      <main className={styles.plPage}>
        <PlErrorPanel
          title="Match not available"
          text={errorMessage ?? data?.error ?? "This match could not be loaded."}
        />
        <p className={styles.backLinks}>
          <Link href="/premier-league/fixtures">← Back to fixtures</Link>
        </p>
      </main>
    );
  }

  return (
    <main className={styles.plPage}>
      <LiveMatchDashboard
        competition={fixture.matchweek !== null ? `Premier League · Matchweek ${fixture.matchweek}` : PL_COMPETITION}
        fixtureId={String(fixture.fixtureId)}
        favouriteMatchId={`pl:${fixture.fixtureId}`}
        homeTeamName={fixture.homeTeamName}
        homeTeamLogo={fixture.homeTeamLogo}
        awayTeamName={fixture.awayTeamName}
        awayTeamLogo={fixture.awayTeamLogo}
        status={fixture.status}
        elapsed={fixture.elapsed}
        homeScore={fixture.homeScore}
        awayScore={fixture.awayScore}
        kickoffLabel={formatKickoff(fixture.kickoffUtc)}
        venue={fixture.venue}
        referee={fixture.referee}
        events={data.events}
        lineups={data.lineups}
        statistics={data.statistics}
      />
    </main>
  );
}
