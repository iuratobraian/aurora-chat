import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { NewsArticle, NewsCategory, NewsSource } from '../types/news';
import { newsService, SOURCE_CONFIG } from '../services/newsService';
import NewsCard from '../components/news/NewsCard';
import { useToast } from '../components/ToastProvider';
import { ShineCard } from '../components/ui/ShineCard';
import { GlowCard } from '../components/ui/GlowCard';

interface NewsViewProps {
  usuario?: any;
}

const CATEGORIES: { id: NewsCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Todas', icon: 'globe' },
  { id: 'forex', label: 'Forex', icon: 'currency_exchange' },
  { id: 'crypto', label: 'Crypto', icon: 'currency_bitcoin' },
  { id: 'indices', label: 'Índices', icon: 'show_chart' },
  { id: 'commodities', label: 'commodities', icon: 'oil_barrel' },
  { id: 'stocks', label: 'Acciones', icon: 'trending_up' },
  { id: 'economic', label: 'Económico', icon: 'account_balance' },
  { id: 'analysis', label: 'Análisis', icon: 'analytics' },
];

const SOURCES: { id: NewsSource; label: string; icon: string }[] = [
  { id: 'investing', label: 'Investing.com', icon: '📈' },
  { id: 'myfxbook', label: 'MyFXBook', icon: '📊' },
  { id: 'forexfactory', label: 'Forex Factory', icon: '🏭' },
  { id: 'bloomberg', label: 'Bloomberg', icon: '💼' },
  { id: 'reuters', label: 'Reuters', icon: '📰' },
  { id: 'cointelegraph', label: 'CoinTelegraph', icon: '₿' },
  { id: 'tradingview', label: 'TradingView', icon: '📉' },
  { id: 'fxstreet', label: 'FXStreet', icon: '💱' },
  { id: 'dailyfx', label: 'DailyFX', icon: '📊' },
];

const NewsView: React.FC<NewsViewProps> = ({ usuario }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'all'>('all');
  const [activeSource, setActiveSource] = useState<NewsSource | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const { showToast } = useToast();
  const calendarEvents = useQuery(api.market.economicCalendar.getUpcomingEvents, { limit: 10 });

  const isAdmin = usuario?.rol === 'admin' || usuario?.rol === 'ceo';
  
  const marketSentiment = useMemo(() => {
    if (!news.length) return { label: 'Neutral', score: 50, color: 'text-gray-400' };
    const bullish = news.filter(n => n.sentiment === 'bullish').length;
    const bearish = news.filter(n => n.sentiment === 'bearish').length;
    const total = bullish + bearish || 1;
    const score = Math.round((bullish / total) * 100);
    
    if (score > 60) return { label: 'Bullish', score, color: 'text-green-400', icon: 'trending_up' };
    if (score < 40) return { label: 'Bearish', score, color: 'text-red-400', icon: 'trending_down' };
    return { label: 'Neutral', score: 50, color: 'text-gray-400', icon: 'horizontal_rule' };
  }, [news]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const filter = {
        categories: activeCategory !== 'all' ? [activeCategory] : undefined,
        sources: activeSource !== 'all' ? [activeSource] : undefined,
        searchQuery: searchQuery || undefined,
      };
      const fetchedNews = await newsService.fetchNews(filter);
      setNews(fetchedNews);
    } catch (error) {
      console.error('Error fetching news:', error);
      showToast('error', 'Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSource, searchQuery, showToast]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await newsService.refreshNews();
      await fetchNews();
      showToast('success', 'Noticias actualizadas');
    } catch (error) {
      showToast('error', 'Error al actualizar');
    }
  };

  const handleReadMore = (article: NewsArticle) => {
    setSelectedArticle(article);
    window.open(article.url, '_blank');
  };

  const handleShare = (article: NewsArticle) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.url,
      });
    } else {
      navigator.clipboard.writeText(article.url);
      showToast('success', 'Enlace copiado');
    }
  };

  const featuredNews = news[0];
  const remainingNews = news.slice(1);
  const trendingNews = [...news].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  return (
    <div className="max-w-[1600px] mx-auto px-4 pt-16 pb-20 animate-in fade-in duration-700">
      {/* Breaking News Ticker */}
      {news.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-3 px-4 py-2 border-b border-red-500/20">
            <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded animate-pulse">
              Breaking
            </span>
            <div className="flex-1 overflow-hidden">
              <div className="whitespace-nowrap animate-marquee">
                {news.slice(0, 5).map((article, i) => (
                  <span key={i} className="inline-block mr-12 text-xs text-white/80 font-medium">
                    {article.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">newspaper</span>
            </div>
            Noticias Financieras
          </h1>
          <p className="text-white/50 mt-1">Mantente informado con las últimas noticias del mercado</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => showToast('info', 'Agente de noticias configurado')}
              className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-bold hover:bg-purple-500/30 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">psychology</span>
              Agente IA
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>refresh</span>
            Actualizar
          </button>
        </div>
      </div>

      {/* Market Sentiment Bar */}
      <GlowCard glowColor={marketSentiment.score > 50 ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"} className="mb-6 !p-4">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-gray-400 uppercase">Sentimiento IA:</span>
            <div className="flex items-center gap-1">
              <span className={`text-sm ${marketSentiment.color}`}>{marketSentiment.icon === 'trending_up' ? '📈' : marketSentiment.icon === 'trending_down' ? '📉' : '➡️'}</span>
              <span className={`text-xs font-black uppercase tracking-widest ${marketSentiment.color}`}>
                {marketSentiment.label} {marketSentiment.score}%
              </span>
            </div>
          </div>
          <div className="h-6 w-px bg-white/10 shrink-0" />
          <div className="flex items-center gap-4 shrink-0 overflow-hidden">
            {CATEGORIES.slice(1, 5).map(cat => {
                const catNews = news.filter(n => n.category === cat.id);
                const hasBull = catNews.some(n => n.sentiment === 'bullish');
                return (
                    <span key={cat.id} className="text-[10px] uppercase font-black tracking-tighter text-gray-400">
                        {cat.label}: <span className={hasBull ? 'text-green-400' : 'text-red-400'}>{hasBull ? 'Bull' : 'Bear'}</span>
                    </span>
                );
            })}
          </div>
        </div>
      </GlowCard>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-6 border border-white/10">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 material-symbols-outlined">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar noticias..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined">view_list</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Source Filter */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider self-center mr-2">Fuentes:</span>
          {SOURCES.map(source => (
            <button
              key={source.id}
              onClick={() => setActiveSource(activeSource === source.id ? 'all' : source.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSource === source.id
                  ? 'bg-white/20 text-white border border-white/20'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              {source.icon} {source.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Featured News */}
          {featuredNews && (
            <ShineCard intensity="high" className="mb-2">
              <NewsCard
                news={featuredNews}
                variant="featured"
                onReadMore={handleReadMore}
                onShare={handleShare}
              />
            </ShineCard>
          )}

          {/* News Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-white/5" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-white/5 rounded w-1/4" />
                    <div className="h-6 bg-white/5 rounded w-3/4" />
                    <div className="h-4 bg-white/5 rounded w-full" />
                    <div className="h-4 bg-white/5 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : remainingNews.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {remainingNews.map(article => (
                  <NewsCard
                    key={article.id}
                    news={article}
                    onReadMore={handleReadMore}
                    onShare={handleShare}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {remainingNews.map(article => (
                  <NewsCard
                    key={article.id}
                    news={article}
                    variant="compact"
                    onReadMore={handleReadMore}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
              <div className="size-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-white/20">newspaper</span>
              </div>
              <h3 className="text-lg font-black text-white mb-2">No hay noticias</h3>
              <p className="text-sm text-white/40">Intenta cambiar los filtros o actualizar</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending */}
          <div className="glass rounded-2xl p-4 border border-white/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">local_fire_department</span>
              Tendencia
            </h3>
            <div className="space-y-2">
              {trendingNews.map((article, index) => (
                <div
                  key={article.id}
                  className="group flex gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                  onClick={() => handleReadMore(article)}
                >
                  <span className="text-lg font-black text-white/20 group-hover:text-primary transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white/80 line-clamp-2 group-hover:text-white transition-colors">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-white/30">{SOURCE_CONFIG[article.source].icon}</span>
                      <span className="text-[10px] text-white/30">{article.category}</span>
                      {article.sentiment && (
                        <span className={`text-[10px] ${
                          article.sentiment === 'bullish' ? 'text-green-400' :
                          article.sentiment === 'bearish' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {article.sentiment === 'bullish' ? '📈' : article.sentiment === 'bearish' ? '📉' : '➡️'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Pairs */}
          <div className="glass rounded-2xl p-4 border border-white/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-signal-green mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Pares Relacionados
            </h3>
            <div className="flex flex-wrap gap-2">
              {['EUR/USD', 'GBP/USD', 'USD/JPY', 'BTC/USD', 'ETH/USD', 'XAU/USD', 'NAS100'].map(pair => (
                <button
                  key={pair}
                  onClick={() => setSearchQuery(pair)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:bg-primary hover:border-primary hover:text-white transition-all"
                >
                  {pair}
                </button>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div className="glass rounded-2xl p-4 border border-white/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">rss_feed</span>
              Fuentes
            </h3>
            <div className="space-y-2">
              {SOURCES.slice(0, 5).map(source => {
                const count = news.filter(n => n.source === source.id).length;
                return (
                  <div key={source.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all">
                    <div className="flex items-center gap-2">
                      <span>{source.icon}</span>
                      <span className="text-xs font-medium text-white/70">{source.label}</span>
                    </div>
                    <span className="text-[10px] text-white/30">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Economic Calendar */}
          <GlowCard glowColor="rgba(59, 130, 246, 0.3)" className="!p-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              Calendario Económico
            </h3>
            <div className="space-y-3">
              {calendarEvents && calendarEvents.length > 0 ? (
                calendarEvents.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all">
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.impact === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-yellow-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{item.event}</p>
                      <p className="text-[9px] text-gray-500">Forecast: {item.forecast || 'N/A'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-[10px] text-gray-500 italic">No hay eventos próximos</p>
                </div>
              )}
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
};

export default NewsView;
