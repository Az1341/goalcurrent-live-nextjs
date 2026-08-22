"use client";

import {
  toggleFavouriteMatch,
  toggleFavouriteTeam,
} from "@/lib/favourites";
import {
  canonicalizeFavouriteMatchId,
  canonicalizeFavouriteTeamKey,
} from "@/lib/favourite-entities";
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
  const canonicalTeamId = canonicalizeFavouriteTeamKey(teamId);
  const active = favourites.teams.includes(canonicalTeamId);

  return (
    <button
      type="button"
      className={`${styles.favBtn} ${active ? styles.favBtnActive : ""} ${className ?? ""}`}
      aria-pressed={active}
      aria-label={active ? `Remove ${teamName} from favourites` : `Add ${teamName} to favourites`}
      title={active ? "Remove from favourites" : "Add to favourites"}
      onClick={() => {
        const added = toggleFavouriteTeam(canonicalTeamId);
        if (added) {
          trackFavouriteAdd({
            entity_type: "team",
            entity_id: canonicalTeamId,
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
  const canonicalMatchId = canonicalizeFavouriteMatchId(matchId);
  const active = favourites.matches.includes(canonicalMatchId);

  return (
    <button
      type="button"
      className={`${styles.favBtn} ${active ? styles.favBtnActive : ""} ${className ?? ""}`}
      aria-pressed={active}
      aria-label={active ? `Remove ${label} from favourites` : `Add ${label} to favourites`}
      title={active ? "Remove from favourites" : "Add to favourites"}
      onClick={() => {
        const added = toggleFavouriteMatch(canonicalMatchId);
        if (added) {
          trackFavouriteAdd({
            entity_type: "match",
            entity_id: canonicalMatchId,
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
