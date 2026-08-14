import styles from "../home-v5.module.css";

const SEPANAI_HREF =
  "https://www.sepanai.com/?utm_source=goalcurrent&utm_medium=owned&utm_campaign=ashna4all_ecosystem&utm_content=home_house_ad";

export default function HomeEcosystemPromo() {
  return (
    <aside className={styles.section} aria-label="Ashna4all ecosystem promotion">
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.newsTag}>From the Ashna4all ecosystem</span>
          <h2 className={styles.sectionTitle}>Built beyond football</h2>
        </div>
      </div>
      <a
        href={SEPANAI_HREF}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={styles.newsSecondaryRow}
      >
        <div className={styles.newsSecondaryBody}>
          <span className={styles.newsTag}>SEPANAI.COM</span>
          <p className={styles.newsSecondaryHeadline}>
            Discover the wider Ashna4all product ecosystem — including SEPANAI.COM, SocialMedia and FAMVI.
          </p>
          <p className={styles.newsMeta}>Owned promotion · no behavioural targeting</p>
        </div>
      </a>
    </aside>
  );
}
