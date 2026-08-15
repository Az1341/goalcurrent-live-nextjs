"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import NavLink from "@/components/nav/NavLink";
import {
  DESKTOP_PRIMARY_NAV,
  isDesktopCompetitionsActive,
  isMainNavActive,
} from "@/lib/nav";
import HeaderCompetitionsDropdown from "./HeaderCompetitionsDropdown";
import HeaderLocaleDropdown from "./HeaderLocaleDropdown";
import { trackSubscriptionStart } from "@/lib/analytics";
import AuthMenu from "@/components/firebase/AuthMenu";
import ThemeToggle from "@/components/theme/ThemeToggle";
import styles from "./master-chrome.module.css";
import responsiveStyles from "./MasterHeaderResponsive.module.css";
import sepanaiStyles from "./SepanaiAttribution.module.css";

const SEPANAI_HEADER_HREF =
  "https://www.sepanai.com/?utm_source=goalcurrent&utm_medium=referral&utm_campaign=powered_by&utm_content=header";

function openSubscribeDialog() {
  trackSubscriptionStart({
    plan_id: "newsletter_pending",
    plan_name: "Newsletter",
    billing_period: "unknown",
    currency: "GBP",
    value: 0,
    source_surface: "header_subscribe",
  });
  window.dispatchEvent(new CustomEvent("gc:subscribe-open"));
}

export default function MasterHeader() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const chromeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const chrome = chromeRef.current;
    if (!chrome) {
      return;
    }

    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--gc-site-header-height",
        `${chrome.offsetHeight}px`,
      );
    };

    syncHeaderHeight();
    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(chrome);
    window.addEventListener("resize", syncHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeaderHeight);
    };
  }, [pathname]);

  return (
    <div
      ref={chromeRef}
      className={`${styles.chromeWrap} ${styles.chromeWrapV5}`}
      data-gc-chrome="site-header"
    >
      <header
        className={`${styles.masterHeader} ${styles.masterHeaderV5}`}
        role="banner"
      >
        <div className={styles.bar}>
          <NavLink href="/" className={styles.brand}>
            <div className={styles.brandLogoWrap}>
              <img
                src="/logo.svg"
                alt="GoalCurrent"
                width={48}
                height={48}
                decoding="async"
              />
            </div>
            <div className={styles.brandName}>
              Goal<span>Current</span>.live
            </div>
          </NavLink>

          <nav className={styles.desktopNav} aria-label={t("mainNavigation")}>
            <div className={styles.desktopNavPrimary}>
              {DESKTOP_PRIMARY_NAV.map((item) => {
                const active = isMainNavActive(pathname, item.href, item.exact);
                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                  >
                    {t(item.labelKey)}
                  </NavLink>
                );
              })}
            </div>
            <div className={styles.mobileQuickNav}>
              <NavLink
                href="/fixture"
                className={`${styles.navLink} ${
                  isMainNavActive(pathname, "/fixture")
                    ? styles.navLinkActive
                    : ""
                }`}
              >
                {t("fixtureCalendar")}
              </NavLink>
            </div>
            <div className={responsiveStyles.desktopCompetitionOnly}>
              <HeaderCompetitionsDropdown
                label={t("competitions")}
                isActive={isDesktopCompetitionsActive(pathname)}
              />
            </div>
          </nav>

          <div className={styles.headerActions}>
            <a
              href={SEPANAI_HEADER_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className={sepanaiStyles.headerLink}
              aria-label="Powered by SEPANAI.COM"
            >
              <span className={sepanaiStyles.powered}>Powered by</span>
              <img
                src="/sepanai-logo-official.svg"
                alt="SEPANAI.COM"
                width={130}
                height={30}
                className={sepanaiStyles.headerOfficialLogo}
                decoding="async"
              />
            </a>
            <ThemeToggle />
            <HeaderLocaleDropdown />
            <AuthMenu />
            <button
              type="button"
              className={styles.headerSubscribe}
              onClick={openSubscribeDialog}
            >
              {tCommon("subscribe")}
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
