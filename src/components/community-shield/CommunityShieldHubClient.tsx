"use client";

import { useTranslations } from "next-intl";
import { PlTeamBadge } from "@/components/pl/PlShared";
import { useCommunityShieldFixture } from "@/lib/client/useCommunityShieldFixture";
import type { CommunityShieldFixturesApiResponse } from "@/lib/community-shield/types";
import styles from "./CommunityShieldHub.module.css";

type Props = {
  initialData: CommunityShieldFixturesApiResponse;
};

export default function CommunityShieldHubClient({ initialData }: Props) {
  const t = useTranslations("communityShield");
  const { data } = useCommunityShieldFixture(initialData);
  const fixture = data?.fixtures?.[0] ?? null;

  return (
    <div className={styles.root} data-gc-community-shield>
      <p className={styles.eyebrow}>{t("eyebrow")}</p>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.subtitle}>{t("subtitle")}</p>

      {!fixture ? (
        <div className={styles.empty}>{t("unavailable")}</div>
      ) : (
        <article className={styles.card} aria-label={t("matchAria")}>
          <p className={styles.meta}>
            {fixture.venue ?? t("venueTba")}
            {" · "}
            {t("matchDate")}
          </p>
          <div className={styles.teams}>
            <div className={styles.team}>
              <PlTeamBadge
                name={fixture.homeTeamName}
                logo={fixture.homeTeamLogo}
                size={48}
              />
              <span className={styles.teamName}>{fixture.homeTeamName}</span>
            </div>
            <span className={styles.vs} aria-hidden="true">
              {t("vs")}
            </span>
            <div className={styles.team}>
              <PlTeamBadge
                name={fixture.awayTeamName}
                logo={fixture.awayTeamLogo}
                size={48}
              />
              <span className={styles.teamName}>{fixture.awayTeamName}</span>
            </div>
          </div>
          {fixture.homeScore != null && fixture.awayScore != null ? (
            <p className={styles.score} aria-label={t("scoreAria")}>
              {fixture.homeScore} – {fixture.awayScore}
            </p>
          ) : null}
          <p className={styles.kickoff}>
            {fixture.kickoffUtc
              ? new Date(fixture.kickoffUtc).toLocaleString()
              : t("kickoffTbc")}
          </p>
        </article>
      )}
    </div>
  );
}
