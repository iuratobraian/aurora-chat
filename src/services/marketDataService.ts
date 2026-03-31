import { useState, useEffect, useCallback } from 'react';

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface MarketSymbol {
  symbol: string;
  description: string;
  type: 'stock' | 'crypto' | 'forex' | 'index';
}

const FINNHUB_API_KEY = 'ctao8g1r01qgk7f2dpg0ctao8g1r01qgk7f2dpg';

const DEFAULT_SYMBOLS: MarketSymbol[] = [
  { symbol: 'AAPL', description: 'Apple Inc', type: 'stock' },
  { symbol: 'GOOGL', description: 'Alphabet Inc', type: 'stock' },
  { symbol: 'MSFT', description: 'Microsoft Corp', type: 'stock' },
  { symbol: 'AMZN', description: 'Amazon.com Inc', type: 'stock' },
  { symbol: 'TSLA', description: 'Tesla Inc', type: 'stock' },
  { symbol: 'NVDA', description: 'NVIDIA Corp', type: 'stock' },
  { symbol: 'META', description: 'Meta Platforms', type: 'stock' },
  { symbol: 'BTC-USD', description: 'Bitcoin USD', type: 'crypto' },
  { symbol: 'ETH-USD', description: 'Ethereum USD', type: 'crypto' },
  { symbol: 'EURUSD', description: 'Euro / US Dollar', type: 'forex' },
];

export const useMarketData = (symbols: string[] = DEFAULT_SYMBOLS.map(s => s.symbol)) => {
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async (symbol: string): Promise<MarketQuote | null> => {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      
      if (data.c === 0 && data.pc === 0) return null;
      
      const change = data.c - data.pc;
      const changePercent = data.pc > 0 ? (change / data.pc) * 100 : 0;
      
      const symbolInfo = DEFAULT_SYMBOLS.find(s => s.symbol === symbol);
      
      return {
        symbol,
        name: symbolInfo?.description || symbol,
        price: data.c,
        change,
        changePercent,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
        timestamp: Date.now(),
      };
    } catch (err) {
      console.error(`Error fetching ${symbol}:`, err);
      return null;
    }
  }, []);

  const fetchAllQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          const quote = await fetchQuote(symbol);
          return quote ? { [symbol]: quote } : null;
        })
      );
      
      const newQuotes: Record<string, MarketQuote> = {};
      results.forEach(result => {
        if (result) {
          const [symbol, quote] = Object.entries(result)[0];
          newQuotes[symbol] = quote;
        }
      });
      
      setQuotes(newQuotes);
    } catch (err) {
      setError('Error fetching market data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [symbols, fetchQuote]);

  useEffect(() => {
    fetchAllQuotes();
    
    const interval = setInterval(() => {
      fetchAllQuotes();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchAllQuotes]);

  return { quotes, loading, error, refetch: fetchAllQuotes };
};

export const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatChange = (change: number, changePercent: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
};

export const getChangeColor = (change: number): string => {
  if (change > 0) return 'text-signal-green';
  if (change < 0) return 'text-red-500';
  return 'text-gray-400';
};

export { DEFAULT_SYMBOLS };
