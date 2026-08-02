import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("FE-009: useNewsFeed is the single SWR owner of /api/news", () => {
  const hook = readFileSync(join(root, "src/lib/use-news-feed.ts"), "utf8");
  assert.match(hook, /useSWR/);
  assert.match(hook, /NEWS_API_PATH\s*=\s*["']\/api\/news["']/);
  assert.doesNotMatch(
    hook,
    /useSyncExternalStore|setInterval|subscriberCount/,
    "legacy module-store poller must be removed",
  );
});

test("FE-009: NewsHub does not own a second /api/news SWR stack", () => {
  const hub = readFileSync(
    join(root, "src/components/news/NewsHub.tsx"),
    "utf8",
  );
  assert.match(hub, /useNewsFeed/);
  assert.doesNotMatch(hub, /useSWR/);
  assert.doesNotMatch(hub, /["']\/api\/news["']/);
});

test("FE-009: one owner per news route surface", () => {
  const home = readFileSync(
    join(root, "src/components/home/v5/HomeLatestNews.tsx"),
    "utf8",
  );
  const profile = readFileSync(
    join(root, "src/components/team-profile/ProfileNewsSection.tsx"),
    "utf8",
  );
  const group = readFileSync(
    join(root, "src/components/wc26/GroupHubContent.tsx"),
    "utf8",
  );
  const news = readFileSync(
    join(root, "src/components/news/NewsHub.tsx"),
    "utf8",
  );

  assert.match(home, /useNewsFeed/);
  assert.doesNotMatch(home, /useSWR/);
  assert.match(profile, /useNewsFeed/);
  assert.doesNotMatch(profile, /useSWR/);
  assert.match(group, /useNewsFeed/);
  assert.doesNotMatch(group, /useSWR/);
  assert.match(news, /useNewsFeed/);
  assert.doesNotMatch(news, /useSWR/);
});
