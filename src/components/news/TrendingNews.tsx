import React, { memo, useState, useEffect } from 'react';
import { NewsArticle } from '../../types/news';
import { newsService } from '../../services/newsService';

export interface TrendingNewsProps {
  limit?: number;
  onNewsClick?: (news: NewsArticle) => void;
  compact?: boolean;
}

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    forex: '💱',
    crypto: '₿',
    commodities: '🛢️',
    indices: '📈',
    stocks: '🏛️',
    general: '📰',
    economic: '📊',
    analysis: '📉',
    education: '📚',
  };
  return icons[category] || '📰';
};

const getSentimentIcon = (sentiment?: string): string => {
  const icons: Record<string, string> = {
    bullish: '📈',
    bearish: '📉',
    neutral: '➡️',
  };
  return icons[sentiment || 'neutral'] || '➡️';
};

const TrendingNewsItem: React.FC<{
  news: NewsArticle;
  index: number;
  onClick?: (news: NewsArticle) => void;
}> = memo(({ news, index, onClick }) => {
  const handleClick = () => onClick?.(news);

  return (
    <article
      onClick={handleClick}
      className="group flex gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center font-black text-sm text-primary">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] text-gray-500">
            {getCategoryIcon(news.category)}
          </span>
          <span className="text-[9px] text-gray-500">
            {getSentimentIcon(news.sentiment)}
          </span>
          <span className="text-[9px] text-gray-600 ml-auto">
            {formatTimeAgo(news.publishedAt)}
          </span>
        </div>

        <h4 className="text-xs font-semibold text-gray-200 group-hover:text-white line-clamp-2 leading-snug transition-colors">
          {news.title}
        </h4>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className="material-symbols-outlined text-xs">visibility</span>
            {news.views || 0}
          </div>
        </div>
      </div>
    </article>
  );
});

TrendingNewsItem.displayName = 'TrendingNewsItem';

const TrendingNews: React.FC<TrendingNewsProps> = ({
  limit = 5,
  onNewsClick,
  compact = false,
}) => {
  const [trendingNews, setTrendingNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const news = await newsService.getTrendingNews(limit);
        setTrendingNews(news);
      } catch (error) {
        console.error('Error fetching trending news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, [limit]);

  if (loading) {
    return (
      <div className="glass rounded-xl border border-white/5 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 animate-pulse" />
          <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
                <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!trendingNews || trendingNews.length === 0) {
    return (
      <div className="glass rounded-xl border border-white/5 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-orange-400 text-sm">local_fire_department</span>
          </div>
          <h3 className="text-sm font-bold text-gray-200">Tendencias</h3>
        </div>
        <p className="text-xs text-gray-500 text-center py-4">No hay tendencias</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-white/5 overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-white/5 bg-gradient-to-r from-orange-500/10 to-transparent">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-orange-400 text-sm">local_fire_department</span>
        </div>
        <h3 className="text-sm font-bold text-gray-200">Tendencias</h3>
        <span className="ml-auto text-[10px] text-gray-500">{trendingNews.length} artículos</span>
      </div>

      <div className={`divide-y divide-white/5 ${compact ? '' : 'max-h-[400px] overflow-y-auto no-scrollbar'}`}>
        {trendingNews.map((news, index) => (
          <TrendingNewsItem
            key={news.id}
            news={news}
            index={index}
            onClick={onNewsClick}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingNews;
