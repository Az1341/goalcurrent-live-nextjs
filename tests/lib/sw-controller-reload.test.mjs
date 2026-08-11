import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const mod = pathToFileURL(join(root, "src/lib/pwa/sw-controller-reload.ts")).href;

function createFakeSw() {
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

test("controllerchange reloads once and ignores further events", async () => {
  const { attachServiceWorkerControllerReload } = await import(mod);
  const sw = createFakeSw();
  let reloads = 0;

  const detach = attachServiceWorkerControllerReload(sw, () => {
    reloads += 1;
  });

  sw.dispatch("controllerchange");
  sw.dispatch("controllerchange");
  sw.dispatch("controllerchange");

  assert.equal(reloads, 1);
  detach();
  assert.equal(sw.listenerCount("controllerchange"), 0);
});

test("detach prevents reload after listener removed", async () => {
  const { attachServiceWorkerControllerReload } = await import(mod);
  const sw = createFakeSw();
  let reloads = 0;

  const detach = attachServiceWorkerControllerReload(sw, () => {
    reloads += 1;
  });
  detach();
  sw.dispatch("controllerchange");

  assert.equal(reloads, 0);
});