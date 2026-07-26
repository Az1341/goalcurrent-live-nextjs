"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import NavLink from "@/components/nav/NavLink";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  MOBILE_BOTTOM_TABS,
  isMobileBottomTabActive,
} from "@/lib/nav";
import styles from "./BottomTabBar.module.css";

const MoreBottomSheet = dynamic(() => import("./MoreBottomSheet"), {
  ssr: false,
});

function HomeIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3 3 10.5V21h6v-6h6v6h6V10.5L12 3Z"
      />
    </svg>
  );
}

function LiveIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 6h16v12H4V6Zm2 2v8h12V8H6Zm2 2h2v4H8v-4Zm4 0h2v4h-2v-4Z"
      />
    </svg>
  );
}

function FavouriteIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z"
      />
    </svg>
  );
}

function PlIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm4 2v3h4V7H7Zm6 0v3h4V7h-4ZM7 14v3h4v-3H7Zm6 0v3h4v-3h-4Z"
      />
    </svg>
  );
}

function Wc26Icon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.93 9H17.1a16.4 16.4 0 0 0-1.2-5.02A8.03 8.03 0 0 1 19.93 11ZM12 4c.95 1.2 1.66 2.86 1.93 5H10.07C10.34 6.86 11.05 5.2 12 4Z"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
      />
    </svg>
  );
}

function TabIcon({ tabId }: { tabId: string }) {
  switch (tabId) {
    case "home":
      return <HomeIcon />;
    case "live":
      return <LiveIcon />;
    case "favourites":
      return <FavouriteIcon />;
    case "pl":
      return <PlIcon />;
    case "articles":
      return <Wc26Icon />;
    default:
      return null;
  }
}

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [moreOpen, setMoreOpen] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setNavReady(true);
  }, []);

  const handleTabNavigate = useCallback(
    (href: (typeof MOBILE_BOTTOM_TABS)[number]["href"]) =>
      (event: MouseEvent<HTMLAnchorElement>) => {
        if (!navReady) {
          return;
        }
        event.preventDefault();
        router.push(href);
      },
    [navReady, router],
  );

  return (
    <>
      <nav
        className={styles.bar}
        aria-label="Mobile bottom navigation"
        data-gc-chrome="mobile-tab-bar"
      >
        {MOBILE_BOTTOM_TABS.map((tab) => {
          const active = isMobileBottomTabActive(pathname, tab);
          return (
            <NavLink
              key={tab.id}
              href={tab.href}
              className={`${styles.tabLink} ${active ? styles.tabLinkActive : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={handleTabNavigate(tab.href)}
            >
              <span className={styles.iconWrap}>
                <TabIcon tabId={tab.id} />
              </span>
              <span className={styles.tabLabel}>{t(tab.labelKey)}</span>
            </NavLink>
          );
        })}

        <button
          ref={moreTriggerRef}
          type="button"
          className={`${styles.tabButton} ${moreOpen ? styles.tabButtonActive : ""}`}
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
          aria-controls="gc-more-sheet"
          aria-label={t("openMoreNavigation")}
          onClick={() => setMoreOpen(true)}
        >
          <span className={styles.iconWrap}>
            <MoreIcon />
          </span>
          <span className={styles.tabLabel}>{t("more")}</span>
        </button>
      </nav>

      {moreOpen ? (
        <MoreBottomSheet
          open={moreOpen}
          onClose={() => setMoreOpen(false)}
          returnFocusRef={moreTriggerRef}
        />
      ) : null}
    </>
  );
}
