"use client";

import { Link } from "@/i18n/navigation";
import { useMemo } from "react";
import PlFixtureCard from "@/components/pl/PlFixtureCard";
import { useLiveFixtures } from "@/lib/client/useLiveFixtures";
import type { PlFixturesApiResponse } from "@/lib/pl/types";
import {
  PL_BROADCASTER_UNAVAILABLE,
  resolvePlBroadcasterForVisitor,
} from "@/lib/pl/pl-broadcasters";
import { SITE_NAME } from "@/lib/site-url";
import styles from "./PlData.module.css";
import {
  PlEmptyPanel,
  PlErrorPanel,
  PlLoadingPanel,
} from "./PlShared";

function withVisitorBroadcasters(
  body: PlFixturesApiResponse,
): PlFixturesApiResponse {
  const visitorBroadcaster = resolvePlBroadcasterForVisitor();
  if (visitorBroadcaster === PL_BROADCASTER_UNAVAILABLE) {
    return body;
  }

  return {
    ...body,
    fixtures: body.fixtures.map((fixture) => ({
      ...fixture,
      broadcaster: visitorBroadcaster,
    })),
  };
}

export default function PlLiveClient() {
  const { data: rawData, error, isLoading } = useLiveFixtures();

  const data = useMemo(() => {
    if (!rawData) {
      return null;
    }

    const withBroadcasters = withVisitorBroadcasters(rawData);
    return {
      ...withBroadcasters,
      fixtures: withBroadcasters.fixtures.filter(
        (fixture) => fixture.status === "LIVE",
      ),
    };
  }, [rawData]);

  const emptyMessage =
    data?.error ??
    (data?.configured === false
      ? "Live matches will appear when the API key is configured on the server."
      : "No Premier League live matches right now.");

  return (
    <main className={styles.plPage}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Premier League Live 2026/27</h1>
        <p className={styles.heroSub}>
          Live PL matches only on {SITE_NAME} — refreshed every 30 seconds.
        </p>
      </header>

      {isLoading && !data ? (
        <PlLoadingPanel title="Loading live matches" text="Checking for live PL games…" />
      ) : null}

      {error && !data ? (
        <PlErrorPanel
          title="Could not load live matches"
          text="The live API is temporarily unavailable."
        />
      ) : null}

      {data && !error && data.fixtures.length === 0 ? (
        <>
          <PlEmptyPanel
            title="No Premier League live matches right now"
            text={emptyMessage}
          />
          <div className={styles.linkRow}>
            <Link href="/premier-league/fixtures" className={styles.linkBtn}>
              View fixtures
            </Link>
          </div>
        </>
      ) : null}

      {data && data.fixtures.length > 0 ? (
        <>
          <section className={styles.list} aria-label="Live Premier League matches">
            {data.fixtures.map((fixture) => (
              <PlFixtureCard key={fixture.fixtureId} fixture={fixture} />
            ))}
          </section>
          <p className={styles.meta}>
            Source: {data.source} · {data.fixtures.length} live · Updated{" "}
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
