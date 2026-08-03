"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import NavLink from "@/components/nav/NavLink";
import {
  DESKTOP_SIDEBAR_LEAGUES_NAV,
  isDesktopSidebarLeagueActive,
} from "@/lib/nav";
import styles from "./DesktopSidebar.module.css";

const COLLAPSE_DELAY_MS = 150;

export default function DesktopSidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const asideRef = useRef<HTMLElement>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pinnedOpen, setPinnedOpen] = useState(false);

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current !== null) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  }, []);

  const holdOpen = useCallback(() => {
    clearCollapseTimer();
    setPinnedOpen(true);
  }, [clearCollapseTimer]);

  const scheduleCollapse = useCallback(() => {
    clearCollapseTimer();
    collapseTimerRef.current = setTimeout(() => {
      const el = asideRef.current;
      if (!el) {
        setPinnedOpen(false);
        collapseTimerRef.current = null;
        return;
      }

      const hovered = el.matches(":hover");
      const focused = el.contains(document.activeElement);
      if (!hovered && !focused) {
        setPinnedOpen(false);
      }
      collapseTimerRef.current = null;
    }, COLLAPSE_DELAY_MS);
  }, [clearCollapseTimer]);

  const handleBlurCapture = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      const next = event.relatedTarget as Node | null;
      if (next && event.currentTarget.contains(next)) {
        return;
      }
      scheduleCollapse();
    },
    [scheduleCollapse],
  );

  return (
    <aside
      ref={asideRef}
      className={`${styles.sidebar} ${pinnedOpen ? styles.pinnedOpen : ""}`}
      aria-label={t("sidebarLeagues")}
      data-gc-chrome="desktop-sidebar"
      onMouseEnter={holdOpen}
      onMouseLeave={scheduleCollapse}
      onFocusCapture={holdOpen}
      onBlurCapture={handleBlurCapture}
    >
      <div className={styles.inner}>
        <p className={styles.sectionLabel}>{t("sidebarLeagues")}</p>
        <ul className={styles.navList}>
          {DESKTOP_SIDEBAR_LEAGUES_NAV.map((item) => {
            const active = isDesktopSidebarLeagueActive(pathname, item);
            const label = t(item.labelKey);
            const ariaLabel = t(item.ariaLabelKey ?? item.labelKey);
            return (
              <li key={item.id}>
                <NavLink
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                  aria-current={active ? "page" : undefined}
                  aria-label={ariaLabel}
                  title={ariaLabel}
                >
                  <span className={styles.navShort} aria-hidden="true">
                    {item.shortLabel}
                  </span>
                  <span className={styles.navLabel}>{label}</span>
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
