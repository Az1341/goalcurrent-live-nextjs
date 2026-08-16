"use client";

import useSWR from "swr";
import { useLocale, useTranslations } from "next-intl";
import { useCommunityShieldFixture } from "@/lib/client/useCommunityShieldFixture";
import { fetcher } from "@/lib/client/fetcher";
import { COMMUNITY_SHIELD_FIXTURE_ID } from "@/lib/community-shield/constants";
import type { CommunityShieldFixturesApiResponse } from "@/lib/community-shield/types";
import type { CommunityShieldMatchDetail } from "@/lib/community-shield/match-detail";
import LiveMatchDashboard from "@/components/match/LiveMatchDashboard";
import styles from "./CommunityShieldHub.module.css";

type Props = {
  initialData: CommunityShieldFixturesApiResponse;
};

export default function CommunityShieldHubClient({ initialData }: Props) {
  const t = useTranslations("communityShield");
  const locale = useLocale();
  const { data } = useCommunityShieldFixture(initialData);
  const fixture = data?.fixtures?.[0] ?? null;
  const { data: detail } = useSWR<CommunityShieldMatchDetail>(
    `/api/community-shield/match/${COMMUNITY_SHIELD_FIXTURE_ID}`,
    fetcher,
    {
      refreshInterval: (latest) => (latest?.status === "LIVE" ? 20_000 : 300_000),
      revalidateOnFocus: true,
    },
  );

  if (!fixture) {
    return (
      <main className={styles.root}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h1 className={styles.title}>{t("title")}</h1>
        <div className={styles.empty}>{t("unavailable")}</div>
      </main>
    );
  }

  const status = detail?.status ?? fixture.status ?? "UPCOMING";
  const kickoffLabel = fixture.kickoffUtc
    ? new Date(fixture.kickoffUtc).toLocaleString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : t("kickoffTbc");

  return (
    <div className={styles.root} data-gc-community-shield>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>

      <LiveMatchDashboard
        competition="FA Community Shield"
        fixtureId={String(fixture.fixtureId)}
        favouriteMatchId={`cs:${fixture.fixtureId}`}
        homeTeamName={fixture.homeTeamName}
        homeTeamLogo={fixture.homeTeamLogo}
        awayTeamName={fixture.awayTeamName}
        awayTeamLogo={fixture.awayTeamLogo}
        status={status}
        elapsed={detail?.elapsed ?? null}
        homeScore={detail?.homeScore ?? null}
        awayScore={detail?.awayScore ?? null}
        kickoffLabel={kickoffLabel}
        venue={detail?.venue ?? fixture.venue ?? null}
        referee={detail?.referee ?? null}
        events={detail?.events ?? []}
        lineups={detail?.lineups ?? { home: null, away: null }}
        statistics={detail?.statistics ?? []}
      />

      <section className={styles.history} aria-labelledby="community-shield-h2h">
        <div className={styles.historyHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Context</p>
            <h2 id="community-shield-h2h">Recent meetings</h2>
          </div>
          <span>{detail?.recentMeetings.length ? "Verified history" : "Loading history"}</span>
        </div>
        {detail?.recentMeetings.length ? (
          <div className={styles.historyList}>
            {detail.recentMeetings.map((meeting) => (
              <div key={meeting.fixtureId} className={styles.historyRow}>
                <span>{meeting.homeTeamName}</span>
                <strong>
                  {meeting.homeScore ?? "–"} – {meeting.awayScore ?? "–"}
                </strong>
                <span>{meeting.awayTeamName}</span>
                <small>
                  {new Date(meeting.kickoffUtc).toLocaleDateString(locale, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            Recent Arsenal–Manchester City meetings will appear when the provider responds.
          </p>
        )}
      </section>
    </div>
  );
}
