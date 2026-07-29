import { sanitizeArticleHtml } from "@/lib/sanitize-article-html";

type ArticleBodyWithAdProps = {
  html: string;
};

export default function ArticleBodyWithAd({ html }: ArticleBodyWithAdProps) {
  const safeHtml = sanitizeArticleHtml(html);

  return (
    <div
      className="article-body"
      // Editorial HTML is sanitised before render (FE-012).
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
