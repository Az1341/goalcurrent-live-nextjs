"use client";

import PastelSidebar from "./nav/PastelSidebar";
import PastelTopNav from "./nav/PastelTopNav";
import PastelBottomTabs from "./nav/PastelBottomTabs";
import PastelLiveMatches from "./home/PastelLiveMatches";
import PastelDailyDigest from "./home/PastelDailyDigest";
import styles from "./pastel.module.css";

/**
 * Isolated Pastel Pulse Match Center preview shell.
 * Covers production chrome via fixed viewport overlay - does not edit layout/*.
 */
export default function PastelMatchCenter() {
  return (
    <div className={styles.shell} data-pastel-preview>
      <PastelTopNav />
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
