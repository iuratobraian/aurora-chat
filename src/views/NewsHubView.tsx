import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type Category = 'forex' | 'crypto' | 'commodities' | 'indices' | 'stocks' | 'general';
type Sentiment = 'bullish' | 'bearish' | 'neutral';

interface NewsArticle {
  _id: Id<"market_news">;
  title: string;
  summary?: string;
  content: string;
  source: string;
  sourceUrl: string;
  category: Category;
  sentiment?: Sentiment;
  relatedPairs: string[];
  imageUrl?: string;
  publishedAt: number;
  views: number;
  likes: string[];
  tags: string[];
  isAIGenerated: boolean;
}

const categories: { id: Category | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '📊' },
  { id: 'forex', label: 'Forex', icon: '💱' },
  { id: 'crypto', label: 'Crypto', icon: '₿' },
  { id: 'commodities', label: 'Commodities', icon: '🛢️' },
  { id: 'indices', label: 'Indices', icon: '📈' },
  { id: 'stocks', label: 'Stocks', icon: '🏛️' },
];

const NewsHubView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);

  const recentNews = useQuery(api.market.marketNews.getRecentNews, { hours: 48 });
  const trendingNews = useQuery(api.market.marketNews.getTrendingNews, { limit: 5 });
  const aiNews = useQuery(api.market.marketNews.getAINews, { limit: 10 });
  const sentiment = useQuery(api.market.marketNews.getNewsSentiment, { hours: 24 });
  const lastSyncTime = useQuery(api.market.marketNews.getLastSyncTime);
  const searchResults = useQuery(
    api.market.marketNews.searchNews, 
    { query: searchQuery, category: selectedCategory !== 'all' ? selectedCategory : undefined, limit: 20 }
  );

  const syncNews = useMutation(api.market.marketNews.syncNewsFromSources);
  const generateAINews = useMutation(api.market.marketNews.generateAINews);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncNews({});
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      await generateAINews({ 
        category: selectedCategory !== 'all' ? selectedCategory as any : undefined,
        count: 3 
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const displayedNews = searchQuery 
    ? searchResults 
    : selectedCategory === 'all' 
      ? recentNews 
      : recentNews?.filter(n => n.category === selectedCategory);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getSentimentIcon = (sentiment?: Sentiment) => {
    switch (sentiment) {
      case 'bullish': return '📈';
      case 'bearish': return '📉';
      default: return '➡️';
    }
  };

  const getCategoryColor = (category: Category) => {
    const colors: Record<Category, string> = {
      forex: 'text-blue-400 bg-blue-400/10',
      crypto: 'text-orange-400 bg-orange-400/10',
      commodities: 'text-amber-400 bg-amber-400/10',
      indices: 'text-green-400 bg-green-400/10',
      stocks: 'text-purple-400 bg-purple-400/10',
      general: 'text-gray-400 bg-gray-400/10',
    };
    return colors[category];
  };

  const openNewsInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatSyncTime = (timestamp: number | null) => {
    if (!timestamp) return 'Nunca';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">News Hub</h3>
          <span className="text-[7px] text-gray-600">
            Sync: {formatSyncTime(lastSyncTime || null)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleGenerateAI}
            disabled={isGeneratingAI}
            className="p-1 rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
            title="Generar noticias con IA"
          >
            <svg className={`w-3 h-3 text-primary ${isGeneratingAI ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Sincronizar noticias"
          >
            <svg className={`w-3 h-3 text-gray-500 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search news..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] text-gray-300 placeholder-gray-500 focus:outline-none focus:border-primary/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
              selectedCategory === cat.id 
                ? 'bg-primary text-white' 
                : 'bg-white/5 text-gray-500 hover:bg-white/10'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {sentiment && !searchQuery && (
        <div className="flex items-center gap-3 mb-2 px-1">
          <div className="flex items-center gap-1">
            <span className="text-[7px]">📈</span>
            <span className="text-[8px] font-mono text-signal-green">{sentiment.percentages.bullish.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7px]">➡️</span>
            <span className="text-[8px] font-mono text-gray-400">{sentiment.percentages.neutral.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7px]">📉</span>
            <span className="text-[8px] font-mono text-alert-red">{sentiment.percentages.bearish.toFixed(0)}%</span>
          </div>
        </div>
      )}

      <div className="glass rounded-[1rem] border border-white/5 overflow-hidden shadow-lg flex-1 max-h-[400px] overflow-y-auto no-scrollbar">
        <div className="divide-y divide-white/5 text-gray-300">
          {displayedNews && displayedNews.length > 0 ? (
            displayedNews.slice(0, 20).map((news: NewsArticle) => (
              <div 
                key={news._id}
                onClick={() => setSelectedNews(news)}
                className="p-2 hover:bg-white/[0.03] transition-colors cursor-pointer group"
              >
                <div className="flex gap-2">
                  {news.imageUrl && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                      <img 
                        src={news.imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-[9px] font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {news.title}
                      </h4>
                      <span className="flex-shrink-0 text-[8px] text-gray-500">
                        {getSentimentIcon(news.sentiment)}
                      </span>
                    </div>
                    <p className="text-[8px] text-gray-500 line-clamp-2 mb-1">
                      {news.summary}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[7px] font-black uppercase px-1 py-0.5 rounded ${getCategoryColor(news.category)}`}>
                        {news.category}
                      </span>
                      <span className="text-[7px] text-gray-600">{news.source}</span>
                      <span className="text-[7px] text-gray-600 ml-auto">{formatTimeAgo(news.publishedAt)}</span>
                    </div>
                    {news.relatedPairs.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {news.relatedPairs.slice(0, 3).map((pair, i) => (
                          <span key={i} className="text-[7px] font-mono text-gray-500 bg-white/5 px-1 rounded">
                            {pair}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 text-[9px]">
              No news found. Try syncing or changing filters.
            </div>
          )}
        </div>
      </div>

      {selectedNews && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedNews(null)}>
          <div 
            className="glass rounded-2xl border border-white/10 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded ${getCategoryColor(selectedNews.category)}`}>
                  {selectedNews.category}
                </span>
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="p-1 rounded hover:bg-white/10"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <h3 className="text-sm font-bold mb-2">{selectedNews.title}</h3>
              
              <div className="flex items-center gap-2 text-[8px] text-gray-500 mb-3">
                <span>{selectedNews.source}</span>
                <span>•</span>
                <span>{formatTimeAgo(selectedNews.publishedAt)}</span>
                <span>•</span>
                <span>{selectedNews.views} views</span>
              </div>
              
              {selectedNews.imageUrl && (
                <img 
                  src={selectedNews.imageUrl} 
                  alt="" 
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}
              
              <p className="text-[9px] text-gray-400 leading-relaxed mb-4">
                {selectedNews.summary || selectedNews.content}
              </p>
              
              <button
                onClick={() => openNewsInNewTab(selectedNews.sourceUrl)}
                className="w-full py-2 bg-primary text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors"
              >
                Read Full Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsHubView;
