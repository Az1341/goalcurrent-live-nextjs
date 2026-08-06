import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const messagesDir = join(process.cwd(), "messages");
const en = JSON.parse(readFileSync(join(messagesDir, "en.json"), "utf8"));

function deepMerge(base: unknown, overrides: unknown): unknown {
  if (
    typeof base !== "object" ||
    base === null ||
    typeof overrides !== "object" ||
    overrides === null ||
    Array.isArray(base) ||
    Array.isArray(overrides)
  ) {
    return overrides ?? base;
  }

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(overrides as Record<string, unknown>)) {
    result[key] = deepMerge(
      (base as Record<string, unknown>)[key],
      (overrides as Record<string, unknown>)[key],
    );
  }
  return result;
}

const localeOverrides: Record<string, Record<string, unknown>> = {
  fr: {
    common: {
      loading: "Chargement…",
      vs: "contre",
      home: "Accueil",
      live: "En direct",
      returnHome: "Retour à l'accueil",
      subscribe: "S'abonner",
      language: "Langue",
    },
    nav: {
      home: "Accueil",
      live: "En direct",
      favourites: "Favoris",
      news: "Actualités",
      articles: "Articles",
      videos: "Vidéos",
      about: "À propos",
      contact: "Contact",
    },
    errors: {
      notFound: {
        title: "Page introuvable",
        description: "La page que vous recherchez n'existe pas ou a peut-être été déplacée.",
        returnHome: "Retour à l'accueil",
        liveScores: "Scores en direct",
      },
    },
    match: { title: "{home} contre {away}" },
    home: { title: "Scores de football en direct et centre de match" },
  },
  de: {
    common: {
      loading: "Wird geladen…",
      vs: "gegen",
      home: "Startseite",
      live: "Live",
      returnHome: "Zur Startseite",
      subscribe: "Abonnieren",
      language: "Sprache",
    },
    nav: {
      home: "Startseite",
      live: "Live",
      favourites: "Favoriten",
      news: "Nachrichten",
      articles: "Artikel",
      videos: "Videos",
      about: "Über uns",
      contact: "Kontakt",
    },
    errors: {
      notFound: {
        title: "Seite nicht gefunden",
        description: "Die gesuchte Seite existiert nicht oder wurde verschoben.",
        returnHome: "Zur Startseite",
        liveScores: "Live-Ergebnisse",
      },
    },
    match: { title: "{home} gegen {away}" },
    home: { title: "Live-Fußballergebnisse & Spielzentrum" },
  },
  nl: {
    common: {
      loading: "Laden…",
      vs: "tegen",
      home: "Home",
      live: "Live",
      returnHome: "Terug naar home",
      subscribe: "Abonneren",
      language: "Taal",
    },
    nav: {
      home: "Home",
      live: "Live",
      favourites: "Favorieten",
      news: "Nieuws",
      articles: "Artikelen",
      videos: "Video's",
      about: "Over",
      contact: "Contact",
    },
    errors: {
      notFound: {
        title: "Pagina niet gevonden",
        description: "De pagina die u zoekt bestaat niet of is verplaatst.",
        returnHome: "Terug naar home",
        liveScores: "Live scores",
      },
    },
    match: { title: "{home} tegen {away}" },
    home: { title: "Live voetbalscores & wedstrijdcentrum" },
  },
  es: {
    common: {
      loading: "Cargando…",
      vs: "vs",
      home: "Inicio",
      live: "En vivo",
      returnHome: "Volver al inicio",
      subscribe: "Suscribirse",
      language: "Idioma",
    },
    nav: {
      home: "Inicio",
      live: "En vivo",
      favourites: "Favoritos",
      news: "Noticias",
      articles: "Artículos",
      videos: "Vídeos",
      about: "Acerca de",
      contact: "Contacto",
    },
    errors: {
      notFound: {
        title: "Página no encontrada",
        description: "La página que buscas no existe o puede haberse movido.",
        returnHome: "Volver al inicio",
        liveScores: "Resultados en vivo",
      },
    },
    match: { title: "{home} vs {away}" },
    home: { title: "Resultados de fútbol en vivo y centro de partidos" },
  },
  it: {
    common: {
      loading: "Caricamento…",
      vs: "vs",
      home: "Home",
      live: "Live",
      returnHome: "Torna alla home",
      subscribe: "Iscriviti",
      language: "Lingua",
    },
    nav: {
      home: "Home",
      live: "Live",
      favourites: "Preferiti",
      news: "Notizie",
      articles: "Articoli",
      videos: "Video",
      about: "Chi siamo",
      contact: "Contatti",
    },
    errors: {
      notFound: {
        title: "Pagina non trovata",
        description: "La pagina che cerchi non esiste o potrebbe essere stata spostata.",
        returnHome: "Torna alla home",
        liveScores: "Risultati live",
      },
    },
    match: { title: "{home} vs {away}" },
    home: { title: "Risultati calcio live e centro partita" },
  },
};

for (const locale of Object.keys(localeOverrides)) {
  const merged = deepMerge(en, localeOverrides[locale]);
  writeFileSync(
    join(messagesDir, `${locale}.json`),
    `${JSON.stringify(merged, null, 2)}\n`,
    "utf8",
  );
  console.log(`Wrote messages/${locale}.json`);
}

function collectKeys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return prefix ? [prefix] : [];
  }
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
    collectKeys(value, prefix ? `${prefix}.${key}` : key),
  );
}

const enKeys = new Set(collectKeys(en));
let failed = false;
for (const file of readdirSync(messagesDir).filter((f) => f.endsWith(".json"))) {
  const data = JSON.parse(readFileSync(join(messagesDir, file), "utf8"));
  const keys = new Set(collectKeys(data));
  for (const key of enKeys) {
    if (!keys.has(key)) {
      console.error(`${file} missing key: ${key}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log("All locale files have key parity with en.json");
