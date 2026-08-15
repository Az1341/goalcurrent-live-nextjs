"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import NavLink from "@/components/nav/NavLink";
import {
  DESKTOP_COMPETITIONS_NAV,
  type DesktopCompetitionNavGroup,
} from "@/lib/nav";
import styles from "./master-chrome.module.css";

type HeaderCompetitionsDropdownProps = {
  label: string;
  isActive: boolean;
};

const PANEL_MIN_WIDTH = 280;
const MOBILE_COMPETITIONS_EVENT = "gc:mobile-competitions-open";

export default function HeaderCompetitionsDropdown({
  label,
  isActive,
}: HeaderCompetitionsDropdownProps) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<
    DesktopCompetitionNavGroup["id"]
  >("pl");
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(
    null,
  );

  const syncPanelPos = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const maxLeft = Math.max(8, window.innerWidth - PANEL_MIN_WIDTH - 8);
    setPanelPos({
      top: rect.bottom,
      left: Math.min(Math.max(8, rect.left), maxLeft),
    });
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setPanelPos(null);
  }, []);

  const handleToggle = useCallback(() => {
    if (window.matchMedia("(max-width: 768px)").matches) {
      closeMenu();
      window.dispatchEvent(new CustomEvent(MOBILE_COMPETITIONS_EVENT));
      return;
    }
    setOpen((value) => !value);
  }, [closeMenu]);

  useLayoutEffect(() => {
    if (!open) return;
    syncPanelPos();
    window.addEventListener("resize", syncPanelPos);
    window.addEventListener("scroll", syncPanelPos, true);
    return () => {
      window.removeEventListener("resize", syncPanelPos);
      window.removeEventListener("scroll", syncPanelPos, true);
    };
  }, [open, syncPanelPos]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const target = event.target;
      if (target instanceof Node && !root.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={styles.dropdownWrap}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.navBtn} ${isActive || open ? styles.navBtnOpen : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={`${panelId} gc-mobile-competitions-sheet`}
        onClick={handleToggle}
      >
        {label}
        <span aria-hidden="true">{" \u25BE"}</span>
      </button>

      {open && panelPos ? (
        <div
          id={panelId}
          className={styles.competitionsPanel}
          role="menu"
          style={{
            position: "fixed",
            top: panelPos.top,
            left: panelPos.left,
            width: PANEL_MIN_WIDTH,
          }}
        >
          <p className={styles.competitionsHint}>Click a competition</p>
          {DESKTOP_COMPETITIONS_NAV.map((group) => {
            const isGroupOpen = activeGroupId === group.id;
            return (
              <div key={group.id} className={styles.competitionsGroup}>
                <button
                  type="button"
                  className={`${styles.competitionsGroupBtn} ${isGroupOpen ? styles.competitionsGroupBtnOpen : ""}`}
                  role="menuitem"
                  aria-expanded={isGroupOpen}
                  aria-controls={`${panelId}-${group.id}`}
                  onClick={() => setActiveGroupId(group.id)}
                >
                  <span>{t(group.labelKey)}</span>
                  <span aria-hidden="true">
                    {isGroupOpen ? "\u25BE" : "\u25B8"}
                  </span>
                </button>
                {isGroupOpen ? (
                  <div
                    id={`${panelId}-${group.id}`}
                    className={styles.competitionsSubmenu}
                    role="group"
                    aria-label={t(group.labelKey)}
                  >
                    {group.links.map((link) => (
                      <NavLink
                        key={`${group.id}-${link.href}`}
                        href={link.href}
                        className={styles.dropdownLink}
                        role="menuitem"
                        onClick={closeMenu}
                      >
                        {t(link.labelKey)}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}