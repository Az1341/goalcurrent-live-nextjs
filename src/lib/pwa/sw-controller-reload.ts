/**
 * Reload once when a new service worker takes control.
 * Guards against reload loops within the same page lifetime.
 */
export function attachServiceWorkerControllerReload(
  sw: Pick<ServiceWorkerContainer, "addEventListener" | "removeEventListener">,
  reload: () => void,
): () => void {
  let refreshing = false;

  const onControllerChange = () => {
    if (refreshing) return;
    refreshing = true;
    reload();
  };

  sw.addEventListener("controllerchange", onControllerChange);
  return () => {
    sw.removeEventListener("controllerchange", onControllerChange);
  };
}