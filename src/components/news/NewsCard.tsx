import React, { memo, useState } from 'react';
import { NewsArticle, NewsCategory } from '../../types/news';
import { SOURCE_CONFIG } from '../../services/newsService';

export interface NewsCardProps {
  news: NewsArticle;
  variant?: 'compact' | 'default' | 'featured' | 'text-only';
  onReadMore?: (news: NewsArticle) => void;
  onShare?: (news: NewsArticle) => void;
}

export type NewsSentiment = 'bullish' | 'bearish' | 'neutral';

const NewsCard: React.FC<NewsCardProps> = ({
  news,
  variant = 'text-only',
  onReadMore,
  onShare,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sourceInfo = SOURCE_CONFIG[news.source];
  const timeAgo = getTimeAgo(news.publishedAt);

  const getSentimentStyles = (sentiment?: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'bearish':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'forex':
        return 'bg-blue-500/20 text-blue-400';
      case 'crypto':
        return 'bg-amber-500/20 text-amber-400';
      case 'indices':
        return 'bg-purple-500/20 text-purple-400';
      case 'commodities':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'stocks':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'economic':
        return 'bg-pink-500/20 text-pink-400';
      case 'analysis':
        return 'bg-cyan-500/20 text-cyan-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (variant === 'compact') {
    const hasValidImage = news.imageUrl && !imageError && !news.imageUrl.includes('picsum.photos');
    return (
      <div
        className="group flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onReadMore?.(news)}
      >
        {hasValidImage && (
          <div className="size-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={news.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${getCategoryStyles(news.category)}`}>
              {news.category}
            </span>
            <span className="text-[10px] text-white/30">{timeAgo}</span>
          </div>
          <h4 className="text-xs font-bold text-white/80 line-clamp-2 group-hover:text-white transition-colors">
            {news.title}
          </h4>
        </div>
        {news.sentiment && (
          <span className={`text-xs px-2 py-0.5 rounded-full border ${getSentimentStyles(news.sentiment)}`}>
            {news.sentiment === 'bullish' ? '📈' : news.sentiment === 'bearish' ? '📉' : '➡️'}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'text-only' || variant === 'default') {
    return (
      <div
        className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
        onClick={() => onReadMore?.(news)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="size-5 rounded-md bg-black/20 flex items-center justify-center text-[10px]">
              {sourceInfo.icon}
            </span>
            <span className="text-[10px] text-white/50 font-medium">{sourceInfo.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${getCategoryStyles(news.category)}`}>
              {news.category}
            </span>
            {news.sentiment && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${getSentimentStyles(news.sentiment)}`}>
                {news.sentiment === 'bullish' ? '📈' : news.sentiment === 'bearish' ? '📉' : '➡️'}
              </span>
            )}
            <span className="text-[10px] text-white/30">{timeAgo}</span>
          </div>
        </div>
        
        <h3 className="text-sm font-bold text-white/90 mb-2 line-clamp-2 group-hover:text-white transition-colors">
          {news.title}
        </h3>

        <p className="text-xs text-white/50 line-clamp-2 mb-2">
          {news.summary}
        </p>

        {news.relatedPairs && news.relatedPairs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {news.relatedPairs.slice(0, 3).map(pair => (
              <span key={pair} className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/70 border border-primary/20">
                {pair}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'featured') {
    const hasValidImage = news.imageUrl && !imageError && !news.imageUrl.includes('picsum.photos');
    return (
      <div
        className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 hover:border-primary/30 transition-all cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onReadMore?.(news)}
      >
        {hasValidImage ? (
          <div className="aspect-video relative">
            <img
              src={news.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>
        ) : (
          <div className="aspect-video relative bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-white/20">newspaper</span>
              <p className="text-xs text-white/30 mt-2">{sourceInfo.name}</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>
        )}
        
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="size-8 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center text-sm">
            {sourceInfo.icon}
          </span>
          <span className="text-xs font-bold text-white/80 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
            {sourceInfo.name}
          </span>
        </div>

        {news.sentiment && (
          <div className="absolute top-4 right-4">
            <span className={`text-sm px-3 py-1 rounded-full border ${getSentimentStyles(news.sentiment)}`}>
              {news.sentiment === 'bullish' ? '📈 Alcista' : news.sentiment === 'bearish' ? '📉 Bajista' : '➡️ Neutral'}
            </span>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${getCategoryStyles(news.category)}`}>
              {news.category}
            </span>
            <span className="text-[10px] text-white/40">{timeAgo}</span>
          </div>
          
          <h3 className="text-lg font-black text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {news.title}
          </h3>
          
          <p className="text-sm text-white/60 line-clamp-2 mb-4">
            {news.summary}
          </p>

          {news.relatedPairs && news.relatedPairs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {news.relatedPairs.slice(0, 3).map(pair => (
                <span key={pair} className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/60 border border-white/5">
                  {pair}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              Leer más
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onShare?.(news); }}
              className="size-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-sm">share</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Ahora';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default NewsCard;
