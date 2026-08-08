import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import styles from "@/components/info/info-pages.module.css";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Privacy Policy",
    description: `Privacy Policy for ${SITE_NAME} — how we collect and use your data.`,
    path: "/privacy",
    locale,
  });
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 2026"
      intro="How we collect, use, and protect your information."
    >
      <section>
        <h2>Who We Are</h2>
        <p>
          {SITE_NAME} is an independent football fan website owned and operated
          by A. Zafarani (Ashna4All), based in England, United Kingdom.
        </p>
        <p>
          We are not affiliated with FIFA, UEFA, the Premier League, or any
          official football organisation.
        </p>
        <p>
          <strong>Contact:</strong>{" "}
          <a href="mailto:info@goalcurrent.live">info@goalcurrent.live</a>
        </p>
      </section>

      <section>
        <h2>What Data We Collect</h2>
        <p>We may collect the following information:</p>
        <ul>
          <li>Email addresses — only if you subscribe to our newsletter</li>
          <li>
            Usage data via Google Analytics (pages visited, time on site, device
            type)
          </li>
          <li>Cookie data — see the Cookie section below</li>
        </ul>
        <p>
          We do <strong>not</strong> collect names, addresses, payment
          information, or any sensitive personal data.
        </p>
      </section>

      <section>
        <h2>Why We Collect It</h2>
        <ul>
          <li>To send football news updates — only if you subscribed</li>
          <li>To improve our website using anonymous analytics</li>
          <li>To improve our website using anonymous analytics</li>
        </ul>
      </section>

      <section>
        <h2>Affiliate Links</h2>
        <p>
          This site contains affiliate links, including links to NordVPN and
          NordPass. If you click an affiliate link and make a purchase, we may
          earn a small commission at no extra cost to you.
        </p>
        <p>
          All affiliate links are clearly labelled with <strong>#AD</strong> or{" "}
          <strong>Affiliate link</strong> notices.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>We use cookies to:</p>
        <ul>
          <li>Remember your cookie preferences</li>
          <li>Analyse site traffic (Google Analytics)</li>
        </ul>
        <p>
          You can control cookies through your browser settings or via our
          cookie consent banner shown on your first visit.
        </p>
      </section>

      <section>
        <h2>Your Rights (UK GDPR)</h2>
        <p>Under UK GDPR, you have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Withdraw consent at any time</li>
          <li>
            Lodge a complaint with the ICO (Information Commissioner&apos;s
            Office)
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us at:{" "}
          <a href="mailto:info@goalcurrent.live">info@goalcurrent.live</a>
        </p>
      </section>

      <section>
        <h2>Third-Party Links</h2>
        <p>
          Our site may link to external websites including news sources,
          official football sites, and affiliate partners. We are not
          responsible for the privacy practices of those sites. Please review
          their individual privacy policies.
        </p>
      </section>

      <section>
        <h2>Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. The date at the top of
          this page always shows the latest version. Continued use of the site
          means you accept any updated policy.
        </p>
        <p>
          Questions? Email us:{" "}
          <a href="mailto:info@goalcurrent.live">info@goalcurrent.live</a>
        </p>
      </section>
    </LegalPage>
  );
}
