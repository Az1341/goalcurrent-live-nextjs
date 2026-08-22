"use client";

import { FavouriteTeamButton } from "@/components/FavouriteButton";
import styles from "./FavouritesModern.module.css";

export default function TeamSupportBar({
  teamKey,
  teamName,
}: {
  teamKey: string;
  teamName: string;
}) {
  return (
    <div className={styles.teamPicker} aria-label={`Favourite ${teamName}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <FavouriteTeamButton teamId={teamKey} teamName={teamName} />
        <div>
          <strong>Support {teamName}</strong>
          <div className={styles.teamSearchMeta}>
            Add the team once to follow its next match and enable match alerts.
          </div>
        </div>
      </div>
    </div>
  );
}
