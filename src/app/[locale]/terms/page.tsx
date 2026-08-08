import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
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
    title: "Terms & Conditions",
    description: `Terms and Conditions for using ${SITE_NAME}.`,
    path: "/terms",
    locale,
  });
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="May 2026"
      intro="Please read these terms carefully before using our website."
    >
      <section>
        <h2>
          <span className={styles.clauseNum}>1</span> About This Website
        </h2>
        <p>
          {SITE_NAME} is an independent football fan site providing news,
          scores, fixtures, and statistics. It is owned and operated by A.
          Zafarani (Ashna4All), based in England, United Kingdom.
        </p>
        <p>
          We are <strong>not affiliated</strong> with FIFA, UEFA, the Premier
          League, or any official football organisation, club, or governing
          body.
        </p>
      </section>

      <section>
        <h2>
          <span className={styles.clauseNum}>2</span> Acceptance of Terms
        </h2>
        <p>
          By accessing or using {SITE_NAME}, you agree to be bound by these
          Terms & Conditions. If you do not agree with any part of these terms,
          please stop using the site immediately.
        </p>
      </section>

      <section>
        <h2>
          <span className={styles.clauseNum}>3</span> Content & Accuracy
        </h2>
        <p>
          We aim to provide accurate and up-to-date football information
          including scores, fixtures, tables, news, and squad data. However, we
          make no guarantees regarding the accuracy, completeness, or timeliness
          of any content published on this site.
        </p>
        <div className={styles.warning}>
          Always verify important information (such as match kick-off times or
          team selections) with official sources before making decisions based
          on it.
        </div>
      </section>

      <section>
        <h2>
          <span className={styles.clauseNum}>4</span> Intellectual Property
        </h2>
        <p>
          All original content, design, text, and code on {SITE_NAME} is{" "}
          <strong>© 2026 Ashna4All (A. Zafarani)</strong>. You may not copy,
          reproduce, redistribute, or republish any original content without
          prior written permission.
        </p>
        <p>
          Football data, club names, competition logos, and trademarks remain
          the property of their respective owners and are referenced for
          informational and fan purposes only.
        </p>
      </section>

      <section>
        <h2>
          <span className={styles.clauseNum}>5</span> Affiliate Links &
          Advertising
        </h2>
        <p>
          {SITE_NAME} participates in affiliate programmes. Some links on this
          site are affiliate links — if you click them and make a purchase, we
          may earn a commission. This does not affect the price you pay.
        </p>
        <p>
          All affiliate links and paid promotions are clearly labelled with{" "}
          <strong>#AD</strong> or <strong>Affiliate link</strong> notices in
          compliance with UK ASA guidelines.
        </p>
      </section>

      <section>
        <h2>
          <span className={styles.clauseNum}>6</span> External Links
        </h2>
        <p>
          We may link to third-party websites including news sources, official
          football sites, and affiliate partners for reference purposes. We are
          not responsible for the content, accuracy, or privacy practices of
          those sites.
        </p>
      </section>

      <section>
        <h2>
          <span className={styles.clauseNum}>7</span> User Conduct
        </h2>
        <p>By using this site, you agree not to:</p>
        <ul>
          <li>
            Attempt to hack, disrupt, or damage this website or its hosting
          </li>
          <li>Use the site for any unlawful or fraudulent purpose</li>
          <li>Scrape, copy, or reproduce content without permission</li>
          <li>Transmit any harmful or malicious code</li>
        </ul>
      </section>

      <section>
        <h2>
          <span className={styles.clauseNum}>8</span> Limitation of Liability
        </h2>
        <p>
          {SITE_NAME} and A. Zafarani (Ashna4All) accept no liability for any
          loss, damage, or inconvenience caused by:
        </p>
        <ul>
          <li>Use of or inability to use this website</li>
          <li>Reliance on any content published on this site</li>
          <li>Any errors or inaccuracies in football data or news</li>
          <li>Third-party websites linked from this site</li>
        </ul>
      </section>

      <section>
        <h2>
          <span className={styles.clauseNum}>9</span> Governing Law
        </h2>
        <p>
          These Terms & Conditions are governed by the laws of{" "}
          <strong>England and Wales</strong>. Any disputes shall be subject to
          the exclusive jurisdiction of the courts of England and Wales.
        </p>
      </section>

      <section>
        <h2>
          <span className={styles.clauseNum}>10</span> Changes to These Terms
        </h2>
        <p>
          We reserve the right to update these terms at any time without prior
          notice. The date at the top of this page shows the latest version.
          Continued use of the site after any changes constitutes your
          acceptance of the updated terms.
        </p>
        <p>
          Questions? Contact us at:{" "}
          <a href="mailto:info@goalcurrent.live">info@goalcurrent.live</a>
        </p>
      </section>
    </LegalPage>
  );
}
