"use client";

import * as Sentry from "@sentry/nextjs";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect } from "react";
import styles from "@/components/ui/trust-pages.module.css";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  const t = useTranslations("errors.generic");

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>{t("code")}</p>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={() => reset()}>
            {t("tryAgain")}
          </button>
          <Link href="/" className={styles.secondary}>
            {t("returnHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
