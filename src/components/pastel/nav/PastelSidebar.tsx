"use client";

import NavLink from "@/components/nav/NavLink";
import { usePathname } from "@/i18n/navigation";
import {
  isPastelNavActive,
  PASTEL_DESKTOP_SIDEBAR,
  PASTEL_NAV_ITEMS,
} from "./pastelNav";
import { PastelNavIcon } from "./PastelNavIcons";
import styles from "../pastel.module.css";

export default function PastelSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="Pastel desktop navigation">
      <div className={styles.sidebarBrand} aria-hidden>
        GC
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
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
