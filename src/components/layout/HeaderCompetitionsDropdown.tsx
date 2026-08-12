"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
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
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const syncPanelPos = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const width = Math.min(
      PANEL_MIN_WIDTH,
      Math.max(200, window.innerWidth - 16),
    );
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    setPanelPos({
      top: rect.bottom,
      left: Math.min(Math.max(8, rect.left), maxLeft),
      width,
    });
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setPanelPos(null);
  }, []);

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
      const target = event.target;
      if (!(target instanceof Node)) return;
      // Panel is portaled to document.body — check both button root and panel.
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
      setPanelPos(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu]);

  const panel =
    open && panelPos && mounted
      ? createPortal(
          <div
            ref={panelRef}
            id={panelId}
            className={styles.competitionsPanel}
            role="menu"
            style={{
              position: "fixed",
              top: panelPos.top,
              left: panelPos.left,
              width: panelPos.width,
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={styles.dropdownWrap}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.navBtn} ${isActive || open ? styles.navBtnOpen : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <span aria-hidden="true">{" \u25BE"}</span>
      </button>
      {panel}
    </div>
  );
}