import React, { memo, useState, useEffect } from 'react';
import { NewsArticle } from '../../types/news';
import { newsService } from '../../services/newsService';

export type NewsSentiment = 'bullish' | 'bearish' | 'neutral';

export interface SentimentFilterProps {
  selected: NewsSentiment | 'all';
  onSelect: (sentiment: NewsSentiment | 'all') => void;
  showStats?: boolean;
  hours?: number;
}

interface SentimentConfig {
  id: NewsSentiment | 'all';
  label: string;
  icon: string;
  color: string;
  activeColor: string;
  gradient: string;
}

const sentiments: SentimentConfig[] = [
  {
    id: 'all',
    label: 'Todos',
    icon: '📊',
    color: 'text-gray-400',
    activeColor: 'bg-gray-400/20 text-white',
    gradient: 'from-gray-500/20 to-gray-600/10',
  },
  {
    id: 'bullish',
    label: 'Alcista',
    icon: '📈',
    color: 'text-emerald-400',
    activeColor: 'bg-emerald-500/20 text-emerald-300',
    gradient: 'from-emerald-500/20 to-green-600/10',
  },
  {
    id: 'bearish',
    label: 'Bajista',
    icon: '📉',
    color: 'text-red-400',
    activeColor: 'bg-red-500/20 text-red-300',
    gradient: 'from-red-500/20 to-red-600/10',
  },
  {
    id: 'neutral',
    label: 'Neutral',
    icon: '➡️',
    color: 'text-gray-400',
    activeColor: 'bg-gray-500/20 text-gray-300',
    gradient: 'from-gray-500/20 to-gray-600/10',
  },
];

interface SentimentStats {
  bullish: number;
  bearish: number;
  neutral: number;
  total: number;
  percentages: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
}

const SentimentFilter: React.FC<SentimentFilterProps> = memo(({
  selected,
  onSelect,
  showStats = false,
  hours = 24,
}) => {
  const [sentimentData, setSentimentData] = useState<SentimentStats | null>(null);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const news = await newsService.fetchNews();
        const cutoff = Date.now() - hours * 60 * 60 * 1000;
        const recentNews = news.filter(n => new Date(n.publishedAt).getTime() >= cutoff);

        const bullish = recentNews.filter(n => n.sentiment === 'bullish').length;
        const bearish = recentNews.filter(n => n.sentiment === 'bearish').length;
        const neutral = recentNews.filter(n => n.sentiment === 'neutral' || !n.sentiment).length;
        const total = recentNews.length || 1;

        setSentimentData({
          bullish,
          bearish,
          neutral,
          total,
          percentages: {
            bullish: (bullish / total) * 100,
            bearish: (bearish / total) * 100,
            neutral: (neutral / total) * 100,
          },
        });
      } catch (error) {
        console.error('Error fetching sentiment:', error);
      }
    };
    fetchSentiment();
  }, [hours]);

  const getSentimentConfig = (id: NewsSentiment | 'all') => {
    if (id === 'all') {
      return sentiments.find((s) => s.id === 'all')!;
    }
    return sentiments.find((s) => s.id === id)!;
  };

  const config = getSentimentConfig(selected);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {sentiments.map((sentiment) => {
          const isActive = selected === sentiment.id;

          return (
            <button
              key={sentiment.id}
              onClick={() => onSelect(sentiment.id)}
              className={`
                relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider
                transition-all duration-300 flex items-center gap-2
                ${isActive
                  ? `${sentiment.activeColor} shadow-lg`
                  : `bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-transparent hover:border-white/10`
                }
              `}
            >
              <span className="text-sm">{sentiment.icon}</span>
              <span>{sentiment.label}</span>
            </button>
          );
        })}
      </div>

      {showStats && sentimentData && (
        <div className={`p-4 rounded-xl bg-gradient-to-r ${config.gradient} border border-white/5`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-300">Sentimiento del Mercado</span>
            <span className="text-[10px] text-gray-500">Últimas {hours}h</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-gray-400">Alcista</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">{sentimentData.bullish}</span>
                <span className="text-gray-500 w-12 text-right">
                  {sentimentData.percentages.bullish.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
                style={{ width: `${sentimentData.percentages.bullish}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-gray-400">Bajista</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-red-400 font-bold">{sentimentData.bearish}</span>
                <span className="text-gray-500 w-12 text-right">
                  {sentimentData.percentages.bearish.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-500"
                style={{ width: `${sentimentData.percentages.bearish}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-gray-400">Neutral</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-bold">{sentimentData.neutral}</span>
                <span className="text-gray-500 w-12 text-right">
                  {sentimentData.percentages.neutral.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gray-500 to-gray-400 transition-all duration-500"
                style={{ width: `${sentimentData.percentages.neutral}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-gray-500">Total Artículos</span>
            <span className="text-sm font-bold text-white">{sentimentData.total}</span>
          </div>
        </div>
      )}
    </div>
  );
});

SentimentFilter.displayName = 'SentimentFilter';

export default SentimentFilter;
