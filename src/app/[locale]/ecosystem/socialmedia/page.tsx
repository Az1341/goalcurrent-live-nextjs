import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "SocialMedia by SEPANAI.COM | GoalCurrent",
  description:
    "See how SocialMedia by SEPANAI.COM helps small businesses create, organise and publish social content before opening the application.",
};

const SCREENSHOTS = [
  {
    src: "https://socialmedia.sepanai.com/help/screenshots/dashboard.png",
    alt: "SocialMedia by SEPANAI.COM dashboard",
    title: "Dashboard",
    text: "A single workspace for your publishing activity, connected channels and recent work.",
  },
  {
    src: "https://socialmedia.sepanai.com/help/screenshots/composer.png",
    alt: "SocialMedia by SEPANAI.COM composer",
    title: "Composer",
    text: "Create posts, attach media and prepare content for the channels you choose.",
  },
  {
    src: "https://socialmedia.sepanai.com/help/screenshots/media.png",
    alt: "SocialMedia by SEPANAI.COM media library",
    title: "Media library",
    text: "Keep reusable images and videos organised so they are ready for future campaigns.",
  },
] as const;

export default function SocialMediaProductPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.brandRow}>
          <img src="/sepanai-mark.svg" alt="SEPANAI.COM" className={styles.logo} />
          <span>SocialMedia by SEPANAI.COM</span>
        </div>
        <p className={styles.eyebrow}>Ashna4all ecosystem product</p>
        <h1>Create. Plan. Publish.</h1>
        <p className={styles.lead}>
          SocialMedia by SEPANAI.COM is built to help small businesses turn ideas into consistent social publishing from one controlled workspace.
        </p>
        <div className={styles.actions}>
          <a
            className={styles.primary}
            href="https://socialmedia.sepanai.com/?utm_source=goalcurrent&utm_medium=referral&utm_campaign=socialmedia_product_page"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open SocialMedia
          </a>
          <a className={styles.secondary} href="/">
            Back to GoalCurrent
          </a>
        </div>
      </section>

      <section className={styles.features} aria-label="SocialMedia product features">
        <article>
          <strong>Create</strong>
          <p>Draft social posts and prepare reusable content in one place.</p>
        </article>
        <article>
          <strong>Organise</strong>
          <p>Use drafts, media and publishing history to keep work structured.</p>
        </article>
        <article>
          <strong>Publish</strong>
          <p>Move approved content toward connected social channels from the same workflow.</p>
        </article>
      </section>

      <section className={styles.gallery} aria-labelledby="socialmedia-screenshots-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Real product screens</p>
          <h2 id="socialmedia-screenshots-title">See SocialMedia before you sign in</h2>
          <p>These are real screenshots from the current SocialMedia product help library.</p>
        </div>
        <div className={styles.grid}>
          {SCREENSHOTS.map((shot) => (
            <figure key={shot.src} className={styles.figure}>
              <img src={shot.src} alt={shot.alt} loading="lazy" decoding="async" />
              <figcaption>
                <strong>{shot.title}</strong>
                <span>{shot.text}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <h2>Explore the product when you are ready</h2>
        <p>The public introduction stays here on GoalCurrent. Sign-in is only the next step after you choose to open the application.</p>
        <a
          href="https://socialmedia.sepanai.com/?utm_source=goalcurrent&utm_medium=referral&utm_campaign=socialmedia_product_page&utm_content=final_cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          Continue to SocialMedia →
        </a>
      </section>
    </main>
  );
}
