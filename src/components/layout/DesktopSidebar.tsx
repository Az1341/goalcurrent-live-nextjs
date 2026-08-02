"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import NavLink from "@/components/nav/NavLink";
import {
  DESKTOP_SIDEBAR_LEAGUES_NAV,
  isDesktopSidebarLeagueActive,
} from "@/lib/nav";
import styles from "./DesktopSidebar.module.css";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <aside
      className={styles.sidebar}
      aria-label={t("sidebarLeagues")}
      data-gc-chrome="desktop-sidebar"
    >
      <div className={styles.inner}>
        <p className={styles.sectionLabel}>{t("sidebarLeagues")}</p>
        <ul className={styles.navList}>
          {DESKTOP_SIDEBAR_LEAGUES_NAV.map((item) => {
            const active = isDesktopSidebarLeagueActive(pathname, item);
            return (
              <li key={item.id}>
                <NavLink
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {t(item.labelKey)}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className={styles.proSlot} aria-label={t("sidebarProTitle")}>
          <p className={styles.proEyebrow}>PRO</p>
          <p className={styles.proTitle}>{t("sidebarProTitle")}</p>
          <p className={styles.proBody}>{t("sidebarProBody")}</p>
          <button type="button" className={styles.proButton} disabled>
            {t("sidebarProCta")}
          </button>
        </div>
      </div>
    </aside>
  );
}