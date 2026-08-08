import type { Metadata } from "next";
import ArticleBanner from "@/components/articles/ArticleBanner";
import Link from "next/link";
import ArticleAuthorLine, { ArticleCopyrightNotice } from "@/components/articles/ArticleAuthorLine";
import { StaticArticleSeo, staticArticleMetadata } from "@/components/seo/StaticArticleSeo";
import PremierLeagueTwoWeeksOutBody from "./PremierLeagueTwoWeeksOutBody";
import styles from "../article.module.css";

const SLUG = "premier-league-2026-27-two-weeks-out";
const HERO_IMAGE = "/images/news/premier-league-2026-27-two-weeks-out/hero.svg";

export const metadata: Metadata = staticArticleMetadata(SLUG);

export default function ArticlePremierLeagueTwoWeeksOut() {
  return (
    <StaticArticleSeo slug={SLUG}>
      <main className={styles.articlePage}>
        <div className={styles.stack}>
          <ArticleBanner
            src={HERO_IMAGE}
            alt="GoalCurrent.live editorial graphic for the Premier League 2026-27 two weeks to kick-off preview"
          />

          <div className={styles.heroCard}>
            <div className={styles.categoryPill}>Preview · Premier League 26/27</div>
            <h1>
              Two Weeks to Kick-Off — Premier League 2026/27 Returns After Spain&apos;s World Cup Triumph
            </h1>
            <div className={styles.hereMeta}>
              <ArticleAuthorLine sepClassName={styles.sep} />
              <span className={styles.sep}>·</span>
              <span>7 August 2026</span>
              <span className={styles.sep}>·</span>
              <span className={styles.readTime}>5 min read</span>
            </div>
          </div>

          <PremierLeagueTwoWeeksOutBody />

          <div className={styles.copyrightCard}>
            <p>
              <strong>© 2026 GoalCurrent.live — All Rights Reserved.</strong>
              <br />
              <ArticleCopyrightNotice />
              <br />
              For syndication enquiries visit{" "}
              <a href="https://goalcurrent.live/contact" target="_blank" rel="noopener noreferrer">
                goalcurrent.live/contact
              </a>
            </p>
          </div>

          <div className={styles.btnRow}>
            <Link href="/articles" className={styles.btnSecondary}>
              ← All Articles
            </Link>
            <Link href="/premier-league" className={styles.btnSecondary}>
              PL Hub
            </Link>
            <Link href="/articles/premier-league-2026-27-august-countdown" className={styles.btnSecondary}>
              Earlier PL countdown
            </Link>
          </div>
        </div>
      </main>
    </StaticArticleSeo>
  );
}
