"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import TeamFlag from "@/components/TeamFlag";
import {
  removeFavouriteCompetition,
  removeFavouriteMatch,
  removeFavouriteTeam,
} from "@/lib/favourites";
import { useFavourites } from "@/lib/use-favourites";
import { useEffectiveFixtures } from "@/lib/use-effective-fixtures";
import { LocalizedKickoffLabel } from "@/components/match/LocalizedKickoff";
import { matchHref } from "@/lib/wc26-match";
import { teamHref } from "@/lib/wc26-teams";
import {
  getFixtureById,
  getTeamById,
  groupLabel,
} from "@/data/wc26";
import { resolveFixtureParticipant } from "@/lib/wc26-live";
import type { EffectiveFixture } from "@/lib/wc26-fixture-overlay";
import { getSeoEffectiveFixtures, mergeFavouriteMatchFixture } from "@/lib/wc26/seo-fixtures";
import MatchTvBroadcast from "@/components/wc26/MatchTvBroadcast";
import { useWc26TvRegion } from "@/lib/use-wc26-tv-region";
import { SITE_NAME } from "@/lib/site-url";
import layoutStyles from "@/components/layout/layout.module.css";
import styles from "@/components/wc26/wc26.module.css";

export default function FavouritesPageContent() {
  const t = useTranslations("favourites");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("match.status");
  const { teams, matches, competitions, matchLabels } = useFavourites();
  const { tvRegion } = useWc26TvRegion();
  const effectiveFixtures = useEffectiveFixtures();
  const seoFixtures = getSeoEffectiveFixtures();
  const hasAny =
    teams.length > 0 || matches.length > 0 || competitions.length > 0;

  return (
    <main className={layoutStyles.content}>
      <h1 className={styles.pageTitle}>{t("title")}</h1>
      <p className={styles.pageIntro}>{t("pageIntro", { siteName: SITE_NAME })}</p>

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
          <p className={styles.favSectionEmpty}>{t("noTeams")}</p>
        ) : (
          <ul className={styles.favList}>
            {teams.map((teamId) => {
              const team = getTeamById(teamId);
              if (!team) {
                return null;
              }
              return (
                <li key={teamId} className={styles.favListItem}>
                  <Link href={teamHref(team.id)} className={styles.favListMain}>
                    <TeamFlag teamId={team.id} size={24} />
                    <span className={styles.favListLabel}>{team.name}</span>
                    <span className={styles.favListMeta}>
                      {groupLabel(team.groupId)}
                    </span>
                  </Link>
                  <button
                    type="button"
                    className={styles.favRemoveBtn}
                    onClick={() => removeFavouriteTeam(teamId)}
                  >
                    {t("removeBtn")}
                  </button>
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
          <ul className={styles.favList}>
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
                return (
                  <li key={matchId} style={{ listStyle: "none", marginBottom: 10 }}>
                    {(() => {
                      const hasScore =
                        live.homeScore !== undefined && live.awayScore !== undefined;
                      const liveStatus = (live.status as string | undefined)?.toLowerCase();
                      const isLive = liveStatus === "live" || liveStatus === "1h" || liveStatus === "2h" || liveStatus === "ht";
                      const isFT = liveStatus === "ft" || liveStatus === "aet" || liveStatus === "pen";
                      const scoreText = hasScore ? `${live.homeScore} – ${live.awayScore}` : null;
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
                      const elapsedLabel = isLive && live.elapsed != null ? `${live.elapsed}'` : null;
                      return (
                    <div style={{
                      background: "#fff",
                      border: `1px solid ${isLive ? "#16a34a" : "#e2e8f0"}`,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}>
                      {/* Status bar if live/ft */}
                      {statusLabel && (
                        <div style={{
                          background: isLive ? "#16a34a" : "#64748b",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 12px",
                          letterSpacing: "0.06em",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}>
                          {isLive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block", animation: "gcPulse 1.4s infinite" }} />}
                          {statusLabel}
                          {elapsedLabel && <span style={{ marginLeft: 6, fontWeight: 800 }}>{elapsedLabel}</span>}
                        </div>
                      )}
                      {/* Match teams row */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center",
                        padding: "14px 16px 10px",
                        gap: 8,
                      }}>
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
                      {/* TV broadcast */}
                      <div style={{ padding: "0 16px 4px", fontSize: 12, color: "#64748b" }}>
                        <MatchTvBroadcast
                          tvRegion={tvRegion}
                          matchNumber={wc26Fixture.matchNumber}
                          variant="chips"
                          className={styles.favListTv}
                        />
                      </div>
                      {/* Actions */}
                      <div style={{
                        display: "flex",
                        gap: 8,
                        padding: "10px 16px 12px",
                        borderTop: "1px solid #f1f5f9",
                      }}>
                        <Link href={matchHref(matchId)} style={{
                          flex: 1,
                          padding: "8px 12px",
                          background: "#7B0D1E",
                          color: "#fff",
                          borderRadius: 8,
                          textDecoration: "none",
                          fontWeight: 700,
                          fontSize: 13,
                          textAlign: "center",
                        }}>
                          {t("matchDetailsCta")}
                        </Link>
                        <button
                          type="button"
                          style={{
                            padding: "8px 12px",
                            background: "transparent",
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "#64748b",
                            cursor: "pointer",
                          }}
                          onClick={() => removeFavouriteMatch(matchId)}
                        >
                          {t("removeBtn")}
                        </button>
                      </div>
                    </div>
                      );
                    })()}
                  </li>
                );
              }

              const savedLabel = matchLabels[matchId];
              return (
                <li key={matchId} className={styles.favListItem} data-gc-fav-match={matchId}>
                  <span className={styles.favListLabel} data-gc-fav-match-label>
                    {savedLabel || t("noLongerAvailable")}
                  </span>
                  <button
                    type="button"
                    className={styles.favRemoveBtn}
                    onClick={() => removeFavouriteMatch(matchId)}
                  >
                    {t("removeBtn")}
                  </button>
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
