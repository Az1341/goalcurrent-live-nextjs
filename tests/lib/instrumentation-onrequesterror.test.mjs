import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const mod = pathToFileURL(join(root, "src/instrumentation.ts")).href;

test("extractLocaleFromPath reads locale from Next onRequestError path", async () => {
  const { extractLocaleFromPath } = await import(mod);
  assert.equal(extractLocaleFromPath("/en/match/123"), "en");
  assert.equal(extractLocaleFromPath("/es/match/123"), "es");
  assert.equal(extractLocaleFromPath("/match/123"), null);
  assert.equal(extractLocaleFromPath("/"), null);
});

test("legacy Fetch Request assumption throws Invalid URL on Next request shape", () => {
  const request = {
    path: "/en/match/12345",
    method: "GET",
    headers: { "user-agent": "task-fix1" },
  };
  assert.throws(() => new URL(request.url), /Invalid URL/);
});

test("onRequestError accepts Next path/method/headers descriptor without throwing", async () => {
  const { onRequestError } = await import(mod);
  const boom = new Error("Cannot read properties of null (reading 'trim')");
  assert.doesNotThrow(() => {
    onRequestError(
      boom,
      {
        path: "/en/match/12345",
        method: "GET",
        headers: { "user-agent": "task-fix1", accept: "text/html" },
      },
      {
        routerKind: "App Router",
        routePath: "/[locale]/match/[fixtureId]",
        routeType: "render",
        revalidateReason: undefined,
      },
    );
  });
});