"use client";

import { useEffect, useState } from "react";
import styles from "../home-v5.module.css";

const HIDE_AFTER_MS = new Date("2026-08-16T18:00:00.000Z").getTime();

const STORIES = [
  {
    source: "Reuters",
    title: "Arsenal hungry for first trophy as Arteta targets a strong start",
    href: "https://www.reuters.com/sports/soccer/hungry-arsenal-target-community-shield-arteta-eyes-strong-start-season-2026-08-14/",
  },
  {
    source: "Reuters",
    title: "Manchester City focus on Community Shield as Maresca prepares for first trophy chance",
    href: "https://www.reuters.com/sports/soccer/manchester-citys-maresca-coy-rodri-future-ahead-community-shield-2026-08-14/",
  },
  {
    source: "The FA",
    title: "Sam Barrott appointed referee for Arsenal v Manchester City in Cardiff",
    href: "https://www.thefa.com/news/2026/jul/20/match-officials-for-fa-community-shield-2026-appointed-20262007",
  },
] as const;

export default function HomeCommunityShieldNews() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(Date.now() < HIDE_AFTER_MS);
  }, []);

  if (!visible) return null;

  return (
    <section className={styles.section} aria-labelledby="home-community-shield-news">
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.newsTag}>Community Shield</span>
          <h2 id="home-community-shield-news" className={styles.sectionTitle}>
            Arsenal v Manchester City — latest build-up
          </h2>
        </div>
        <a
          href="https://www.thefa.com/competitions/the-fa-community-shield"
          className={styles.sectionLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Official competition →
        </a>
      </div>
      <div className={styles.newsSecondaryList}>
        {STORIES.map((story) => (
          <a
            key={story.href}
            href={story.href}
            className={styles.newsSecondaryRow}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.newsSecondaryBody}>
              <span className={styles.newsTag}>{story.source}</span>
              <p className={styles.newsSecondaryHeadline}>{story.title}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
