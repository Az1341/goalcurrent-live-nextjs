import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import test from "node:test";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("homepage current surfaces do not promote World Cup 2026", async () => {
  const [homePage, homeTeams, header, footer] = await Promise.all([
    read("src/app/[locale]/page.tsx"),
    read("src/components/home/v5/HomeTeamsLeagues.tsx"),
    read("src/components/layout/MasterHeader.tsx"),
    read("src/components/layout/MasterFooter.tsx"),
  ]);

  assert.doesNotMatch(homePage, /World Cup 2026/i);
  assert.doesNotMatch(homeTeams, /World Cup 2026|\/worldcup2026/i);
  assert.doesNotMatch(header, /href="\/worldcup2026"/i);
  assert.match(footer, /CURRENT_PLATFORM_LINKS/);
  assert.match(footer, /!link\.href\.startsWith\("\/worldcup2026"\)/);
});

test("global layout cannot show WC26 celebrations outside the archive", async () => {
  const layout = await read("src/app/[locale]/layout.tsx");

  assert.doesNotMatch(layout, /FinalWinnerCelebration|components\/wc26/i);
  await assert.rejects(
    access(
      new URL(
        "../../src/components/wc26/FinalWinnerCelebration.tsx",
        import.meta.url,
      ),
      constants.F_OK,
    ),
  );
});

test("About describes WC26 only as generic historical archive, not current coverage", async () => {
  const about = await read("src/app/[locale]/about/page.tsx");

  assert.doesNotMatch(about, /World Cup 2026|WC 2026|72 World Cup|48 World Cup/i);
  assert.match(about, /Historical Coverage/);
  assert.match(about, /historical archive/i);
});

test("WC26 archive routes remain preserved", async () => {
  const archive = await read("src/app/[locale]/worldcup2026/page.tsx");
  assert.match(archive, /World Cup 2026 Archive/);
  assert.match(archive, /historical archive/i);
});
