import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("in-memory rate-limit buckets", async () => {
  const { checkRateLimit } = await import("../../src/lib/server/cache.ts");

  it("general API traffic does not consume the football-provider bucket", () => {
    const ip = `test-general-${Date.now()}-${Math.random()}`;

    for (let i = 0; i < 40; i += 1) {
      assert.deepEqual(checkRateLimit(ip, "/api/news"), { allowed: true });
    }

    for (let i = 0; i < 30; i += 1) {
      assert.deepEqual(checkRateLimit(ip, "/api/pl/fixtures"), { allowed: true });
    }

    const blocked = checkRateLimit(ip, "/api/pl/fixtures");
    assert.equal(blocked.allowed, false);
  });

  it("all football-provider routes share the upstream bucket consistently", () => {
    const ip = `test-upstream-${Date.now()}-${Math.random()}`;
    const paths = [
      "/api/pl/fixtures",
      "/api/ucl/fixtures",
      "/api/facup/fixtures",
      "/api/unl/fixtures",
      "/api/wc26/scores",
    ];

    for (let i = 0; i < 30; i += 1) {
      assert.deepEqual(checkRateLimit(ip, paths[i % paths.length]), { allowed: true });
    }

    const blocked = checkRateLimit(ip, "/api/ucl/fixtures");
    assert.equal(blocked.allowed, false);
  });
});
