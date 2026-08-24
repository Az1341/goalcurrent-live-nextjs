import { getTranslations } from "next-intl/server";
import CookieConsent from "./CookieConsent";
import BottomTabBar from "./BottomTabBar";
import MasterFooter from "./MasterFooter";
import MasterHeader from "./MasterHeader";
import MobileBackBar from "./MobileBackBar";
import styles from "./layout.module.css";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function Layout({ children }: LayoutProps) {
  const t = await getTranslations("layout");

  return (
    <div className={styles.page} data-gc-shell>
      <a href="#main-content" className={styles.skipLink}>
        {t("skipToContent")}
      </a>
      <MasterHeader />

      <div className={styles.shellRow}>
        <div
          id="main-content"
          className={`${styles.main} ${styles.mainWithTabBar}`}
          data-gc-shell
        >
          <MobileBackBar />
          {children}
          <MasterFooter />
        </div>
      </div>

      <BottomTabBar />
      <CookieConsent />
    </div>
  );
}
