"use client";

import { useCallback, useSyncExternalStore } from "react";
import PastelSidebar from "./nav/PastelSidebar";
import PastelTopNav from "./nav/PastelTopNav";
import PastelBottomTabs from "./nav/PastelBottomTabs";
import PastelLiveMatches from "./home/PastelLiveMatches";
import PastelDailyDigest from "./home/PastelDailyDigest";
import type { PastelTheme } from "./PastelThemeToggle";
import styles from "./pastel.module.css";

const STORAGE_KEY = "gc-pastel-preview-theme";

let pastelThemeSnapshot: PastelTheme = "dark";
let pastelThemeHydrated = false;
const pastelThemeListeners = new Set<() => void>();

function emitPastelTheme() {
  for (const listener of pastelThemeListeners) {
    listener();
  }
}

function readStoredPastelTheme(): PastelTheme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function systemPastelTheme(): PastelTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function hydratePastelThemeSnapshot() {
  if (pastelThemeHydrated || typeof window === "undefined") {
    return;
  }
  pastelThemeSnapshot = readStoredPastelTheme() ?? systemPastelTheme();
  pastelThemeHydrated = true;
}

function subscribePastelTheme(listener: () => void) {
  pastelThemeListeners.add(listener);
  return () => {
    pastelThemeListeners.delete(listener);
  };
}

function getPastelThemeSnapshot(): PastelTheme {
  hydratePastelThemeSnapshot();
  return pastelThemeSnapshot;
}

function getPastelThemeServerSnapshot(): PastelTheme {
  return "dark";
}

function persistPastelTheme(mode: PastelTheme) {
  pastelThemeSnapshot = mode;
  pastelThemeHydrated = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore quota / private mode */
  }
  emitPastelTheme();
}

/**
 * Isolated Pastel Pulse Match Center preview shell.
 * Covers production chrome via fixed viewport overlay - does not edit layout/*.
 */
export default function PastelMatchCenter() {
  const theme = useSyncExternalStore(
    subscribePastelTheme,
    getPastelThemeSnapshot,
    getPastelThemeServerSnapshot,
  );

  const toggle = useCallback(() => {
    persistPastelTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return (
    <div
      className={styles.shell}
      data-pastel-preview
      data-pastel-theme={theme}
    >
      <PastelTopNav theme={theme} onToggleTheme={toggle} />
      <div className={styles.shellRow}>
        <PastelSidebar />
        <main className={styles.main}>
          <p className={styles.previewBanner}>
            Private design preview - Pastel Pulse Match Center. Not production
            navigation.
          </p>
          <PastelLiveMatches />
          <PastelDailyDigest />
        </main>
      </div>
      <PastelBottomTabs />
    </div>
  );
}
