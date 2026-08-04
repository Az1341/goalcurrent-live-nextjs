"use client";

import { useEffect, useState } from "react";
import PastelSidebar from "./nav/PastelSidebar";
import PastelTopNav from "./nav/PastelTopNav";
import PastelBottomTabs from "./nav/PastelBottomTabs";
import PastelLiveMatches from "./home/PastelLiveMatches";
import PastelDailyDigest from "./home/PastelDailyDigest";
import type { PastelTheme } from "./PastelThemeToggle";
import styles from "./pastel.module.css";

const STORAGE_KEY = "gc-pastel-preview-theme";

function getSystemPastelTheme(): PastelTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStored(): PastelTheme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Isolated Pastel Pulse Match Center preview shell.
 * Covers production chrome via fixed viewport overlay - does not edit layout/*.
 */
export default function PastelMatchCenter() {
  const [theme, setTheme] = useState<PastelTheme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStored();
    setTheme(stored ?? getSystemPastelTheme());
    setReady(true);
  }, []);

  const setAndPersist = (mode: PastelTheme) => {
    setTheme(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore quota / private mode */
    }
  };

  const toggle = () => setAndPersist(theme === "dark" ? "light" : "dark");

  return (
    <div
      className={styles.shell}
      data-pastel-preview
      {...(ready ? { "data-pastel-theme": theme } : {})}
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
