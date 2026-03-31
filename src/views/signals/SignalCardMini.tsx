import React, { memo } from 'react';

export interface Signal {
  _id: any;
  signalId: string;
  providerId: string;
  type: string;
  priority: string;
  pair: string;
  pairCategory?: string;
  direction: 'buy' | 'sell';
  entryPrice: number;
  entryRangeMin?: number;
  entryRangeMax?: number;
  entryType: string;
  stopLoss: number;
  stopLossPips?: number;
  takeProfits: Array<{
    level: number;
    price: number;
    percentage?: number;
    reached: boolean;
    reachedAt?: number;
  }>;
  timeframe: string;
  status: string;
  sentAt?: number;
  tags: string[];
}

interface SignalCardMiniProps {
  signal: Signal;
  onClick?: () => void;
}

const SignalCardMini: React.FC<SignalCardMiniProps> = memo(({ signal, onClick }) => {
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div 
      onClick={onClick}
      className="glass rounded-lg p-3 bg-gradient-to-r from-black/40 to-transparent border border-white/5 hover:border-primary/30 cursor-pointer transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className={`shrink-0 size-10 rounded-lg flex items-center justify-center ${
          signal.direction === 'buy' 
            ? 'bg-signal-green/20 text-signal-green' 
            : 'bg-signal-red/20 text-signal-red'
        }`}>
          <span className="material-symbols-outlined text-xl">
            {signal.direction === 'buy' ? 'trending_up' : 'trending_down'}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-sm uppercase truncate">
              {signal.pair}
            </span>
            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
              signal.direction === 'buy' 
                ? 'bg-signal-green/20 text-signal-green' 
                : 'bg-signal-red/20 text-signal-red'
            }`}>
              {signal.direction === 'buy' ? 'BUY' : 'SELL'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>Entry: <span className="text-signal-green">{signal.entryPrice.toFixed(signal.entryPrice < 1 ? 4 : 2)}</span></span>
            <span>SL: <span className="text-signal-red">{signal.stopLoss.toFixed(signal.stopLoss < 1 ? 4 : 2)}</span></span>
            {signal.takeProfits[0] && (
              <span>TP: <span className="text-primary">{signal.takeProfits[0].price.toFixed(signal.takeProfits[0].price < 1 ? 4 : 2)}</span></span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
            signal.priority === 'vip' ? 'bg-amber-500/20 text-amber-400' :
            signal.priority === 'premium' ? 'bg-primary/20 text-primary' :
            'bg-white/5 text-gray-400'
          }`}>
            {signal.priority}
          </span>
          <p className="text-[9px] text-gray-600 mt-1">
            {signal.sentAt ? formatTime(signal.sentAt) : 'Ahora'}
          </p>
        </div>
      </div>
    </div>
  );
});

export default SignalCardMini;
