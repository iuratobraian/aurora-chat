import { useState, useEffect } from 'react';

export const useMarketData = (symbols: string[]) => {
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>({});

  useEffect(() => {
    // Valores base actualizados a proyecciones/realidad 2025
    const initial: Record<string, { price: number; change: number }> = {
      'EUR/USD': { price: 1.0540, change: -0.12 },
      'BTC/USD': { price: 96420.50, change: 2.45 },
      'XAU/USD': { price: 2655.94, change: 0.89 },
      'GBP/USD': { price: 1.2530, change: 0.05 },
      'NAS100': { price: 21250.00, change: 1.15 }, // Nasdaq
      'ETH/USD': { price: 3850.20, change: 3.10 },
      'US30': { price: 44150.40, change: 0.45 }, // Dow Jones
      'USOIL': { price: 71.42, change: -1.20 }
    };

    const currentPrices = { ...initial };
    symbols.forEach(s => {
      // Fallback para símbolos desconocidos
      if (!currentPrices[s]) currentPrices[s] = { price: 100.00, change: 0 };
    });
    setPrices(currentPrices);

    const interval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(symbol => {
          const isCrypto = symbol.includes('BTC') || symbol.includes('ETH');
          const isIndices = symbol.includes('NAS') || symbol.includes('US30');
          
          // Volatilidad diferenciada por clase de activo
          const volatilityFactor = isCrypto ? 25 : (isIndices ? 5 : 0.0005);
          const movement = (Math.random() - 0.5) * volatilityFactor;
          
          next[symbol] = {
            price: Math.max(0, next[symbol].price + movement),
            change: next[symbol].change + (Math.random() - 0.5) * (isCrypto ? 0.1 : 0.01)
          };
        });
        return next;
      });
    }, 2000); // Actualización un poco más lenta para legibilidad

    return () => clearInterval(interval);
  }, [symbols]);

  return prices;
};