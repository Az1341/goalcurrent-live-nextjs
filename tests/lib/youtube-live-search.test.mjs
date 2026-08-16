import test from "node:test";
import assert from "node:assert/strict";

import { isYouTubeLiveSearchEnabled } from "../../src/lib/youtube-videos.ts";

test("YouTube live search is disabled by default", () => {
  assert.equal(isYouTubeLiveSearchEnabled({}), false);
});

test("YouTube live search only enables on explicit true", () => {
  assert.equal(isYouTubeLiveSearchEnabled({ YOUTUBE_LIVE_SEARCH_ENABLED: "true" }), true);
  assert.equal(isYouTubeLiveSearchEnabled({ YOUTUBE_LIVE_SEARCH_ENABLED: " TRUE " }), true);
  assert.equal(isYouTubeLiveSearchEnabled({ YOUTUBE_LIVE_SEARCH_ENABLED: "false" }), false);
  assert.equal(isYouTubeLiveSearchEnabled({ YOUTUBE_LIVE_SEARCH_ENABLED: "1" }), false);
});
