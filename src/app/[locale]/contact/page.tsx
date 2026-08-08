import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import ContactForm from "@/components/info/ContactForm";
import InfoPageShell, { InfoBackLink } from "@/components/info/InfoPageShell";
import SocialIcon from "@/components/layout/SocialIcon";
import SocialLinks from "@/components/layout/SocialLinks";
import { FOOTER_SOCIAL } from "@/lib/nav";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME, SITE_URL } from "@/lib/site-url";
import styles from "@/components/info/info-pages.module.css";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Contact Us",
    description: `Contact ${SITE_NAME}. Get in touch with Ahmad Zafarani (Ashna4All) for questions, feedback or partnership enquiries.`,
    path: "/contact",
    locale,
  });
}

export default async function ContactPage() {
  const t = await getTranslations("nav");
  return (
    <InfoPageShell>
      <div className={styles.stack}>
        <article className={styles.card}>
          <h1>Contact Us</h1>
          <p className={styles.intro}>
            We would love to hear from you! Get in touch with any questions,
            suggestions or feedback.
          </p>

          <div className={styles.contactOptions}>
            <a
              className={styles.contactOption}
              href="mailto:info@goalcurrent.live"
            >
              <div className={styles.contactOptionTitle}>Email Us</div>
              <div className={styles.contactOptionSub}>
                info@goalcurrent.live
              </div>
            </a>
            {FOOTER_SOCIAL.map((social) => (
              <a
                key={social.href}
                className={styles.contactOption}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className={styles.contactOptionTitle}>
                  <SocialIcon
                    name={social.icon}
                    className={styles.socialLinkIcon}
                  />{" "}
                  {t(social.labelKey)}
                </div>
                <div className={styles.contactOptionSub}>
                  {social.labelKey === "instagram"
                    ? "@goalcurrent.live"
                    : "GoalCurrent Live"}
                </div>
              </a>
            ))}
          </div>

          <h2>Send Us a Message</h2>
          <ContactForm />
        </article>

        <article className={styles.card}>
          <h2>General Enquiries</h2>
          <p>
            For general questions about {SITE_NAME}, site features, or football
            coverage, email{" "}
            <a href="mailto:info@goalcurrent.live">info@goalcurrent.live</a>.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Editorial Corrections</h2>
          <p>
            Spotted a score error, wrong kick-off time, or outdated squad
            detail? Select <strong>Score Error / Bug Report</strong> in the form
            above or email us with the match and correction details.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Advertising and Partnerships</h2>
          <p>
            For advertising, sponsorship, or partnership enquiries, select{" "}
            <strong>Advertising / Partnership</strong> in the form or contact{" "}
            <a href="mailto:info@goalcurrent.live">info@goalcurrent.live</a>.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Affiliate and Legal Enquiries</h2>
          <p>
            Questions about affiliate links, privacy, or legal matters? See our{" "}
            <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>,{" "}
            <Link href="/privacy">Privacy Policy</Link>, and{" "}
            <Link href="/terms">Terms & Conditions</Link>, or email{" "}
            <a href="mailto:info@goalcurrent.live">info@goalcurrent.live</a>.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Other Ways to Reach Us</h2>
          <div className={styles.highlight}>
            <strong>{SITE_NAME}</strong>
            <br />
            Created by Ahmad Zafarani (Ashna4All)
            <br />
            Email:{" "}
            <a href="mailto:info@goalcurrent.live">info@goalcurrent.live</a>
            <br />
            Website: <a href={SITE_URL}>goalcurrent.live</a>
            <br />
            <br />
            <strong>Response time:</strong> We aim to respond within 24–48
            hours.
          </div>
          <div className={styles.socialList}>
            <SocialLinks
              linkClassName={styles.socialLink}
              iconClassName={styles.socialLinkIcon}
              showLabel
            />
          </div>
        </article>

        <InfoBackLink />
      </div>
    </InfoPageShell>
  );
}
