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
    description: `Learn about ${SITE_NAME}, created by Ahmad Zafarani (Ashna4All). Your go-to source for live Premier League and World Cup 2026 football scores.`,
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
            Your go-to destination for live football scores, World Cup 2026
            fixtures and Premier League updates — free, fast and built with
            passion.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Who We Are</h2>
          <p>
            {SITE_NAME} is a free live football scores website created and owned
            by <strong>Ahmad Zafarani</strong>, operating under the brand{" "}
            <strong>Ashna4All</strong>. We launched in 2026 with a simple
            mission — to give football fans around the world instant access to
            live scores, fixtures, standings and World Cup 2026 coverage,
            completely free.
          </p>
          <p>
            Based in the United Kingdom, we cover the{" "}
            <strong>Premier League</strong>, the{" "}
            <strong>FIFA World Cup 2026</strong> and major international
            football tournaments.
          </p>
          <div className={styles.highlight}>
            {SITE_NAME} is visited by football fans from the UK, USA, Canada,
            Iran and across the world. All match times are shown in your local
            device timezone automatically.
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNum}>72</div>
              <div className={styles.statLabel}>WC 2026 Fixtures</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>20</div>
              <div className={styles.statLabel}>PL Teams Covered</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>48</div>
              <div className={styles.statLabel}>World Cup Teams</div>
            </div>
          </div>
        </article>

        <article className={styles.card}>
          <h2>Meet the Creator</h2>
          <div className={styles.teamCard}>
            <div>
              <h3>Ahmad Zafarani</h3>
              <p className={styles.teamCardMeta}>
                Founder & Creator · Ashna4All
              </p>
              <p className={styles.teamCardMeta}>
                Email:{" "}
                <a href="mailto:info@goalcurrent.live">info@goalcurrent.live</a>
              </p>
            </div>
          </div>
          <p>
            Ahmad is a passionate football fan and web developer who built{" "}
            {SITE_NAME} to provide football fans with a fast, clean and
            easy-to-use live scores experience. With a love for the Premier
            League and huge excitement for the FIFA World Cup 2026, Ahmad built
            this site to share that passion with fans worldwide.
          </p>
          <p>
            Follow us on Instagram and Facebook for updates, matchday posts and
            behind-the-scenes content from the {SITE_NAME} team.
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
              Real-time Premier League & World Cup scores updated every 60
              seconds
            </div>
            <div className={styles.feature}>
              <strong>Full Schedule</strong>
              All 72 World Cup 2026 group stage fixtures with correct UK times
            </div>
            <div className={styles.feature}>
              <strong>Standings</strong>
              PL table all 20 teams + WC 2026 all 12 official groups A–L
            </div>
            <div className={styles.feature}>
              <strong>My Teams</strong>
              Pick your favourite teams and get personalised score alerts
            </div>
            <div className={styles.feature}>
              <strong>Global Times</strong>
              Match times shown in your own device timezone automatically
            </div>
            <div className={styles.feature}>
              <strong>TV Listings</strong>
              BBC, ITV, Fox, TSN broadcaster info for every World Cup match
            </div>
          </div>
        </article>

        <article className={styles.card}>
          <h2>Data Sources</h2>
          <p>
            {SITE_NAME} uses data from trusted third-party sports data providers
            including ESPN, TheSportsDB and API-Football to deliver accurate
            live scores. We make every effort to display accurate information
            but cannot guarantee 100% accuracy of live data at all times.
          </p>
          <p>
            World Cup 2026 fixture times are sourced from official FIFA
            schedules and verified against Sky Sports and Squawka UK broadcaster
            schedules.
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
            Affiliate partnerships and advertising support the site but do not
            influence editorial coverage, fixture data, or standings
            calculations.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Contact Us</h2>
          <p>
            We love hearing from football fans! Whether you have a question,
            suggestion or just want to chat about football:
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
