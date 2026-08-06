import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const schemaMod = pathToFileURL(join(root, "src/lib/seo/schema.ts")).href;

test("rankingListSchema maps standings fields without inventing metrics", async () => {
  const { rankingListSchema } = await import(schemaMod);

  const schema = rankingListSchema({
    path: "/premier-league/table",
    name: "Premier League Table 2026/27",
    locale: "en",
    itemType: "SportsTeam",
    competitionName: "Premier League",
    items: [
      {
        position: 1,
        name: "Arsenal",
        metricName: "points",
        metricValue: 10,
        played: 4,
      },
    ],
  });

  assert.equal(schema["@type"], "ItemList");
  assert.equal(schema.numberOfItems, 1);
  assert.equal(schema.itemListElement[0].position, 1);
  assert.equal(schema.itemListElement[0].item["@type"], "SportsTeam");
  assert.equal(schema.itemListElement[0].item.name, "Arsenal");
  assert.deepEqual(schema.itemListElement[0].item.additionalProperty, [
    { "@type": "PropertyValue", name: "points", value: 10 },
    { "@type": "PropertyValue", name: "played", value: 4 },
  ]);
});

test("rankingListSchema returns null for empty lists", async () => {
  const { rankingListSchema } = await import(schemaMod);
  assert.equal(
    rankingListSchema({
      path: "/premier-league/table",
      name: "Premier League Table 2026/27",
      itemType: "SportsTeam",
      items: [],
    }),
    null,
  );
});

test("rankingListSchema supports Person leaderboard shape", async () => {
  const { rankingListSchema } = await import(schemaMod);
  const schema = rankingListSchema({
    path: "/premier-league/statistics",
    name: "Premier League Top Scorers",
    itemType: "Person",
    items: [
      {
        position: 1,
        name: "Erling Haaland",
        teamName: "Manchester City",
        metricName: "goals",
        metricValue: 12,
      },
    ],
  });

  assert.equal(schema.itemListElement[0].item["@type"], "Person");
  assert.equal(schema.itemListElement[0].item.memberOf.name, "Manchester City");
});