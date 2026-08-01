"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import NavLink from "@/components/nav/NavLink";
import {
  getLocaleShortLabel,
  LOCALES,
  LANGUAGE_MENU_ICON,
  type AppLocale,
} from "@/i18n/locales";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  DESKTOP_COMPETITIONS_NAV,
  MORE_SHEET_LEVEL1,
  MORE_SHEET_SUBMENU_TITLE_KEYS,
  MORE_SHEET_SUBMENUS,
  isMoreSheetCompetitionId,
  isMoreSheetLinkActive,
  type MoreSheetSubmenuId,
} from "@/lib/nav";
import { trackLanguageChange } from "@/lib/analytics";
import AuthMenu from "@/components/firebase/AuthMenu";
import { trapTabKey } from "@/lib/a11y/dialog-focus";
import styles from "./MoreBottomSheet.module.css";

type MoreBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Prefer restoring focus to the More trigger after dismissal. */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

export default function MoreBottomSheet({
  open,
  onClose,
  returnFocusRef,
}: MoreBottomSheetProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const returnFocusRefInternal = useRef(returnFocusRef);
  const [submenu, setSubmenu] = useState<MoreSheetSubmenuId | null>(null);
  // Sheet unmounts when closed (BottomTabBar), so submenu resets on remount.
  const activeSubmenu = open ? submenu : null;

  useEffect(() => {
    onCloseRef.current = onClose;
    returnFocusRefInternal.current = returnFocusRef;
  });

  // FE-007: initial focus, Escape dismissal, Tab trap, focus restore, scroll lock.
  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused =
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null) ?? null;

    const focusTarget =
      dialog.querySelector<HTMLElement>('[data-gc-more-close="true"]') ?? dialog;
    // Defer so dynamic mount + CSS open class settle before focusing.
    const focusTimer = window.setTimeout(() => {
      focusTarget.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      trapTabKey(event, dialog);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      const restore =
        returnFocusRefInternal.current?.current ?? previouslyFocused;
      if (restore && typeof restore.focus === "function") {
        restore.focus();
      }
    };
  }, [open]);

  const handleClose = () => {
    setSubmenu(null);
    onClose();
  };

  const handleNavigate = () => {
    setSubmenu(null);
    onClose();
  };

  const handleBack = () => {
    if (activeSubmenu && isMoreSheetCompetitionId(activeSubmenu)) {
      setSubmenu("competitions");
      return;
    }
    setSubmenu(null);
  };

  const handleLocaleChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) {
      handleNavigate();
      return;
    }
    trackLanguageChange({
      previous_language: locale,
      selected_language: nextLocale,
      source_surface: "more_sheet_language",
    });
    router.replace(pathname, { locale: nextLocale });
    router.refresh();
    handleNavigate();
  };

  const submenuTitle = activeSubmenu
    ? t(MORE_SHEET_SUBMENU_TITLE_KEYS[activeSubmenu])
    : t("more");

  return (
    <>
      <div
        className={`${styles.moreOverlay} ${open ? styles.moreOverlayOpen : ""}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        tabIndex={-1}
        data-gc-chrome="more-sheet"
        id="gc-more-sheet"
      >
        <div className={styles.sheetHeader}>
          {activeSubmenu ? (
            <button
              type="button"
              className={styles.backBtn}
              aria-label={t("backToMenu")}
              onClick={handleBack}
            >
              ←
            </button>
          ) : (
            <span className={styles.headerSpacer} aria-hidden="true" />
          )}

          <h2 id={titleId} className={styles.sheetTitle}>
            {submenuTitle}
          </h2>

          <button
            type="button"
            className={styles.closeBtn}
            aria-label={t("closeMenu")}
            data-gc-more-close="true"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <div className={styles.panelStack}>
          <div
            className={`${styles.panel} ${activeSubmenu ? styles.panelHidden : styles.panelActive}`}
            aria-hidden={Boolean(activeSubmenu)}
            inert={activeSubmenu ? true : undefined}
          >
            <nav className={styles.sheetList} aria-label={t("openMoreNavigation")}>
              {MORE_SHEET_LEVEL1.map((item, index) => {
                if (item.type === "divider") {
                  return <hr key={`divider-${index}`} className={styles.sheetDivider} />;
                }

                if (item.type === "submenu") {
                  const isLanguage = item.id === "language";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.sheetRow} ${isLanguage ? styles.sheetRowLanguage : ""}`}
                      aria-haspopup="menu"
                      aria-expanded={activeSubmenu === item.id}
                      onClick={() => setSubmenu(item.id)}
                    >
                      {isLanguage ? (
                        <span className={styles.sheetRowLeading}>
                          <span className={styles.sheetRowIcon} aria-hidden="true">
                            {LANGUAGE_MENU_ICON}
                          </span>
                          <span className={styles.sheetRowLabel}>
                            <span className={styles.sheetRowTitle}>{t(item.labelKey)}</span>
                            <span className={styles.sheetRowMeta}>
                              {getLocaleShortLabel(locale)}
                            </span>
                          </span>
                        </span>
                      ) : (
                        <span>{t(item.labelKey)}</span>
                      )}
                      <span className={styles.chevron} aria-hidden="true">
                        ▾
                      </span>
                    </button>
                  );
                }

                if (item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`${styles.sheetLink} ${styles.sheetLinkExternal}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      onClick={handleNavigate}
                    >
                      {t(item.labelKey)}
                    </a>
                  );
                }

                const active = isMoreSheetLinkActive(pathname, item.href);

                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    className={`${styles.sheetLink} ${active ? styles.sheetLinkActive : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={handleNavigate}
                  >
                    {t(item.labelKey)}
                  </NavLink>
                );
              })}
            </nav>
            <div className={styles.sheetAccount}>
              <h3 className={styles.sheetAccountTitle}>{tAuth("account")}</h3>
              <AuthMenu variant="sheet" onAction={handleNavigate} />
            </div>
          </div>

          <div
            className={`${styles.panel} ${activeSubmenu ? styles.panelActive : styles.panelHidden}`}
            aria-hidden={!activeSubmenu}
            inert={!activeSubmenu ? true : undefined}
          >
            {activeSubmenu === "language" ? (
              <ul className={styles.sheetList} aria-label={t("language")}>
                {LOCALES.map((code) => {
                  const isActive = locale === code;
                  return (
                    <li key={code}>
                    <button
                      type="button"
                      className={`${styles.langRow} ${isActive ? styles.langRowActive : ""}`}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => handleLocaleChange(code)}
                    >
                      <span className={styles.langLabel}>{getLocaleShortLabel(code)}</span>
                      {isActive ? (
                        <span className={styles.langCheck} aria-hidden="true">
                          ✓
                        </span>
                      ) : null}
                    </button>
                    </li>
                  );
                })}
              </ul>
            ) : activeSubmenu === "competitions" ? (
              <nav className={styles.sheetList} aria-label={t("competitions")}>
                {DESKTOP_COMPETITIONS_NAV.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className={styles.sheetRow}
                    aria-haspopup="menu"
                    onClick={() => setSubmenu(group.id)}
                  >
                    <span>{t(group.labelKey)}</span>
                    <span className={styles.chevron} aria-hidden="true">
                      ▾
                    </span>
                  </button>
                ))}
              </nav>
            ) : activeSubmenu ? (
              <nav className={styles.sheetList} aria-label={`${submenuTitle} links`}>
                {MORE_SHEET_SUBMENUS[activeSubmenu].map((link, index) => {
                  const key = `${activeSubmenu}-${link.labelKey}-${index}`;
                  const active = !link.external && isMoreSheetLinkActive(pathname, link.href);

                  if (link.external) {
                    return (
                      <a
                        key={key}
                        href={link.href}
                        className={`${styles.sheetLink} ${styles.sheetLinkExternal}`}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={handleNavigate}
                      >
                        {t(link.labelKey)}
                      </a>
                    );
                  }

                  return (
                    <NavLink
                      key={key}
                      href={link.href}
                      className={`${styles.sheetLink} ${active ? styles.sheetLinkActive : ""}`}
                      aria-current={active ? "page" : undefined}
                      onClick={handleNavigate}
                    >
                      {t(link.labelKey)}
                    </NavLink>
                  );
                })}
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
