import styles from "./HomeSepanaiVideoAd.module.css";

const SEPANAI_VIDEO =
  "https://www.sepanai.com/media/SEPANAI.COM_Product_Update_SocialMedia_1308206_1036.mp4";
const SEPANAI_CTA =
  "https://www.sepanai.com/?utm_source=goalcurrent&utm_medium=owned&utm_campaign=ashna4all_ecosystem&utm_content=home_video_ad";

export default function HomeSepanaiVideoAd() {
  return (
    <aside className={styles.card} aria-label="SEPANAI.COM owned video advertisement">
      <div className={styles.label}>OWNED ADVERTISEMENT · SEPANAI.COM</div>
      <div className={styles.copy}>
        <div>
          <h2 className={styles.title}>See what SEPANAI.COM is building</h2>
          <p className={styles.text}>
            Watch the latest SEPANAI.COM product update from the Ashna4all ecosystem.
          </p>
        </div>
        <a
          className={styles.cta}
          href={SEPANAI_CTA}
          target="_blank"
          rel="noopener noreferrer sponsored"
        >
          Visit SEPANAI.COM
        </a>
      </div>
      <video
        className={styles.video}
        controls
        playsInline
        preload="metadata"
        src={SEPANAI_VIDEO}
      >
        Your browser does not support embedded video.
      </video>
      <p className={styles.meta}>Owned promotion · no behavioural targeting</p>
    </aside>
  );
}
