import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const STORAGE_KEY = "gc_favourites";

function installMemoryStorage() {
  const store = new Map();
  const localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
  globalThis.localStorage = localStorage;
  const CustomEventImpl =
    globalThis.CustomEvent ??
    class CustomEvent {
      constructor(type) {
        this.type = type;
      }
    };
  globalThis.window = Object.assign(globalThis.window ?? globalThis, {
    localStorage,
    CustomEvent: CustomEventImpl,
    dispatchEvent() {
      return true;
    },
  });
}

installMemoryStorage();
const favouritesHref = pathToFileURL(join(root, "src/lib/favourites.ts")).href;
const fav = await import(favouritesHref);

beforeEach(() => {
  installMemoryStorage();
});

describe("favourite match labels", () => {
  it("stores a readable label beside a Premier League match id", () => {
    assert.equal(
      fav.toggleFavouriteMatch("pl:1557367", "Arsenal vs Coventry"),
      true,
    );
    const state = fav.readFavourites();
    assert.deepEqual(state.matches, ["pl:1557367"]);
    assert.equal(state.matchLabels["pl:1557367"], "Arsenal vs Coventry");
  });

  it("keeps legacy localStorage payloads compatible", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        teams: ["team-bra"],
        matches: ["pl:123"],
        competitions: ["wc26"],
      }),
    );
    const state = fav.readFavourites();
    assert.deepEqual(state.matches, ["pl:123"]);
    assert.deepEqual(state.matchLabels, {});
  });

  it("drops malformed and orphaned label metadata", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        teams: [],
        matches: ["pl:123"],
        competitions: [],
        matchLabels: {
          "pl:123": 42,
          "pl:999": "orphan",
        },
      }),
    );
    assert.deepEqual(fav.readFavourites().matchLabels, {});
  });

  it("sanitizes control characters and excessive whitespace", () => {
    fav.toggleFavouriteMatch("pl:9", "  Hull City\nvs\tManchester United  ");
    assert.equal(
      fav.getFavouriteMatchLabel("pl:9"),
      "Hull City vs Manchester United",
    );
  });

  it("removes associated label metadata when unfavourited", () => {
    fav.toggleFavouriteMatch("pl:123", "Arsenal vs Coventry");
    assert.equal(fav.toggleFavouriteMatch("pl:123"), false);
    const state = fav.readFavourites();
    assert.deepEqual(state.matches, []);
    assert.deepEqual(state.matchLabels, {});
  });
});

describe("favourites UI wiring", () => {
  it("passes the existing match label into persistence", () => {
    const source = readFileSync(
      join(root, "src/components/FavouriteButton.tsx"),
      "utf8",
    );
    assert.match(source, /toggleFavouriteMatch\(\s*matchId\s*,\s*label\s*\)/);
  });

  it("renders saved label metadata instead of a raw saved match id", () => {
    const source = readFileSync(
      join(root, "src/components/favourites/FavouritesPageContent.tsx"),
      "utf8",
    );
    assert.match(source, /matchLabels/);
    assert.match(source, /data-gc-fav-match-label/);
    assert.doesNotMatch(source, /savedMatch[\s\S]{0,40}\{ matchId \}/);
  });
});
