import React, { useRef, useEffect, useState } from 'react';

interface TradingViewPostWidgetProps {
    symbol?: string;
    url?: string;
}

export const TradingViewPostWidget: React.FC<TradingViewPostWidgetProps> = ({ symbol, url }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const getSymbol = () => symbol || 'NASDAQ:NDX';

    useEffect(() => {
        if (!containerRef.current) return;
        
        const container = containerRef.current;
        container.innerHTML = '';
        setIsLoaded(false);
        setHasError(false);

        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'tradingview-widget-container__widget';
        widgetDiv.style.cssText = 'height: 200px; width: 100%;';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
        script.type = 'text/javascript';
        script.async = true;
        script.crossOrigin = 'anonymous';

        const widgetConfig = {
            symbol: getSymbol(),
            width: '100%',
            height: 200,
            locale: 'es',
            dateRange: '1D',
            colorTheme: 'dark',
            isTransparent: true,
            autosize: true,
            largeChartUrl: url || ''
        };

        script.textContent = JSON.stringify(widgetConfig);

        script.onload = () => setIsLoaded(true);
        script.onerror = () => setHasError(true);

        container.appendChild(widgetDiv);
        container.appendChild(script);

        const timeout = setTimeout(() => {
            if (!isLoaded) setHasError(true);
        }, 8000);

        return () => {
            clearTimeout(timeout);
            if (container) container.innerHTML = '';
        };
    }, [symbol, url]);

    if (hasError || (url && getTvImage(url))) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className="tradingview-widget-container w-full h-[200px] overflow-hidden rounded-lg"
        >
            {!isLoaded && (
                <div className="flex items-center justify-center h-full bg-[#1a1d21]">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};

export const getTvImage = (url: string | null | undefined): string | null => {
    if (!url || typeof url !== 'string') return null;
    if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ||
        url.includes('picsum.photos') ||
        url.includes('postimg') ||
        url.includes('ibb.co') ||
        url.includes('supabase') ||
        url.includes('cloudinary') ||
        url.includes('imgur')) {
        return url;
    }
    const matchX = url.match(/tradingview\.com\/x\/([a-zA-Z0-9]+)\/?/);
    if (matchX && matchX[1]) {
        return `https://s3.tradingview.com/snapshots/${matchX[1].charAt(0).toLowerCase()}/${matchX[1]}.png`;
    }
    const matchChart = url.match(/chart\/([a-zA-Z0-9]+)\/?/);
    if (matchChart && matchChart[1]) {
        return `https://s3.tradingview.com/snapshots/${matchChart[1].charAt(0).toLowerCase()}/${matchChart[1]}.png`;
    }
    return url;
};

export const extractTvUrl = (text: string | null | undefined): string | null => {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(/https:\/\/www\.tradingview\.com\/(x|chart)\/\S+/);
    return match ? match[0] : null;
};

export default TradingViewPostWidget;
