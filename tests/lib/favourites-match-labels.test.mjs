import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
const fav = await import("../../src/lib/favourites.ts");

beforeEach(() => {
  installMemoryStorage();
});

describe("toggleFavouriteMatch persists human-readable labels", () => {
  it("stores a non-WC26 match id and its label on add", () => {
    const added = fav.toggleFavouriteMatch("pl:926270001", "Arsenal vs Coventry");
    assert.equal(added, true);

    const state = fav.readFavourites();
    assert.deepEqual(state.matches, ["pl:926270001"]);
    assert.equal(state.matchLabels["pl:926270001"], "Arsenal vs Coventry");
    assert.equal(
      fav.getFavouriteMatchLabel("pl:926270001"),
      "Arsenal vs Coventry",
    );
  });

  it("ignores empty or whitespace-only labels", () => {
    fav.toggleFavouriteMatch("pl:123", "   ");
    const state = fav.readFavourites();
    assert.deepEqual(state.matches, ["pl:123"]);
    assert.equal(state.matchLabels["pl:123"], undefined);
    assert.equal(fav.getFavouriteMatchLabel("pl:123"), null);
  });

  it("sanitizes control characters and trims the stored label", () => {
    fav.toggleFavouriteMatch("pl:9", "  Hull City\nvs\tManchester United  ");
    assert.equal(
      fav.getFavouriteMatchLabel("pl:9"),
      "Hull City vs Manchester United",
    );
  });

  it("keeps existing callers valid when no label is supplied", () => {
    const added = fav.toggleFavouriteMatch("pl:555");
    assert.equal(added, true);
    const state = fav.readFavourites();
    assert.deepEqual(state.matches, ["pl:555"]);
    assert.deepEqual(state.matchLabels, {});
  });
});

describe("legacy favourites payloads remain valid", () => {
  it("loads old localStorage without matchLabels", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        teams: ["team-bra"],
        matches: ["pl:123"],
        competitions: ["wc26"],
      }),
    );

    const state = fav.readFavourites();
    assert.deepEqual(state.teams, ["team-bra"]);
    assert.deepEqual(state.matches, ["pl:123"]);
    assert.deepEqual(state.competitions, ["wc26"]);
    assert.deepEqual(state.matchLabels, {});
    assert.equal(fav.isMatchFavourited("pl:123"), true);
    assert.equal(fav.isTeamFavourited("team-bra"), true);
  });

  it("does not crash on completely missing lists", () => {
    localStorage.setItem(STORAGE_KEY, "{}");
    const state = fav.readFavourites();
    assert.deepEqual(state.teams, []);
    assert.deepEqual(state.matches, []);
    assert.deepEqual(state.competitions, []);
    assert.deepEqual(state.matchLabels, {});
  });
});

describe("malformed optional metadata is normalized safely", () => {
  it("treats an array matchLabels value as empty", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        teams: [],
        matches: ["pl:123"],
        competitions: [],
        matchLabels: ["not", "an", "object"],
      }),
    );
    const state = fav.readFavourites();
    assert.deepEqual(state.matches, ["pl:123"]);
    assert.deepEqual(state.matchLabels, {});
  });

  it("drops non-string label values and orphaned keys", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        teams: ["team-arg"],
        matches: ["pl:123"],
        competitions: ["wc26"],
        matchLabels: {
          "pl:123": { nested: true },
          "pl:999": "Should be dropped because match is not saved",
          "pl:abc": 42,
        },
      }),
    );
    const state = fav.readFavourites();
    assert.deepEqual(state.teams, ["team-arg"]);
    assert.deepEqual(state.competitions, ["wc26"]);
    assert.deepEqual(state.matches, ["pl:123"]);
    assert.deepEqual(state.matchLabels, {});
  });

  it("invalid JSON fails safely to empty state", () => {
    localStorage.setItem(STORAGE_KEY, "{not-json");
    const state = fav.readFavourites();
    assert.deepEqual(state.teams, []);
    assert.deepEqual(state.matches, []);
    assert.deepEqual(state.competitions, []);
    assert.deepEqual(state.matchLabels, {});
  });
});

describe("removing a match also removes associated metadata", () => {
  it("toggle off deletes the label", () => {
    fav.toggleFavouriteMatch("pl:123", "Arsenal vs Coventry");
    const stillFav = fav.toggleFavouriteMatch("pl:123");
    assert.equal(stillFav, false);

    const state = fav.readFavourites();
    assert.deepEqual(state.matches, []);
    assert.equal(state.matchLabels["pl:123"], undefined);
    assert.equal(fav.getFavouriteMatchLabel("pl:123"), null);
  });

  it("removeFavouriteMatch deletes the label and leaves teams/competitions", () => {
    fav.toggleFavouriteTeam("team-eng");
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...fav.readFavourites(),
        competitions: ["wc26"],
        matches: ["pl:123", "cs:1"],
        matchLabels: {
          "pl:123": "Arsenal vs Coventry",
          "cs:1": "Arsenal vs Manchester City",
        },
      }),
    );

    fav.removeFavouriteMatch("pl:123");
    const state = fav.readFavourites();
    assert.ok(state.teams.includes("team-eng"));
    assert.deepEqual(state.competitions, ["wc26"]);
    assert.deepEqual(state.matches, ["cs:1"]);
    assert.equal(state.matchLabels["pl:123"], undefined);
    assert.equal(state.matchLabels["cs:1"], "Arsenal vs Manchester City");
  });
});

describe("FavouriteMatchButton wires the existing label into persistence", () => {
  it("passes label as the second argument to toggleFavouriteMatch", () => {
    const source = readFileSync(
      join(root, "src/components/FavouriteButton.tsx"),
      "utf8",
    );
    assert.match(source, /toggleFavouriteMatch\(\s*matchId\s*,\s*label\s*\)/);
  });
});

describe("Favourites page uses saved label instead of raw match id", () => {
  it("does not render savedMatch with the raw id when a label exists", () => {
    const source = readFileSync(
      join(root, "src/components/favourites/FavouritesPageContent.tsx"),
      "utf8",
    );
    assert.match(source, /matchLabels/);
    assert.match(source, /data-gc-fav-match-label/);
    assert.doesNotMatch(
      source,
      /savedMatch[\s\S]{0,40}\{ matchId \}/,
    );
  });
});