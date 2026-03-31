import React, { useEffect, useRef } from 'react';

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
}

const sanitizeString = (str: string): string => {
  return str.replace(/[<>&'"]/g, '');
};

const DEFAULT_TICKER_DATA: TickerItem[] = [
  { symbol: 'S&P 500', price: '5,234.18', change: '+0.42%', isPositive: true },
  { symbol: 'NASDAQ', price: '16,428.82', change: '+0.63%', isPositive: true },
  { symbol: 'EUR/USD', price: '1.0842', change: '-0.15%', isPositive: false },
  { symbol: 'BTC/USD', price: '67,842.50', change: '+2.31%', isPositive: true },
  { symbol: 'ETH/USD', price: '3,521.40', change: '+1.87%', isPositive: true },
  { symbol: 'XAU/USD', price: '2,381.20', change: '+0.28%', isPositive: true },
  { symbol: 'GBP/USD', price: '1.2654', change: '-0.08%', isPositive: false },
  { symbol: 'USD/JPY', price: '151.42', change: '+0.12%', isPositive: true },
];

const Ticker: React.FC = () => {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedWatchlist = localStorage.getItem('user_watchlist');
    let tickerData = DEFAULT_TICKER_DATA;

    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist);
        if (Array.isArray(parsed) && parsed.length > 0) {
          tickerData = parsed.map((s: string) => {
            const safeSymbol = sanitizeString(String(s));
            const base = DEFAULT_TICKER_DATA.find(t => 
              t.symbol.toLowerCase().includes(safeSymbol.toLowerCase()) ||
              safeSymbol.toLowerCase().includes(t.symbol.toLowerCase())
            );
            if (base) return base;
            const change = (Math.random() * 4 - 2).toFixed(2);
            return {
              symbol: safeSymbol.substring(0, 10),
              price: (Math.random() * 10000).toFixed(2),
              change: `${change}%`,
              isPositive: parseFloat(change) >= 0
            };
          });
        }
      } catch (e) {}
    }

    if (!tickerRef.current) return;
    tickerRef.current.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'flex items-center gap-6 animate-ticker-scroll';
    
    const createTickerElement = (item: TickerItem): HTMLElement => {
      const el = document.createElement('div');
      el.className = 'flex items-center gap-2 whitespace-nowrap';
      
      const symbolSpan = document.createElement('span');
      symbolSpan.className = 'text-white text-xs font-semibold';
      symbolSpan.textContent = item.symbol;
      
      const priceSpan = document.createElement('span');
      priceSpan.className = 'text-gray-300 text-xs font-mono';
      priceSpan.textContent = item.price;
      
      const changeSpan = document.createElement('span');
      changeSpan.className = `${item.isPositive ? 'text-emerald-400' : 'text-red-400'} text-xs font-bold`;
      changeSpan.textContent = `${item.isPositive ? '▲' : '▼'} ${item.change}`;
      
      el.appendChild(symbolSpan);
      el.appendChild(priceSpan);
      el.appendChild(changeSpan);
      
      return el;
    };
    
    tickerData.forEach(item => {
      container.appendChild(createTickerElement(item));
    });

    const allItems = [...tickerData, ...tickerData];
    allItems.forEach(item => {
      container.appendChild(createTickerElement(item));
    });

    tickerRef.current.appendChild(container);
  }, []);

  return (
    <div className="relative overflow-hidden bg-black border-b border-white/5">
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker-scroll {
          animation: ticker-scroll 40s linear infinite;
        }
        .animate-ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="flex items-center">
        <div className="bg-primary px-3 py-2.5 flex items-center gap-1.5 z-10 relative">
          <span className="size-1.5 bg-white rounded-full animate-pulse"></span>
          <span className="text-white text-[10px] font-black uppercase tracking-widest">Live</span>
        </div>
        <div className="flex-1 overflow-hidden" ref={tickerRef} />
      </div>
    </div>
  );
};

export default Ticker;
