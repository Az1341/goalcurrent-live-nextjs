import styles from "./LiveScoreAdUnit.module.css";

type LiveScoreAdUnitProps = {
  index: number;
};

type Campaign = {
  id: "sepanai" | "socialmedia" | "famvi";
  brand: string;
  headline: string;
  body: string;
  href: string;
  className: string;
  logoSrc: string;
  logoAlt: string;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "sepanai",
    brand: "SEPANAI.COM",
    headline: "One AI ecosystem. Useful products.",
    body: "Discover the SEPANAI.COM ecosystem and join the private trial.",
    href: "https://www.sepanai.com/?utm_source=goalcurrent&utm_medium=live_score_ad&utm_campaign=sepanai_ecosystem&utm_content=live_match",
    className: styles.sepanai,
    logoSrc: "/sepanai-mark.svg",
    logoAlt: "SEPANAI.COM",
  },
  {
    id: "socialmedia",
    brand: "SocialMedia by SEPANAI.COM",
    headline: "Create. Plan. Publish.",
    body: "AI-assisted social media workflows built for small businesses.",
    href: "https://socialmedia.sepanai.com/?utm_source=goalcurrent&utm_medium=live_score_ad&utm_campaign=socialmedia&utm_content=live_match",
    className: styles.socialmedia,
    logoSrc: "/sepanai-mark.svg",
    logoAlt: "SEPANAI.COM",
  },
  {
    id: "famvi",
    brand: "FAMVI",
    headline: "Your Family’s Chief of Staff",
    body: "A private family AI designed to help organise everyday family life.",
    href: "https://famviai.com/?utm_source=goalcurrent&utm_medium=live_score_ad&utm_campaign=famvi&utm_content=live_match",
    className: styles.famvi,
    logoSrc: "/famvi-wordmark-inline.svg",
    logoAlt: "FAMVI",
  },
];

export default function LiveScoreAdUnit({ index }: LiveScoreAdUnitProps) {
  const campaign = CAMPAIGNS[index % CAMPAIGNS.length];

  return (
    <li className={`${styles.item} ${campaign.className}`} data-gc-live-ad={campaign.id}>
      <a
        href={campaign.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={styles.link}
        aria-label={`Advertisement: ${campaign.brand}`}
      >
        <span className={styles.adLabel}>Advertisement</span>
        <span className={styles.brandRow}>
          <img
            className={campaign.id === "famvi" ? styles.famviLogo : styles.sepanaiLogo}
            src={campaign.logoSrc}
            alt={campaign.logoAlt}
            loading="lazy"
            decoding="async"
          />
          <span className={styles.brand}>{campaign.brand}</span>
        </span>
        <span className={styles.copy}>
          <strong className={styles.headline}>{campaign.headline}</strong>
          <span className={styles.body}>{campaign.body}</span>
        </span>
        <span className={styles.cta}>Learn more →</span>
      </a>
    </li>
  );
}
