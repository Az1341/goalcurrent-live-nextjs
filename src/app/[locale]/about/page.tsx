import type { Metadata } from "next";
import Link from "next/link";
import InfoPageShell, { InfoBackLink } from "@/components/info/InfoPageShell";
import SocialLinks from "@/components/layout/SocialLinks";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME, SITE_URL } from "@/lib/site-url";
import styles from "@/components/info/info-pages.module.css";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "About Us",
    description: `Learn about ${SITE_NAME}, a free football scores service for live scores, fixtures, results, standings and match coverage.`,
    path: "/about",
    locale,
  });
}

export default async function AboutPage() {
  return (
    <InfoPageShell>
      <div className={styles.stack}>
        <article className={styles.card}>
          <h1>About {SITE_NAME}</h1>
          <p className={styles.intro}>
            A free football scores service built to make live scores, fixtures,
            results, standings and match information fast and easy to find.
          </p>
        </article>

        <article className={styles.card}>
          <h2>What GoalCurrent Is</h2>
          <p>
            {SITE_NAME} is an independent football website created and owned by
            <strong> Ahmad Zafarani</strong>, operating under the Ashna4All
            brand. The product is designed around one priority: helping football
            supporters reach accurate match information quickly without a paid
            subscription.
          </p>
          <p>
            Current coverage includes the <strong>Premier League</strong>,
            <strong> UEFA Champions League</strong>, <strong>FA Cup</strong>,
            <strong> Community Shield</strong> and other supported domestic and
            international competitions as reliable data becomes available.
          </p>
          <div className={styles.highlight}>
            Match times are displayed in the viewer&apos;s local device timezone.
            When provider data is unavailable, GoalCurrent shows a clear pending
            or unavailable state rather than inventing match information.
          </div>
        </article>

        <article className={styles.card}>
          <h2>Meet the Creator</h2>
          <div className={styles.teamCard}>
            <div>
              <h3>Ahmad Zafarani</h3>
              <p className={styles.teamCardMeta}>Founder & Creator · Ashna4All</p>
              <p className={styles.teamCardMeta}>
                Email:{" "}
                <a href="mailto:info@goalcurrent.live">info@goalcurrent.live</a>
              </p>
            </div>
          </div>
          <p>
            GoalCurrent was built to provide a clean, mobile-friendly football
            experience focused on the information supporters need most on
            matchday.
          </p>
          <p>
            Follow GoalCurrent on its active social channels for updates,
            matchday posts and product news.
          </p>
          <div className={styles.socialList}>
            <SocialLinks
              linkClassName={styles.socialLink}
              iconClassName={styles.socialLinkIcon}
              showLabel
            />
          </div>
        </article>

        <article className={styles.card}>
          <h2>What We Offer</h2>
          <div className={styles.features}>
            <div className={styles.feature}>
              <strong>Live Scores</strong>
              Current match scores and status from supported football data feeds
            </div>
            <div className={styles.feature}>
              <strong>Fixtures & Results</strong>
              Upcoming fixtures and completed results across supported competitions
            </div>
            <div className={styles.feature}>
              <strong>Tables & Standings</strong>
              Competition standings where the underlying provider supports them
            </div>
            <div className={styles.feature}>
              <strong>Favourites</strong>
              Save the teams and football items that matter most to you
            </div>
            <div className={styles.feature}>
              <strong>Local Kick-off Times</strong>
              Match times shown in your own device timezone automatically
            </div>
            <div className={styles.feature}>
              <strong>News & Editorial</strong>
              Football news, articles and match-focused editorial coverage
            </div>
          </div>
        </article>

        <article className={styles.card}>
          <h2>Historical Coverage</h2>
          <p>
            GoalCurrent preserves selected completed-tournament coverage as a
            historical archive. Archive pages are clearly identified as
            historical content and are separate from current live football.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Data Sources</h2>
          <p>
            {SITE_NAME} uses trusted third-party sports-data and editorial
            providers to deliver fixtures, scores, standings and supporting
            football information. We make every effort to display accurate and
            timely information, but live provider data can occasionally be
            delayed or unavailable.
          </p>
          <p>
            Where a fact cannot be verified from an available source,
            GoalCurrent omits it or marks it unavailable rather than presenting
            an assumption as confirmed data.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Editorial Independence</h2>
          <p>
            {SITE_NAME} is an independent football media platform. We are not
            affiliated with FIFA, UEFA, the Premier League, any football club,
            federation, broadcaster, or official organisation.
          </p>
          <p>
            Advertising and commercial partnerships support the site but do not
            determine scores, fixtures, standings or editorial conclusions.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Contact Us</h2>
          <p>
            Questions, corrections, advertising enquiries and product feedback
            are welcome.
          </p>
          <div className={styles.highlight}>
            Email:{" "}
            <a href="mailto:info@goalcurrent.live">
              <strong>info@goalcurrent.live</strong>
            </a>
            <br />
            Website: <a href={SITE_URL}>goalcurrent.live</a>
          </div>
          <p>
            Or use our <Link href="/contact">Contact Us page</Link> to send us a
            message directly.
          </p>
          <div className={styles.socialList}>
            <SocialLinks
              linkClassName={styles.socialLink}
              iconClassName={styles.socialLinkIcon}
              showLabel
            />
          </div>
        </article>

        <p className={styles.copyNote}>
          <strong>© 2026 Ashna4All (A. Zafarani)</strong> · All Rights Reserved
          <br />
          {SITE_NAME} — Live Football Scores
        </p>

        <InfoBackLink />
      </div>
    </InfoPageShell>
  );
}
