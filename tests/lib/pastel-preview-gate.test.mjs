import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gateMod = pathToFileURL(
  join(root, "src/lib/pastel/preview-gate.ts"),
).href;

test("pastel preview blocked on Vercel production", async () => {
  const { isPastelPreviewAllowed } = await import(gateMod);
  assert.equal(
    isPastelPreviewAllowed({
      VERCEL_ENV: "production",
      NODE_ENV: "production",
    }),
    false,
  );
});

test("pastel preview allowed on Vercel preview", async () => {
  const { isPastelPreviewAllowed } = await import(gateMod);
  assert.equal(
    isPastelPreviewAllowed({ VERCEL_ENV: "preview", NODE_ENV: "production" }),
    true,
  );
});

test("pastel preview allowed in development", async () => {
  const { isPastelPreviewAllowed } = await import(gateMod);
  assert.equal(isPastelPreviewAllowed({ NODE_ENV: "development" }), true);
});

test("pastel preview blocked on production-like next start without VERCEL_ENV", async () => {
  const { isPastelPreviewAllowed } = await import(gateMod);
  assert.equal(isPastelPreviewAllowed({ NODE_ENV: "production" }), false);
});