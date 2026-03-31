const BITACORA_API_URL = 'https://bitacora-de-trading.vercel.app/api';

export interface BitacoraStats {
  userId: string;
  totalTrades: number;
  wins: number;
  losses: number;
  breakeven: number;
  totalPnl: number;
  winRate: string;
  bestTrade: number;
  worstTrade: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: string;
  bestAsset: string;
  lastTradeDate: string | null;
}

class BitacoraService {
  async getStats(userId: string): Promise<BitacoraStats | null> {
    try {
      const response = await fetch(`${BITACORA_API_URL}/stats?userId=${userId}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch {
      return null;
    }
  }

  isVerifiedTrader(stats: BitacoraStats | null): boolean {
    if (!stats) return false;
    return stats.totalTrades >= 50 && parseFloat(stats.winRate) >= 40;
  }

  getTraderTier(stats: BitacoraStats | null): 'bronze' | 'silver' | 'gold' | 'vip' {
    if (!stats || stats.totalTrades < 10) return 'bronze';
    if (stats.totalTrades < 50) return 'silver';
    if (stats.totalTrades < 200) return 'gold';
    return 'vip';
  }
}

export const bitacoraService = new BitacoraService();
