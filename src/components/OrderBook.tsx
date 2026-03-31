
import React, { useState, useEffect, useMemo, memo } from 'react';

interface OrderBookProps {
  symbol: string;
  price: number;
}

const OrderBook = memo<OrderBookProps>(({ symbol, price }) => {
  const [bids, setBids] = useState<{ p: number, q: number, total: number }[]>([]);
  const [asks, setAsks] = useState<{ p: number, q: number, total: number }[]>([]);

  useEffect(() => {
    // Generar libro inicial
    const generateBook = () => {
      const b = [];
      const a = [];
      let totalB = 0;
      let totalA = 0;
      for (let i = 1; i <= 15; i++) {
        const qB = Math.random() * 2;
        const qA = Math.random() * 2;
        totalB += qB;
        totalA += qA;
        b.push({ p: price - (i * (price * 0.0002)), q: qB, total: totalB });
        a.push({ p: price + (i * (price * 0.0002)), q: qA, total: totalA });
      }
      setBids(b);
      setAsks(a.reverse()); // Asks visualmente de mayor a menor precio (o viceversa según diseño)
    };

    generateBook();

    const interval = setInterval(() => {
      // Actualización rápida simulada (100ms)
      setBids(prev => prev.map(item => ({
        ...item,
        q: Math.max(0.1, item.q + (Math.random() - 0.5)),
        p: price - ((price - item.p) * (1 + (Math.random() - 0.5) * 0.001))
      })));
      setAsks(prev => prev.map(item => ({
        ...item,
        q: Math.max(0.1, item.q + (Math.random() - 0.5)),
        p: price + ((item.p - price) * (1 + (Math.random() - 0.5) * 0.001))
      })));
    }, 200);

    return () => clearInterval(interval);
  }, [price]);

  const maxTotal = useMemo(() => Math.max(
    ...bids.map(b => b.total),
    ...asks.map(a => a.total)
  ), [bids, asks]);

  const spread = useMemo(() => {
    if (asks.length > 0 && bids.length > 0) {
      return ((asks[asks.length - 1].p - bids[0].p) / price * 100).toFixed(2);
    }
    return '0.02';
  }, [asks, bids, price]);

  const priceColor = useMemo(() => {
    return spread ? 'text-signal-green' : 'text-alert-red';
  }, [spread]);

  return (
    <div className="flex flex-col h-full bg-[#0b0e11] text-[10px] font-mono select-none overflow-hidden">
      <div className="flex justify-between px-2 py-1 text-gray-500 font-bold border-b border-white/5 bg-[#15191f]">
        <span>Price</span>
        <span>Amount</span>
        <span>Total</span>
      </div>
      
      {/* Asks (Ventas - Rojo) */}
      <div className="flex-1 overflow-hidden flex flex-col justify-end">
        {asks.slice(0, 10).map((ask, i) => (
          <div key={i} className="flex justify-between px-2 py-0.5 relative hover:bg-white/5 cursor-pointer">
            <div className="absolute top-0 right-0 bottom-0 bg-alert-red/10 transition-all duration-200" style={{ width: `${(ask.total / maxTotal) * 100}%` }}></div>
            <span className="text-alert-red z-10">{ask.p.toFixed(2)}</span>
            <span className="text-gray-300 z-10">{ask.q.toFixed(4)}</span>
            <span className="text-gray-500 z-10">{ask.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Spread / Last Price */}
        <div className="py-1.5 px-2 my-0.5 bg-white/5 flex justify-between items-center font-bold border-y border-white/5">
        <span className={`text-lg ${priceColor}`}>
          {price.toFixed(2)} <span className="text-[9px] text-gray-400 align-top">{symbol.split('/')[1] || 'USD'}</span>
        </span>
        <span className="text-[9px] text-gray-500">Spread: {spread}%</span>
      </div>

      {/* Bids (Compras - Verde) */}
      <div className="flex-1 overflow-hidden">
        {bids.slice(0, 10).map((bid, i) => (
          <div key={i} className="flex justify-between px-2 py-0.5 relative hover:bg-white/5 cursor-pointer">
             <div className="absolute top-0 right-0 bottom-0 bg-signal-green/10 transition-all duration-200" style={{ width: `${(bid.total / maxTotal) * 100}%` }}></div>
            <span className="text-signal-green z-10">{bid.p.toFixed(2)}</span>
            <span className="text-gray-300 z-10">{bid.q.toFixed(4)}</span>
            <span className="text-gray-500 z-10">{bid.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default OrderBook;
