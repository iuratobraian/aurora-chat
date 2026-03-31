import React, { useState, useEffect } from 'react';
import { TradingPattern } from '../types';
import { StorageService } from '../services/storage';
import { detectPatterns } from '../services/aiPatternDetection';
import logger from '../utils/logger';

const AIPatternScanner: React.FC = () => {
  const [patterns, setPatterns] = useState<TradingPattern[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD');

  const symbols = ['BTC/USD', 'EUR/USD', 'XAU/USD', 'NAS100', 'ETH/USD'];

  useEffect(() => {
    const loadPatterns = async () => {
      const stored = await StorageService.getPatterns();
      setPatterns(stored);
    };
    loadPatterns();
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      // Generate mock historical data for the AI to analyze
      const mockHistoricalData = Array.from({ length: 30 }, (_, i) => {
        const basePrice = selectedSymbol === 'BTC/USD' ? 60000 : selectedSymbol === 'EUR/USD' ? 1.05 : selectedSymbol === 'XAU/USD' ? 2000 : 100;
        const volatility = basePrice * 0.02;
        return {
          date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          open: basePrice + (Math.random() - 0.5) * volatility,
          high: basePrice + Math.random() * volatility,
          low: basePrice - Math.random() * volatility,
          close: basePrice + (Math.random() - 0.5) * volatility,
          volume: Math.floor(Math.random() * 10000)
        };
      });

      const newPatterns = await detectPatterns(selectedSymbol, mockHistoricalData);
      
      if (newPatterns.length > 0) {
        for (const p of newPatterns) {
          await StorageService.savePattern(p);
        }
        const updated = await StorageService.getPatterns();
        setPatterns(updated);
      }
    } catch (error) {
      logger.error("Scan failed", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <section className="glass rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-gray-400 text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-500 text-sm">memory</span>
          AI Scanner
        </h2>
      </div>

      <div className="flex gap-2 mb-4">
        <select 
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none flex-1"
        >
          {symbols.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
        </select>
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isScanning ? (
            <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Scaneando...</>
          ) : (
            <><span className="material-symbols-outlined text-sm">search</span> Scan</>
          )}
        </button>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
        {patterns.length === 0 && !isScanning && (
          <p className="text-xs text-gray-500 text-center py-4">No hay patrones detectados.</p>
        )}
        
        {patterns.map(pattern => (
          <div key={pattern.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-gray-400">{pattern.symbol}</span>
                <h4 className="text-sm font-black text-white">{pattern.patternName}</h4>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${pattern.type === 'Bullish' ? 'bg-signal-green/20 text-signal-green' : pattern.type === 'Bearish' ? 'bg-alert-red/20 text-alert-red' : 'bg-gray-500/20 text-gray-400'}`}>
                {pattern.type}
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{pattern.description}</p>
            <div className="flex justify-between items-center mt-1 pt-2 border-t border-white/5">
              <span className="text-[10px] text-gray-500">Confianza: <span className="text-white font-bold">{pattern.confidence}%</span></span>
              <span className="text-[9px] text-gray-600">{new Date(pattern.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AIPatternScanner;
