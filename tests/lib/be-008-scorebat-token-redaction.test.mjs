/* eslint-disable security/detect-non-literal-fs-filename -- static in-repo path fixtures for BE-008 source contract */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const requestMod = pathToFileURL(join(root, "src/lib/scorebat/request.ts")).href;

test("BE-008: redactScoreBatUrl strips query tokens from fixtures/logs", async () => {
  const { buildScoreBatFeedUrl, redactScoreBatUrl } = await import(requestMod);
  const secret = "scorebat-secret-token-value";
  const url = buildScoreBatFeedUrl(secret);
  assert.match(url, /token=/);
  assert.match(url, new RegExp(secret));

  const redacted = redactScoreBatUrl(url);
  assert.equal(redacted.includes(secret), false);
  assert.match(redacted, /token=%5BREDACTED%5D|token=\[REDACTED\]/);

  const malformed = "https://www.scorebat.com/video-api/v3/feed/?token=abc123&x=1";
  assert.equal(redactScoreBatUrl(malformed).includes("abc123"), false);
});

test("BE-008: callers use fetchScoreBatFeed and do not inline token query URLs", () => {
  const requestSrc = readFileSync(join(root, "src/lib/scorebat/request.ts"), "utf8");
  assert.match(requestSrc, /redactScoreBatUrl\(url\)/);
  assert.match(requestSrc, /console\.error/);

  const callers = [
    ["getScoreBatEmbed.ts", join(root, "src/lib/scorebat/getScoreBatEmbed.ts")],
    ["videos.ts", join(root, "src/content/videos.ts")],
  ];

  for (const [label, path] of callers) {
    const src = readFileSync(path, "utf8");
    assert.match(src, /fetchScoreBatFeed/, label);
    assert.equal(src.includes("?token="), false, `${label} must not inline ?token=`);
    assert.equal(
      /SCOREBAT_API_TOKEN/.test(src),
      false,
      `${label} must not read SCOREBAT_API_TOKEN directly`,
    );
  }
});

test("BE-008: credential-like tokens never appear in redacted fixtures", async () => {
  const { redactScoreBatUrl } = await import(requestMod);
  const samples = [
    "https://www.scorebat.com/video-api/v3/feed/?token=sk_live_abcdef",
    "https://www.scorebat.com/video-api/v3/feed/?token=Bearer%20secret-token",
    "not-a-url?token=plain-secret",
  ];
  for (const sample of samples) {
    const out = redactScoreBatUrl(sample);
    assert.equal(out.includes("sk_live_abcdef"), false);
    assert.equal(out.includes("secret-token"), false);
    assert.equal(out.includes("plain-secret"), false);
    assert.match(out, /\[REDACTED\]|%5BREDACTED%5D/);
  }
});
