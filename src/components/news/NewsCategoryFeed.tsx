import { Link } from "@/i18n/navigation";
import type { NewsArticle } from "@/types/news";
import NewsArticleCard from "@/components/news/NewsArticleCard";
import styles from "./news.module.css";

type NewsCategoryFeedProps = {
  heading: string;
  headingAccent: string;
  intro: string;
  articles: NewsArticle[];
  emptyMessage: string;
  sources: string[];
};

export default function NewsCategoryFeed({
  heading,
  headingAccent,
  intro,
  articles,
  emptyMessage,
  sources,
}: NewsCategoryFeedProps) {
  return (
    <main className={styles.content}>
      <h1 className={styles.pageTitle}>
        {heading} <span>{headingAccent}</span>
      </h1>
      <p className={styles.pageIntro}>{intro}</p>

      {sources.length > 0 ? (
        <div className={styles.sourceBar}>
          {sources.includes("BBC Sport") ? (
            <span className={`${styles.sourceTag} ${styles.sourceTagBbc}`}>
              BBC Sport
            </span>
          ) : null}
          {sources.includes("ESPN") ? (
            <span className={`${styles.sourceTag} ${styles.sourceTagEspn}`}>
              ESPN
            </span>
          ) : null}
          <span className={styles.sourceTag}>Live RSS feed</span>
        </div>
      ) : null}

      {articles.length === 0 ? (
        <p className={styles.emptyState}>{emptyMessage}</p>
      ) : (
        <div className={styles.grid}>
          {articles.map((article) => (
            <NewsArticleCard
              key={`${article.link}-${article.title}`}
              article={article}
            />
          ))}
        </div>
      )}

      <p className={styles.hubBack}>
        <Link href="/news">← Latest News</Link>
      </p>
    </main>
  );
}
