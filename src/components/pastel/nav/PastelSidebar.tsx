"use client";

import { useCallback, useRef, useState } from "react";
import NavLink from "@/components/nav/NavLink";
import { usePathname } from "@/i18n/navigation";
import {
  isPastelNavActive,
  PASTEL_DESKTOP_SIDEBAR,
  PASTEL_NAV_ITEMS,
} from "./pastelNav";
import { PastelNavIcon } from "./PastelNavIcons";
import styles from "../pastel.module.css";

const COLLAPSE_DELAY_MS = 150;

/**
 * Desktop pastel nav rail — 56px collapsed → 240px on hover / focus-within
 * (aligned with production DesktopSidebar hover-expand from #16).
 */
export default function PastelSidebar() {
  const pathname = usePathname();
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
      className={`${styles.sidebar}${pinnedOpen ? ` ${styles.sidebarPinned}` : ""}`}
      aria-label="Pastel desktop navigation"
      onMouseEnter={holdOpen}
      onMouseLeave={scheduleCollapse}
      onFocusCapture={holdOpen}
      onBlurCapture={handleBlurCapture}
    >
      <div className={styles.sidebarBrand} aria-hidden>
        <span className={styles.sidebarBrandShort}>GC</span>
        <span className={styles.sidebarBrandFull}>GoalCurrent</span>
      </div>
      <nav className={styles.sidebarNav}>
        {PASTEL_DESKTOP_SIDEBAR.map((id) => {
          const item = PASTEL_NAV_ITEMS[id];
          const active = isPastelNavActive(pathname, item.href, id === "home");
          const className = `${styles.sidebarLink}${active ? ` ${styles.sidebarLinkActive}` : ""}${item.enabled ? "" : ` ${styles.navItemDisabled}`}`;

          if (!item.enabled) {
            return (
              <span
                key={id}
                className={className}
                aria-disabled="true"
                aria-label={`${item.label} (Soon)`}
                title={`${item.label} — Soon`}
              >
                <PastelNavIcon id={id} />
                <span className={styles.sidebarLinkLabel} aria-hidden>
                  {item.label}
                </span>
                <span className={styles.soonBadge}>Soon</span>
              </span>
            );
          }

          return (
            <NavLink
              key={id}
              href={item.href}
              className={className}
              aria-label={item.label}
              title={item.label}
            >
              <PastelNavIcon id={id} />
              <span className={styles.sidebarLinkLabel} aria-hidden>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
