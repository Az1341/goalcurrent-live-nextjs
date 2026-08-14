import styles from "./HomeEcosystemPromo.module.css";

const SEPANAI_HREF =
  "https://www.sepanai.com/?utm_source=goalcurrent&utm_medium=advertising&utm_campaign=ashna4all_ecosystem&utm_content=home_display_ad";

export default function HomeEcosystemPromo() {
  return (
    <aside className={styles.card} aria-label="Advertisement from SEPANAI.COM">
      <span className={styles.label}>Advertisement</span>
      <div className={styles.body}>
        <div>
          <div className={styles.brandRow}>
            <img src="/sepanai-mark.svg" alt="" className={styles.mark} />
            <span className={styles.brand}>SEPANAI.COM</span>
          </div>
          <h2 className={styles.title}>More than football</h2>
          <p className={styles.text}>
            Discover SEPANAI.COM, SocialMedia and FAMVI — technology products from the wider Ashna4all ecosystem.
          </p>
        </div>
        <a
          href={SEPANAI_HREF}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={styles.cta}
          data-gc-ad="sepanai-ecosystem"
        >
          Explore SEPANAI.COM →
        </a>
      </div>
    </aside>
  );
}
