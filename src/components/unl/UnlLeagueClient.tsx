"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  UNL_DISPLAY_NAME,
  UNL_SEASON_LABEL,
  type UnlLeagueId,
} from "@/lib/unl/constants";
import { getUnlFlagSrc } from "@/lib/unl/flag";
import { getUnlGroupsByLeague } from "@/lib/unl/groups-ssot";
import styles from "./UnlHub.module.css";

type UnlLeagueClientProps = {
  league: UnlLeagueId;
};

export default function UnlLeagueClient({ league }: UnlLeagueClientProps) {
  const groups = getUnlGroupsByLeague(league);
  const leagueTitle = `League ${league.toUpperCase()}`;

  return (
    <main className={styles.unlPage}>
      <Link href="/nations-league" className={styles.backLink}>
        ← Nations League {UNL_SEASON_LABEL}
      </Link>
      <header className={styles.hero}>
        <p className={styles.seasonBadge}>NATIONS LEAGUE {UNL_SEASON_LABEL}</p>
        <h1 className={styles.heroTitle}>
          {UNL_DISPLAY_NAME} · {leagueTitle}
        </h1>
        <p className={styles.heroSub}>
          Groups and teams in {leagueTitle} for the UEFA Nations League{" "}
          {UNL_SEASON_LABEL} league phase.
        </p>
      </header>

      <section className={styles.card} aria-labelledby="unl-league-groups">
        <h2 id="unl-league-groups" className={styles.cardTitle}>
          {leagueTitle} groups
        </h2>
        {groups.length ? (
          <div className={styles.groupGrid}>
            {groups.map((group) => {
              const num = group.groupId.slice(1);
              return (
                <Link
                  key={group.groupId}
                  href={`/nations-league/league/${league}/group/${num}`}
                  className={styles.groupCard}
                >
                  <h3 className={styles.groupCardTitle}>{group.label}</h3>
                  <ul className={styles.teamList}>
                    {group.teams.map((team) => {
                      const flag = getUnlFlagSrc(team.flagCode);
                      const src = team.logo || flag;
                      return (
                        <li key={team.teamId} className={styles.teamListItem}>
                          {src ? (
                            <Image
                              src={src}
                              alt=""
                              width={22}
                              height={22}
                              className={styles.badge}
                              unoptimized
                            />
                          ) : (
                            <span className={styles.badge} aria-hidden />
                          )}
                          <span>{team.name}</span>
                        </li>
                      );
                    })}
                  </ul>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className={styles.panel}>
            <p className={styles.panelTitle}>No groups found</p>
            <p className={styles.panelText}>
              Group data for {leagueTitle} is not available yet.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}