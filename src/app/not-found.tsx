import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/ui/trust-pages.module.css";

export const metadata: Metadata = {
  title: "Page not found | GoalCurrent",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootNotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>404</p>
        <h1>Page not found</h1>
        <p>The page you requested does not exist or has moved.</p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            Return home
          </Link>
          <Link href="/live" className={styles.secondary}>
            Scores
          </Link>
        </div>
      </div>
    </main>
  );
}
