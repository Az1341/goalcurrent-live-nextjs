import styles from "./HomeSepanaiVideoAd.module.css";

const SEPANAI_VIDEO =
  "https://www.sepanai.com/media/SEPANAI.COM_Product_Update_SocialMedia_1308206_1036.mp4";
const SEPANAI_POSTER =
  "https://www.sepanai.com/media/product-update-1-poster.svg";
const SEPANAI_CTA =
  "https://www.sepanai.com/?utm_source=goalcurrent&utm_medium=advertising&utm_campaign=sepanai_video&utm_content=home_video_ad";

export default function HomeSepanaiVideoAd() {
  return (
    <aside className={styles.card} aria-label="Advertisement from SEPANAI.COM">
      <div className={styles.label}>Advertisement</div>
      <div className={styles.copy}>
        <div>
          <div className={styles.brandRow}>
            <img src="/sepanai-mark.svg" alt="" className={styles.mark} />
            <span className={styles.brand}>SEPANAI.COM</span>
          </div>
          <h2 className={styles.title}>See what SEPANAI.COM is building</h2>
          <p className={styles.text}>
            Watch the latest product update, including SocialMedia by SEPANAI.COM.
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
        preload="none"
        poster={SEPANAI_POSTER}
      >
        <source src={SEPANAI_VIDEO} type="video/mp4" />
        Your browser does not support embedded video.
      </video>
      <p className={styles.fallback}>
        If playback is unavailable, <a href={SEPANAI_VIDEO}>open the video directly</a>.
      </p>
    </aside>
  );
}
