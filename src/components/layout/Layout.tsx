import CookieConsent from "./CookieConsent";
import BottomTabBar from "./BottomTabBar";
import DesktopSidebar from "./DesktopSidebar";
import MasterFooter from "./MasterFooter";
import MasterHeader from "./MasterHeader";
import MobileBackBar from "./MobileBackBar";
import styles from "./layout.module.css";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.page} data-gc-shell>
      <MasterHeader />

      <div className={styles.shellRow}>
        <DesktopSidebar />

        <div className={`${styles.main} ${styles.mainWithTabBar}`} data-gc-shell>
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
