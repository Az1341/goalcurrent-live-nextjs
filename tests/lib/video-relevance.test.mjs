import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { filterRelevantFootballVideos, isRelevantFootballVideo } = await import(
  pathToFileURL(join(root, "src/lib/video-relevance.ts")).href
);

function video(overrides = {}) {
  return {
    videoId: "abc123",
    title: "FIFA World Cup 2026 highlights",
    description: "Football highlights and match analysis",
    publishedAt: "2026-08-16T00:00:00.000Z",
    thumbnail: "https://img.youtube.com/vi/abc123/hqdefault.jpg",
    channelTitle: "FIFA",
    url: "https://www.youtube.com/watch?v=abc123",
    ...overrides,
  };
}

test("World Cup football results are accepted", () => {
  assert.equal(isRelevantFootballVideo(video(), "wc"), true);
});

test("ICC T20 World Cup cricket results are rejected even when title contains World Cup", () => {
  assert.equal(
    isRelevantFootballVideo(
      video({
        title: "ICC Women's T20 World Cup 2026 highlights",
        description: "Cricket wickets and innings",
        channelTitle: "ICC",
      }),
      "wc",
    ),
    false,
  );
});

test("other sports are rejected from Premier League and all-football feeds", () => {
  const basketball = video({
    title: "NBA highlights",
    description: "Basketball finals",
    channelTitle: "NBA",
  });
  assert.equal(isRelevantFootballVideo(basketball, "pl"), false);
  assert.equal(isRelevantFootballVideo(basketball, "all"), false);
});

test("filter retains only relevant football videos", () => {
  const output = filterRelevantFootballVideos(
    [
      video({ videoId: "football-1" }),
      video({
        videoId: "cricket-1",
        title: "World Cup 2026 highlights",
        description: "T20 cricket innings",
        channelTitle: "ICC",
      }),
      video({
        videoId: "football-2",
        title: "World Cup 2026 tactical preview",
        description: "Soccer teams prepare for the tournament",
        channelTitle: "Football Analysis",
      }),
    ],
    "wc",
  );

  assert.deepEqual(
    output.map((item) => item.videoId),
    ["football-1", "football-2"],
  );
});
