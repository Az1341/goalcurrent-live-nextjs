import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const {
  getDialogFocusableElements,
  trapTabKey,
} = await import(pathToFileURL(join(root, "src/lib/a11y/dialog-focus.ts")).href);

describe("dialog-focus helpers (FE-007)", () => {
  it("exports focus-trap helpers", () => {
    assert.equal(typeof getDialogFocusableElements, "function");
    assert.equal(typeof trapTabKey, "function");
  });

  it("ignores non-Tab keys without throwing", () => {
    const container = {
      querySelectorAll: () => [],
      contains: () => false,
      focus: () => {},
    };
    const event = {
      key: "Escape",
      shiftKey: false,
      preventDefault() {
        throw new Error("Escape must not be handled by trapTabKey");
      },
    };
    trapTabKey(/** @type {any} */ (event), /** @type {any} */ (container));
  });
});