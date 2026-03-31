import { memo, useEffect, useState } from 'react';

interface PriceTickerProps {
  price: number;
  previousPrice: number;
  currency?: string;
  showChange?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PriceTicker = memo(function PriceTicker({
  price,
  previousPrice,
  currency = 'USD',
  showChange = true,
  size = 'md',
  className = '',
}: PriceTickerProps) {
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (price > previousPrice) {
      setDirection('up');
      setFlash(true);
    } else if (price < previousPrice) {
      setDirection('down');
      setFlash(true);
    } else {
      setDirection('neutral');
    }

    const timer = setTimeout(() => setFlash(false), 500);
    return () => clearTimeout(timer);
  }, [price, previousPrice]);

  const changePercent = previousPrice ? ((price - previousPrice) / previousPrice) * 100 : 0;
  
  const sizeClasses = {
    sm: 'text-sm font-mono',
    md: 'text-lg font-mono font-bold',
    lg: 'text-2xl font-mono font-black',
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={sizeClasses[size]}>
        {formatCurrency(price)}
      </span>
      
      {showChange && previousPrice !== price && (
        <span
          className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold
            transition-all duration-300
            ${direction === 'up' ? 'bg-emerald-500/20 text-emerald-400' : ''}
            ${direction === 'down' ? 'bg-red-500/20 text-red-400' : ''}
            ${direction === 'neutral' ? 'bg-gray-500/20 text-gray-400' : ''}
            ${flash ? 'animate-pulse' : ''}
          `}
        >
          {direction === 'up' && '↑'}
          {direction === 'down' && '↓'}
          {changePercent >= 0 ? '+' : ''}
          {changePercent.toFixed(2)}%
        </span>
      )}
    </div>
  );
});

interface SignalPriceProps {
  entry: number;
  stopLoss: number;
  takeProfit?: number;
  currentPrice: number;
  className?: string;
}

export function SignalPriceCard({
  entry,
  stopLoss,
  takeProfit,
  currentPrice,
  className = '',
}: SignalPriceProps) {
  const pnl = currentPrice - entry;
  const pnlPercent = (pnl / entry) * 100;
  const isProfit = pnl >= 0;

  return (
    <div className={`bg-card-dark rounded-xl p-4 border border-white/10 ${className}`}>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Entrada</p>
          <p className="text-lg font-mono font-bold text-white">${entry.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">SL</p>
          <p className="text-lg font-mono font-bold text-red-400">${stopLoss.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">TP</p>
          <p className="text-lg font-mono font-bold text-emerald-400">
            {takeProfit ? `$${takeProfit.toFixed(2)}` : '—'}
          </p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">PnL</span>
          <span
            className={`text-lg font-mono font-bold ${
              isProfit ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export const Skeleton = memo(function Skeleton({
  height = 'h-4',
  width = 'w-full',
  className = '',
}: {
  height?: string;
  width?: string;
  className?: string;
}) {
  return (
    <div
      className={`
        ${height} ${width}
        bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800
        animate-pulse rounded
        ${className}
      `}
    />
  );
});

export const ChartSkeleton = memo(function ChartSkeleton({
  height = 'h-96',
  className = '',
}: {
  height?: string;
  className?: string;
}) {
  return (
    <div className={`bg-card-dark rounded-lg ${height} ${className}`}>
      <div className="h-full w-full p-4 flex flex-col gap-3">
        <Skeleton height="h-6" width="w-32" />
        <Skeleton height="h-full" />
        <div className="flex gap-2">
          <Skeleton height="h-4" width="w-16" />
          <Skeleton height="h-4" width="w-16" />
          <Skeleton height="h-4" width="w-16" />
        </div>
      </div>
    </div>
  );
});

interface BlurOverlayProps {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const BlurOverlay = memo(function BlurOverlay({
  children,
  intensity = 'medium',
  className = '',
}: BlurOverlayProps) {
  const blurClasses = {
    low: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    high: 'backdrop-blur-xl',
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`absolute inset-0 bg-black/60 ${blurClasses[intensity]} rounded-lg z-10`} />
      <div className="relative z-0 blur-sm select-none">{children}</div>
    </div>
  );
});

interface UpsellCTAProps {
  feature: string;
  price: string;
  urgency?: string;
  className?: string;
}

export const UpsellCTA = memo(function UpsellCTA({
  feature,
  price,
  urgency,
  className = '',
}: UpsellCTAProps) {
  return (
    <div className={`text-center p-6 ${className}`}>
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-bold mb-4">
        <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        PREMIUM
      </div>
      <h3 className="text-xl font-black text-white mb-2">{feature}</h3>
      <p className="text-2xl font-bold text-primary mb-2">{price}</p>
      {urgency && (
        <p className="text-sm text-red-400 mb-4 animate-pulse">{urgency}</p>
      )}
      <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
        Upgrade Ahora
      </button>
    </div>
  );
});
