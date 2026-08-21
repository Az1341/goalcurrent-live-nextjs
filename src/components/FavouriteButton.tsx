"use client";

import {
  toggleFavouriteMatch,
  toggleFavouriteTeam,
} from "@/lib/favourites";
import { trackFavouriteAdd } from "@/lib/analytics";
import { useFavourites } from "@/lib/use-favourites";
import { useLocale } from "next-intl";
import styles from "@/components/wc26/wc26.module.css";

type FavouriteTeamButtonProps = {
  teamId: string;
  teamName: string;
  className?: string;
};

type FavouriteMatchButtonProps = {
  matchId: string;
  label: string;
  className?: string;
};

export function FavouriteTeamButton({
  teamId,
  teamName,
  className,
}: FavouriteTeamButtonProps) {
  const locale = useLocale();
  const favourites = useFavourites();
  const active = favourites.teams.includes(teamId);

  return (
    <button
      type="button"
      className={`${styles.favBtn} ${active ? styles.favBtnActive : ""} ${className ?? ""}`}
      aria-pressed={active}
      aria-label={active ? `Remove ${teamName} from favourites` : `Add ${teamName} to favourites`}
      title={active ? "Remove from favourites" : "Add to favourites"}
      onClick={() => {
        const added = toggleFavouriteTeam(teamId);
        if (added) {
          trackFavouriteAdd({
            entity_type: "team",
            entity_id: teamId,
            entity_name: teamName.slice(0, 120),
            source_surface: "favourite_button",
            language: locale,
          });
        }
      }}
    >
      {active ? "★" : "☆"}
    </button>
  );
}

export function FavouriteMatchButton({
  matchId,
  label,
  className,
}: FavouriteMatchButtonProps) {
  const locale = useLocale();
  const favourites = useFavourites();
  const active = favourites.matches.includes(matchId);

  return (
    <button
      type="button"
      className={`${styles.favBtn} ${active ? styles.favBtnActive : ""} ${className ?? ""}`}
      aria-pressed={active}
      aria-label={active ? `Remove ${label} from favourites` : `Add ${label} to favourites`}
      title={active ? "Remove from favourites" : "Add to favourites"}
      onClick={() => {
        const added = toggleFavouriteMatch(matchId, label);
        if (added) {
          trackFavouriteAdd({
            entity_type: "match",
            entity_id: matchId,
            entity_name: label.slice(0, 120),
            source_surface: "favourite_button",
            language: locale,
          });
        }
      }}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
