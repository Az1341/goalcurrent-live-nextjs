"use client";

import { useMemo } from "react";
import NewsArticleCard from "@/components/news/NewsArticleCard";
import { useNewsFeed } from "@/lib/use-news-feed";
import { getEditorialNewsArticles } from "@/lib/editorial-news";
import { filterNewsByKeywords } from "@/lib/team-profile/fixture-utils";
import ProfileFallback from "./ProfileFallback";
import ProfileSection from "./ProfileSection";
import styles from "./team-profile.module.css";

export default function ProfileNewsSection({ keywords, sectionId = "profile-news" }: { keywords: string[]; sectionId?: string }) {
  const { articles } = useNewsFeed();
  const editorialFallback = useMemo(
    () => filterNewsByKeywords(getEditorialNewsArticles(), keywords),
    [keywords],
  );
  const liveFiltered = useMemo(
    () => filterNewsByKeywords(articles, keywords),
    [articles, keywords],
  );
  const displayArticles = liveFiltered.length ? liveFiltered : editorialFallback;

  return (
    <ProfileSection id={sectionId} title="Latest news">
      {displayArticles.length ? (
        <div className={styles.newsList}>
          {displayArticles.slice(0, 5).map((article) => (
            <NewsArticleCard key={`${article.link}-${article.title}`} article={article} />
          ))}
        </div>
      ) : (
        <ProfileFallback message="No latest news available yet." />
      )}
    </ProfileSection>
  );
}
