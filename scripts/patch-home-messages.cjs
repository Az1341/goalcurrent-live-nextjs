const fs = require("fs");
const path = require("path");

const dir = path.join(process.cwd(), "messages");
const locales = ["en", "es", "it", "de", "fr", "nl"];

const homeByLocale = {
  en: {
    subtitle:
      "Live results, fixtures and news from {siteName} — World Cup 2026 is the lead competition.",
    matchDetails: "Match details",
    allFixtures: "All fixtures",
    noFixturesLoaded: "No World Cup fixtures loaded.",
    latestResults: "Latest Results",
    viewAllResults: "View All Results",
    noRecentResults: "No recent full-time results.",
    upcomingFixtures: "Upcoming Fixtures",
    viewAllFixtures: "View All Fixtures",
    noUpcomingFixtures: "No upcoming fixtures scheduled.",
    wc26Title: "World Cup 2026",
    viewAll: "View All",
    wc26Summary:
      "USA · Mexico · Canada · 11 Jun – 19 Jul 2026 · {gamesPlayed} played · {gamesLeft} remaining",
    featuredMatch: "Featured match",
    liveNow: "Live Now",
    viewAllLive: "View All Live Matches",
    noLiveMatches: "No live matches right now.",
  },
};

const favByLocale = {
  en: {
    stripTitle: "Your Favourites",
    manage: "Manage",
    emptyStripLead: "Star a match or team to see them here. Browse",
    liveScores: "live scores",
    worldCupTeams: "World Cup teams",
    or: "or",
  },
};

const ribbonByLocale = {
  en: {
    worldCup2026: "WORLD CUP 2026",
    liveNow: "LIVE NOW",
    latestResults: "LATEST RESULTS",
    emptyMessage:
      "Fixtures from local schedule — scores when API sync is active",
    liveMatchesAria: "Live matches",
    latestResultsAria: "Latest results",
    moreMatches: "+{count} More Matches",
    viewMoreMatchesAria: "View {count} more matches",
    allFixtures: "ALL FIXTURES",
    viewAllFixturesAria: "View all fixtures",
    tickerAria: "Live scores ticker",
    liveElapsed: "LIVE {elapsed}'",
  },
};

for (const loc of locales) {
  const file = path.join(dir, `${loc}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  data.home = { ...data.home, ...(homeByLocale[loc] || homeByLocale.en) };
  data.favourites = {
    ...data.favourites,
    ...(favByLocale[loc] || favByLocale.en),
  };
  data.layout.liveRibbon = {
    ...data.layout.liveRibbon,
    ...(ribbonByLocale[loc] || ribbonByLocale.en),
  };
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

console.log("Message keys patched for home, favourites, liveRibbon");
