import Link from "next/link";
import type { Metadata } from "next";
import AndroidTwaLaunchGuard from "@/components/android/AndroidTwaLaunchGuard";
import JsonLdScript from "@/components/seo/JsonLdScript";
import TeamFlag from "@/components/TeamFlag";
import Wc26Breadcrumb from "@/components/wc26/Wc26Breadcrumb";
import { WC26_TOURNAMENT } from "@/data/wc26";
import { WC26_SECTIONS } from "@/lib/wc26-sections";
import {
  WC26_ARCHIVE_DATA_AS_OF,
  WC26_ARCHIVE_HUB_ARTICLES,
  WC26_ARCHIVE_LABEL,
  WC26_ARCHIVE_MATCH_REPORTS,
  formatArchiveScoreLine,
  getWc26ArchiveFinalSummary,
} from "@/lib/wc26/archive";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME, absoluteUrl } from "@/lib/site-url";
import styles from "@/components/wc26/wc26.module.css";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "World Cup 2026 Archive",
    description: `FIFA World Cup 2026 Archive on ${SITE_NAME} — final results, champion, bracket, standings and GoalCurrent tournament coverage.`,
    path: "/worldcup2026",
    locale,
  });
}

export default function WorldCupArchiveHubPage() {
  const hosts = WC26_TOURNAMENT.hosts.join(" · ");
  const finalSummary = getWc26ArchiveFinalSummary();
  const scoreLine = finalSummary ? formatArchiveScoreLine(finalSummary) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsOrganization",
        name: "FIFA World Cup 2026",
        sport: "Football",
        url: absoluteUrl("/worldcup2026"),
      },
      {
        "@type": "Event",
        name: "FIFA World Cup 2026",
        startDate: WC26_TOURNAMENT.startUtc,
        endDate: WC26_TOURNAMENT.endUtc,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        url: absoluteUrl("/worldcup2026"),
        description:
          "Historical archive of the completed FIFA World Cup 2026 tournament.",
      },
    ],
  };

  return (
    <>
      <AndroidTwaLaunchGuard />
      <JsonLdScript data={jsonLd} />
      <main className={styles.wc26Content}>
        <Wc26Breadcrumb items={[{ label: WC26_ARCHIVE_LABEL }]} />

        <p className={styles.archiveBadge}>{WC26_ARCHIVE_LABEL}</p>
        <h1 className={styles.pageTitle}>
          FIFA World Cup <span>2026</span> Archive
        </h1>
        <p className={styles.pageIntro}>
          {hosts}. Tournament window {WC26_TOURNAMENT.startUtc.slice(0, 10)} to{" "}
          {WC26_TOURNAMENT.endUtc.slice(0, 10)}. This hub is a permanent
          historical archive of GoalCurrent&apos;s World Cup 2026 coverage — not
          live tournament coverage.
        </p>

        <p className={styles.archiveTimestamp}>
          Archived data as of {WC26_ARCHIVE_DATA_AS_OF} (curated repository
          results).
        </p>

        {finalSummary && scoreLine ? (
          <section
            className={styles.archiveChampion}
            aria-labelledby="wc26-archive-champion-heading"
          >
            <h2
              id="wc26-archive-champion-heading"
              className={styles.sectionTitle}
            >
              Champion and final
            </h2>
            <div className={styles.archiveChampionCard}>
              <div className={styles.archiveChampionTeams}>
                <span className={styles.archiveTeam}>
                  <TeamFlag teamId={finalSummary.winnerTeamId} size={36} />
                  <strong>{finalSummary.winnerName}</strong>
                  <span className={styles.archiveChampionTag}>Champion</span>
                </span>
                <span
                  className={styles.archiveScore}
                  aria-label={`Final score ${scoreLine}`}
                >
                  {scoreLine}
                </span>
                <span className={styles.archiveTeam}>
                  <TeamFlag teamId={finalSummary.runnerUpTeamId} size={36} />
                  <strong>{finalSummary.runnerUpName}</strong>
                  <span className={styles.archiveChampionTag}>Runner-up</span>
                </span>
              </div>
              <p className={styles.archiveChampionMeta}>
                Match {finalSummary.matchNumber} · {finalSummary.winnerName}{" "}
                defeated {finalSummary.runnerUpName} ({scoreLine}).
              </p>
              <Link
                href={`/worldcup2026/match/${finalSummary.fixtureId}`}
                className={styles.hubCardLink}
              >
                Open final match report →
              </Link>
            </div>
          </section>
        ) : null}

        <h2 className={styles.sectionTitle}>Archive sections</h2>
        <div className={styles.hubGrid}>
          {WC26_SECTIONS.map(({ href, label, hubDescription }) => (
            <Link key={href} href={href} className={styles.hubCard}>
              <div className={styles.hubCardLabel}>{label}</div>
              <p className={styles.hubCardDesc}>{hubDescription}</p>
              <span className={styles.hubCardLink}>Open archive →</span>
            </Link>
          ))}
        </div>

        <h2 className={styles.sectionTitle}>GoalCurrent tournament articles</h2>
        <ul className={styles.archiveLinkList}>
          {WC26_ARCHIVE_HUB_ARTICLES.map((article) => (
            <li key={article.href}>
              <Link href={article.href}>{article.title}</Link>
            </li>
          ))}
        </ul>

        <h2 className={styles.sectionTitle}>Selected match reports</h2>
        <ul className={styles.archiveLinkList}>
          {WC26_ARCHIVE_MATCH_REPORTS.map((match) => (
            <li key={match.href}>
              <Link href={match.href}>{match.title}</Link>
            </li>
          ))}
        </ul>

        <h2 className={styles.sectionTitle}>Tournament timeline</h2>
        <p className={styles.pageIntro}>
          Group stage and knockout football across {WC26_TOURNAMENT.teamCount}{" "}
          teams and {WC26_TOURNAMENT.fixtureCount} matches, hosted in {hosts},
          ending {WC26_TOURNAMENT.endUtc.slice(0, 10)}.
        </p>

        <aside
          className={styles.archiveNotice}
          aria-label="Historical data notice"
        >
          <h2 className={styles.sectionTitle}>Historical-data notice</h2>
          <p>
            Scores and pairings shown in this archive come from
            GoalCurrent&apos;s curated confirmed-results dataset. This is not a
            live feed. Facts that are not verified in the repository are omitted
            rather than invented.
          </p>
        </aside>
      </main>
    </>
  );
}
