"use client";

import { useState } from "react";
import NavLink from "@/components/nav/NavLink";
import { usePathname } from "@/i18n/navigation";
import {
  isPastelNavActive,
  PASTEL_MOBILE_MORE,
  PASTEL_MOBILE_TABS,
  PASTEL_NAV_ITEMS,
  resolvePastelItems,
} from "./pastelNav";
import { PastelNavIcon } from "./PastelNavIcons";
import PastelMoreMenu from "./PastelMoreMenu";
import styles from "../pastel.module.css";

export default function PastelBottomTabs() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className={styles.bottomTabs} aria-label="Pastel mobile navigation">
        {PASTEL_MOBILE_TABS.map((id) => {
          const item = PASTEL_NAV_ITEMS[id];
          const active = isPastelNavActive(pathname, item.href, id === "home");
          const className = `${styles.bottomTab}${active ? ` ${styles.bottomTabActive}` : ""}${item.enabled ? "" : ` ${styles.navItemDisabled}`}`;

          if (!item.enabled) {
            return (
              <span
                key={id}
                className={className}
                aria-disabled="true"
                title={`${item.label} — Soon`}
              >
                <PastelNavIcon id={id} />
                <span>{item.label}</span>
                <span className={styles.soonBadge}>Soon</span>
              </span>
            );
          }

          return (
            <NavLink key={id} href={item.href} className={className}>
              <PastelNavIcon id={id} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          className={`${styles.bottomTab} ${styles.bottomMore}${moreOpen ? ` ${styles.bottomTabActive}` : ""}`}
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
          onClick={() => setMoreOpen(true)}
        >
          <PastelNavIcon id="more" />
          <span>More</span>
        </button>
      </nav>
      <PastelMoreMenu
        variant="sheet"
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        items={resolvePastelItems(PASTEL_MOBILE_MORE)}
      />
    </>
  );
}
