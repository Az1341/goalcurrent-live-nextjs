"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { KickoffTime } from "@/components/KickoffTime";
import { Link } from "@/i18n/navigation";
import { useLiveUnlFixtures } from "@/lib/client/useLiveUnlFixtures";
import { SITE_NAME } from "@/lib/site-url";
import {
  isFinishedUnlStatus,
  isLiveUnlStatus,
  sanitiseUnlProviderError,
} from "@/lib/unl/contract";
import {
  UNL_DISPLAY_NAME,
  UNL_GROUP_IDS,
  UNL_LEAGUE_ID,
  UNL_LEAGUES,
  UNL_SEASON,
  UNL_SEASON_LABEL,
  type UnlLeagueId,
} from "@/lib/unl/constants";
import { getUnlFlagSrc } from "@/lib/unl/flag";
import { formatUnlHostLabel } from "@/lib/unl/host-country";
import { getUnlGroups } from "@/lib/unl/groups-ssot";
import type { UnlFixtureRow } from "@/lib/unl/types";
import styles from "./UnlHub.module.css";

function yearMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return y + "-" + m;
}

function isoDayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDayChip(isoDay: string): string {
  const [y, m, d] = isoDay.split("-").map(Number);
  if (!y || !m || !d) return isoDay;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
  });
}

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function statusClass(status: UnlFixtureRow["status"]): string {
  switch (status) {
    case "LIVE":
      return styles.statusLive;
    case "FT":
    case "AET":
    case "PEN":
      return styles.statusFt;
    case "POSTPONED":
      return styles.statusPostponed;
    case "CANCELLED":
      return styles.statusCancelled;
    default:
      return styles.statusUpcoming;
  }
}

function statusLabel(status: UnlFixtureRow["status"]): string {
  switch (status) {
    case "LIVE":
      return "Live";
    case "AET":
      return "AET";
    case "PEN":
      return "PEN";
    case "FT":
      return "FT";
    case "POSTPONED":
      return "Postponed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Upcoming";
  }
}

function TeamBadge({
  logo,
  flagCode,
}: {
  logo: string | null;
  flagCode: string | null;
}) {
  const src = logo || getUnlFlagSrc(flagCode);
  if (!src) return <span className={styles.badge} aria-hidden />;
  return (
    <Image
      src={src}
      alt=""
      width={22}
      height={22}
      className={styles.badge}
      unoptimized
    />
  );
}

function FixtureRow({ fixture }: { fixture: UnlFixtureRow }) {
  const showScore =
    fixture.homeScore !== null &&
    fixture.awayScore !== null &&
    (isFinishedUnlStatus(fixture.status) || isLiveUnlStatus(fixture.status));

  return (
    <Link
      href={`/nations-league/match/${fixture.fixtureId}`}
      className={styles.fixtureRowLink}
    >
      <article className={styles.fixtureRow}>
        <div className={styles.team}>
          <TeamBadge logo={fixture.homeTeamLogo} flagCode={fixture.homeTeamFlag} />
          <span className={styles.teamName}>{fixture.homeTeamName}</span>
        </div>
        <div className={styles.scoreBox}>
          {showScore ? (
            <>
              {fixture.homeScore} - {fixture.awayScore}
            </>
          ) : (
            "VS"
          )}
        </div>
        <div className={`${styles.team} ${styles.teamAway}`}>
          <TeamBadge logo={fixture.awayTeamLogo} flagCode={fixture.awayTeamFlag} />
          <span className={styles.teamName}>{fixture.awayTeamName}</span>
        </div>
      </article>
    </Link>
  );
}

function DateFilterBar({
  monthOptions,
  month,
  onMonthChange,
  days,
  selectedDay,
  onDayChange,
}: {
  monthOptions: string[];
  month: string;
  onMonthChange: (ym: string) => void;
  days: string[];
  selectedDay: string | "all";
  onDayChange: (day: string | "all") => void;
}) {
  if (monthOptions.length === 0) return null;
  return (
    <div className={styles.dateFilter}>
      <label className={styles.monthSelectWrap}>
        <span className={styles.srOnly}>Month</span>
        <select
          className={styles.monthSelect}
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          aria-label="Select month"
        >
          {monthOptions.map((ym) => (
            <option key={ym} value={ym}>
              {formatMonthLabel(ym)}
            </option>
          ))}
        </select>
      </label>
      {days.length > 0 ? (
        <div className={styles.dayPicker} role="group" aria-label="Pick a date">
          <button
            type="button"
            className={`${styles.dayChip} ${selectedDay === "all" ? styles.dayChipActive : ""}`}
            onClick={() => onDayChange("all")}
          >
            All dates
          </button>
          {days.map((day) => (
            <button
              key={day}
              type="button"
              className={`${styles.dayChip} ${selectedDay === day ? styles.dayChipActive : ""}`}
              onClick={() => onDayChange(day)}
            >
              {formatDayChip(day)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FixtureBlock({
  title,
  id,
  fixtures,
  emptyTitle,
  emptyText,
  showDateFilter,
}: {
  title: string;
  id: string;
  fixtures: UnlFixtureRow[];
  emptyTitle: string;
  emptyText: string;
  showDateFilter?: boolean;
}) {
  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    for (const row of fixtures) {
      set.add(yearMonthKey(new Date(row.kickoffUtc)));
    }
    return [...set].sort();
  }, [fixtures]);

  const [month, setMonth] = useState(() => monthOptions[0] ?? "");
  const [selectedDay, setSelectedDay] = useState<string | "all">("all");

  // Keep month valid when fixtures load/change
  const effectiveMonth =
    month && monthOptions.includes(month) ? month : monthOptions[0] ?? "";

  const daysInMonth = useMemo(() => {
    const set = new Set<string>();
    for (const row of fixtures) {
      if (yearMonthKey(new Date(row.kickoffUtc)) !== effectiveMonth) continue;
      const key = isoDayKey(row.kickoffUtc);
      if (key) set.add(key);
    }
    return [...set].sort();
  }, [fixtures, effectiveMonth]);

  const visible = useMemo(() => {
    return fixtures.filter((row) => {
      if (yearMonthKey(new Date(row.kickoffUtc)) !== effectiveMonth) return false;
      if (selectedDay === "all") return true;
      return isoDayKey(row.kickoffUtc) === selectedDay;
    });
  }, [fixtures, effectiveMonth, selectedDay]);

  return (
    <section className={styles.card} aria-labelledby={id}>
      <h2 id={id} className={styles.cardTitle}>
        {title}
      </h2>
      {showDateFilter ? (
        <DateFilterBar
          monthOptions={monthOptions}
          month={effectiveMonth}
          onMonthChange={(ym) => {
            setMonth(ym);
            setSelectedDay("all");
          }}
          days={daysInMonth}
          selectedDay={selectedDay}
          onDayChange={setSelectedDay}
        />
      ) : null}
      {visible.length ? (
        <div className={styles.fixtureList}>
          {visible.map((fixture) => (
            <div key={fixture.fixtureId}>
              <div className={styles.metaLine}>
                <span className={statusClass(fixture.status)}>
                  {statusLabel(fixture.status)}
                </span>
                <span>
                  {fixture.kickoffUtc ? (
                    <KickoffTime utcDate={fixture.kickoffUtc} />
                  ) : (
                    "Kickoff TBC"
                  )}
                </span>
                {fixture.round ? <span>{fixture.round}</span> : null}
                <span>{fixture.groupId.toUpperCase()}</span>
                <span className={styles.hostCountry}>
                  {formatUnlHostLabel(
                    fixture.homeTeamName,
                    fixture.homeTeamFlag,
                  )}
                </span>
              </div>
              <FixtureRow fixture={fixture} />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.panel} data-testid={`unl-empty-${id}`}>
          <p className={styles.panelTitle}>{emptyTitle}</p>
          <p className={styles.panelText}>{emptyText}</p>
        </div>
      )}
    </section>
  );
}

function leagueLabel(league: UnlLeagueId): string {
  return `League ${league.toUpperCase()}`;
}

function allUpcoming(fixtures: UnlFixtureRow[]): UnlFixtureRow[] {
  const now = Date.now();
  return fixtures
    .filter((f) => {
      if (f.status === "UPCOMING" || isLiveUnlStatus(f.status)) return true;
      if (f.status === "POSTPONED") {
        if (!f.kickoffUtc) return true;
        return new Date(f.kickoffUtc).getTime() >= now;
      }
      return false;
    })
    .sort((a, b) => {
      const at = a.kickoffUtc
        ? new Date(a.kickoffUtc).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bt = b.kickoffUtc
        ? new Date(b.kickoffUtc).getTime()
        : Number.MAX_SAFE_INTEGER;
      return at - bt;
    });
}

function allResults(fixtures: UnlFixtureRow[]): UnlFixtureRow[] {
  return fixtures
    .filter((f) => isFinishedUnlStatus(f.status))
    .sort((a, b) => {
      const at = a.kickoffUtc ? new Date(a.kickoffUtc).getTime() : 0;
      const bt = b.kickoffUtc ? new Date(b.kickoffUtc).getTime() : 0;
      return bt - at;
    });
}

export default function UnlHubClient() {
  const {
    data: fixturesData,
    error: fixturesError,
    isLoading: fixturesLoading,
  } = useLiveUnlFixtures();

  const groups = useMemo(() => getUnlGroups(), []);

  const upcoming = useMemo(
    () => (fixturesData?.fixtures ? allUpcoming(fixturesData.fixtures) : []),
    [fixturesData],
  );
  const results = useMemo(
    () => (fixturesData?.fixtures ? allResults(fixturesData.fixtures) : []),
    [fixturesData],
  );

  const isLoading = fixturesLoading && !fixturesData;
  const errorMessage = fixturesError
    ? sanitiseUnlProviderError("fetch failed")
    : fixturesData?.error
      ? sanitiseUnlProviderError(fixturesData.error)
      : null;

  const stale = Boolean(fixturesData?.stale);
  const ownershipOk =
    !fixturesData ||
    (fixturesData.competitionKey === "unl" &&
      fixturesData.leagueId === UNL_LEAGUE_ID &&
      fixturesData.season === UNL_SEASON);

  return (
    <main className={styles.unlPage}>
      <header className={styles.hero}>
        <p className={styles.seasonBadge}>NATIONS LEAGUE {UNL_SEASON_LABEL}</p>
        <h1 className={styles.heroTitle}>{UNL_DISPLAY_NAME}</h1>
        <p className={styles.heroSub}>
          UEFA Nations League {UNL_SEASON_LABEL} league phase — Leagues A–D with
          group fixtures, results and tables on {SITE_NAME}.
        </p>
        <nav className={styles.hubNav} aria-label="Nations League 26/27 sections">
          <a href="#unl-about">About</a>
          <a href="#unl-fixtures">Fixtures</a>
          <a href="#unl-results">Results</a>
          <a href="#unl-standings">Standings</a>
        </nav>
        <nav className={styles.leagueTabs} aria-label="Nations League leagues">
          {UNL_LEAGUES.map((league) => (
            <Link
              key={league}
              href={`/nations-league/league/${league}`}
              className={styles.leagueTab}
            >
              {leagueLabel(league)}
            </Link>
          ))}
        </nav>
      </header>

      <section className={styles.card} aria-labelledby="unl-about">
        <h2 id="unl-about" className={styles.cardTitle}>
          About Nations League {UNL_SEASON_LABEL}
        </h2>
        <p className={styles.panelText}>
          The 2026/27 UEFA Nations League splits Europe&apos;s national teams into
          four leagues and fourteen groups. Follow this hub for upcoming fixtures,
          recent results and links into each league and group table.
        </p>
      </section>

      {isLoading ? (
        <div className={styles.panel} role="status" data-testid="unl-hub-loading">
          <p className={styles.panelTitle}>
            Loading Nations League {UNL_SEASON_LABEL}
          </p>
          <p className={styles.panelText}>Fetching fixtures and results…</p>
        </div>
      ) : null}

      {errorMessage ? (
        <div
          className={`${styles.panel} ${styles.errorPanel}`}
          role="alert"
          data-testid="unl-hub-error"
        >
          <p className={styles.panelTitle}>Could not load hub</p>
          <p className={styles.panelText}>{errorMessage}</p>
        </div>
      ) : null}

      {stale ? (
        <p className={styles.staleNote} data-testid="unl-hub-stale">
          Showing recently cached Nations League data while the live feed recovers.
        </p>
      ) : null}

      {!isLoading && ownershipOk && fixturesData ? (
        <div className={styles.stack}>
          <FixtureBlock
            title="Upcoming fixtures"
            id="unl-fixtures"
            fixtures={upcoming}
            emptyTitle="No upcoming fixtures"
            emptyText="Scheduled Nations League matches will appear here."
            showDateFilter
          />
          <FixtureBlock
            title="Recent results"
            id="unl-results"
            fixtures={results}
            emptyTitle="No results yet"
            emptyText="Finished Nations League matches will appear here."
            showDateFilter={results.length > 0}
          />
          <section className={styles.card} aria-labelledby="unl-standings">
            <h2 id="unl-standings" className={styles.cardTitle}>
              Standings by group
            </h2>
            <div className={styles.groupLinks}>
              {UNL_GROUP_IDS.map((groupId) => {
                const group = groups.find((g) => g.groupId === groupId);
                const league = groupId.charAt(0);
                const num = groupId.slice(1);
                return (
                  <Link
                    key={groupId}
                    href={`/nations-league/league/${league}/group/${num}`}
                  >
                    {group?.label ?? `Group ${groupId.toUpperCase()}`}
                  </Link>
                );
              })}
            </div>
          </section>
          <p className={styles.footerMeta}>
            UEFA Nations League {UNL_SEASON_LABEL} · league {UNL_LEAGUE_ID} /
            season {UNL_SEASON}.
          </p>
        </div>
      ) : null}

      {!isLoading && fixturesData && !ownershipOk ? (
        <div
          className={`${styles.panel} ${styles.errorPanel}`}
          role="alert"
          data-testid="unl-hub-ownership"
        >
          <p className={styles.panelTitle}>Ownership mismatch</p>
          <p className={styles.panelText}>
            Rejected a response that was not Nations League {UNL_LEAGUE_ID}/
            {UNL_SEASON}.
          </p>
        </div>
      ) : null}
    </main>
  );
}