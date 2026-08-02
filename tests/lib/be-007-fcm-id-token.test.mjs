import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const routeMod = pathToFileURL(
  join(root, "src/app/api/firebase/fcm-token/route.ts"),
).href;
const routePath = join(root, "src/app/api/firebase/fcm-token/route.ts");

test("BE-007: requireFcmIdToken rejects missing and blank tokens", async () => {
  const { requireFcmIdToken } = await import(routeMod);

  const missing = requireFcmIdToken(undefined);
  assert.equal(missing.ok, false);
  if (!missing.ok) {
    assert.equal(missing.response.status, 401);
    const body = await missing.response.json();
    assert.equal(body.error.code, "missing_id_token");
  }

  const blank = requireFcmIdToken("   ");
  assert.equal(blank.ok, false);
  if (!blank.ok) {
    assert.equal(blank.response.status, 401);
  }

  const ok = requireFcmIdToken("firebase-id-token");
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.idToken, "firebase-id-token");
  }
});

test("BE-007: POST without idToken returns 401 before subscribe", async () => {
  const { POST } = await import(routeMod);
  const response = await POST(
    new Request("http://localhost/api/firebase/fcm-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "device-fcm-token", locale: "en" }),
    }),
  );
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, "missing_id_token");
});

test("BE-007: POST with empty idToken is rejected without subscribe", async () => {
  const { POST } = await import(routeMod);
  const response = await POST(
    new Request("http://localhost/api/firebase/fcm-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "device-fcm-token",
        locale: "en",
        idToken: "",
      }),
    }),
  );
  assert.ok([400, 401].includes(response.status));
  const body = await response.json();
  assert.equal(body.ok, false);
});

test("BE-007: route always verifies idToken and never optional-gates subscribe", () => {
  const source = readFileSync(routePath, "utf8");
  assert.match(source, /requireFcmIdToken/);
  assert.match(source, /verifyIdToken\(required\.idToken\)/);
  assert.equal(source.includes("if (idToken) {"), false);
  assert.equal(source.includes("if (uid)"), false);
  assert.match(source, /user-\$\{uid\}/);
});