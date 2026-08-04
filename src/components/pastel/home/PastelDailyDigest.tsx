import styles from "../pastel.module.css";

/**
 * Preview-only Daily Digest card.
 * Surface uses theme-aware --pastel-surface-accent (dark teal or light white).
 */
export default function PastelDailyDigest() {
  return (
    <section
      className={styles.dailyDigest}
      aria-labelledby="pastel-digest-heading"
    >
      <p className={styles.dailyDigestEyebrow}>Daily Digest</p>
      <h2 id="pastel-digest-heading" className={styles.dailyDigestTitle}>
        Weekend Highlights
      </h2>
      <p className={styles.dailyDigestBody}>
        Your curated pulse of transfers, talking points, and match-day storylines
        — preview surface for Pastel Pulse Match Center.
      </p>
    </section>
  );
}
