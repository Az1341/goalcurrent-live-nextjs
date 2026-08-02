import { Link } from "@/i18n/navigation";
import styles from "../home-v5.module.css";

/**
 * Homepage daily pulse — hottest PL / transfers / competitions news.
 * Replaces the retired World Cup champion archive banner on the home route.
 */
export default function HomeChampionSnippet() {
  return (
    <section
      className={styles.championSnippet}
      aria-labelledby="home-daily-pulse-heading"
    >
      <p className={styles.championSnippetEyebrow}>DAILY TRANSFERS &amp; HOT NEWS</p>
      <h2 id="home-daily-pulse-heading" className={styles.championSnippetTitle}>
        Premier League 26/27 transfer window — today&apos;s hottest moves
      </h2>
      <p className={styles.championSnippetBody}>
        Follow GoalCurrent for daily Premier League, Champions League and FA Cup
        transfer news, plus the latest club and national-team stories as the
        2026/27 season builds toward kickoff.
      </p>
      <div className={styles.championSnippetActions}>
        <Link href="/premier-league/transfers" className={styles.championSnippetPrimary}>
          PL transfers 26/27
        </Link>
        <Link href="/news/premier-league" className={styles.championSnippetSecondary}>
          Premier League news
        </Link>
        <Link
          href="/articles/premier-league-2026-27-summer-transfers"
          className={styles.championSnippetSecondary}
        >
          Transfer round-up
        </Link>
      </div>
    </section>
  );
}
