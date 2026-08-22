"use client";

import Image from "next/image";
import Link from "next/link";
import { LocalizedKickoffLabel } from "@/components/match/LocalizedKickoff";
import type { FavouriteTeamEntity } from "@/lib/favourite-entities";
import type { FavouriteFixtureView } from "@/lib/favourite-fixtures";
import { getUnlFlagSrc } from "@/lib/unl/flag";
import styles from "./FavouritesModern.module.css";

function TeamBadge({ team }: { team: FavouriteTeamEntity }) {
  const src = team.logo || getUnlFlagSrc(team.flagCode);
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
  const initials = team.name
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

export default function FavouriteTeamCard({
  team,
  nextFixture,
  alertEnabled,
  alertsAvailable,
  onToggleAlert,
  onRemove,
}: {
  team: FavouriteTeamEntity;
  nextFixture: FavouriteFixtureView | null;
  alertEnabled: boolean;
  alertsAvailable: boolean;
  onToggleAlert: () => void;
  onRemove: () => void;
}) {
  const nextHref =
    nextFixture?.source === "cs" ? "/community-shield" : nextFixture?.href;
  return (
    <article className={styles.teamCard}>
      <div className={styles.teamCardHeader}>
        <TeamBadge team={team} />
        <div className={styles.teamIdentity}>
          <span className={styles.teamName}>{team.name}</span>
          <span className={styles.teamMeta}>
            {team.kind === "club" ? "Club" : "National team"} · {team.competition}
          </span>
        </div>
      </div>

      <div className={styles.nextMatch}>
        <span className={styles.nextMatchLabel}>Next match</span>
        {nextFixture ? (
          <>
            <div className={styles.nextMatchTeams}>
              {nextFixture.homeTeamName} vs {nextFixture.awayTeamName}
            </div>
            <div className={styles.matchMeta}>
              {nextFixture.competition} · <LocalizedKickoffLabel iso={nextFixture.kickoffUtc} />
            </div>
          </>
        ) : (
          <span className={styles.matchMeta}>Next match not currently available.</span>
        )}
      </div>

      <div className={styles.actions}>
        {team.href ? (
          <Link href={team.href} className={styles.primaryAction}>
            View team
          </Link>
        ) : null}
        {nextHref ? (
          <Link href={nextHref} className={styles.secondaryAction}>
            View match
          </Link>
        ) : null}
        <button
          type="button"
          className={alertEnabled ? styles.alertActionActive : styles.alertAction}
          aria-pressed={alertEnabled}
          disabled={!alertsAvailable}
          onClick={onToggleAlert}
        >
          {alertEnabled ? "Next-match alert on" : "Notify me for next match"}
        </button>
        <button type="button" className={styles.secondaryAction} onClick={onRemove}>
          Remove
        </button>
      </div>
      {!alertsAvailable ? (
        <p className={styles.alertHint}>
          Sign in and allow notifications to enable next-match alerts on this device.
        </p>
      ) : alertEnabled ? (
        <p className={styles.alertHint}>
          One alert is scheduled for the next match. The target advances after that fixture.
        </p>
      ) : null}
    </article>
  );
}
