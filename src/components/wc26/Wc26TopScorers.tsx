"use client";

import { useMemo, useState } from "react";
import TeamFlag from "@/components/TeamFlag";
import { WC26_TOP_SCORERS_FALLBACK } from "@/data/wc26Standings";
import { resolveTeamId } from "@/lib/teamIdentity";
import {
  formatTopScorerPlayerName,
  type TopScorerRow,
} from "@/lib/wc26-top-scorers";
import styles from "./wc26.module.css";

const TOP_SCORERS_VISIBLE = 6;

type Wc26TopScorersProps = {
  /** When true, omit outer section title (parent supplies heading). */
  embedded?: boolean;
  /** Optional anchor id for in-page links (e.g. bracket page). */
  sectionId?: string;
  /** When set, use unified top scorers data from parent (e.g. group hub). */
  scorers?: readonly TopScorerRow[];
  loading?: boolean;
};

function ScorerTableRow({
  row,
  moreSectionStart = false,
}: {
  row: TopScorerRow;
  moreSectionStart?: boolean;
}) {
  const teamId = resolveTeamId(row.teamName);

  return (
    <tr
      className={moreSectionStart ? styles.topScorersRowMoreStart : undefined}
    >
      <td>{row.rank}</td>
      <td className={styles.colPlayer}>{formatTopScorerPlayerName(row)}</td>
      <td className={styles.colTeam}>
        <span className={styles.topScorerTeamCell}>
          {teamId ? <TeamFlag teamId={teamId} size={20} /> : null}
          <span className={styles.topScorerTeamName}>{row.teamName}</span>
        </span>
      </td>
      <td>{row.goals}</td>
    </tr>
  );
}

export default function Wc26TopScorers({
  embedded = false,
  sectionId = "top-scorers",
  scorers: scorersProp,
  loading: loadingProp = false,
}: Wc26TopScorersProps) {
  const [expanded, setExpanded] = useState(false);

  const fallbackScorers = useMemo(
    () =>
      WC26_TOP_SCORERS_FALLBACK.map((row) => ({
        ...row,
        ownGoals: 0,
      })),
    [],
  );

  const scorers = scorersProp ?? fallbackScorers;
  const hasScorers = scorers.length > 0;
  const hasMoreScorers = scorers.length > TOP_SCORERS_VISIBLE;
  const visibleScorers = expanded
    ? scorers
    : scorers.slice(0, TOP_SCORERS_VISIBLE);

  return (
    <section
      id={sectionId}
      className={styles.topScorersSection}
      aria-labelledby={embedded ? undefined : "top-scorers-heading"}
    >
      {embedded ? null : (
        <h2 id="top-scorers-heading" className={styles.sectionTitle}>
          Top scorers
        </h2>
      )}

      <div className={styles.topScorersShell}>
        {loadingProp ? (
          <p className={styles.topScorersEmpty}>Loading top scorers...</p>
        ) : !hasScorers ? (
          <p className={styles.topScorersEmpty}>
            Top scorers are not available in this archive yet.
          </p>
        ) : (
          <>
            <table className={styles.topScorersTable}>
              <thead className={styles.topScorersThead}>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col" className={styles.colPlayer}>
                    Player
                  </th>
                  <th scope="col" className={styles.colTeam}>
                    Team
                  </th>
                  <th scope="col">Goals</th>
                </tr>
              </thead>
              <tbody>
                {visibleScorers.map((row, index) => (
                  <ScorerTableRow
                    key={`${row.rank}-${row.playerName}-${row.teamName}`}
                    row={row}
                    moreSectionStart={expanded && index === TOP_SCORERS_VISIBLE}
                  />
                ))}
              </tbody>
            </table>
            {hasMoreScorers ? (
              <button
                type="button"
                className={styles.topScorersExpandBtn}
                aria-expanded={expanded}
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded ? "Show top 6 only" : "Show all goal scorers"}
              </button>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
