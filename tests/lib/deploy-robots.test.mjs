import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const {
  shouldNoIndexDeploy,
  deployRobotsMetadata,
} = await import(pathToFileURL(join(root, "src/lib/seo/deploy-robots.ts")).href);

test("production Vercel remains indexable", () => {
  assert.equal(shouldNoIndexDeploy({ VERCEL_ENV: "production", NODE_ENV: "production" }), false);
  assert.deepEqual(
    deployRobotsMetadata({ VERCEL_ENV: "production", NODE_ENV: "production" }),
    {},
  );
});

test("preview and development deploys are noindex/nofollow", () => {
  assert.equal(shouldNoIndexDeploy({ VERCEL_ENV: "preview" }), true);
  assert.equal(shouldNoIndexDeploy({ VERCEL_ENV: "development" }), true);
  assert.equal(shouldNoIndexDeploy({ NODE_ENV: "development" }), true);
  const meta = deployRobotsMetadata({ VERCEL_ENV: "preview" });
  assert.equal(meta.robots?.index, false);
  assert.equal(meta.robots?.follow, false);
});