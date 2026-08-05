"use client";

import { useEffect, useId, useRef } from "react";
import NavLink from "@/components/nav/NavLink";
import type { PastelNavItem } from "./pastelNav";
import styles from "../pastel.module.css";

type PastelMoreMenuProps = {
  variant: "dropdown" | "sheet";
  open: boolean;
  onClose: () => void;
  items: PastelNavItem[];
  triggerLabel?: string;
};

function MoreItem({
  item,
  className,
  role,
  onClose,
}: {
  item: PastelNavItem;
  className: string;
  role?: string;
  onClose: () => void;
}) {
  if (!item.enabled) {
    return (
      <span
        className={`${className} ${styles.navItemDisabled}`}
        role={role}
        aria-disabled="true"
        title={`${item.label} — Soon`}
      >
        {item.label}
        <span className={styles.soonBadge}>Soon</span>
      </span>
    );
  }

  return (
    <NavLink
      href={item.href}
      className={className}
      role={role}
      onClick={onClose}
    >
      {item.label}
    </NavLink>
  );
}

export default function PastelMoreMenu({
  variant,
  open,
  onClose,
  items,
  triggerLabel = "More",
}: PastelMoreMenuProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || variant !== "dropdown") return;
    const onPointer = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open, onClose, variant]);

  if (!open) return null;

  if (variant === "dropdown") {
    return (
      <div
        ref={panelRef}
        className={styles.moreDropdown}
        role="menu"
        aria-label={triggerLabel}
      >
        {items.map((item) => (
          <MoreItem
            key={item.id}
            item={item}
            className={styles.moreDropdownItem}
            role="menuitem"
            onClose={onClose}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className={styles.moreSheetOverlay}
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        className={styles.moreSheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.moreSheetHeader}>
          <h2 id={titleId} className={styles.moreSheetTitle}>
            {triggerLabel}
          </h2>
          <button
            type="button"
            className={styles.moreSheetClose}
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <nav className={styles.moreSheetNav} aria-label="More navigation">
          {items.map((item) => (
            <MoreItem
              key={item.id}
              item={item}
              className={styles.moreSheetItem}
              onClose={onClose}
            />
          ))}
        </nav>
      </div>
    </>
  );
}
