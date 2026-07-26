import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "@/components/ui/trust-pages.module.css";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  const t = useTranslations("errors.notFound");

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>{t("code")}</p>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            {t("returnHome")}
          </Link>
          <Link href="/live" className={styles.secondary}>
            {t("liveScores")}
          </Link>
        </div>
      </div>
    </main>
  );
}
