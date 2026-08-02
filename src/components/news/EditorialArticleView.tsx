import { Link } from "@/i18n/navigation";
import type { EditorialArticle } from "@/types/editorial";
import { EDITORIAL_SOURCE_LABEL } from "@/lib/seo/constants";
import styles from "./news.module.css";

function formatArticleDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type EditorialArticleViewProps = {
  article: EditorialArticle;
};

export default function EditorialArticleView({ article }: EditorialArticleViewProps) {
  return (
    <main className={styles.content}>
      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <p className={styles.articleEyebrow}>{EDITORIAL_SOURCE_LABEL} · World Cup 2026</p>
          <h1 className={styles.articleTitle}>{article.title}</h1>
          <p className={styles.articleDeck}>{article.description}</p>
          <div className={styles.articleMeta}>
            <span>{article.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>
              {formatArticleDate(article.publishedAt)}
            </time>
          </div>
        </header>

        {article.sections.map((section) => (
          <section key={section.id} className={styles.articleSection}>
            <h2 className={styles.articleSectionTitle}>{section.heading}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index} className={styles.articleParagraph}>
                {paragraph}
              </p>
            ))}
            {section.image ? (
              <figure className={styles.articleFigure}>
                <div
                  className={styles.imagePlaceholder}
                  role="img"
                  aria-label={section.image.alt}
                >
                  <span>{section.image.label}</span>
                </div>
                {section.image.caption ? (
                  <figcaption className={styles.imageCaption}>
                    {section.image.caption}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
          </section>
        ))}

        <footer className={styles.articleFooter}>
          <p className={styles.articleRelatedLabel}>Related on GoalCurrent.live</p>
          <ul className={styles.articleRelatedList}>
            {article.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </footer>
      </article>

      <p className={styles.hubBack}>
        <Link href="/articles">← All Articles</Link>
        {" · "}
        <Link href="/news">Latest News</Link>
      </p>
    </main>
  );
}
