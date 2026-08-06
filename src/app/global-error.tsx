"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useMemo } from "react";
import { DEFAULT_LOCALE, LOCALES, type AppLocale } from "@/i18n/locales";
import styles from "@/components/ui/trust-pages.module.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

type ErrorCopy = {
  code: string;
  title: string;
  description: string;
  tryAgain: string;
};

const ERROR_COPY: Record<AppLocale, ErrorCopy> = {
  en: {
    code: "Error",
    title: "Something went wrong",
    description: "Please try again or return home.",
    tryAgain: "Try again",
  },
  fr: {
    code: "Erreur",
    title: "Une erreur est survenue",
    description: "Veuillez réessayer ou retourner à l'accueil.",
    tryAgain: "Réessayer",
  },
  de: {
    code: "Fehler",
    title: "Etwas ist schiefgelaufen",
    description: "Bitte versuchen Sie es erneut oder kehren Sie zur Startseite zurück.",
    tryAgain: "Erneut versuchen",
  },
  nl: {
    code: "Fout",
    title: "Er is iets misgegaan",
    description: "Probeer het opnieuw of ga terug naar home.",
    tryAgain: "Opnieuw proberen",
  },
  es: {
    code: "Error",
    title: "Algo salió mal",
    description: "Inténtalo de nuevo o vuelve al inicio.",
    tryAgain: "Reintentar",
  },
  it: {
    code: "Errore",
    title: "Qualcosa è andato storto",
    description: "Riprova o torna alla home.",
    tryAgain: "Riprova",
  },
};

function resolveDocumentLocale(): AppLocale {
  if (typeof document === "undefined") {
    return DEFAULT_LOCALE;
  }

  const cookieMatch = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const fromCookie = cookieMatch?.[1]?.trim();
  if (fromCookie && (LOCALES as readonly string[]).includes(fromCookie)) {
    return fromCookie as AppLocale;
  }

  const htmlLang = document.documentElement.lang?.trim();
  if (htmlLang && (LOCALES as readonly string[]).includes(htmlLang)) {
    return htmlLang as AppLocale;
  }

  return DEFAULT_LOCALE;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const locale = useMemo(() => resolveDocumentLocale(), []);
  const copy = ERROR_COPY[locale] ?? ERROR_COPY.en;

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang={locale}>
      <body>
        <main className={styles.page}>
          <div className={styles.card}>
            <p className={styles.code}>{copy.code}</p>
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={() => reset()}>
                {copy.tryAgain}
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
