import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("ssotFixturesResponse is exported and wraps SSOT via baseFixturesResponse", () => {
  const api = readFileSync(join(root, "src/lib/pl/api.ts"), "utf8");

  assert.match(api, /export\s+function\s+ssotFixturesResponse\s*\(/);
  assert.match(api, /:\s*PlFixturesApiResponse/);
  assert.match(
    api,
    /ssotFixturesResponse\([\s\S]*?locale\s*=\s*["']en-GB["']/,
  );
  assert.match(
    api,
    /export\s+function\s+ssotFixturesResponse[\s\S]*?return\s+baseFixturesResponse\(\s*["']fallback["']\s*,\s*\{[\s\S]*?fixtures:\s*getPlSsotFixtures\(\s*locale\s*\)/,
  );
});

test("homepage reuses ssotFixturesResponse and does not reconstruct PL API shape", () => {
  const page = readFileSync(join(root, "src/app/[locale]/page.tsx"), "utf8");

  assert.match(page, /ssotFixturesResponse/);
  assert.match(page, /from\s*["']@\/lib\/pl\/api["']/);
  assert.doesNotMatch(page, /baseFixturesResponse/);
  assert.doesNotMatch(page, /getPlSsotFixtures\s*\(/);
  assert.doesNotMatch(page, /fetchPlFixtures\s*\(/);
  assert.doesNotMatch(page, /source:\s*["']fallback["']/);
  assert.doesNotMatch(page, /fixtures:\s*getPlSsotFixtures/);
});