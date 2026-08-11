import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const mod = pathToFileURL(join(root, "src/lib/pwa/sw-foreground-update.ts")).href;

function createFakeTarget() {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();
  return {
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(handler);
    },
    removeEventListener(type, handler) {
      listeners.get(type)?.delete(handler);
    },
    dispatch(type) {
      for (const handler of listeners.get(type) ?? []) {
        handler();
      }
    },
    listenerCount(type) {
      return listeners.get(type)?.size ?? 0;
    },
  };
}

test("visibilitychange visible and focus call registration.update", async () => {
  const { attachServiceWorkerForegroundUpdate } = await import(mod);
  const documentTarget = createFakeTarget();
  const windowTarget = createFakeTarget();
  let visibilityState = "hidden";
  let updates = 0;

  const detach = attachServiceWorkerForegroundUpdate(
    {
      update: async () => {
        updates += 1;
      },
    },
    {
      document: {
        ...documentTarget,
        get visibilityState() {
          return visibilityState;
        },
      },
      window: windowTarget,
    },
  );

  documentTarget.dispatch("visibilitychange");
  assert.equal(updates, 0, "hidden should not update");

  visibilityState = "visible";
  documentTarget.dispatch("visibilitychange");
  assert.equal(updates, 1);

  windowTarget.dispatch("focus");
  assert.equal(updates, 2);

  detach();
  assert.equal(documentTarget.listenerCount("visibilitychange"), 0);
  assert.equal(windowTarget.listenerCount("focus"), 0);

  documentTarget.dispatch("visibilitychange");
  windowTarget.dispatch("focus");
  assert.equal(updates, 2);
});

test("update rejection is swallowed", async () => {
  const { attachServiceWorkerForegroundUpdate } = await import(mod);
  const documentTarget = createFakeTarget();
  const windowTarget = createFakeTarget();

  attachServiceWorkerForegroundUpdate(
    {
      update: async () => {
        throw new Error("network");
      },
    },
    {
      document: {
        ...documentTarget,
        visibilityState: "visible",
      },
      window: windowTarget,
    },
  );

  documentTarget.dispatch("visibilitychange");
  windowTarget.dispatch("focus");
});