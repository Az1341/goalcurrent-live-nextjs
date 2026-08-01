"use client";

import Image from "next/image";
import { KickoffTime } from "@/components/KickoffTime";
import { Link } from "@/i18n/navigation";
import { formatUnlHostLabel } from "@/lib/unl/host-country";
import { getUnlFlagSrc } from "@/lib/unl/flag";
import { unlGroupHrefFromGroupId } from "@/lib/unl/live-partition";
import { UNL_DISPLAY_NAME, UNL_SEASON_LABEL } from "@/lib/unl/constants";
import type { UnlFixtureRow } from "@/lib/unl/types";
import styles from "./UnlHub.module.css";

function Flag({ code }: { code: string | null }) {
  const src = getUnlFlagSrc(code);
  if (!src) return <span className={styles.badge} aria-hidden />;
  return (
    <Image src={src} alt="" width={28} height={28} className={styles.badge} unoptimized />
  );
}

export default function UnlMatchClient({ fixture }: { fixture: UnlFixtureRow }) {
  const groupHref = unlGroupHrefFromGroupId(fixture.groupId);
  const showScore =
    fixture.homeScore !== null &&
    fixture.awayScore !== null &&
    (fixture.status === "FT" ||
      fixture.status === "AET" ||
      fixture.status === "PEN" ||
      fixture.status === "LIVE");

  return (
    <main className={styles.unlPage}>
      <Link href="/nations-league" className={styles.backLink}>
        ← Nations League {UNL_SEASON_LABEL}
      </Link>
      <header className={styles.hero}>
        <p className={styles.seasonBadge}>NATIONS LEAGUE {UNL_SEASON_LABEL}</p>
        <h1 className={styles.heroTitle}>
          {fixture.homeTeamName} vs {fixture.awayTeamName}
        </h1>
        <p className={styles.heroSub}>
          {UNL_DISPLAY_NAME} · Group {fixture.groupId.toUpperCase()}
          {fixture.matchday ? ` · MD ${fixture.matchday}` : ""}
        </p>
      </header>

      <section className={styles.card}>
        <div className={styles.metaLine}>
          <span className={styles.statusUpcoming}>{fixture.status}</span>
          <span>
            {fixture.kickoffUtc ? (
              <KickoffTime utcDate={fixture.kickoffUtc} />
            ) : (
              "Kickoff TBC"
            )}
          </span>
          <span className={styles.hostCountry}>
            {formatUnlHostLabel(fixture.homeTeamName, fixture.homeTeamFlag)}
          </span>
        </div>
        <article className={styles.fixtureRow}>
          <div className={styles.team}>
            <Flag code={fixture.homeTeamFlag} />
            <span className={styles.teamName}>{fixture.homeTeamName}</span>
          </div>
          <div className={styles.scoreBox}>
            {showScore ? (
              <>
                {fixture.homeScore} - {fixture.awayScore}
              </>
            ) : (
              "VS"
            )}
          </div>
          <div className={`${styles.team} ${styles.teamAway}`}>
            <Flag code={fixture.awayTeamFlag} />
            <span className={styles.teamName}>{fixture.awayTeamName}</span>
          </div>
        </article>
        <p className={styles.panelText} style={{ marginTop: 12 }}>
          <Link href={groupHref}>View group table and all fixtures →</Link>
        </p>
      </section>
    </main>
  );
}