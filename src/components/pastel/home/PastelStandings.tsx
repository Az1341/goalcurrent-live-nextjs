"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { PlStandingsApiResponse } from "@/lib/pl/types";
import { PlTeamLogo } from "@/components/pl/PlShared";
import styles from "../pastel.module.css";

type ViewState = "loading" | "error" | "empty" | "ready";

export default function PastelStandings() {
  const [view, setView] = useState<ViewState>("loading");
  const [data, setData] = useState<PlStandingsApiResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/pl/standings", { cache: "no-store" });
        if (!res.ok) throw new Error(`standings ${res.status}`);
        const body = (await res.json()) as PlStandingsApiResponse;
        if (cancelled) return;
        setData(body);
        setView(body.standings.length ? "ready" : "empty");
      } catch {
        if (!cancelled) setView("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = data?.standings.slice(0, 6) ?? [];

  return (
    <section
      className={styles.widgetCard}
      aria-labelledby="pastel-standings-heading"
    >
      <div className={styles.widgetHeader}>
        <h2 id="pastel-standings-heading" className={styles.widgetTitle}>
          Standings
        </h2>
        <Link href="/premier-league/table" className={styles.widgetLink}>
          Full table
        </Link>
      </div>

      {view === "loading" ? (
        <p className={styles.muted}>Loading table…</p>
      ) : null}
      {view === "error" ? (
        <p className={styles.muted} role="alert">
          Standings unavailable right now.
        </p>
      ) : null}
      {view === "empty" ? (
        <p className={styles.muted}>No standings rows from the live feed yet.</p>
      ) : null}

      {view === "ready" ? (
        <ol className={styles.standingsList}>
          {rows.map((row) => (
            <li key={row.teamId} className={styles.standingsRow}>
              <span className={styles.standingsRank}>{row.rank}</span>
              <span className={styles.teamBadgeCircleSm}>
                <PlTeamLogo
                  name={row.teamName}
                  logo={row.teamLogo}
                  size={24}
                  rounded
                  className={styles.teamBadgeInner}
                />
              </span>
              <span className={styles.standingsTeam}>{row.teamName}</span>
              <span className={styles.standingsPts}>{row.points}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
