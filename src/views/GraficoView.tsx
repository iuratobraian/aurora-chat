import React, { useState, useEffect, useRef } from 'react';
import { Usuario, AssetsConfig } from '../types';
import { StorageService } from '../services/storage';

interface GraficoViewProps {
    usuario: Usuario | null;
}

const ASSETS: any[] = [];

const TIMEFRAMES = [
    { label: '1M', value: '1' },
    { label: '5M', value: '5' },
    { label: '15M', value: '15' },
    { label: '1H', value: '60' },
    { label: '4H', value: '240' },
    { label: '1D', value: 'D' },
    { label: '1W', value: 'W' },
];

const CHART_STYLES = [
    { id: '1', label: 'Velas', icon: 'candlestick_chart' },
    { id: '2', label: 'Barras', icon: 'bar_chart' },
    { id: '3', label: 'Línea', icon: 'show_chart' },
    { id: '9', label: 'Heikin', icon: 'stacked_bar_chart' },
];

const TradingViewChart: React.FC<{
    symbol: string;
    interval: string;
    chartType: string;
}> = ({ symbol, interval, chartType }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef(`tv_adv_chart_${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        if (!containerRef.current) return;
        
        const container = containerRef.current;
        container.innerHTML = '';
        const id = widgetId.current;

        const wrapper = document.createElement('div');
        wrapper.id = id;
        wrapper.className = "w-full h-full";
        container.appendChild(wrapper);

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
            // TradingView is loaded from external script, has no TypeScript types
            if (typeof (window as unknown as { TradingView?: unknown }).TradingView !== 'undefined' && wrapper) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                new (window as unknown as { TradingView: any }).TradingView.widget({
                    autosize: true,
                    symbol: symbol,
                    interval: interval,
                    timezone: 'America/Argentina/Buenos_Aires',
                    theme: 'dark',
                    style: chartType,
                    locale: 'es',
                    toolbar_bg: '#f1f3f6',
                    enable_publishing: false,
                    hide_side_toolbar: false,
                    allow_symbol_change: true,
                    container_id: id,
                    withdateranges: true,
                    hide_legend: false,
                    save_image: true,
                    details: true,
                    hotlist: false,
                    calendar: false,
                    studies: [],
                    enabled_features: ["study_templates", "use_localstorage_for_settings_save"],
                });
            }
        };
        container.appendChild(script);

        return () => {
            container.innerHTML = '';
        };
    }, [symbol, interval, chartType]);

    return (
        <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden bg-black/20" />
    );
};

const GraficoView: React.FC<GraficoViewProps> = ({ usuario }) => {
    const [assets, setAssets] = useState(ASSETS);
    const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
    const [timeframe, setTimeframe] = useState('D');
    const [chartStyle, setChartStyle] = useState('1');
    const [filterCategory, setFilterCategory] = useState('Todos');

    useEffect(() => {
        const loadAssets = async () => {
            const config = await StorageService.getGraficoConfig();
            if (config && config.assets && config.assets.length > 0) {
                const mapped = config.assets.map(a => ({
                    id: a.symbol.toLowerCase().replace(':', '-'),
                    symbol: a.exchange + ':' + a.symbol,
                    label: a.symbol,
                    description: a.name,
                    emoji: a.category === 'Crypto' ? '₿' : a.category === 'Forex' ? '💱' : '📊',
                    color: a.category === 'Crypto' ? '#f59e0b' : '#3b82f6',
                    category: a.category
                }));
                setAssets(mapped);
                setSelectedAsset(mapped[0]);
            }
        };
        loadAssets();
    }, []);

    const categories = ['Todos', 'Forex', 'Índice', 'Crypto', 'Commodities'];
    const filteredAssets = filterCategory === 'Todos'
        ? assets
        : assets.filter(a => a.category === filterCategory);

    return (
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Análisis <span className="text-primary">Gráfico</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Gráficos en tiempo real • TradingView Pro
                    </p>
                </div>

                {/* Chart Controls */}
                <div className="flex items-center gap-3">
                    {/* Timeframe Selector */}
                    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
                        {TIMEFRAMES.map(tf => (
                            <button
                                key={tf.value}
                                onClick={() => setTimeframe(tf.value)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${timeframe === tf.value
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>

                    {/* Chart Style Selector */}
                    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
                        {CHART_STYLES.map(cs => (
                            <button
                                key={cs.id}
                                onClick={() => setChartStyle(cs.id)}
                                title={cs.label}
                                className={`p-1.5 rounded-lg transition-all ${chartStyle === cs.id
                                    ? 'bg-primary text-white'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">{cs.icon}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Asset List Sidebar */}
                <div className="lg:col-span-1 space-y-3">
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${filterCategory === cat
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Asset Cards */}
                    <div className="space-y-2">
                        {filteredAssets.map(asset => (
                            <button
                                key={asset.id}
                                onClick={() => setSelectedAsset(asset)}
                                className={`w-full p-3 rounded-xl border text-left transition-all duration-200 ${selectedAsset.id === asset.id
                                    ? 'border-primary/40 bg-primary/5 shadow-lg shadow-primary/10'
                                    : 'border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:border-primary/20 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                                style={selectedAsset.id === asset.id ? { borderColor: asset.color + '60' } : {}}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="size-10 rounded-xl flex items-center justify-center text-xl font-black"
                                        style={{ backgroundColor: asset.color + '20' }}
                                    >
                                        {asset.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase">{asset.label}</span>
                                            <span
                                                className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase"
                                                style={{ color: asset.color, backgroundColor: asset.color + '20' }}
                                            >
                                                {asset.category}
                                            </span>
                                        </div>
                                        <p className="text-[9px] text-gray-500 font-medium mt-0.5">{asset.description}</p>
                                    </div>
                                </div>

                                {selectedAsset.id === asset.id && (
                                    <div className="mt-2 flex items-center gap-1">
                                        <div className="size-1.5 rounded-full animate-pulse" style={{ backgroundColor: asset.color }}></div>
                                        <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: asset.color }}>
                                            Viendo en vivo
                                        </span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Info Card */}
                    <div className="glass rounded-xl p-4 border border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-primary text-sm">info</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">TradingView Pro</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                            Gráficos en tiempo real integrados con TradingView. Puedes hacer zoom, agregar indicadores y tomar capturas para compartir en el feed.
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="text-center p-2 bg-white/5 rounded-lg">
                                <span className="text-xs font-black text-white">8+</span>
                                <p className="text-[8px] text-gray-500 uppercase">Activos</p>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded-lg">
                                <span className="text-xs font-black text-white">RT</span>
                                <p className="text-[8px] text-gray-500 uppercase">Tiempo Real</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Chart Area */}
                <div className="lg:col-span-3">
                    <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl" style={{ height: '70vh', minHeight: 500 }}>
                        {/* Chart Header */}
                        <div className="flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div
                                    className="size-8 rounded-xl flex items-center justify-center text-lg"
                                    style={{ backgroundColor: selectedAsset.color + '25' }}
                                >
                                    {selectedAsset.emoji}
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                        {selectedAsset.label}
                                    </h2>
                                    <p className="text-[9px] text-gray-500">{selectedAsset.description}</p>
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                                    <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[8px] font-black text-emerald-500 uppercase">En Vivo</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={`https://www.tradingview.com/chart/?symbol=${selectedAsset.symbol}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-wider"
                                >
                                    <img src="https://www.tradingview.com/static/images/favicon.ico" className="size-3" alt="" />
                                    Abrir en TV
                                </a>
                            </div>
                        </div>

                        {/* Chart Widget */}
                        <div className="w-full" style={{ height: 'calc(100% - 70px)' }}>
                            <TradingViewChart
                                key={`${selectedAsset.symbol}-${timeframe}-${chartStyle}`}
                                symbol={selectedAsset.symbol}
                                interval={timeframe}
                                chartType={chartStyle}
                            />
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Símbolo', value: selectedAsset.symbol.split(':')[1] || selectedAsset.symbol, icon: 'tag' },
                            { label: 'Categoría', value: selectedAsset.category, icon: 'category' },
                            { label: 'Temporalidad', value: TIMEFRAMES.find(t => t.value === timeframe)?.label || '1D', icon: 'schedule' },
                            { label: 'Tipo Gráfico', value: CHART_STYLES.find(c => c.id === chartStyle)?.label || 'Velas', icon: 'bar_chart' },
                        ].map((stat, i) => (
                            <div key={i} className="glass rounded-xl p-3 border border-white/5 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-sm">{stat.icon}</span>
                                <div>
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-xs font-black text-gray-900 dark:text-white">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chart Tips */}
            <div className="glass rounded-2xl p-6 border border-white/5 bg-gradient-to-r from-primary/5 to-transparent">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">💡 Consejos de Uso</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: '🖱️', title: 'Interactivo', desc: 'Zoom con scroll, arrastra para navegar en el tiempo' },
                        { icon: '📸', title: 'Capturar', desc: 'Usa el botón de la cámara en el gráfico para tomar capturas' },
                        { icon: '📊', title: 'Indicadores', desc: 'Haz clic en el botón Ind. para agregar RSI, MACD y más' },
                    ].map((tip, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className="text-2xl">{tip.icon}</span>
                            <div>
                                <p className="text-xs font-black text-gray-900 dark:text-white">{tip.title}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">{tip.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GraficoView;
