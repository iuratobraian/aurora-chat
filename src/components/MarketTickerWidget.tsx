import React, { useState } from 'react';
import { useMarketData, formatPrice, formatChange, getChangeColor, DEFAULT_SYMBOLS } from '../services/marketDataService';
import TradingViewWidget from './TradingViewWidget';

interface MarketTickerWidgetProps {
  initialSymbol?: string;
}

const MarketTickerWidget: React.FC<MarketTickerWidgetProps> = ({ initialSymbol = 'AAPL' }) => {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const { quotes, loading, error, refetch } = useMarketData(DEFAULT_SYMBOLS.map(s => s.symbol));

  const currentQuote = quotes[selectedSymbol];
  const symbolInfo = DEFAULT_SYMBOLS.find(s => s.symbol === selectedSymbol);

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">show_chart</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase">Mercado en Vivo</h3>
              <p className="text-[10px] text-gray-400">Datos en tiempo real</p>
            </div>
          </div>
          <button 
            onClick={() => refetch()}
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
            title="Actualizar"
          >
            <span className="material-symbols-outlined text-gray-400 text-sm">refresh</span>
          </button>
        </div>
      </div>

      {/* Symbol Selector */}
      <div className="p-3 border-b border-white/5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {DEFAULT_SYMBOLS.slice(0, 8).map((symbol) => (
            <button
              key={symbol.symbol}
              onClick={() => setSelectedSymbol(symbol.symbol)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap transition-all ${
                selectedSymbol === symbol.symbol
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {symbol.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Quote Display */}
      <div className="p-4 border-b border-white/5">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-3xl text-red-400 mb-2">error</span>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        ) : currentQuote ? (
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-black text-white">{currentQuote.symbol}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    symbolInfo?.type === 'crypto' ? 'bg-amber-500/20 text-amber-400' :
                    symbolInfo?.type === 'forex' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-signal-green/500/20 text-signal-green'
                  }`}>
                    {symbolInfo?.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{currentQuote.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-white">{formatPrice(currentQuote.price)}</p>
                <p className={`text-xs font-bold ${getChangeColor(currentQuote.change)}`}>
                  {formatChange(currentQuote.change, currentQuote.changePercent)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px]">
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-gray-500">Apertura</p>
                <p className="font-bold text-white">{formatPrice(currentQuote.open)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-gray-500">Alto</p>
                <p className="font-bold text-signal-green">{formatPrice(currentQuote.high)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-gray-500">Bajo</p>
                <p className="font-bold text-red-400">{formatPrice(currentQuote.low)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-gray-500">Cierre</p>
                <p className="font-bold text-white">{formatPrice(currentQuote.previousClose)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 text-xs">Sin datos disponibles</p>
          </div>
        )}
      </div>

      {/* TradingView Chart */}
      <div className="p-3">
        <TradingViewWidget 
          symbol={selectedSymbol} 
          height={250}
        />
      </div>

      {/* Quick Quotes */}
      <div className="p-3 border-t border-white/5">
        <p className="text-[9px] font-black text-gray-500 uppercase mb-2">Otros</p>
        <div className="grid grid-cols-4 gap-2">
          {DEFAULT_SYMBOLS.slice(0, 4).filter(s => s.symbol !== selectedSymbol).map((symbol) => {
            const quote = quotes[symbol.symbol];
            return (
              <button
                key={symbol.symbol}
                onClick={() => setSelectedSymbol(symbol.symbol)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-left"
              >
                <p className="text-[9px] font-bold text-white">{symbol.symbol}</p>
                {quote && (
                  <p className={`text-[8px] font-bold ${getChangeColor(quote.change)}`}>
                    {formatPrice(quote.price)}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketTickerWidget;
