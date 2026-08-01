import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const cacheMod = pathToFileURL(join(root, "src/lib/server/cache.ts")).href;

test("RSR-003: missing DEBUG_SECRET rejects in development", async () => {
  const { authorizeDebugAccess } = await import(cacheMod);
  assert.equal(
    authorizeDebugAccess({
      debugSecret: undefined,
      nodeEnv: "development",
      authorizationHeader: null,
      debugSecretHeader: null,
    }),
    false,
  );
  assert.equal(
    authorizeDebugAccess({
      debugSecret: "",
      nodeEnv: "development",
      authorizationHeader: null,
      debugSecretHeader: null,
    }),
    false,
  );
});

test("RSR-003: missing DEBUG_SECRET rejects in preview-equivalent env", async () => {
  const { authorizeDebugAccess } = await import(cacheMod);
  assert.equal(
    authorizeDebugAccess({
      debugSecret: undefined,
      nodeEnv: "preview",
      authorizationHeader: null,
      debugSecretHeader: null,
    }),
    false,
  );
});

test("RSR-003: missing DEBUG_SECRET rejects in production", async () => {
  const { authorizeDebugAccess } = await import(cacheMod);
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

test("RSR-003: configured secret + missing request credential rejects", async () => {
  const { authorizeDebugAccess } = await import(cacheMod);
  assert.equal(
    authorizeDebugAccess({
      debugSecret: "debug-only",
      nodeEnv: "development",
      authorizationHeader: null,
      debugSecretHeader: null,
    }),
    false,
  );
});

test("RSR-003: configured secret + incorrect Bearer rejects", async () => {
  const { authorizeDebugAccess } = await import(cacheMod);
  assert.equal(
    authorizeDebugAccess({
      debugSecret: "debug-only",
      nodeEnv: "production",
      authorizationHeader: "Bearer wrong",
      debugSecretHeader: null,
    }),
    false,
  );
});

test("RSR-003: configured secret + incorrect x-debug-secret rejects", async () => {
  const { authorizeDebugAccess } = await import(cacheMod);
  assert.equal(
    authorizeDebugAccess({
      debugSecret: "debug-only",
      nodeEnv: "production",
      authorizationHeader: null,
      debugSecretHeader: "wrong",
    }),
    false,
  );
});

test("BE-005/RSR-003: correct Bearer and x-debug-secret authorize", async () => {
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

  assert.equal(
    authorizeDebugAccess({
      debugSecret: undefined,
      nodeEnv: "development",
      authorizationHeader: "Bearer cron-secret",
      debugSecretHeader: null,
    }),
    false,
    "CRON Bearer must not open debug when DEBUG_SECRET unset",
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

test("RSR-003: authorizeDebugAccess returns boolean only (no secret echo)", async () => {
  const { authorizeDebugAccess } = await import(cacheMod);
  const result = authorizeDebugAccess({
    debugSecret: "super-secret-value",
    nodeEnv: "production",
    authorizationHeader: "Bearer wrong",
    debugSecretHeader: null,
  });
  assert.equal(typeof result, "boolean");
  assert.equal(result, false);
});

test("RSR-003: this suite only imports the shared auth utility module", async () => {
  const fs = await import("node:fs");
  const raw = fs.readFileSync(
    join(root, "tests/lib/be-005-debug-auth.test.mjs"),
    "utf8",
  );
  assert.doesNotMatch(raw, /api\/pl\//);
  assert.doesNotMatch(raw, /api\/unl\//);
  assert.match(raw, /src\/lib\/server\/cache\.ts/);
});
