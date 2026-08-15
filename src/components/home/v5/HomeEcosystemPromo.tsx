import styles from "./HomeEcosystemPromo.module.css";

type Campaign = {
  id: "sepanai" | "socialmedia" | "famvi";
  brand: string;
  headline: string;
  body: string;
  href: string;
  className: string;
  logo?: string;
  logoAlt?: string;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "sepanai",
    brand: "SEPANAI.COM",
    headline: "Intelligence that becomes useful products",
    body: "Explore the SEPANAI.COM platform and the products being built across the Ashna4all ecosystem.",
    href: "https://www.sepanai.com/?utm_source=goalcurrent&utm_medium=advertising&utm_campaign=ashna4all_ecosystem&utm_content=home_sepanai_display",
    logo: "/sepanai-mark.svg",
    logoAlt: "SEPANAI.COM",
    className: styles.sepanai,
  },
  {
    id: "socialmedia",
    brand: "SocialMedia by SEPANAI.COM",
    headline: "Create. Plan. Publish.",
    body: "AI-assisted social media workflows for small businesses, built to turn ideas into consistent publishing.",
    href: "https://socialmedia.sepanai.com/?utm_source=goalcurrent&utm_medium=advertising&utm_campaign=ashna4all_ecosystem&utm_content=home_socialmedia_display",
    className: styles.socialmedia,
  },
  {
    id: "famvi",
    brand: "FAMVI",
    headline: "Your Family’s Chief of Staff",
    body: "A private family AI designed to help organise everyday family life.",
    href: "https://famviai.com/?utm_source=goalcurrent&utm_medium=advertising&utm_campaign=ashna4all_ecosystem&utm_content=home_famvi_display",
    logo: "/famvi-wordmark-inline.svg",
    logoAlt: "FAMVI",
    className: styles.famvi,
  },
];

export default function HomeEcosystemPromo() {
  return (
    <section className={styles.zone} aria-label="Featured advertisements">
      <div className={styles.zoneHeader}>
        <span className={styles.zoneLabel}>Advertisement</span>
        <span className={styles.zoneNote}>Featured products</span>
      </div>
      <div className={styles.grid}>
        {CAMPAIGNS.map((campaign) => (
          <a
            key={campaign.id}
            href={campaign.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`${styles.card} ${campaign.className}`}
            data-gc-ad={campaign.id}
            aria-label={`Advertisement: ${campaign.brand}`}
          >
            <div className={styles.brandRow}>
              {campaign.logo ? (
                <img
                  src={campaign.logo}
                  alt={campaign.logoAlt ?? campaign.brand}
                  className={campaign.id === "famvi" ? styles.famviLogo : styles.sepanaiLogo}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className={styles.socialMark} aria-hidden="true">SM</span>
              )}
              <span className={styles.brand}>{campaign.brand}</span>
            </div>
            <strong className={styles.headline}>{campaign.headline}</strong>
            <span className={styles.body}>{campaign.body}</span>
            <span className={styles.cta}>Learn more →</span>
          </a>
        ))}
      </div>
    </section>
  );
}
