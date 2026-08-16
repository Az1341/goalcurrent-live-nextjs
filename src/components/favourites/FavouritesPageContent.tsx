"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import TeamFlag from "@/components/TeamFlag";
import FavouriteFixtureCard from "@/components/favourites/FavouriteFixtureCard";
import FavouriteTeamCard from "@/components/favourites/FavouriteTeamCard";
import {
  removeFavouriteCompetition,
  removeFavouriteMatch,
  removeFavouriteTeam,
  setTeamNotificationEnabled,
  toggleFavouriteTeam,
} from "@/lib/favourites";
import { useFavourites } from "@/lib/use-favourites";
import { useEffectiveFixtures } from "@/lib/use-effective-fixtures";
import { LocalizedKickoffLabel } from "@/components/match/LocalizedKickoff";
import { matchHref } from "@/lib/wc26-match";
import {
  getFixtureById,
  groupLabel,
} from "@/data/wc26";
import { resolveFixtureParticipant } from "@/lib/wc26-live";
import type { EffectiveFixture } from "@/lib/wc26-fixture-overlay";
import { getSeoEffectiveFixtures, mergeFavouriteMatchFixture } from "@/lib/wc26/seo-fixtures";
import MatchTvBroadcast from "@/components/wc26/MatchTvBroadcast";
import { useWc26TvRegion } from "@/lib/use-wc26-tv-region";
import { SITE_NAME } from "@/lib/site-url";
import {
  getFavouriteTeamCatalog,
  parseFavouriteMatchId,
  resolveFavouriteTeam,
} from "@/lib/favourite-entities";
import {
  getNextFavouriteTeamFixture,
  resolveFavouriteFixture,
} from "@/lib/favourite-fixtures";
import type { PlFixtureRow, PlFixturesApiResponse } from "@/lib/pl/types";
import type { UnlFixtureRow, UnlFixturesApiResponse } from "@/lib/unl/types";
import { isFirebaseMessagingConfigured } from "@/lib/firebase/config";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import layoutStyles from "@/components/layout/layout.module.css";
import styles from "@/components/wc26/wc26.module.css";
import modernStyles from "./FavouritesModern.module.css";

export default function FavouritesPageContent() {
  const t = useTranslations("favourites");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("match.status");
  const { teams, matches, competitions, teamNotifications } = useFavourites();
  const { tvRegion } = useWc26TvRegion();
  const effectiveFixtures = useEffectiveFixtures();
  const seoFixtures = getSeoEffectiveFixtures();
  const { user } = useFirebaseAuth();
  const [plFixtures, setPlFixtures] = useState<PlFixtureRow[]>([]);
  const [unlFixtures, setUnlFixtures] = useState<UnlFixtureRow[]>([]);
  const [teamQuery, setTeamQuery] = useState("");
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    let cancelled = false;
    async function loadFixtures() {
      const [plResult, unlResult] = await Promise.allSettled([
        fetch("/api/pl/fixtures", { cache: "no-store" }),
        fetch("/api/unl/fixtures", { cache: "no-store" }),
      ]);
      if (cancelled) return;

      if (plResult.status === "fulfilled" && plResult.value.ok) {
        try {
          const body = (await plResult.value.json()) as PlFixturesApiResponse;
          if (!cancelled) setPlFixtures(body.fixtures ?? []);
        } catch {
          // Keep the safe empty fallback.
        }
      }

      if (unlResult.status === "fulfilled" && unlResult.value.ok) {
        try {
          const body = (await unlResult.value.json()) as UnlFixturesApiResponse;
          if (!cancelled) setUnlFixtures(body.fixtures ?? []);
        } catch {
          // Keep the safe empty fallback.
        }
      }
    }
    void loadFixtures();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const hasAny =
    teams.length > 0 || matches.length > 0 || competitions.length > 0;

  const teamCatalog = useMemo(() => getFavouriteTeamCatalog(), []);
  const filteredTeams = useMemo(() => {
    const query = teamQuery.trim().toLowerCase();
    if (!query) return [];
    return teamCatalog
      .filter((team) =>
        [team.name, team.competition, ...team.aliases]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 8);
  }, [teamCatalog, teamQuery]);

  const alertsAvailable =
    Boolean(user) &&
    isFirebaseMessagingConfigured() &&
    typeof window !== "undefined" &&
    "Notification" in window &&
    notificationPermission !== "denied";

  async function toggleTeamAlert(teamKey: string, enabled: boolean) {
    if (!user || !isFirebaseMessagingConfigured() || typeof window === "undefined") {
      return;
    }
    if (!("Notification" in window)) return;

    if (enabled) {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }
      if (permission !== "granted") return;
    }
    setTeamNotificationEnabled(teamKey, enabled);
  }

  return (
    <main className={layoutStyles.content}>
      <h1 className={styles.pageTitle}>{t("title")}</h1>
      <p className={styles.pageIntro}>{t("pageIntro", { siteName: SITE_NAME })}</p>

      <div className={modernStyles.teamPicker}>
        <label htmlFor="favourite-team-search" className={modernStyles.teamPickerLabel}>
          Add a club or national team
        </label>
        <input
          id="favourite-team-search"
          type="search"
          value={teamQuery}
          onChange={(event) => setTeamQuery(event.target.value)}
          className={modernStyles.teamSearch}
          placeholder="Try Arsenal, England, Spain…"
          autoComplete="off"
        />
        {filteredTeams.length ? (
          <div className={modernStyles.teamSearchResults}>
            {filteredTeams.map((team) => {
              const active = teams.includes(team.key);
              return (
                <button
                  type="button"
                  key={team.key}
                  className={modernStyles.teamSearchButton}
                  aria-pressed={active}
                  onClick={() => toggleFavouriteTeam(team.key)}
                >
                  <span>
                    <strong>{team.name}</strong>
                    <span className={modernStyles.teamSearchMeta}>
                      {" · "}{team.kind === "club" ? "Club" : "National team"}
                    </span>
                  </span>
                  <span>{active ? "★ Added" : "☆ Add"}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {!hasAny ? (
        <div className={styles.favEmpty}>
          <h2>{t("emptyTitle")}</h2>
          <p>{t("emptyHint")}</p>
        </div>
      ) : null}

      <section aria-labelledby="fav-teams-heading">
        <h2 id="fav-teams-heading" className={styles.sectionTitle}>
          {t("teamsSection")}
        </h2>
        {teams.length === 0 ? (
          <p className={styles.favSectionEmpty}>
            No teams saved yet. Search above and add the club or national team you support.
          </p>
        ) : (
          <ul className={modernStyles.cardList}>
            {teams.map((teamId) => {
              const team = resolveFavouriteTeam(teamId);
              if (!team) {
                return (
                  <li key={teamId} className={modernStyles.unavailableCard}>
                    <p className={modernStyles.unavailableTitle}>Saved team unavailable</p>
                    <p className={modernStyles.unavailableText}>
                      This older favourite can no longer be matched safely to a current team.
                    </p>
                    <div className={modernStyles.actions}>
                      <button
                        type="button"
                        className={modernStyles.secondaryAction}
                        onClick={() => removeFavouriteTeam(teamId)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              }
              const nextFixture = getNextFavouriteTeamFixture(
                teamId,
                plFixtures,
                unlFixtures,
              );
              const alertEnabled = teamNotifications.includes(teamId);
              return (
                <li key={teamId}>
                  <FavouriteTeamCard
                    team={team}
                    nextFixture={nextFixture}
                    alertEnabled={alertEnabled}
                    alertsAvailable={alertsAvailable}
                    onToggleAlert={() => {
                      void toggleTeamAlert(teamId, !alertEnabled);
                    }}
                    onRemove={() => removeFavouriteTeam(teamId)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="fav-matches-heading">
        <h2 id="fav-matches-heading" className={styles.sectionTitle}>
          {t("matchesSection")}
        </h2>
        {matches.length === 0 ? (
          <p className={styles.favSectionEmpty}>{t("noMatches")}</p>
        ) : (
          <ul className={modernStyles.cardList}>
            {matches.map((matchId) => {
              const wc26Fixture = getFixtureById(matchId);
              if (wc26Fixture) {
                const live: EffectiveFixture =
                  mergeFavouriteMatchFixture(matchId, effectiveFixtures) ??
                  seoFixtures.find((entry) => entry.id === matchId) ??
                  wc26Fixture;
                const homeResolved = resolveFixtureParticipant(
                  live,
                  "home",
                  seoFixtures,
                );
                const awayResolved = resolveFixtureParticipant(
                  live,
                  "away",
                  seoFixtures,
                );
                const hasScore =
                  live.homeScore !== undefined && live.awayScore !== undefined;
                const liveStatus = (live.status as string | undefined)?.toLowerCase();
                const isLive =
                  liveStatus === "live" ||
                  liveStatus === "1h" ||
                  liveStatus === "2h" ||
                  liveStatus === "ht";
                const isFT =
                  liveStatus === "ft" || liveStatus === "aet" || liveStatus === "pen";
                const scoreText = hasScore
                  ? `${live.homeScore} – ${live.awayScore}`
                  : null;
                const halfLabel =
                  liveStatus === "1h"
                    ? tStatus("1h")
                    : liveStatus === "2h"
                      ? tStatus("2h")
                      : liveStatus === "ht"
                        ? tStatus("ht")
                        : tStatus("live");
                const statusLabel = isLive
                  ? halfLabel
                  : isFT
                    ? tStatus("ft")
                    : null;
                const elapsedLabel =
                  isLive && live.elapsed != null ? `${live.elapsed}'` : null;

                return (
                  <li key={matchId} style={{ listStyle: "none" }}>
                    <div
                      style={{
                        background: "#fff",
                        border: `1px solid ${isLive ? "#16a34a" : "#e2e8f0"}`,
                        borderRadius: 12,
                        overflow: "hidden",
                      }}
                    >
                      {statusLabel && (
                        <div
                          style={{
                            background: isLive ? "#16a34a" : "#64748b",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 12px",
                            letterSpacing: "0.06em",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {statusLabel}
                          {elapsedLabel && (
                            <span style={{ marginLeft: 6, fontWeight: 800 }}>
                              {elapsedLabel}
                            </span>
                          )}
                        </div>
                      )}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto 1fr",
                          alignItems: "center",
                          padding: "14px 16px 10px",
                          gap: 8,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                          <TeamFlag teamId={homeResolved.teamId} teamName={homeResolved.label} size={28} />
                          <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{homeResolved.label}</span>
                        </div>
                        <div style={{ textAlign: "center", minWidth: 70 }}>
                          {scoreText ? (
                            <div style={{ fontSize: 22, fontWeight: 800, color: isLive ? "#16a34a" : "#0f172a", lineHeight: 1 }}>{scoreText}</div>
                          ) : (
                            <>
                              <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{tCommon("vs")}</div>
                              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                                <LocalizedKickoffLabel iso={live.kickoffUtc} />
                              </div>
                            </>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start" }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{awayResolved.label}</span>
                          <TeamFlag teamId={awayResolved.teamId} teamName={awayResolved.label} size={28} />
                        </div>
                      </div>
                      <div style={{ padding: "0 16px 4px", fontSize: 12, color: "#64748b" }}>
                        <MatchTvBroadcast
                          tvRegion={tvRegion}
                          matchNumber={wc26Fixture.matchNumber}
                          variant="chips"
                          className={styles.favListTv}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 8, padding: "10px 16px 12px", borderTop: "1px solid #f1f5f9" }}>
                        <Link
                          href={matchHref(matchId)}
                          style={{ flex: 1, padding: "8px 12px", background: "#7B0D1E", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 13, textAlign: "center" }}
                        >
                          {t("matchDetailsCta")}
                        </Link>
                        <button
                          type="button"
                          style={{ padding: "8px 12px", background: "transparent", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#64748b", cursor: "pointer" }}
                          onClick={() => removeFavouriteMatch(matchId)}
                        >
                          {t("removeBtn")}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              }

              const fixture = resolveFavouriteFixture(
                matchId,
                plFixtures,
                unlFixtures,
              );
              if (fixture) {
                return (
                  <li key={matchId}>
                    <FavouriteFixtureCard
                      fixture={fixture}
                      onRemove={() => removeFavouriteMatch(matchId)}
                    />
                  </li>
                );
              }

              const parsed = parseFavouriteMatchId(matchId);
              return (
                <li key={matchId} className={modernStyles.unavailableCard}>
                  <p className={modernStyles.unavailableTitle}>
                    Saved {parsed.competition} match unavailable
                  </p>
                  <p className={modernStyles.unavailableText}>
                    This older saved match can no longer be matched safely to current fixture data. You can remove it without losing any other favourites.
                  </p>
                  <div className={modernStyles.actions}>
                    <button
                      type="button"
                      className={modernStyles.secondaryAction}
                      onClick={() => removeFavouriteMatch(matchId)}
                    >
                      {t("removeBtn")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="fav-competitions-heading">
        <h2 id="fav-competitions-heading" className={styles.sectionTitle}>
          {t("competitionsSection")}
        </h2>
        {competitions.length === 0 ? (
          <p className={styles.favSectionEmpty}>{t("noCompetitions")}</p>
        ) : (
          <ul className={styles.favList}>
            {competitions.map((competitionId) => (
              <li key={competitionId} className={styles.favListItem}>
                <span className={styles.favListLabel}>
                  {competitionId === "wc26"
                    ? t("wc26Competition")
                    : competitionId}
                </span>
                <button
                  type="button"
                  className={styles.favRemoveBtn}
                  onClick={() => removeFavouriteCompetition(competitionId)}
                >
                  {t("removeBtn")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className={styles.hubBack}>
        <Link href="/">{tCommon("backToHome")}</Link>
      </p>
    </main>
  );
}
