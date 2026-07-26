import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("locale not-found exports robots noindex and remains a not-found page", () => {
  const raw = readFileSync(
    join(root, "src/app/[locale]/not-found.tsx"),
    "utf8",
  );
  assert.match(raw, /export const metadata/);
  assert.match(raw, /index:\s*false/);
  assert.match(raw, /follow:\s*false/);
  assert.doesNotMatch(raw, /redirect\(/);
  assert.match(raw, /errors\.notFound/);
});