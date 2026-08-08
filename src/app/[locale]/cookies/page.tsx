import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import ManageCookieButton from "@/components/info/ManageCookieButton";
import styles from "@/components/info/info-pages.module.css";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME, SITE_URL } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Cookie Policy",
    description: `Cookie Policy for ${SITE_NAME}. Learn about the cookies we use and how to manage your preferences.`,
    path: "/cookies",
    locale,
  });
}

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="22 May 2026"
      intro={`This Cookie Policy explains what cookies are, how ${SITE_NAME} uses them, and how you can control them. This policy should be read alongside our Privacy Policy.`}
    >
      <div className={styles.highlight}>
        Read our <Link href="/privacy">Privacy Policy</Link> for how personal
        data is handled alongside cookies.
      </div>

      <section>
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files placed on your device when you visit a
          website. They help websites remember your preferences and improve your
          experience. Some cookies are essential for the site to function, while
          others are used for analytics.
        </p>
      </section>

      <section>
        <h2>2. How We Use Cookies</h2>
        <p>{SITE_NAME} uses cookies for the following purposes:</p>
        <ul>
          <li>
            <strong>Essential cookies</strong> — to make the website work
            correctly
          </li>
          <li>
            <strong>Analytics cookies</strong> — to understand how visitors use
            the site
          </li>
          <li>
            <strong>Push notification cookies</strong> — to manage your
            notification preferences via OneSignal
          </li>
          <li>
            <strong>Affiliate cookies</strong> — to track clicks on NordVPN and
            NordPass affiliate links
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Cookies We Use</h2>
        <table className={styles.cookieTable}>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Provider</th>
              <th>Purpose</th>
              <th>Duration</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>gc_cookie_consent_v1</td>
              <td>{SITE_NAME}</td>
              <td>Stores your cookie consent preferences</td>
              <td>1 year</td>
              <td>
                <span className={`${styles.badge} ${styles.badgeEssential}`}>
                  Essential
                </span>
              </td>
            </tr>
            <tr>
              <td>gc_favourites_v1</td>
              <td>{SITE_NAME}</td>
              <td>Stores your favourite teams (local storage)</td>
              <td>Persistent</td>
              <td>
                <span className={`${styles.badge} ${styles.badgeEssential}`}>
                  Essential
                </span>
              </td>
            </tr>
            <tr>
              <td>_ga, _ga_*</td>
              <td>Google Analytics</td>
              <td>Tracks website traffic and user behaviour</td>
              <td>2 years</td>
              <td>
                <span className={`${styles.badge} ${styles.badgeAnalytics}`}>
                  Analytics
                </span>
              </td>
            </tr>
            <tr>
              <td>onesignal-*</td>
              <td>OneSignal</td>
              <td>Manages push notification subscriptions</td>
              <td>Session/1 year</td>
              <td>
                <span className={`${styles.badge} ${styles.badgePush}`}>
                  Push
                </span>
              </td>
            </tr>
            <tr>
              <td>nordvpn_aff_*</td>
              <td>NordVPN</td>
              <td>Tracks affiliate link clicks for commission</td>
              <td>30 days</td>
              <td>
                <span className={`${styles.badge} ${styles.badgeAds}`}>
                  Affiliate
                </span>
              </td>
            </tr>
            <tr>
              <td>nordpass_aff_*</td>
              <td>NordPass</td>
              <td>Tracks affiliate link clicks for commission</td>
              <td>30 days</td>
              <td>
                <span className={`${styles.badge} ${styles.badgeAds}`}>
                  Affiliate
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>4. Your Consent</h2>
        <p>
          When you first visit {SITE_NAME}, a cookie consent banner appears. You
          can choose to:
        </p>
        <ul>
          <li>
            <strong>Accept</strong> — allow cookies including analytics
          </li>
          <li>
            <strong>Decline</strong> — allow only essential cookies required for
            the site to work
          </li>
        </ul>
        <p>You can change your preferences at any time:</p>
        <ManageCookieButton />
      </section>

      <section>
        <h2>5. Third-Party Cookies</h2>
        <p>
          Some cookies are set by third-party services we use. We do not control
          these cookies directly. Please refer to the relevant privacy policies:
        </p>
        <ul>
          <li>
            <a
              href="https://policies.google.com/technologies/cookies"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Cookies Policy
            </a>
          </li>
          <li>
            <a
              href="https://onesignal.com/privacy_policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              OneSignal Privacy Policy
            </a>
          </li>
          <li>
            <a
              href="https://nordvpn.com/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              NordVPN Privacy Policy
            </a>
          </li>
          <li>
            <a
              href="https://nordpass.com/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              NordPass Privacy Policy
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2>6. How to Control Cookies in Your Browser</h2>
        <p>
          You can also control cookies directly through your browser settings:
        </p>
        <ul>
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apple Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge"
              target="_blank"
              rel="noopener noreferrer"
            >
              Microsoft Edge
            </a>
          </li>
        </ul>
        <p>
          Note: disabling all cookies may affect the functionality of{" "}
          {SITE_NAME}.
        </p>
      </section>

      <section>
        <h2>7. Affiliate Link Disclosure</h2>
        <div className={styles.highlight}>
          #AD — {SITE_NAME} participates in affiliate programmes. NordVPN and
          NordPass links are affiliate links — if you click and purchase, we may
          earn a commission at no extra cost to you. Affiliate tracking cookies
          are only placed with your consent.
        </div>
      </section>

      <section>
        <h2>8. Contact Us</h2>
        <p>
          If you have any questions about our use of cookies, please contact:
        </p>
        <div className={styles.highlight}>
          <strong>Ahmad Zafarani (Ashna4All)</strong>
          <br />
          Email:{" "}
          <a href="mailto:info@goalcurrent.live">info@goalcurrent.live</a>
          <br />
          Website: <a href={SITE_URL}>goalcurrent.live</a>
        </div>
      </section>
    </LegalPage>
  );
}
