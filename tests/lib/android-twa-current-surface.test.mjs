import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("legacy Android TWA is intercepted server-side before WC26 renders", () => {
  const proxy = readFileSync(join(root, "src/proxy.ts"), "utf8");
  assert.match(proxy, /android-app:\/\/com\.goalcurrent\.app/);
  assert.match(proxy, /gc_android_twa_current/);
  assert.match(proxy, /LEGACY_ANDROID_TWA_WC26_PATH/);
  assert.match(proxy, /NextResponse\.redirect\(url, 307\)/);
  assert.match(proxy, /url\.pathname = "\/"/);
  assert.match(proxy, /Cache-Control", "no-store"/);
});
