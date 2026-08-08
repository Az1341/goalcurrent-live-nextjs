import type { Metadata } from "next";
import Link from "next/link";
import InfoPageShell, { InfoBackLink } from "@/components/info/InfoPageShell";
import styles from "@/components/info/info-pages.module.css";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Affiliate Disclosure",
    description: `Affiliate disclosure for ${SITE_NAME} — independent football fan site.`,
    path: "/affiliate-disclosure",
    locale,
  });
}

export default function AffiliateDisclosurePage() {
  return (
    <InfoPageShell>
      <div className={styles.stack}>
        <article className={styles.card}>
          <h1>Affiliate Disclosure</h1>
          <p className={styles.updated}>Last updated: May 2026</p>
          <p className={styles.intro}>
            Important information about affiliate links and advertising on{" "}
            {SITE_NAME}.
          </p>
        </article>

        <div className={styles.fanBanner}>
          <div>
            <h3>Independent Football Fan Site</h3>
            <p>
              {SITE_NAME} is run by a football fan, for football fans. We are
              not affiliated with, endorsed by, or connected to any official
              football organisation, governing body, or club.
            </p>
          </div>
        </div>

        <article className={styles.card}>
          <h2>Not an Official Source</h2>
          <p>
            {SITE_NAME} is an independent fan site and is{" "}
            <strong>not affiliated with</strong> FIFA, UEFA, the Premier League,
            the Football Association, or any football club, governing body,
            broadcaster, or official organisation.
          </p>
          <p>
            All football-related names, logos, and trademarks referenced on this
            site belong to their respective owners.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Content Accuracy</h2>
          <p>
            We aim to provide accurate football news, scores, fixtures,
            standings, and squad information. However, we make{" "}
            <strong>no guarantees</strong> regarding the accuracy, completeness,
            or timeliness of any content published on this site.
          </p>
          <p>
            Football data can change rapidly. Always verify important
            information — such as kick-off times, results, or squad selections —
            with official sources before relying on it.
          </p>
        </article>

        <article className={styles.affiliateCard}>
          <h2>Affiliate Disclosure</h2>
          <p>
            {SITE_NAME} participates in affiliate programmes. This means we may
            receive compensation when you click certain links or make purchases
            through our site.
          </p>
          <p>
            Current affiliate partnerships include:{" "}
            <span className={styles.nordPill}>NordVPN</span>{" "}
            <span className={styles.nordPill}>NordPass</span>
          </p>
          <p>
            All affiliate and sponsored content is clearly labelled with{" "}
            <strong>#AD</strong> or <strong>Affiliate link</strong> notices.
            Affiliate partnerships do <strong>not</strong> influence our
            editorial content or news coverage.
          </p>
          <p>
            Purchasing through our affiliate links supports the site at{" "}
            <strong>no extra cost to you</strong>.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Third-Party Links</h2>
          <p>
            This site may contain links to third-party websites including news
            sources, official football organisations, and affiliate partners. We
            are not responsible for the content, accuracy, or privacy practices
            of those sites.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Copyright</h2>
          <p>
            All original content on {SITE_NAME} — including articles, design,
            and code — is <strong>© 2026 Ashna4All (A. Zafarani)</strong>.
            Unauthorised reproduction is prohibited.
          </p>
          <p>
            Football statistics, club names, competition names, and logos remain
            the property of their respective owners and are used for
            informational and fan purposes only.
          </p>
        </article>

        <article className={styles.card}>
          <h2>No Liability</h2>
          <p>
            {SITE_NAME} and A. Zafarani (Ashna4All) accept{" "}
            <strong>no liability</strong> for any loss, damage, or inconvenience
            arising from use of this website or reliance on its content.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this disclosure or any legal matter
            related to {SITE_NAME}, please contact us:
          </p>
          <p>
            Email:{" "}
            <a href="mailto:info@goalcurrent.live">info@goalcurrent.live</a>
          </p>
          <p>
            You can also read our full{" "}
            <Link href="/privacy">Privacy Policy</Link> and{" "}
            <Link href="/terms">Terms & Conditions</Link>.
          </p>
        </article>

        <InfoBackLink />
      </div>
    </InfoPageShell>
  );
}
