/**
 * Small helpers for modal dialog / sheet keyboard patterns (FE-007).
 * No external dependency - used by MoreBottomSheet.
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function isElementVisible(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

/** True when el is under an inert / aria-hidden subtree outside container. */
function isInSuppressedSubtree(el: HTMLElement, container: HTMLElement): boolean {
  let node: HTMLElement | null = el;
  while (node && node !== container) {
    if (node.hasAttribute("inert")) return true;
    if (node.getAttribute("aria-hidden") === "true") return true;
    node = node.parentElement;
  }
  return false;
}

export function getDialogFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (el) => isElementVisible(el) && !isInSuppressedSubtree(el, container),
  );
}

export function trapTabKey(
  event: KeyboardEvent,
  container: HTMLElement,
): void {
  if (event.key !== "Tab") return;

  const focusables = getDialogFocusableElements(container);
  if (focusables.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (active === first || !container.contains(active)) {
      event.preventDefault();
      last.focus();
    }
    return;
  }

  if (active === last || !container.contains(active)) {
    event.preventDefault();
    first.focus();
  }
}