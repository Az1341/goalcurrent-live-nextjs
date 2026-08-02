"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  type CalendarCompetitionKey,
  type CalendarFixture,
  formatYearMonthLabel,
  localDateKey,
  normalizeFacupApiFixtures,
  normalizePlApiFixtures,
  normalizeUclApiFixtures,
  normalizeUnlApiFixtures,
  yearMonthKey,
} from "@/lib/fixtures/calendar-aggregate";
import { getUnlFlagSrc } from "@/lib/unl/flag";
import type { FacupFixturesApiResponse } from "@/lib/facup/types";
import type { PlFixturesApiResponse } from "@/lib/pl/types";
import type { UclFixturesApiResponse } from "@/lib/ucl/types";
import type { UnlFixturesApiResponse } from "@/lib/unl/types";
import styles from "./FixtureCalendar.module.css";

type FilterKey = "all" | CalendarCompetitionKey;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pl", label: "PL" },
  { key: "ucl", label: "UCL" },
  { key: "facup", label: "FA Cup" },
  { key: "unl", label: "UNL" },
];

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "TBC";
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
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

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function Flag({ code }: { code?: string | null }) {
  const src = getUnlFlagSrc(code ?? null);
  if (!src) return <span className={styles.flagFallback} aria-hidden />;
  return (
    <Image src={src} alt="" width={18} height={18} className={styles.flag} unoptimized />
  );
}

export default function FixtureCalendarClient() {
  const [month, setMonth] = useState("2026-09");
  const [selectedDay, setSelectedDay] = useState<string | "all">("all");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [fixtures, setFixtures] = useState<CalendarFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [pl, ucl, facup, unl] = await Promise.all([
        fetchJson<PlFixturesApiResponse>("/api/pl/fixtures"),
        fetchJson<UclFixturesApiResponse>("/api/ucl/fixtures"),
        fetchJson<FacupFixturesApiResponse>("/api/facup/fixtures"),
        fetchJson<UnlFixturesApiResponse>("/api/unl/fixtures"),
      ]);

      if (cancelled) return;

      const next: CalendarFixture[] = [];
      if (pl?.fixtures) next.push(...normalizePlApiFixtures(pl.fixtures));
      if (ucl?.fixtures) next.push(...normalizeUclApiFixtures(ucl.fixtures));
      if (facup?.fixtures) next.push(...normalizeFacupApiFixtures(facup.fixtures));
      if (unl?.fixtures) next.push(...normalizeUnlApiFixtures(unl.fixtures));

      next.sort(
        (a, b) =>
          new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
      );

      setFixtures(next);
      setLoadError(next.length === 0 && !pl && !ucl && !facup && !unl);
      if (next.length > 0) {
        setMonth(yearMonthKey(new Date(next[0].kickoffUtc)));
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    for (const row of fixtures) {
      if (filter !== "all" && row.competitionKey !== filter) continue;
      set.add(yearMonthKey(new Date(row.kickoffUtc)));
    }
    return [...set].sort();
  }, [fixtures, filter]);

  const activeMonth =
    monthOptions.length === 0
      ? month
      : monthOptions.includes(month)
        ? month
        : monthOptions[0];

  const filteredByComp = useMemo(() => {
    return fixtures.filter((row) => {
      if (filter !== "all" && row.competitionKey !== filter) return false;
      return yearMonthKey(new Date(row.kickoffUtc)) === activeMonth;
    });
  }, [fixtures, filter, activeMonth]);

  const daysInMonth = useMemo(() => {
    const set = new Set<string>();
    for (const row of filteredByComp) {
      const key = isoDayKey(row.kickoffUtc);
      if (key) set.add(key);
    }
    return [...set].sort();
  }, [filteredByComp]);

  const activeDay =
    selectedDay === "all" || daysInMonth.includes(selectedDay)
      ? selectedDay
      : "all";

  const filtered = useMemo(() => {
    if (activeDay === "all") return filteredByComp;
    return filteredByComp.filter((row) => isoDayKey(row.kickoffUtc) === activeDay);
  }, [filteredByComp, activeDay]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarFixture[]>();
    for (const row of filtered) {
      const key = localDateKey(row.kickoffUtc);
      const bucket = map.get(key) ?? [];
      bucket.push(row);
      map.set(key, bucket);
    }
    return [...map.entries()];
  }, [filtered]);

  const monthIndex = monthOptions.indexOf(activeMonth);

  function chooseMonth(ym: string) {
    setMonth(ym);
    setSelectedDay("all");
  }

  function chooseFilter(key: FilterKey) {
    setFilter(key);
    setSelectedDay("all");
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Fixtures calendar</h1>
      <p className={styles.intro}>
        Premier League, Champions League, FA Cup, and Nations League 26/27 —
        pick a month and date. Times shown in your local timezone.
      </p>

      <div className={styles.toolbar}>
        <div className={styles.monthNav}>
          <button
            type="button"
            className={styles.monthBtn}
            disabled={monthIndex <= 0}
            onClick={() => {
              if (monthIndex > 0) chooseMonth(monthOptions[monthIndex - 1]);
            }}
          >
            Prev
          </button>
          <label className={styles.monthSelectWrap}>
            <span className={styles.srOnly}>Month</span>
            <select
              className={styles.monthSelect}
              value={activeMonth}
              onChange={(e) => chooseMonth(e.target.value)}
              aria-label="Select month"
            >
              {(monthOptions.length ? monthOptions : [activeMonth]).map((ym) => (
                <option key={ym} value={ym}>
                  {formatYearMonthLabel(ym)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={styles.monthBtn}
            disabled={monthIndex < 0 || monthIndex >= monthOptions.length - 1}
            onClick={() => {
              if (monthIndex >= 0 && monthIndex < monthOptions.length - 1) {
                chooseMonth(monthOptions[monthIndex + 1]);
              }
            }}
          >
            Next
          </button>
        </div>

        <div className={styles.filters} role="group" aria-label="Competition filter">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`${styles.pill} ${filter === item.key ? styles.pillActive : ""}`}
              onClick={() => chooseFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {daysInMonth.length > 0 ? (
        <div className={styles.dayPicker} role="group" aria-label="Pick a date">
          <button
            type="button"
            className={`${styles.dayChip} ${activeDay === "all" ? styles.dayChipActive : ""}`}
            onClick={() => setSelectedDay("all")}
          >
            All dates
          </button>
          {daysInMonth.map((day) => (
            <button
              key={day}
              type="button"
              className={`${styles.dayChip} ${activeDay === day ? styles.dayChipActive : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              {formatDayChip(day)}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <p className={styles.status}>Loading fixtures…</p>
      ) : null}
      {loadError ? (
        <p className={styles.status}>Could not load fixtures. Try again shortly.</p>
      ) : null}

      {!loading && !loadError && byDay.length === 0 ? (
        <p className={styles.empty}>No fixtures in this month for the selected filter.</p>
      ) : null}

      {byDay.map(([day, rows]) => (
        <section key={day} className={styles.dayBlock}>
          <h2 className={styles.dayHeading}>{day}</h2>
          <ul className={styles.list}>
            {rows.map((row) => (
              <li key={row.id}>
                <Link href={row.href} className={styles.row}>
                  <span className={styles.time}>{formatTime(row.kickoffUtc)}</span>
                  <span className={styles.teams}>
                    <Flag code={row.homeFlag} />
                    <span>
                      {row.homeName} vs {row.awayName}
                    </span>
                    <Flag code={row.awayFlag} />
                  </span>
                  <span className={styles.meta}>
                    <span className={styles.badge}>{row.competitionLabel}</span>
                    {row.groupLabel ? (
                      <span className={styles.group}>{row.groupLabel}</span>
                    ) : null}
                    {row.venueLabel ? (
                      <span className={styles.venue}>{row.venueLabel}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
