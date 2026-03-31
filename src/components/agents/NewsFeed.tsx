import React, { useState, useEffect } from 'react';
import { 
  fetchMarketNews, 
  analyzeAsset, 
  searchNews, 
  NEWS_CATEGORIES,
  type NewsItem,
  type AnalysisResult 
} from '../../services/agents/newsAgentService';

interface NewsFeedProps {
  compact?: boolean;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ compact = false }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadNews();
  }, [category]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await fetchMarketNews(category);
      setNews(data);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadNews();
      return;
    }
    setLoading(true);
    try {
      const results = await searchNews(searchQuery);
      setNews(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (symbol: string) => {
    setAnalyzing(true);
    setSelectedAnalysis(null);
    try {
      const analysis = await analyzeAsset(symbol);
      setSelectedAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'bearish': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getCategoryIcon = (cat: string) => {
    const found = NEWS_CATEGORIES.find(c => c.id === cat);
    return found?.icon || '📰';
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {news.slice(0, 5).map(item => (
          <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <span className="text-xl">{getCategoryIcon(item.category)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-gray-400">{item.source} • {formatTimeAgo(item.publishedAt)}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {NEWS_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                category === cat.id 
                  ? 'bg-primary text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar noticias..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 md:w-64 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/30 transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No se encontraron noticias
            </div>
          ) : (
            news.map(item => (
              <div 
                key={item.id}
                className="glass rounded-2xl p-4 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => window.open(item.sourceUrl, '_blank')}
              >
                <div className="flex gap-4">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getCategoryIcon(item.category)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getSentimentColor(item.sentiment)}`}>
                        {item.sentiment || 'neutral'}
                      </span>
                      {item.isAIAnalysis && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/20">
                          🤖 IA
                        </span>
                      )}
                      <span className="text-xs text-gray-500 ml-auto">
                        {formatTimeAgo(item.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">{item.source}</span>
                      {item.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-4">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <span>📊</span> Análisis IA
            </h3>
            <div className="space-y-2">
              {['BTC', 'EUR/USD', 'ETH', 'GOLD'].map(symbol => (
                <button
                  key={symbol}
                  onClick={() => handleAnalyze(symbol)}
                  disabled={analyzing}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                >
                  <span className="font-bold">{symbol}</span>
                  {analyzing ? (
                    <span className="animate-spin text-primary">⟳</span>
                  ) : (
                    <span className="text-primary text-sm">Analizar →</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {selectedAnalysis && (
            <div className="glass rounded-2xl p-4 border border-primary/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white">{selectedAnalysis.symbol}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  selectedAnalysis.trend === 'bullish' ? 'bg-green-500/20 text-green-400' :
                  selectedAnalysis.trend === 'bearish' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {selectedAnalysis.trend.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-4">{selectedAnalysis.summary}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <span className="text-gray-400">Soporte</span>
                  <div className="font-mono text-green-400">
                    {selectedAnalysis.levels.support.slice(0, 2).join(' / ')}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <span className="text-gray-400">Resistencia</span>
                  <div className="font-mono text-red-400">
                    {selectedAnalysis.levels.resistance.slice(0, 2).join(' / ')}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-400">Sentimiento: {(selectedAnalysis.sentiment * 100).toFixed(0)}%</span>
                <span className="text-gray-400">Confianza: {(selectedAnalysis.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{ width: `${selectedAnalysis.sentiment * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;
