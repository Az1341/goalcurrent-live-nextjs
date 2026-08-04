"use client";

import { useState } from "react";
import NavLink from "@/components/nav/NavLink";
import { usePathname } from "@/i18n/navigation";
import {
  isPastelNavActive,
  PASTEL_DESKTOP_TOP,
  PASTEL_NAV_ITEMS,
  PASTEL_TABLET_MORE,
  PASTEL_TABLET_TOP,
  resolvePastelItems,
  type PastelNavItem,
} from "./pastelNav";
import PastelMoreMenu from "./PastelMoreMenu";
import PastelThemeToggle, { type PastelTheme } from "../PastelThemeToggle";
import styles from "../pastel.module.css";

function PastelTopNavItem({
  item,
  active,
}: {
  item: PastelNavItem;
  active: boolean;
}) {
  const className = `${styles.topNavLink}${active ? ` ${styles.topNavLinkActive}` : ""}${item.enabled ? "" : ` ${styles.navItemDisabled}`}`;

  if (!item.enabled) {
    return (
      <span
        className={className}
        aria-disabled="true"
        title={`${item.label} — Soon`}
      >
        {item.label}
        <span className={styles.soonBadge}>Soon</span>
      </span>
    );
  }

  return (
    <NavLink href={item.href} className={className}>
      {item.label}
    </NavLink>
  );
}

type Props = {
  theme: PastelTheme;
  onToggleTheme: () => void;
};

export default function PastelTopNav({ theme, onToggleTheme }: Props) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className={styles.topNav} aria-label="Pastel top navigation">
      <div className={styles.topNavInner}>
        <span className={styles.topNavBrand}>GoalCurrent | Pastel Preview</span>

        <nav className={styles.topNavDesktop} aria-label="Desktop tabs">
          {PASTEL_DESKTOP_TOP.map((id) => {
            const item = PASTEL_NAV_ITEMS[id];
            return (
              <PastelTopNavItem
                key={id}
                item={item}
                active={isPastelNavActive(pathname, item.href)}
              />
            );
          })}
        </nav>

        <nav className={styles.topNavTablet} aria-label="Tablet tabs">
          {PASTEL_TABLET_TOP.map((id) => {
            const item = PASTEL_NAV_ITEMS[id];
            return (
              <PastelTopNavItem
                key={id}
                item={item}
                active={isPastelNavActive(pathname, item.href, id === "home")}
              />
            );
          })}
          <div className={styles.moreWrap}>
            <button
              type="button"
              className={`${styles.topNavLink} ${styles.moreTrigger}`}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((v) => !v)}
            >
              More ▾
            </button>
            <PastelMoreMenu
              variant="dropdown"
              open={moreOpen}
              onClose={() => setMoreOpen(false)}
              items={resolvePastelItems(PASTEL_TABLET_MORE)}
            />
          </div>
        </nav>

        <div className={styles.topNavActions}>
          <PastelThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
