"use client";

import Image from "next/image";
import Link from "next/link";
import { LocalizedKickoffLabel } from "@/components/match/LocalizedKickoff";
import type { FavouriteFixtureView } from "@/lib/favourite-fixtures";
import { getUnlFlagSrc } from "@/lib/unl/flag";
import styles from "./FavouritesModern.module.css";

function TeamBadge({
  name,
  logo,
  flagCode,
}: {
  name: string;
  logo: string | null;
  flagCode: string | null;
}) {
  const src = logo || getUnlFlagSrc(flagCode);
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={36}
        height={36}
        className={styles.badge}
        unoptimized
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return (
    <span className={styles.badgeFallback} aria-hidden>
      {initials || "FC"}
    </span>
  );
}

function scoreLabel(fixture: FavouriteFixtureView): string | null {
  if (fixture.homeScore == null || fixture.awayScore == null) return null;
  const status = fixture.status.trim().toUpperCase();
  if (!["LIVE", "FT", "AET", "PEN"].includes(status)) return null;
  return `${fixture.homeScore} – ${fixture.awayScore}`;
}

function statusLabel(fixture: FavouriteFixtureView): string {
  const status = fixture.status.trim().toUpperCase();
  if (status === "LIVE") {
    return fixture.elapsed != null ? `LIVE ${fixture.elapsed}'` : "LIVE";
  }
  if (status === "FT" || status === "AET" || status === "PEN") return status;
  if (status === "POSTPONED") return "POSTPONED";
  if (status === "CANCELLED") return "CANCELLED";
  return "UPCOMING";
}

export default function FavouriteFixtureCard({
  fixture,
  onRemove,
}: {
  fixture: FavouriteFixtureView;
  onRemove: () => void;
}) {
  const score = scoreLabel(fixture);
  const detailsHref = fixture.source === "cs" ? "/community-shield" : fixture.href;
  return (
    <article className={styles.matchCard}>
      <div className={styles.matchTop}>
        <span className={styles.competition}>{fixture.competition}</span>
        <span className={styles.matchMeta}>{statusLabel(fixture)}</span>
      </div>
      <div className={styles.matchTeams}>
        <div className={styles.matchTeamHome}>
          <TeamBadge
            name={fixture.homeTeamName}
            logo={fixture.homeTeamLogo}
            flagCode={fixture.homeTeamFlag}
          />
          <span>{fixture.homeTeamName}</span>
        </div>
        <div className={styles.scoreBox}>
          {score ? <span className={styles.score}>{score}</span> : <span>vs</span>}
          <span className={styles.kickoff}>
            <LocalizedKickoffLabel iso={fixture.kickoffUtc} />
          </span>
        </div>
        <div className={styles.matchTeamAway}>
          <TeamBadge
            name={fixture.awayTeamName}
            logo={fixture.awayTeamLogo}
            flagCode={fixture.awayTeamFlag}
          />
          <span>{fixture.awayTeamName}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <Link href={detailsHref} className={styles.primaryAction}>
          Match details
        </Link>
        <button type="button" className={styles.secondaryAction} onClick={onRemove}>
          Remove
        </button>
      </div>
    </article>
  );
}
