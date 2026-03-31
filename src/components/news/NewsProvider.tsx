import React, { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { newsService } from '../../services/newsService';

interface NewsProviderProps {
  children: React.ReactNode;
}

export const NewsProvider: React.FC<NewsProviderProps> = ({ children }) => {
  const news = useQuery(api.news.getNews, {});
  const trendingNews = useQuery(api.news.getTrendingNews, { limit: 5 });
  const latestNews = useQuery(api.news.getLatestNews, { limit: 20 });

  useEffect(() => {
    if (news && news.length > 0) {
      newsService.enableConvex(news as any);
    }
  }, [news]);

  useEffect(() => {
    if (trendingNews && trendingNews.length > 0) {
      const allNews = news || [];
      const trending = trendingNews;
      const combined = [...new Map([...allNews, ...trending].map(item => [item._id, item])).values()];
      newsService.enableConvex(combined as any);
    }
  }, [news, trendingNews]);

  return <>{children}</>;
};

export default NewsProvider;
