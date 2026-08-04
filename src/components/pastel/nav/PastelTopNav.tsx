"use client";

import { useState } from "react";
import NavLink from "@/components/nav/NavLink";
import { usePathname } from "@/i18n/navigation";
import {
  PASTEL_DESKTOP_TOP,
  PASTEL_NAV_ITEMS,
  PASTEL_TABLET_MORE,
  PASTEL_TABLET_TOP,
  resolvePastelItems,
} from "./pastelNav";
import PastelMoreMenu from "./PastelMoreMenu";
import styles from "../pastel.module.css";

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/") return pathname === "/" || pathname === "";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PastelTopNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className={styles.topNav} aria-label="Pastel top navigation">
      <div className={styles.topNavInner}>
        <span className={styles.topNavBrand}>GoalCurrent | Pastel Preview</span>

        <nav className={styles.topNavDesktop} aria-label="Desktop tabs">
          {PASTEL_DESKTOP_TOP.map((id) => {
            const item = PASTEL_NAV_ITEMS[id];
            const active = isActive(pathname, item.href);
            return (
              <NavLink
                key={id}
                href={item.href}
                className={`${styles.topNavLink}${active ? ` ${styles.topNavLinkActive}` : ""}`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <nav className={styles.topNavTablet} aria-label="Tablet tabs">
          {PASTEL_TABLET_TOP.map((id) => {
            const item = PASTEL_NAV_ITEMS[id];
            const active = isActive(pathname, item.href, id === "home");
            return (
              <NavLink
                key={id}
                href={item.href}
                className={`${styles.topNavLink}${active ? ` ${styles.topNavLinkActive}` : ""}`}
              >
                {item.label}
              </NavLink>
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
      </div>
    </header>
  );
}
