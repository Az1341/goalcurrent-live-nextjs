"use client";

import NavLink from "@/components/nav/NavLink";
import { usePathname } from "@/i18n/navigation";
import {
  PASTEL_DESKTOP_SIDEBAR,
  PASTEL_NAV_ITEMS,
} from "./pastelNav";
import { PastelNavIcon } from "./PastelNavIcons";
import styles from "../pastel.module.css";

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/") return pathname === "/" || pathname === "";
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
          const active = isActive(pathname, item.href, id === "home");
          return (
            <NavLink
              key={id}
              href={item.href}
              className={`${styles.sidebarLink}${active ? ` ${styles.sidebarLinkActive}` : ""}`}
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
