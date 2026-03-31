import React, { useState, useCallback, useEffect } from 'react';
import { newsService } from '../../services/newsService';
import { NewsArticle, NewsCategory } from '../../types/news';
import NewsCard from './NewsCard';

export interface NewsFeedProps {
  category?: NewsCategory | 'all';
  sentiment?: 'bullish' | 'bearish' | 'neutral' | 'all';
  hours?: number;
  limit?: number;
  onNewsClick?: (news: NewsArticle) => void;
  userId?: string;
  onLike?: (newsId: string) => void;
  showPagination?: boolean;
  pageSize?: number;
  compact?: boolean;
}

const NewsFeed: React.FC<NewsFeedProps> = ({
  category = 'all',
  sentiment = 'all',
  hours,
  limit = 20,
  onNewsClick,
  userId,
  onLike,
  showPagination = false,
  pageSize = 10,
  compact = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [displayCount, setDisplayCount] = useState(pageSize);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const allNews = await newsService.fetchNews({
        categories: category !== 'all' ? [category as NewsCategory] : undefined,
      });
      setNews(allNews);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const getFilteredNews = useCallback((): NewsArticle[] => {
    let filtered = news;

    if (sentiment !== 'all') {
      filtered = filtered.filter((n) => n.sentiment === sentiment);
    }

    if (hours) {
      const cutoff = Date.now() - hours * 60 * 60 * 1000;
      filtered = filtered.filter((n) => new Date(n.publishedAt).getTime() >= cutoff);
    }

    return filtered.slice(0, limit);
  }, [news, sentiment, hours, limit]);

  const filteredNews = getFilteredNews();

  const handleLoadMore = useCallback(() => {
    if (showPagination) {
      setCurrentPage((prev) => prev + 1);
    } else {
      setDisplayCount((prev) => prev + pageSize);
    }
  }, [showPagination, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
    setDisplayCount(pageSize);
  }, [category, sentiment, pageSize]);

  const displayedNews = showPagination
    ? filteredNews.slice(0, currentPage * pageSize)
    : filteredNews.slice(0, displayCount);

  const hasMore = showPagination
    ? currentPage * pageSize < filteredNews.length
    : displayCount < filteredNews.length;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-white/5 rounded w-1/4 mb-2" />
            <div className="h-6 bg-white/5 rounded w-3/4 mb-2" />
            <div className="h-4 bg-white/5 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!filteredNews || filteredNews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-4xl text-white/20">newspaper</span>
        </div>
        <p className="text-sm text-white/40">No hay noticias disponibles</p>
        <p className="text-xs text-white/20 mt-1">Intenta cambiar los filtros</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {displayedNews.map((item) => (
          <NewsCard
            key={item.id}
            news={item}
            variant={compact ? 'compact' : 'default'}
            onReadMore={onNewsClick}
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={handleLoadMore}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">expand_more</span>
          Cargar más
        </button>
      )}

      {showPagination && filteredNews.length > pageSize && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>

          <span className="text-sm text-white/50 px-4">
            Página {currentPage} de {Math.ceil(filteredNews.length / pageSize)}
          </span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= Math.ceil(filteredNews.length / pageSize)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
