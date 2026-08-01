"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { KickoffTime } from "@/components/KickoffTime";
import { Link } from "@/i18n/navigation";
import { buildUpcomingCompetitionWindows } from "@/lib/live/upcoming-competition-windows";
import { getUnlFlagSrc } from "@/lib/unl/flag";
import { formatUnlHostLabel } from "@/lib/unl/host-country";
import type { FacupFixturesApiResponse } from "@/lib/facup/types";
import type { PlFixturesApiResponse } from "@/lib/pl/types";
import type { UclFixturesApiResponse } from "@/lib/ucl/types";
import type { UnlFixturesApiResponse } from "@/lib/unl/types";
import styles from "./UpcomingCompetitionCards.module.css";

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
  if (!src) return null;
  return (
    <Image src={src} alt="" width={18} height={18} className={styles.flag} unoptimized />
  );
}

export default function UpcomingCompetitionCards() {
  const [pl, setPl] = useState<PlFixturesApiResponse | null>(null);
  const [ucl, setUcl] = useState<UclFixturesApiResponse | null>(null);
  const [facup, setFacup] = useState<FacupFixturesApiResponse | null>(null);
  const [unl, setUnl] = useState<UnlFixturesApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [plRes, uclRes, facupRes, unlRes] = await Promise.all([
        fetchJson<PlFixturesApiResponse>("/api/pl/fixtures"),
        fetchJson<UclFixturesApiResponse>("/api/ucl/fixtures"),
        fetchJson<FacupFixturesApiResponse>("/api/facup/fixtures"),
        fetchJson<UnlFixturesApiResponse>("/api/unl/fixtures"),
      ]);
      if (cancelled) return;
      setPl(plRes);
      setUcl(uclRes);
      setFacup(facupRes);
      setUnl(unlRes);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const windows = useMemo(
    () =>
      buildUpcomingCompetitionWindows({
        pl: pl?.fixtures,
        ucl: ucl?.fixtures,
        facup: facup?.fixtures,
        unl: unl?.fixtures,
      }),
    [pl, ucl, facup, unl],
  );

  if (loading) {
    return (
      <section className={styles.wrap} aria-labelledby="upcoming-comps-heading">
        <h2 id="upcoming-comps-heading" className={styles.heading}>
          Upcoming competitions
        </h2>
        <p className={styles.muted}>Loading announced fixtures…</p>
      </section>
    );
  }

  if (windows.length === 0) {
    return (
      <section className={styles.wrap} aria-labelledby="upcoming-comps-heading">
        <h2 id="upcoming-comps-heading" className={styles.heading}>
          Upcoming competitions
        </h2>
        <p className={styles.muted}>No announced competition fixtures yet.</p>
      </section>
    );
  }

  return (
    <section className={styles.wrap} aria-labelledby="upcoming-comps-heading">
      <h2 id="upcoming-comps-heading" className={styles.heading}>
        Upcoming competitions
      </h2>
      <p className={styles.intro}>
        First two match days from each competition that has announced fixtures —
        soonest competition first.
      </p>
      <div className={styles.cards}>
        {windows.map((win) => (
          <article key={win.key} className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>{win.label}</h3>
                <p className={styles.cardMeta}>Starts {win.startDayLabel}</p>
              </div>
              <Link href={win.hubHref} className={styles.hubLink}>
                Open hub
              </Link>
            </header>
            <ul className={styles.list}>
              {win.matches.map((match) => (
                <li key={match.id}>
                  <Link href={match.href} className={styles.row}>
                    <span className={styles.time}>
                      <KickoffTime utcDate={match.kickoffUtc} />
                    </span>
                    <span className={styles.teams}>
                      <Flag code={match.homeFlag} />
                      <span>
                        {match.homeName} vs {match.awayName}
                      </span>
                      <Flag code={match.awayFlag} />
                    </span>
                    <span className={styles.rowMeta}>
                      {match.meta ? <span>{match.meta}</span> : null}
                      {win.key === "unl" ? (
                        <span>
                          {formatUnlHostLabel(match.homeName, match.homeFlag)}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}