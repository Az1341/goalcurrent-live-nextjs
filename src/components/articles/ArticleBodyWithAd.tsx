import { sanitizeArticleHtml } from "@/lib/sanitize-article-html";

type ArticleBodyWithAdProps = {
  html: string;
};

/**
 * Article body sink (FE-012). HTML must already be (or is) structurally sanitised
 * before dangerouslySetInnerHTML. Formatting styles live on .article-body — not
 * inline style attributes on publisher HTML (inline CSS is not allowlisted).
 */
export default function ArticleBodyWithAd({ html }: ArticleBodyWithAdProps) {
  const safeHtml = sanitizeArticleHtml(html);

  return (
    <div className="article-body">
      <style>{`
        .article-body h2 {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 28px 0 10px;
          padding-bottom: 8px;
          border-bottom: 2px solid #2563eb;
        }
        .article-body p {
          margin-bottom: 16px;
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </div>
  );
}
