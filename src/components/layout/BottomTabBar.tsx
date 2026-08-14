"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import NavLink from "@/components/nav/NavLink";
import { useCallback, useRef, useState, type MouseEvent } from "react";
import { FAVOURITES_HREF } from "@/lib/nav";
import styles from "./BottomTabBar.module.css";

const MoreBottomSheet = dynamic(() => import("./MoreBottomSheet"), { ssr: false });
const MobileCompetitionsSheet = dynamic(() => import("./MobileCompetitionsSheet"), { ssr: false });

function HomeIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 3 10.5V21h6v-6h6v6h6V10.5L12 3Z" /></svg>;
}

function LiveIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 6h16v12H4V6Zm2 2v8h12V8H6Zm2 2h2v4H8v-4Zm4 0h2v4h-2v-4Z" /></svg>;
}

function CompetitionIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h10v3h3v3c0 3.1-2.2 5.7-5.1 6.4A4.9 4.9 0 0 1 13 17.8V20h4v2H7v-2h4v-2.2a4.9 4.9 0 0 1-1.9-2.4C6.2 14.7 4 12.1 4 9V6h3V3Zm0 5H6v1c0 1.7.8 3.2 2.1 4.1A11 11 0 0 1 7 8Zm10 0a11 11 0 0 1-1.1 5.1A5 5 0 0 0 18 9V8h-1Z" /></svg>;
}

function FavouriteIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" /></svg>;
}

function MoreIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></svg>;
}

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const [moreOpen, setMoreOpen] = useState(false);
  const [competitionsOpen, setCompetitionsOpen] = useState(false);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const competitionsTriggerRef = useRef<HTMLButtonElement>(null);

  const handleNavigate = useCallback(
    (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      router.push(href);
    },
    [router],
  );

  const isHome = pathname === "/";
  const isLive = pathname.startsWith("/live");
  const isCompetition = [
    "/premier-league",
    "/worldcup2026",
    "/champions-league",
    "/la-liga",
    "/serie-a",
    "/bundesliga",
    "/fa-cup",
    "/community-shield",
    "/nations-league",
  ].some((prefix) => pathname.startsWith(prefix));
  const isFavourite = pathname.startsWith(FAVOURITES_HREF);

  return (
    <>
      <nav className={styles.bar} aria-label="Mobile bottom navigation" data-gc-chrome="mobile-tab-bar">
        <NavLink href="/" className={`${styles.tabLink} ${isHome ? styles.tabLinkActive : ""}`} aria-current={isHome ? "page" : undefined} onClick={handleNavigate("/")}>
          <span className={styles.iconWrap}><HomeIcon /></span>
          <span className={styles.tabLabel}>{t("home")}</span>
        </NavLink>

        <NavLink href="/live" className={`${styles.tabLink} ${isLive ? styles.tabLinkActive : ""}`} aria-current={isLive ? "page" : undefined} onClick={handleNavigate("/live")}>
          <span className={styles.iconWrap}><LiveIcon /></span>
          <span className={styles.tabLabel}>{t("scores")}</span>
        </NavLink>

        <button
          ref={competitionsTriggerRef}
          type="button"
          className={`${styles.tabButton} ${isCompetition || competitionsOpen ? styles.tabButtonActive : ""}`}
          aria-expanded={competitionsOpen}
          aria-haspopup="dialog"
          aria-controls="gc-mobile-competitions-sheet"
          onClick={() => setCompetitionsOpen(true)}
        >
          <span className={styles.iconWrap}><CompetitionIcon /></span>
          <span className={styles.tabLabel}>{t("competitions")}</span>
        </button>

        <NavLink href={FAVOURITES_HREF} className={`${styles.tabLink} ${isFavourite ? styles.tabLinkActive : ""}`} aria-current={isFavourite ? "page" : undefined} onClick={handleNavigate(FAVOURITES_HREF)}>
          <span className={styles.iconWrap}><FavouriteIcon /></span>
          <span className={styles.tabLabel}>{t("favourites")}</span>
        </NavLink>

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
          <span className={styles.iconWrap}><MoreIcon /></span>
          <span className={styles.tabLabel}>{t("more")}</span>
        </button>
      </nav>

      {competitionsOpen ? (
        <MobileCompetitionsSheet
          open={competitionsOpen}
          onClose={() => setCompetitionsOpen(false)}
          returnFocusRef={competitionsTriggerRef}
        />
      ) : null}

      {moreOpen ? (
        <MoreBottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} returnFocusRef={moreTriggerRef} />
      ) : null}
    </>
  );
}
