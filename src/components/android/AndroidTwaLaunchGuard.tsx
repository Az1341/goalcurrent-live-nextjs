"use client";

import { useEffect } from "react";

/**
 * Compatibility bridge for the currently published Android TWA.
 *
 * The installed com.goalcurrent.app package can still launch the historical
 * /worldcup2026 URL. Website visitors must retain access to that archive, but
 * an Android standalone/TWA launch should enter the current GoalCurrent home.
 */
export default function AndroidTwaLaunchGuard() {
  useEffect(() => {
    const isArchiveHub = /^\/(?:[a-z]{2}\/)?worldcup2026\/?$/i.test(
      window.location.pathname,
    );
    if (!isArchiveHub) return;

    const isAndroid = /Android/i.test(window.navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isGoalCurrentTwa = document.referrer.startsWith(
      "android-app://com.goalcurrent.app",
    );

    if (isGoalCurrentTwa || (isAndroid && isStandalone)) {
      window.location.replace("/");
    }
  }, []);

  return null;
}
