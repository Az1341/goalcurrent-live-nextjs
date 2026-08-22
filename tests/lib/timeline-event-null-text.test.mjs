import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const mod = pathToFileURL(join(root, "src/components/match/timeline-event-badge.ts")).href;
const { resolveTimelineEventDisplay, resolveEventSide } = await import(mod);

test("archived provider event with null text cannot crash match rendering", () => {
  const display = resolveTimelineEventDisplay({
    minute: 64,
    extra: null,
    teamName: null,
    playerName: null,
    assistName: null,
    type: null,
    detail: null,
  });

  assert.equal(display.title, "Event");
  assert.equal(display.playerName, null);
  assert.equal(display.teamName, "");
  assert.equal(display.minute, "64'");
});

test("null event team degrades to neutral rather than throwing", () => {
  assert.equal(resolveEventSide(null, "Team A", "Team B"), "neutral");
});
