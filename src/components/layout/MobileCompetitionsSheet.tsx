"use client";

import { useEffect, useId, useRef, type RefObject } from "react";
import { useTranslations } from "next-intl";
import NavLink from "@/components/nav/NavLink";
import { DESKTOP_COMPETITIONS_NAV } from "@/lib/nav";
import { trapTabKey } from "@/lib/a11y/dialog-focus";
import styles from "./MoreBottomSheet.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

export default function MobileCompetitionsSheet({ open, onClose, returnFocusRef }: Props) {
  const t = useTranslations("nav");
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const close = dialog.querySelector<HTMLElement>('[data-gc-competitions-close="true"]');
    window.setTimeout(() => close?.focus(), 0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      trapTabKey(event, dialog);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef?.current?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) return null;

  return (
    <>
      <div className={`${styles.moreOverlay} ${styles.moreOverlayOpen}`} onClick={onClose} aria-hidden="true" />
      <div
        id="gc-mobile-competitions-sheet"
        ref={dialogRef}
        className={`${styles.sheet} ${styles.sheetOpen}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-gc-chrome="mobile-competitions-sheet"
      >
        <div className={styles.sheetHeader}>
          <span className={styles.headerSpacer} aria-hidden="true" />
          <h2 id={titleId} className={styles.sheetTitle}>{t("competitions")}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            data-gc-competitions-close="true"
            aria-label={t("closeMenu")}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <nav className={styles.sheetList} aria-label={t("competitions")}>
          {DESKTOP_COMPETITIONS_NAV.map((competition) => (
            <NavLink
              key={competition.id}
              href={competition.href}
              className={styles.sheetLink}
              onClick={onClose}
            >
              {t(competition.labelKey)}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
