"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  FOOTER_COMPANY_LINKS,
  FOOTER_PLATFORM_LINKS,
} from "@/lib/nav";
import { SITE_NAME } from "@/lib/site-url";
import GooglePlayBadge from "./GooglePlayBadge";
import SocialLinks from "./SocialLinks";
import styles from "./master-chrome.module.css";
import sepanaiStyles from "./SepanaiAttribution.module.css";

const SEPANAI_FOOTER_HREF =
  "https://www.sepanai.com/?utm_source=goalcurrent&utm_medium=referral&utm_campaign=powered_by&utm_content=footer";

export default function MasterFooter() {
  const t = useTranslations("nav");
  const tLayout = useTranslations("layout.footer");

  return (
    <footer
      className={`${styles.masterFooter} ${styles.masterFooterV5}`}
      data-gc-chrome="site-footer"
    >
      <div className={styles.footerV5Grid}>
        <div className={styles.footerBrandCol}>
          <Link href="/" className={styles.footerBrand}>
            Goal<span>Current</span>.live
          </Link>
          <a
            href={SEPANAI_FOOTER_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className={sepanaiStyles.footerLink}
            aria-label="Powered by SEPANAI.COM"
          >
            <img src="/sepanai-mark.svg" alt="" className={sepanaiStyles.mark} />
            <span className={sepanaiStyles.copy}>
              <span className={sepanaiStyles.powered}>Powered by</span>
              <span className={sepanaiStyles.name}>SEPANAI.COM</span>
            </span>
          </a>
          <div className={styles.footerSocial} aria-label={tLayout("socialAria")}>
            <SocialLinks
              linkClassName={styles.footerSocialIcon}
              iconClassName={styles.footerSocialSvg}
            />
          </div>
        </div>

        <nav className={styles.footerLinkCol} aria-label={tLayout("platform")}>
          <h3 className={styles.footerColTitle}>{tLayout("platform")}</h3>
          <ul className={styles.footerLinkList}>
            {FOOTER_PLATFORM_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{t(link.labelKey)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={styles.footerLinkCol} aria-label={tLayout("company")}>
          <h3 className={styles.footerColTitle}>{tLayout("company")}</h3>
          <ul className={styles.footerLinkList}>
            {FOOTER_COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{t(link.labelKey)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.footerStoreCol}>
          <GooglePlayBadge />
        </div>
      </div>

      <p className={styles.footerCopy}>
        {tLayout("copyright", {
          year: new Date().getFullYear(),
          siteName: SITE_NAME,
        })}
      </p>
    </footer>
  );
}
