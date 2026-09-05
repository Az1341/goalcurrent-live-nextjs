import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { canonicalHostRedirectUrl, removedLocaleRedirectPath } = await import(
  pathToFileURL(join(root, "src/lib/seo/canonical-host.ts")).href
);

test("www GoalCurrent URLs consolidate to the canonical apex and preserve path/query", () => {
  const input = new URL("http://www.goalcurrent.live/premier-league/fixtures?week=1");
  const redirected = canonicalHostRedirectUrl(input);

  assert.equal(
    redirected?.toString(),
    "https://goalcurrent.live/premier-league/fixtures?week=1",
  );
});

test("canonical, preview and localhost hosts are not redirected", () => {
  assert.equal(canonicalHostRedirectUrl(new URL("https://goalcurrent.live/live")), null);
  assert.equal(
    canonicalHostRedirectUrl(
      new URL("https://goalcurrent-git-example.vercel.app/live"),
    ),
    null,
  );
  assert.equal(canonicalHostRedirectUrl(new URL("http://localhost:3000/live")), null);
});

test("retired Arabic and Persian locale prefixes consolidate to English routes", () => {
  assert.equal(removedLocaleRedirectPath("/ar/articles"), "/articles");
  assert.equal(removedLocaleRedirectPath("/fa/premier-league/table"), "/premier-league/table");
  assert.equal(removedLocaleRedirectPath("/ar"), "/");
  assert.equal(removedLocaleRedirectPath("/fa/"), "/");
});

test("supported locales and unrelated paths are unchanged", () => {
  assert.equal(removedLocaleRedirectPath("/de/news"), null);
  assert.equal(removedLocaleRedirectPath("/premier-league"), null);
  assert.equal(removedLocaleRedirectPath("/article/fa-cup"), null);
});
