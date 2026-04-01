import { api } from "../../../convex/_generated/api";
import { getConvexClient } from '../../../lib/convex/client';

const convex = getConvexClient();

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  publishedAt: Date;
  category: 'crypto' | 'forex' | 'commodities' | 'indices' | 'stocks' | 'general';
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  tags: string[];
  isAIAnalysis?: boolean;
}

export interface AnalysisResult {
  symbol: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  summary: string;
  levels: {
    support: number[];
    resistance: number[];
  };
  sentiment: number;
  confidence: number;
}

export async function fetchMarketNews(category?: string): Promise<NewsItem[]> {
  try {
    if (convex) {
      const news = await convex.query(api.market.marketNews.getRecentNews, { hours: 24 });
      
      let mappedNews: NewsItem[] = (news || []).map((n: any) => ({
        id: n._id || n.id,
        title: n.title || '',
        summary: n.summary || '',
        content: n.content || '',
        source: n.source || 'Unknown',
        sourceUrl: n.sourceUrl || '',
        imageUrl: n.imageUrl || undefined,
        publishedAt: new Date(n.publishedAt || Date.now()),
        category: n.category || 'general',
        sentiment: n.sentiment || 'neutral',
        tags: n.tags || [],
        isAIAnalysis: n.isAIGenerated || false
      }));
      
      if (category && category !== 'all') {
        mappedNews = mappedNews.filter(n => n.category === category);
      }
      
      return mappedNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    }
  } catch (error) {
    console.error('Error fetching market news from Convex:', error);
  }
  
  return [];
}

export async function analyzeAsset(symbol: string): Promise<AnalysisResult> {
  try {
    if (convex) {
      const news = await convex.query(api.market.marketNews.getNewsByPair, { pair: symbol.toUpperCase(), limit: 10 });
      
      if (news && news.length > 0) {
        const sentiments = news.map((n: any) => n.sentiment);
        const bullishCount = sentiments.filter((s: string) => s === 'bullish').length;
        const bearishCount = sentiments.filter((s: string) => s === 'bearish').length;
        
        let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
        if (bullishCount > bearishCount) trend = 'bullish';
        else if (bearishCount > bullishCount) trend = 'bearish';
        
        const avgSentiment = sentiments.length > 0 
          ? (bullishCount - bearishCount) / sentiments.length 
          : 0;
        
        return {
          symbol: symbol.toUpperCase(),
          trend,
          summary: `Análisis basado en ${news.length} noticias recientes sobre ${symbol}. Sentimiento: ${trend}`,
          levels: { support: [], resistance: [] },
          sentiment: avgSentiment,
          confidence: Math.min(0.3 + (news.length * 0.05), 0.9)
        };
      }
    }
  } catch (error) {
    console.error('Error analyzing asset from Convex:', error);
  }
  
  return {
    symbol: symbol.toUpperCase(),
    trend: 'neutral',
    summary: 'No hay suficientes datos de noticias para generar análisis. Sincroniza noticias desde el panel de administración.',
    levels: { support: [], resistance: [] },
    sentiment: 0.5,
    confidence: 0.1
  };
}

export async function searchNews(query: string): Promise<NewsItem[]> {
  try {
    if (convex) {
      const news = await convex.query(api.market.marketNews.searchNews, { query, limit: 20 });
      
      return (news || []).map((n: any) => ({
        id: n._id || n.id,
        title: n.title || '',
        summary: n.summary || '',
        content: n.content || '',
        source: n.source || 'Unknown',
        sourceUrl: n.sourceUrl || '',
        imageUrl: n.imageUrl || undefined,
        publishedAt: new Date(n.publishedAt || Date.now()),
        category: n.category || 'general',
        sentiment: n.sentiment || 'neutral',
        tags: n.tags || [],
        isAIAnalysis: n.isAIGenerated || false
      }));
    }
  } catch (error) {
    console.error('Error searching news from Convex:', error);
  }
  
  return [];
}

export const NEWS_CATEGORIES = [
  { id: 'all', label: 'Todo', icon: '🌐' },
  { id: 'crypto', label: 'Crypto', icon: '₿' },
  { id: 'forex', label: 'Forex', icon: '💱' },
  { id: 'commodities', label: 'Materias Primas', icon: '🛢️' },
  { id: 'indices', label: 'Índices', icon: '📈' },
  { id: 'stocks', label: 'Acciones', icon: '🏛️' },
] as const;
