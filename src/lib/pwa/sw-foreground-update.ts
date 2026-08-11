/**
 * Check for a service worker update when the app returns to the foreground.
 * Complements the browser's default ~24h update interval for PWAs that stay open.
 */
export function attachServiceWorkerForegroundUpdate(
  registration: { update: () => Promise<unknown> },
  deps: {
    document: Pick<
      Document,
      "addEventListener" | "removeEventListener" | "visibilityState"
    >;
    window: Pick<Window, "addEventListener" | "removeEventListener">;
  },
): () => void {
  const checkForUpdate = () => {
    void registration.update().catch(() => {});
  };

  const onVisibilityChange = () => {
    if (deps.document.visibilityState !== "visible") return;
    checkForUpdate();
  };

  deps.document.addEventListener("visibilitychange", onVisibilityChange);
  deps.window.addEventListener("focus", checkForUpdate);

  return () => {
    deps.document.removeEventListener("visibilitychange", onVisibilityChange);
    deps.window.removeEventListener("focus", checkForUpdate);
  };
}