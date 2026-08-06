export const LOCALES = [
  "en",
  "es",
  "it",
  "de",
  "fr",
  "nl",
] as const;

export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

/** Shown on language menu rows (renders reliably across platforms). */
export const LANGUAGE_MENU_ICON = "🌐";

/** No RTL locales remain after GC-LOCALE-20260805-155356 (ar/fa removed). */
export const RTL_LOCALES = new Set<AppLocale>([]);

export type LocaleMeta = {
  label: string;
  dateLocale: string;
  direction: "ltr" | "rtl";
  flag: string;
};

export const LOCALE_META: Record<AppLocale, LocaleMeta> = {
  en: { label: "English", dateLocale: "en-GB", direction: "ltr", flag: "🇬🇧" },
  es: { label: "Español", dateLocale: "es-ES", direction: "ltr", flag: "🇪🇸" },
  it: { label: "Italiano", dateLocale: "it-IT", direction: "ltr", flag: "🇮🇹" },
  de: { label: "Deutsch", dateLocale: "de-DE", direction: "ltr", flag: "🇩🇪" },
  fr: { label: "Français", dateLocale: "fr-FR", direction: "ltr", flag: "🇫🇷" },
  nl: { label: "Nederlands", dateLocale: "nl-NL", direction: "ltr", flag: "🇳🇱" },
};

/** Match rows keep home-left / away-right globally (sport convention). */
export function getDirection(locale: string): "ltr" | "rtl" {
  return RTL_LOCALES.has(locale as AppLocale) ? "rtl" : "ltr";
}

export function getDateLocale(locale: string): string {
  return LOCALE_META[locale as AppLocale]?.dateLocale ?? "en-GB";
}

/** Two-letter code shown in the header language selector (EN, FR, ES, …). */
export function getLocaleShortLabel(locale: string): string {
  return locale.toUpperCase();
}
