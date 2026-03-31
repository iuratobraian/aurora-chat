import React, { useState, useEffect } from 'react';
import { bitacoraService, BitacoraStats } from '../services/bitacoraService';

interface VerifiedTraderProps {
  userId: string;
  username: string;
}

const tierConfig = {
  bronze: {
    color: '#cd7f32',
    bg: 'from-amber-950/50 to-amber-900/20',
    border: 'border-amber-700/30',
    label: 'Bronze Trader'
  },
  silver: {
    color: '#c0c0c0',
    bg: 'from-gray-700/50 to-gray-600/20',
    border: 'border-gray-500/30',
    label: 'Silver Trader'
  },
  gold: {
    color: '#ffd700',
    bg: 'from-yellow-600/30 to-yellow-500/10',
    border: 'border-yellow-500/40',
    label: 'Gold Trader'
  },
  vip: {
    color: '#e040fb',
    bg: 'from-purple-600/40 to-pink-500/20',
    border: 'border-purple-400/50',
    label: 'VIP Trader'
  }
};

export const VerifiedTrader: React.FC<VerifiedTraderProps> = ({ userId, username }) => {
  const [stats, setStats] = useState<BitacoraStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await bitacoraService.getStats(userId);
        setStats(data);
        setError(!data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (error || !stats || stats.totalTrades === 0) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-gray-500">analytics</span>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Track Record</h3>
        </div>
        <p className="text-xs text-gray-500">
          Conecta tu Bitácora para mostrar tu track record de trading
        </p>
      </div>
    );
  }

  const tier = bitacoraService.getTraderTier(stats);
  const config = tierConfig[tier];
  const isPositive = stats.totalPnl >= 0;

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full blur-2xl" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="size-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <span className="material-symbols-outlined text-lg" style={{ color: config.color }}>
              workspace_premium
            </span>
          </div>
          <div>
            <span 
              className="text-xs font-black uppercase tracking-wider"
              style={{ color: config.color }}
            >
              {config.label}
            </span>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Verified by Bitácora</p>
          </div>
        </div>
        
        <a
          href="https://bitacora-de-trading.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Trades</p>
          <p className="text-xl font-black text-white">{stats.totalTrades}</p>
        </div>
        
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Win Rate</p>
          <p className="text-xl font-black" style={{ color: parseFloat(stats.winRate) >= 50 ? '#10b981' : '#ef4444' }}>
            {stats.winRate}%
          </p>
        </div>
        
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">P&L Total</p>
          <p className="text-xl font-black" style={{ color: isPositive ? '#10b981' : '#ef4444' }}>
            {isPositive ? '+' : ''}{stats.totalPnl.toFixed(2)}
          </p>
        </div>
        
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Profit Factor</p>
          <p className="text-xl font-black text-white">{stats.profitFactor}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-[9px] text-gray-500 uppercase">Wins</p>
          <p className="text-sm font-bold text-green-400">{stats.wins}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-gray-500 uppercase">Loss</p>
          <p className="text-sm font-bold text-red-400">{stats.losses}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-gray-500 uppercase">Best</p>
          <p className="text-sm font-bold text-yellow-400">{stats.bestAsset}</p>
        </div>
      </div>

      {stats.lastTradeDate && (
        <p className="text-[9px] text-gray-600 mt-3 text-center uppercase tracking-widest">
          Último trade: {new Date(stats.lastTradeDate).toLocaleDateString('es-ES')}
        </p>
      )}
    </div>
  );
};

export default VerifiedTrader;
