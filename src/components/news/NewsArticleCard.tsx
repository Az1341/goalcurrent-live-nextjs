import { Link } from "@/i18n/navigation";
import CardMedia from "@/components/ui/CardMedia";
import { withSvgMediaClass } from "@/lib/images";
import type { NewsArticle, NewsTag } from "@/types/news";
import styles from "./news.module.css";

function formatNewsDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function tagClassName(tag: NewsTag): string {
  return `${styles.cardTag} ${styles[`tag${tag}`]}`;
}

function isExternalLink(link: string): boolean {
  return link.startsWith("http://") || link.startsWith("https://");
}

type NewsArticleCardProps = {
  article: NewsArticle;
};

export default function NewsArticleCard({ article }: NewsArticleCardProps) {
  const content = (
    <>
      <div
        className={withSvgMediaClass(
          article.image,
          styles.cardImageWrap,
          styles.cardImageWrapSvg,
        )}
      >
        <CardMedia
          src={article.image}
          alt=""
          width={640}
          height={360}
          sizes="(max-width: 768px) 100vw, 400px"
          className={withSvgMediaClass(
            article.image,
            styles.cardImage,
            styles.cardImageSvg,
          )}
        />
      </div>
      <div className={styles.cardBody}>
        <span className={tagClassName(article.tag)}>{article.tag}</span>
        <div className={styles.cardTitle}>{article.title}</div>
        <div className={styles.cardMeta}>{formatNewsDate(article.date)}</div>
        {article.excerpt ? (
          <p className={styles.cardExcerpt}>{article.excerpt}</p>
        ) : null}
        <div className={styles.cardSource}>{article.source}</div>
      </div>
    </>
  );

  if (isExternalLink(article.link)) {
    return (
      <a
        href={article.link}
        className={styles.card}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={article.link} className={styles.card}>
      {content}
    </Link>
  );
}
