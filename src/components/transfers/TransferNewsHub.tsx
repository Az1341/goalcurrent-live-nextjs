import { Link } from "@/i18n/navigation";
import { fetchNewsFeed } from "@/content/readers";
import { sortPartnerNewsFeed } from "@/lib/editorial-news";
import NewsCard, { FeaturedArticle } from "@/components/news/NewsCard";
import type { NewsArticle } from "@/types/news";
import styles from "@/components/news/news.module.css";

export type TransferView = "latest" | "rumours" | "completed" | "free-agents";

const VIEW_COPY: Record<TransferView, { title: string; intro: string; section: string }> = {
  latest: {
    title: "Latest Transfers",
    intro: "Current football transfer news, confirmed moves and credible market reports from GoalCurrent's cached partner feeds.",
    section: "Latest transfer coverage",
  },
  rumours: {
    title: "Transfer Rumours",
    intro: "Current transfer links, talks and reported targets from GoalCurrent's cached partner feeds. Rumours are not presented as confirmed deals.",
    section: "Latest transfer rumours",
  },
  completed: {
    title: "Completed Transfers",
    intro: "Recent reports of confirmed signings, completed moves and player departures from GoalCurrent's cached partner feeds.",
    section: "Recent completed deals",
  },
  "free-agents": {
    title: "Free Agents",
    intro: "Current free-agent, released-player and out-of-contract reports from GoalCurrent's cached partner feeds.",
    section: "Latest free-agent coverage",
  },
};

const TRANSFER_TERMS = [
  "transfer", "signing", "signed", "signs", "join", "joins", "joined", "loan", "deal", "move", "moves",
];
const RUMOUR_TERMS = ["rumour", "gossip", "linked", "target", "talks", "interested", "eye", "eyes", "consider"];
const COMPLETED_TERMS = ["signed", "signs", "joins", "joined", "completes", "completed", "confirmed", "confirm", "deal"];
const FREE_AGENT_TERMS = ["free agent", "released", "out of contract", "contract expires", "contract expired"];

function includesAny(article: NewsArticle, terms: readonly string[]): boolean {
  const text = `${article.title} ${article.excerpt}`.toLowerCase();
  return terms.some((term) => text.includes(term));
}

function isTransferArticle(article: NewsArticle): boolean {
  return article.tag === "TRANSFER" || includesAny(article, TRANSFER_TERMS);
}

function matchesView(article: NewsArticle, view: TransferView): boolean {
  if (view === "latest") return isTransferArticle(article);
  if (!isTransferArticle(article)) return false;
  if (view === "rumours") return includesAny(article, RUMOUR_TERMS);
  if (view === "completed") return includesAny(article, COMPLETED_TERMS);
  return includesAny(article, FREE_AGENT_TERMS);
}

export default async function TransferNewsHub({ view = "latest" }: { view?: TransferView }) {
  const feed = await fetchNewsFeed("all");
  const allTransfers = sortPartnerNewsFeed(feed.articles.filter(isTransferArticle));
  const exact = allTransfers.filter((article) => matchesView(article, view));
  const articles = exact.length ? exact : allTransfers;
  const copy = VIEW_COPY[view];
  const featured = articles[0];
  const rest = articles.slice(1, 13);

  return (
    <main className={styles.content}>
      <h1 className={styles.pageTitle}>{copy.title}</h1>
      <p className={styles.pageIntro}>{copy.intro}</p>

      <div className={styles.sourceBar}>
        <span className={styles.sourceTag}>Current cached feed</span>
        <span className={styles.sourceUpdated}>
          Updated {new Date(feed.fetched).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
        </span>
      </div>

      <nav aria-label="Transfer sections" style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <Link href="/transfers">Latest</Link>
        <Link href="/transfers/rumours">Rumours</Link>
        <Link href="/transfers/completed">Completed deals</Link>
        <Link href="/transfers/free-agents">Free agents</Link>
      </nav>

      {view !== "latest" && exact.length === 0 && allTransfers.length > 0 ? (
        <p className={styles.fallbackNote}>No dedicated {copy.title.toLowerCase()} reports are in the current cache, so the latest transfer coverage is shown instead.</p>
      ) : null}

      {featured ? <FeaturedArticle article={featured} /> : (
        <p className={styles.fallbackNote}>No current transfer stories are available in the cached feed. GoalCurrent will show them here as soon as the feed contains verified transfer coverage.</p>
      )}

      {rest.length ? (
        <>
          <div className={styles.sectionLabel}>{copy.section}</div>
          <div className={styles.grid}>
            {rest.map((article) => <NewsCard key={`${article.link}-${article.title}`} article={article} />)}
          </div>
        </>
      ) : null}

      {feed.sources.length ? <p className={styles.fallbackNote}>Sources: {feed.sources.join(", ")}</p> : null}
      <p className={styles.hubBack}><Link href="/">← Back to Home</Link></p>
    </main>
  );
}
