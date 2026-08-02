"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useMemo, useState } from "react";
import type { PlTeamRow, PlTeamsApiResponse } from "@/lib/pl/types";
import { clubHref, getClubSlugByName } from "@/lib/team-profile/club-slug";
import { SITE_NAME } from "@/lib/site-url";
import styles from "./PlData.module.css";
import {
  PlErrorPanel,
  PlLoadingPanel,
  PlSearchInput,
  PlTeamBadge,
} from "./PlShared";

type ViewState = "loading" | "error" | "ready";

export default function PlClubsClient() {
  const [view, setView] = useState<ViewState>("loading");
  const [data, setData] = useState<PlTeamsApiResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setView("loading");
      try {
        const res = await fetch("/api/pl/teams", { cache: "no-store" });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const body = (await res.json()) as PlTeamsApiResponse;
        if (cancelled) return;
        setData(body);
        setView("ready");
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Unknown error",
        );
        setView("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!data?.teams.length) return [] as PlTeamRow[];
    const q = query.trim().toLowerCase();
    if (!q) return data.teams;
    return data.teams.filter((team) => team.name.toLowerCase().includes(q));
  }, [data, query]);

  const emptyMessage =
    data?.error ??
    "Premier League clubs are not available yet.";

  return (
    <main className={styles.plPage}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Premier League Clubs 26/27</h1>
        <p className={styles.heroSub}>
          All 20 Premier League 26/27 clubs on {SITE_NAME} — from the official
          season fixture release (promoted: Coventry, Leeds, Sunderland, Hull;
          Ipswich bounce back).
        </p>
      </header>

      {view === "loading" ? (
        <PlLoadingPanel title="Loading clubs" text="Fetching Premier League teams…" />
      ) : null}
      {view === "error" ? (
        <PlErrorPanel
          title="Could not load clubs"
          text={errorMessage ?? "The teams API is temporarily unavailable."}
        />
      ) : null}

      {view === "ready" && data ? (
        <>
          <PlSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search clubs…"
          />
          {filtered.length === 0 ? (
            <p className={styles.meta}>
              {data.teams.length
                ? "No clubs match your search."
                : emptyMessage}
            </p>
          ) : (
            <div className={styles.grid}>
              {filtered.map((team) => {
                const slug = getClubSlugByName(team.name);
                const href = slug ? clubHref(slug) : null;

                const cardInner = (
                  <>
                    <PlTeamBadge name={team.name} logo={team.logo} />
                    <span className={styles.cardName}>{team.name}</span>
                    {team.venueName ? (
                      <span className={styles.listSub}>{team.venueName}</span>
                    ) : null}
                    {href ? (
                      <span className={styles.listSub}>View club profile</span>
                    ) : null}
                  </>
                );

                return href ? (
                  <Link
                    key={team.teamId}
                    href={href}
                    className={styles.card}
                    aria-label={`View ${team.name} club profile`}
                  >
                    {cardInner}
                  </Link>
                ) : (
                  <div
                    key={team.teamId}
                    className={styles.card}
                    aria-label={team.name}
                  >
                    {cardInner}
                  </div>
                );
              })}
            </div>
          )}
          <p className={styles.meta}>
            Source: {data.source} · {data.teams.length} clubs · Updated{" "}
            {new Date(data.fetchedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </>
      ) : null}
    </main>
  );
}
