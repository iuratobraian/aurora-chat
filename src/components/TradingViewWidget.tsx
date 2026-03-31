import React, { useEffect, useRef, memo, useState, useCallback } from 'react';

interface Props {
  symbol?: string;
  width?: string | number;
  height?: string | number;
}

const TradingViewWidget: React.FC<Props> = memo(({ 
  symbol = 'BINANCE:BTCUSD', 
  width = '100%', 
  height = 400 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  const triggerWidgetAction = useCallback((action: string) => {
    const iframe = containerRef.current?.querySelector('iframe');
    if (iframe?.contentWindow) {
      try {
        iframe.contentWindow.postMessage({ action }, 'https://www.tradingview.com');
      } catch {
        // TradingView widget communication failed silently
      }
    }
  }, []);

  const handleDownloadImage = useCallback(() => {
    triggerWidgetAction('save_chart_to_file');
    const iframe = containerRef.current?.querySelector('iframe');
    if (iframe?.contentDocument) {
      const canvas = iframe.contentDocument.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `tradingview-${symbol.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    }
  }, [symbol, triggerWidgetAction]);

  const handleCopyImage = useCallback(async () => {
    const iframe = containerRef.current?.querySelector('iframe');
    if (iframe?.contentDocument) {
      const canvas = iframe.contentDocument.querySelector('canvas');
      if (canvas) {
        try {
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/png');
          });
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setShowToolbar(false);
        } catch {
          handleDownloadImage();
        }
      }
    }
  }, [handleDownloadImage]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';
    setError(false);
    setIsLoaded(false);

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.cssText = 'height: 100%; width: 100%;';
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    const widgetConfig = {
      autosize: true,
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'es',
      enable_publishing: false,
      allow_symbol_change: true,
      support_host: 'https://www.tradingview.com',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      hide_side_toolbar: false,
    };

    container.appendChild(widgetContainer);
    container.appendChild(script);

    script.addEventListener('load', () => {
      setIsLoaded(true);
    });
    
    script.addEventListener('error', () => {
      setError(true);
    });

    const timer = setTimeout(() => {
      if (!isLoaded) {
        setError(true);
      }
    }, 10000);

    return () => {
      clearTimeout(timer);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol]);

  const containerHeight = typeof height === 'number' ? `${height}px` : height;
  const containerWidth = typeof width === 'number' ? `${width}px` : width;

  if (error) {
    return (
      <div 
        className="flex flex-col items-center justify-center bg-gradient-to-br from-[#0f1115] to-[#1a1d21] rounded-xl border border-white/10 relative"
        style={{ height: containerHeight, width: containerWidth }}
      >
        <div className="text-center p-6">
          <span className="material-symbols-outlined text-4xl text-gray-500 mb-2">chart</span>
          <p className="text-gray-400 text-sm">Gráfico no disponible</p>
          <p className="text-gray-500 text-xs mt-1">Verifica tu conexión</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="tradingview-widget-container rounded-xl overflow-hidden border border-white/10 relative"
      ref={containerRef}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
      style={{ 
        height: containerHeight,
        width: containerWidth,
        minHeight: '300px'
      }}
    >
      {!isLoaded && (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#0f1115] to-[#1a1d21]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-500 text-xs">Cargando gráfico...</span>
          </div>
        </div>
      )}
      
      {isLoaded && showToolbar && (
        <div className="absolute top-3 right-3 z-10 flex gap-2 animate-in fade-in duration-200">
          <button
            onClick={handleCopyImage}
            className="size-9 rounded-lg bg-black/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-lg"
            title="Copiar imagen"
          >
            <span className="material-symbols-outlined text-base">content_copy</span>
          </button>
          <button
            onClick={handleDownloadImage}
            className="size-9 rounded-lg bg-black/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-lg"
            title="Descargar imagen"
          >
            <span className="material-symbols-outlined text-base">download</span>
          </button>
        </div>
      )}
    </div>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';

export default TradingViewWidget;
