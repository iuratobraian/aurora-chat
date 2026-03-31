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

const DEMO_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Bitcoin alcanza nuevo máximo semanal tras institucionalización',
    summary: 'BTC supera los $85,000 con inflows record en ETFs',
    content: 'El mercado de criptomonedas muestra fortaleza...',
    source: 'CoinMarketCap',
    sourceUrl: 'https://coinmarketcap.com',
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
    publishedAt: new Date(Date.now() - 1000 * 60 * 30),
    category: 'crypto',
    sentiment: 'bullish',
    tags: ['BTC', 'Bitcoin', 'ETF'],
    isAIAnalysis: false
  },
  {
    id: '2',
    title: 'EUR/USD analiza ruptura de resistencia clave',
    summary: 'El par muestra momentum bullish en gráfico diario',
    content: 'Los indicadores técnicos sugieren continuación...',
    source: 'TradingView',
    sourceUrl: 'https://tradingview.com',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60),
    category: 'forex',
    sentiment: 'bullish',
    tags: ['EUR/USD', 'Forex', 'Técnico'],
    isAIAnalysis: true
  },
  {
    id: '3',
    title: 'Oro corrige desde máximos históricos',
    summary: 'XAU/USD retreats after hitting $3,100',
    content: 'El metal precioso toma respiro tras rally...',
    source: 'FX Street',
    sourceUrl: 'https://fxstreet.com',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400',
    publishedAt: new Date(Date.now() - 1000 * 60 * 90),
    category: 'commodities',
    sentiment: 'neutral',
    tags: ['Oro', 'XAU/USD', 'Commodities'],
    isAIAnalysis: false
  },
  {
    id: '4',
    title: 'NVIDIA lidera rally de semiconductores',
    summary: 'NVDA sube 5% tras earnings beats',
    content: 'El sector tecnológico impulsa índices...',
    source: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    publishedAt: new Date(Date.now() - 1000 * 60 * 120),
    category: 'stocks',
    sentiment: 'bullish',
    tags: ['NVDA', 'Semiconductores', ' earnings'],
    isAIAnalysis: true
  },
  {
    id: '5',
    title: 'S&P 500 marca nuevo cierre histórico',
    summary: 'El índice cierra acima de 5,200 puntos',
    content: 'Los inversores optimism tras datos económicos...',
    source: 'CNBC',
    sourceUrl: 'https://cnbc.com',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400',
    publishedAt: new Date(Date.now() - 1000 * 60 * 180),
    category: 'indices',
    sentiment: 'bullish',
    tags: ['S&P 500', 'Wall Street', 'Índices'],
    isAIAnalysis: false
  },
  {
    id: '6',
    title: 'Análisis: Ethereum preparado para próximo rally',
    summary: 'ETH muestra estructura bullish en marco semanal',
    content: 'Los indicadores on-chain sugieren acumulación...',
    source: 'Deep Research',
    sourceUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400',
    publishedAt: new Date(Date.now() - 1000 * 60 * 15),
    category: 'crypto',
    sentiment: 'bullish',
    tags: ['ETH', 'Ethereum', 'Análisis'],
    isAIAnalysis: true
  }
];

export async function fetchMarketNews(category?: string): Promise<NewsItem[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let news = [...DEMO_NEWS];
  
  if (category && category !== 'all') {
    news = news.filter(n => n.category === category);
  }
  
  return news.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
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
