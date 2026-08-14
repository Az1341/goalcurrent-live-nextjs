import styles from "../home-v5.module.css";

const SEPANAI_HREF =
  "https://www.sepanai.com/?utm_source=goalcurrent&utm_medium=owned&utm_campaign=ashna4all_ecosystem&utm_content=home_house_ad";

export default function HomeEcosystemPromo() {
  return (
    <aside className={styles.section} aria-label="Ashna4all ecosystem advertisement">
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.newsTag}>OWNED ADVERTISEMENT · ASHNA4ALL ECOSYSTEM</span>
          <h2 className={styles.sectionTitle}>More from the people behind GoalCurrent</h2>
        </div>
      </div>
      <a
        href={SEPANAI_HREF}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={styles.newsSecondaryRow}
        data-gc-owned-ad="sepanai-ecosystem"
      >
        <div className={styles.newsSecondaryBody}>
          <span className={styles.newsTag}>SEPANAI.COM</span>
          <p className={styles.newsSecondaryHeadline}>
            Discover SEPANAI.COM, SocialMedia and FAMVI — products from the wider Ashna4all ecosystem.
          </p>
          <p className={styles.newsMeta}>Visit SEPANAI.COM → · contextual house ad · no behavioural targeting</p>
        </div>
      </a>
    </aside>
  );
}
