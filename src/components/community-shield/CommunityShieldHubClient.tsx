"use client";

import useSWR from "swr";
import { useLocale, useTranslations } from "next-intl";
import { PlTeamBadge } from "@/components/pl/PlShared";
import { useCommunityShieldFixture } from "@/lib/client/useCommunityShieldFixture";
import { fetcher } from "@/lib/client/fetcher";
import { COMMUNITY_SHIELD_FIXTURE_ID } from "@/lib/community-shield/constants";
import type { CommunityShieldFixturesApiResponse } from "@/lib/community-shield/types";
import type { CommunityShieldMatchDetail } from "@/lib/community-shield/match-detail";
import styles from "./CommunityShieldHub.module.css";

type Props = {
  initialData: CommunityShieldFixturesApiResponse;
};

function LineupSide({ side }: { side: CommunityShieldMatchDetail["lineups"]["home"] }) {
  if (!side) return <p className={styles.pending}>Confirmed line-up will appear here when released.</p>;
  return (
    <div className={styles.lineupSide}>
      <h3>{side.teamName}</h3>
      <p className={styles.detailMeta}>
        {side.formation ? `Formation ${side.formation}` : "Formation pending"}
        {side.coach ? ` · Coach ${side.coach}` : ""}
      </p>
      <ol className={styles.playerList}>
        {side.startXI.map((player, index) => (
          <li key={`${side.teamName}-${player.name}-${index}`}>
            <span>{player.number ?? "–"}</span>
            <strong>{player.name}</strong>
            <small>{player.position ?? ""}</small>
          </li>
        ))}
      </ol>
    </div>
  );
}

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

  const status = detail?.status ?? fixture?.status ?? "UPCOMING";
  const liveScore = detail?.homeScore != null && detail?.awayScore != null;

  return (
    <div className={styles.root} data-gc-community-shield>
      <p className={styles.eyebrow}>{t("eyebrow")}</p>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.subtitle}>{t("subtitle")}</p>

      {!fixture ? (
        <div className={styles.empty}>{t("unavailable")}</div>
      ) : (
        <>
          <article className={styles.card} aria-label={t("matchAria")}>
            <div className={styles.statusRow}>
              <span className={status === "LIVE" ? styles.livePill : styles.statusPill}>
                {status === "LIVE" && detail?.elapsed != null ? `LIVE ${detail.elapsed}'` : status}
              </span>
              <span>{detail?.referee ? `Referee: ${detail.referee}` : "Match officials confirmed by The FA"}</span>
            </div>
            <p className={styles.meta}>
              {detail?.venue ?? fixture.venue ?? t("venueTba")}
              {" · "}
              {t("matchDate")}
            </p>
            <div className={styles.teams}>
              <div className={styles.team}>
                <PlTeamBadge name={fixture.homeTeamName} logo={fixture.homeTeamLogo} size={56} />
                <span className={styles.teamName}>{fixture.homeTeamName}</span>
              </div>
              <span className={styles.vs} aria-hidden="true">
                {liveScore ? `${detail?.homeScore} – ${detail?.awayScore}` : t("vs")}
              </span>
              <div className={styles.team}>
                <PlTeamBadge name={fixture.awayTeamName} logo={fixture.awayTeamLogo} size={56} />
                <span className={styles.teamName}>{fixture.awayTeamName}</span>
              </div>
            </div>
            <p className={styles.kickoff}>
              {fixture.kickoffUtc
                ? new Date(fixture.kickoffUtc).toLocaleString(locale, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short",
                  })
                : t("kickoffTbc")}
            </p>
          </article>

          <section className={styles.detailSection} aria-labelledby="community-shield-h2h">
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Pre-match stats</p>
                <h2 id="community-shield-h2h">Recent meetings</h2>
              </div>
              <span className={styles.availability}>
                {detail?.recentMeetings.length ? "Last meetings" : "Loading history"}
              </span>
            </div>
            {detail?.recentMeetings.length ? (
              <div className={styles.statsList}>
                {detail.recentMeetings.map((meeting) => (
                  <div key={meeting.fixtureId} className={styles.statRow}>
                    <strong>{meeting.homeScore ?? "–"}</strong>
                    <span>
                      {meeting.homeTeamName} vs {meeting.awayTeamName}
                      <small className={styles.detailMeta}>
                        {new Date(meeting.kickoffUtc).toLocaleDateString(locale, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </small>
                    </span>
                    <strong>{meeting.awayScore ?? "–"}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.pending}>Recent Arsenal–Manchester City meetings will appear here when the data provider responds.</p>
            )}
          </section>

          <section className={styles.detailSection} aria-labelledby="community-shield-lineups">
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Match centre</p>
                <h2 id="community-shield-lineups">Line-ups</h2>
              </div>
              <span className={styles.availability}>
                {detail?.lineups.home || detail?.lineups.away ? "Confirmed" : "Updates automatically when released"}
              </span>
            </div>
            <div className={styles.lineupGrid}>
              <LineupSide side={detail?.lineups.home ?? null} />
              <LineupSide side={detail?.lineups.away ?? null} />
            </div>
          </section>

          <section className={styles.detailSection} aria-labelledby="community-shield-stats">
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Live data</p>
                <h2 id="community-shield-stats">Match statistics</h2>
              </div>
              <span className={styles.availability}>
                {detail?.statistics.length ? "Live" : "Available from kick-off"}
              </span>
            </div>
            {detail?.statistics.length ? (
              <div className={styles.statsList}>
                {detail.statistics.map((stat) => (
                  <div key={stat.key} className={styles.statRow}>
                    <strong>{String(stat.home ?? "–")}</strong>
                    <span>{stat.label}</span>
                    <strong>{String(stat.away ?? "–")}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.pending}>Live possession, shots, corners, cards and other available match statistics will populate automatically.</p>
            )}
          </section>

          <section className={styles.detailSection} aria-labelledby="community-shield-events">
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Timeline</p>
                <h2 id="community-shield-events">Match events</h2>
              </div>
            </div>
            {detail?.events.length ? (
              <ol className={styles.eventsList}>
                {detail.events.map((event, index) => (
                  <li key={`${event.minute}-${event.playerName}-${index}`}>
                    <strong>{event.minute ?? "–"}'</strong>
                    <span>{event.teamName}</span>
                    <span>{event.playerName} · {event.detail}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.pending}>Goals, cards and substitutions will appear here during the match.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
