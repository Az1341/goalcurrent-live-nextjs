import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const imagesMod = pathToFileURL(join(root, "src/lib/images.ts")).href;
const rssMod = pathToFileURL(join(root, "src/utils/rss/parse.ts")).href;

test("upgradeRemoteNewsImageUrl bumps Guardian width=140 thumbs", async () => {
  const { NEWS_IMAGE_TARGET_WIDTH, upgradeRemoteNewsImageUrl } =
    await import(imagesMod);
  const input =
    "https://" +
    "i.guim.co.uk/img/media/example.jpg?width=140&amp;quality=85&amp;auto=format&amp;fit=max&amp;s=abc";
  const out = upgradeRemoteNewsImageUrl(input);
  assert.match(out, new RegExp("width=" + NEWS_IMAGE_TARGET_WIDTH));
  assert.doesNotMatch(out, /width=140/);
  assert.doesNotMatch(out, /&amp;/);
});

test("upgradeRemoteNewsImageUrl bumps BBC ace/standard/240 paths", async () => {
  const { upgradeRemoteNewsImageUrl } = await import(imagesMod);
  const input =
    "https://" + "ichef.bbci.co.uk/ace/standard/240/cpsprodpb/live/example.jpg";
  const out = upgradeRemoteNewsImageUrl(input);
  assert.match(out, /\/ace\/standard\/976\//);
});

test("upgradeRemoteNewsImageUrl bumps BBC ic/240x135 paths", async () => {
  const { upgradeRemoteNewsImageUrl } = await import(imagesMod);
  const input = "https://" + "ichef.bbci.co.uk/images/ic/240x135/p0p25nb2.jpg";
  const out = upgradeRemoteNewsImageUrl(input);
  assert.match(out, /\/images\/ic\/976x549\//);
});

test("parseRssItemXml prefers larger media:content over tiny thumbnail", async () => {
  const { parseRssItemXml } = await import(rssMod);
  const thumb =
    "https://" +
    "i.guim.co.uk/img/media/example.jpg?width=140&amp;quality=85&amp;auto=format&amp;fit=max&amp;s=abc";
  const large = thumb.replace("width=140", "width=1000");
  const itemXml = [
    "<item>",
    "  <title>World Cup 2026 live</title>",
    "  <link>https://" + "www.theguardian.com/football/live/example</link>",
    "  <description>Latest</description>",
    '  <media:thumbnail width="140" url="' + thumb + '"/>',
    '  <media:content width="1000" url="' + large + '"/>',
    "</item>",
  ].join("\n");
  const parsed = parseRssItemXml(itemXml);
  assert.ok(parsed);
  assert.match(parsed.thumbnail ?? "", /width=1000/);
});
