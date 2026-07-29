import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const cacheMod = pathToFileURL(join(root, "src/lib/server/cache.ts")).href;

test("BE-005: DEBUG_SECRET Bearer and x-debug-secret authorize", async () => {
  const { authorizeDebugAccess } = await import(cacheMod);
  assert.equal(
    authorizeDebugAccess({
      debugSecret: "debug-only",
      nodeEnv: "production",
      authorizationHeader: "Bearer debug-only",
      debugSecretHeader: null,
    }),
    true,
  );
  assert.equal(
    authorizeDebugAccess({
      debugSecret: "debug-only",
      nodeEnv: "production",
      authorizationHeader: null,
      debugSecretHeader: "debug-only",
    }),
    true,
  );
});

test("BE-005: CRON_SECRET never authorizes debug routes", async () => {
  const { authorizeDebugAccess } = await import(cacheMod);

  assert.equal(
    authorizeDebugAccess({
      debugSecret: undefined,
      nodeEnv: "production",
      authorizationHeader: "Bearer cron-secret",
      debugSecretHeader: null,
    }),
    false,
    "CRON_SECRET must not be an env fallback for debug auth",
  );

  assert.equal(
    authorizeDebugAccess({
      debugSecret: "debug-only",
      nodeEnv: "production",
      authorizationHeader: "Bearer cron-secret",
      debugSecretHeader: null,
    }),
    false,
    "Bearer CRON_SECRET must not authorize when DEBUG_SECRET is set",
  );

  assert.equal(
    authorizeDebugAccess({
      debugSecret: "debug-only",
      nodeEnv: "production",
      authorizationHeader: null,
      debugSecretHeader: "cron-secret",
    }),
    false,
  );
});

test("BE-005: unset DEBUG_SECRET opens only development", async () => {
  const { authorizeDebugAccess } = await import(cacheMod);
  assert.equal(
    authorizeDebugAccess({
      debugSecret: "",
      nodeEnv: "development",
      authorizationHeader: null,
      debugSecretHeader: null,
    }),
    true,
  );
  assert.equal(
    authorizeDebugAccess({
      debugSecret: undefined,
      nodeEnv: "production",
      authorizationHeader: null,
      debugSecretHeader: null,
    }),
    false,
  );
});

test("BE-005: isDebugAuthorized source never reads process.env.CRON_SECRET", async () => {
  const fs = await import("node:fs");
  const raw = fs.readFileSync(join(root, "src/lib/server/cache.ts"), "utf8");
  const fnStart = raw.indexOf("export function authorizeDebugAccess");
  const slice = raw.slice(fnStart);
  assert.match(slice, /process\.env\.DEBUG_SECRET/);
  assert.doesNotMatch(slice, /process\.env\.CRON_SECRET/);
  assert.doesNotMatch(slice, /x-cron-secret/);
});
