import styles from "./page.module.css";

export default function LocaleLoading() {
  return (
    <div className={styles.page} aria-busy="true">
      <div
        className={styles.sectionBlock}
        style={{ padding: "48px 16px", minHeight: 160 }}
        aria-hidden="true"
      />
    </div>
  );
}
