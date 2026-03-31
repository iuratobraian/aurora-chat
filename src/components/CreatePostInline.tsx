import React, { useState, useEffect, useRef } from 'react';
import { Usuario, CategoriaPost } from '../types';
import { StorageService } from '../services/storage';
import { PostimgService } from '../services/postimg';
import { ImageUploadService } from '../services/imageUpload';
import { useToast } from './ToastProvider';
import logger from '../utils/logger';

interface CreatePostInlineProps {
    usuario: Usuario;
    onSubmit: (data: any) => void;
}

const ZONE_ICONS = [
    { emoji: '🟢', label: 'Zona Compra' },
    { emoji: '🔴', label: 'Zona Venta' },
    { emoji: '⚡', label: 'Alerta' },
    { emoji: '🎯', label: 'Objetivo' },
    { emoji: '🛡️', label: 'Stop Loss' },
    { emoji: '📊', label: 'Análisis' },
    { emoji: '🚀', label: 'Momentum' },
    { emoji: '⚠️', label: 'Precaución' },
    { emoji: '💡', label: 'Idea' },
    { emoji: '🔥', label: 'Tendencia Fuerte' },
    { emoji: '❄️', label: 'Corrección' },
    { emoji: '📈', label: 'Alcista' },
    { emoji: '📉', label: 'Bajista' },
    { emoji: '💰', label: 'Beneficio' },
    { emoji: '🏆', label: 'Setup Premium' },
];

const OPERATIVO_TIPS = [
    { tipo: 'Compra', icon: '🟢', desc: 'Zona Operativa de Compra', color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' },
    { tipo: 'Venta', icon: '🔴', desc: 'Zona Operativa de Venta', color: 'border-red-500/40 bg-red-500/5 text-red-400' },
];

// TradingView Chart Widget embebido
const TradingViewEmbed: React.FC<{ symbol: string }> = ({ symbol }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef(`tv_embed_${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        if (!containerRef.current) return;
        
        const container = containerRef.current;
        container.innerHTML = '';
        const id = widgetId.current;

        const wrapper = document.createElement('div');
        wrapper.id = id;
        wrapper.style.height = '100%';
        wrapper.style.width = '100%';
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
                    symbol: symbol || 'FX:EURUSD',
                    interval: 'D',
                    timezone: 'America/Argentina/Buenos_Aires',
                    theme: 'dark',
                    style: '1',
                    locale: 'es',
                    toolbar_bg: '#f1f3f6',
                    enable_publishing: false,
                    hide_side_toolbar: false,
                    allow_symbol_change: true,
                    container_id: id,
                });
            }
        };
        container.appendChild(script);

        return () => {
            container.innerHTML = '';
        };
    }, [symbol]);

    return (
        <div ref={containerRef} className="w-full h-[350px] rounded-xl overflow-hidden bg-black/20" />
    );
};

const CreatePostInline: React.FC<CreatePostInlineProps> = ({ usuario, onSubmit }) => {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<CategoriaPost>('General');
    const [tags, setTags] = useState<string>('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [videoThumbnail, setVideoThumbnail] = useState('');
    const [youtubePasteUrl, setYoutubePasteUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [tradingViewUrl, setTradingViewUrl] = useState('');
    const [selectedZone, setSelectedZone] = useState<string>(''); // 'Compra' | 'Venta' | ''
    const [selectedPar, setSelectedPar] = useState('');
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState('');
    const [showTVEmbed, setShowTVEmbed] = useState(false);
    const [tvSymbol, setTvSymbol] = useState('FX:EURUSD');
    const [zonaValues, setZonaValues] = useState({ inicio: '', fin: '' });
    const [creationMode, setCreationMode] = useState<'post' | 'signal'>('post');
    const [signalData, setSignalData] = useState({
        entryPrice: '',
        stopLoss: '',
        takeProfits: ['', '', ''],
        direction: 'buy' as 'buy' | 'sell'
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const hasSignalAccess = Number(usuario.rol ?? 0) >= 4;

    const PARES_COMUNES = ['EURUSD', 'GBPUSD', 'NASDAQ', 'BITCOIN', 'ORO/GOLD', 'USDJPY', 'AUDUSD', 'SPX500', 'DXY', 'BTCUSDT'];

    const extractTradingViewImage = (url: string): string | null => {
        if (!url) return null;
        const matchX = url.match(/https:\/\/www\.tradingview\.com\/x\/([a-zA-Z0-9]+)\/?/);
        if (matchX && matchX[1]) {
            return `https://s3.tradingview.com/snapshots/${matchX[1].charAt(0).toLowerCase()}/${matchX[1]}.png`;
        }
        const matchChart = url.match(/chart\/([^\/]+)\/?/);
        if (matchChart && matchChart[1]) {
            return `https://s3.tradingview.com/snapshots/${matchChart[1].charAt(0).toLowerCase()}/${matchChart[1]}.png`;
        }
        return null;
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setContent(text);

        const extracted = extractTradingViewImage(text);
        if (extracted && !imageUrl) {
            setImageUrl(extracted);
            setTradingViewUrl(text.match(/https:\/\/www\.tradingview\.com\/(x|chart)\/[a-zA-Z0-9]+\/?/)?.[0] || '');
        }
    };

    const handleTvUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setTradingViewUrl(url);
        const extracted = extractTradingViewImage(url);
        if (extracted) {
            setImageUrl(extracted);
        } else if (!url) {
            setImageUrl('');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = ImageUploadService.validate(file);
        if (!validation.ok) { showToast('error', validation.error); return; }

        setIsUploading(true);
        setUploadProgress(0);
        try {
            if (validation.type === 'video') {
                const result = await ImageUploadService.uploadVideo(file, (pct) => setUploadProgress(pct));
                setVideoUrl(result.url);
                setVideoThumbnail(result.thumbnail);
                setImageUrl(''); // clear image if video selected
            } else {
                const url = await PostimgService.uploadImage(file);
                setImageUrl(url);
                setVideoUrl(''); // clear video if image selected
            }
        } catch (error: any) {
            logger.error('Upload failed', error);
            showToast('error', error?.message || 'Error al subir el archivo.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (videoInputRef.current) videoInputRef.current.value = '';
        }
    };

    const handleYoutubePaste = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setYoutubePasteUrl(url);
        const ytId = ImageUploadService.extractYoutubeId(url);
        if (ytId) {
            setVideoUrl(`yt:${ytId}`);
            setVideoThumbnail(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
            setImageUrl('');
        } else if (!url) {
            setVideoUrl('');
            setVideoThumbnail('');
        }
    };

    const handleIconSelect = (emoji: string) => {
        setSelectedIcon(emoji);
        setShowIconPicker(false);
        // Insert icon at cursor or prepend to content
        if (!content.startsWith(emoji)) {
            setContent(prev => `${emoji} ${prev}`);
        }
    };

    const handleSubmit = () => {
        if (!content.trim()) return;

        let finalContent = content;
        
        // Auto-add emoji based on zone if not present
        if (selectedZone === 'Compra' && !content.includes('🟢')) {
            finalContent = `🟢 ${finalContent}`;
        } else if (selectedZone === 'Venta' && !content.includes('🔴')) {
            finalContent = `🔴 ${finalContent}`;
        } else if (selectedIcon && !content.includes(selectedIcon)) {
            finalContent = `${selectedIcon} ${finalContent}`;
        }

        const postData = {
            titulo: title.trim() || '',
            contenido: finalContent,
            categoria: creationMode === 'signal' ? 'Signal' : category,
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
            imagenUrl: imageUrl || videoThumbnail || '',
            videoUrl: videoUrl || undefined,
            tradingViewUrl: tradingViewUrl || content.match(/https:\/\/www\.tradingview\.com\/(x|chart)\/[a-zA-Z0-9]+\/?/)?.[0],
            par: selectedPar || 'GENERAL',
            tipo: creationMode === 'signal' ? (signalData.direction === 'buy' ? 'Compra' : 'Venta') : (selectedZone || 'Neutral'),
            zonaOperativa: creationMode === 'signal' ? {
                inicio: signalData.entryPrice,
                fin: signalData.takeProfits[0] // Default TP1 as target zone for visual compatibility
            } : (selectedZone ? {
                inicio: zonaValues.inicio,
                fin: zonaValues.fin
            } : undefined),
            // Signal specific fields
            isSignal: creationMode === 'signal',
            signalDetails: creationMode === 'signal' ? {
                entryPrice: signalData.entryPrice,
                stopLoss: signalData.stopLoss,
                takeProfits: signalData.takeProfits.filter(tp => tp),
                direction: signalData.direction
            } : undefined
        };

        onSubmit(postData);
        // Reset all state
        setContent('');
        setTitle('');
        setTags('');
        setImageUrl('');
        setVideoUrl('');
        setVideoThumbnail('');
        setYoutubePasteUrl('');
        setTradingViewUrl('');
        setSelectedZone('');
        setSelectedPar('');
        setSelectedIcon('');
        setSignalData({
            entryPrice: '',
            stopLoss: '',
            takeProfits: ['', '', ''],
            direction: 'buy'
        });
        setCreationMode('post');
        setShowTVEmbed(false);
        setIsExpanded(false);
        setZonaValues({ inicio: '', fin: '' });
    };

    const getParTvSymbol = (par: string): string => {
        const p = par.toUpperCase();
        if (p.includes('EUR')) return 'FX:EURUSD';
        if (p.includes('GBP')) return 'FX:GBPUSD';
        if (p.includes('NAS')) return 'NASDAQ:NDX';
        if (p.includes('BTC') || p.includes('BITCOIN')) return 'BINANCE:BTCUSDT';
        if (p.includes('ORO') || p.includes('GOLD') || p.includes('XAU')) return 'TVC:GOLD';
        if (p.includes('JPY')) return 'FX:USDJPY';
        if (p.includes('AUD')) return 'FX:AUDUSD';
        if (p.includes('SPX')) return 'SP:SPX';
        if (p.includes('DXY')) return 'TVC:DXY';
        return 'FX:EURUSD';
    };

    useEffect(() => {
        if (selectedPar) {
            setTvSymbol(getParTvSymbol(selectedPar));
        }
    }, [selectedPar]);

    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        try {
                            const validation = ImageUploadService.validate(file);
                            if (!validation.ok) {
                                showToast('error', validation.error || 'Archivo inválido');
                                return;
                            }
                            const url = await PostimgService.uploadImage(file);
                            if (url) {
                                setImageUrl(url);
                                showToast('success', 'Imagen pegada desde portapapeles');
                            }
                        } catch (err) {
                            showToast('error', 'Error al procesar imagen');
                        }
                    }
                    break;
                }
            }
        };
        
        const textarea = document.querySelector('textarea[placeholder*="¿Qué"]') as HTMLTextAreaElement;
        if (textarea) {
            textarea.addEventListener('paste', handlePaste);
            return () => textarea.removeEventListener('paste', handlePaste);
        }
    }, []);

    return (
        <div className={`glass rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-card-dark transition-all duration-300 ${isExpanded ? 'shadow-xl ring-1 ring-primary/20' : 'shadow-sm'} overflow-hidden`}>
            {hasSignalAccess && isExpanded && (
                <div className="flex items-center gap-1 p-1 bg-gray-50/50 dark:bg-black/40 border-b border-gray-100 dark:border-white/5 animate-in slide-in-from-top-1 duration-300">
                    <button
                        onClick={() => setCreationMode('post')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${creationMode === 'post' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                    >
                        <span className="material-symbols-outlined text-sm">article</span>
                        Publicar Post
                    </button>
                    <button
                        onClick={() => setCreationMode('signal')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${creationMode === 'signal' ? 'bg-gradient-to-r from-primary/20 to-violet-500/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(160,120,255,0.1)]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                    >
                        <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
                        Crear Señal
                    </button>
                </div>
            )}
            <div className="p-4 flex gap-4">
                <img src={usuario.avatar} className="size-10 rounded-full bg-gray-100 dark:bg-white/5 flex-shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                    {isExpanded && (
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Título del análisis..."
                            className="w-full bg-transparent border-none outline-none text-[15px] font-black text-gray-900 dark:text-white mb-2"
                        />
                    )}
                    <textarea
                        value={content}
                        onChange={handleContentChange}
                        onFocus={() => setIsExpanded(true)}
                        placeholder={`¿Qué estás analizando hoy, ${usuario.nombre.split(' ')[0]}?`}
                        className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none min-h-[40px]"
                        rows={isExpanded ? 4 : 1}
                    />

                    {/* Image Preview */}
                    {imageUrl && !videoUrl && (
                        <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 group">
                            <img src={imageUrl} className="w-full max-h-64 object-contain bg-gray-900/30" alt="Preview" />
                            <button
                                onClick={() => { setImageUrl(''); setTradingViewUrl(''); }}
                                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    )}

                    {/* Video Preview */}
                    {videoUrl && (
                        <div className="relative mt-2 rounded-xl overflow-hidden border border-primary/20 bg-black group">
                            {videoUrl.startsWith('yt:') ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${videoUrl.replace('yt:', '')}?controls=1&rel=0&modestbranding=1`}
                                    className="w-full aspect-video"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    frameBorder="0"
                                />
                            ) : (
                                <video
                                    src={videoUrl}
                                    controls
                                    className="w-full max-h-72 object-contain"
                                    poster={videoThumbnail}
                                />
                            )}
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-widest">
                                <span className="material-symbols-outlined text-[12px] text-primary">videocam</span>
                                {videoUrl.startsWith('yt:') ? 'YouTube' : 'Video'}
                            </div>
                            <button
                                onClick={() => { setVideoUrl(''); setVideoThumbnail(''); setYoutubePasteUrl(''); }}
                                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    )}

                    {/* Upload progress bar */}
                    {isUploading && uploadProgress > 0 && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Subiendo video...</span>
                                <span className="text-[9px] font-black text-primary">{uploadProgress}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                        </div>
                    )}

                    {/* TradingView Embed Preview */}
                    {showTVEmbed && isExpanded && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-primary/20 relative">
                            <div className="absolute top-2 right-2 z-10 flex gap-2">
                                <div className="bg-primary/90 text-white text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1">
                                    <img src="https://www.tradingview.com/static/images/favicon.ico" className="size-3" alt="" />
                                    GRÁFICO EN VIVO
                                </div>
                                <button
                                    onClick={() => setShowTVEmbed(false)}
                                    className="bg-black/50 text-white rounded-lg px-2 py-1 text-[10px] hover:bg-red-500 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <TradingViewEmbed symbol={tvSymbol} />
                            <div className="bg-gray-900/95 p-3 border-t border-white/10 flex items-center gap-3">
                                <span className="text-lg">💡</span>
                                <p className="text-[10px] text-gray-300 font-medium leading-tight">
                                    <span className="text-primary font-black">TIP:</span> Haz tus dibujos y usa el <span className="text-white font-bold">ícono de cámara (snapshot)</span> de TradingView. Pega el link resultante aquí arriba para que se publique con tus marcas.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Expanded Options */}
                    {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">

                            {/* Signal Specific Fields */}
                            {creationMode === 'signal' && (
                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4 animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase text-primary tracking-widest">Parámetros de la Señal</label>
                                        <div className="flex bg-black/10 rounded-lg p-0.5">
                                            <button 
                                                onClick={() => setSignalData({ ...signalData, direction: 'buy' })}
                                                className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${signalData.direction === 'buy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                                            >BUY</button>
                                            <button 
                                                onClick={() => setSignalData({ ...signalData, direction: 'sell' })}
                                                className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${signalData.direction === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                                            >SELL</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-gray-400 uppercase">Precio de Entrada</label>
                                            <input 
                                                type="text" 
                                                value={signalData.entryPrice}
                                                onChange={e => setSignalData({ ...signalData, entryPrice: e.target.value })}
                                                placeholder="0.0000"
                                                className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-mono font-bold text-gray-900 dark:text-white outline-none focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-gray-400 uppercase">Stop Loss</label>
                                            <input 
                                                type="text" 
                                                value={signalData.stopLoss}
                                                onChange={e => setSignalData({ ...signalData, stopLoss: e.target.value })}
                                                placeholder="0.0000"
                                                className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-mono font-bold text-red-500 outline-none focus:border-red-500/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-gray-400 uppercase">Take Profits (Objetivos)</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {signalData.takeProfits.map((tp, idx) => (
                                                <div key={idx} className="relative">
                                                    <span className="absolute left-2 top-1.5 text-[8px] font-black text-primary/40">TP{idx + 1}</span>
                                                    <input 
                                                        type="text" 
                                                        value={tp}
                                                        onChange={e => {
                                                            const newTPs = [...signalData.takeProfits];
                                                            newTPs[idx] = e.target.value;
                                                            setSignalData({ ...signalData, takeProfits: newTPs });
                                                        }}
                                                        placeholder="0.0000"
                                                        className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg pl-7 pr-2 py-2 text-xs font-mono font-bold text-emerald-500 outline-none focus:border-emerald-500/50 transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Zone Selector (Hidden for signals, replaced by signal params) */}
                            {creationMode === 'post' && (
                                <div>
                                    <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block">Zona Operativa</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {OPERATIVO_TIPS.map(op => (
                                            <button
                                                key={op.tipo}
                                                onClick={() => setSelectedZone(selectedZone === op.tipo ? '' : op.tipo)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-black transition-all ${selectedZone === op.tipo ? op.color + ' ring-1 ring-current' : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-300 dark:hover:border-white/20'}`}
                                            >
                                                <span>{op.icon}</span>
                                                {op.desc}
                                            </button>
                                        ))}
                                        {selectedZone && (
                                            <button
                                                onClick={() => setSelectedZone('')}
                                                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-400 text-xs hover:border-red-500/30 hover:text-red-400 transition-all"
                                            >
                                                ✕ Limpiar
                                            </button>
                                        )}
                                    </div>
                                    {selectedZone && (
                                        <div className="mt-3 grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95 duration-200">
                                            <div>
                                                <label className="text-[8px] font-black uppercase text-gray-500 mb-1 block">PRECIO INICIO</label>
                                                <input 
                                                    type="text" 
                                                    value={zonaValues.inicio} 
                                                    onChange={e => setZonaValues({ ...zonaValues, inicio: e.target.value })}
                                                    placeholder="0.0000"
                                                    className="w-full bg-gray-50 dark:bg-black/20 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-white/5 outline-none focus:border-primary/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[8px] font-black uppercase text-gray-500 mb-1 block">PRECIO FIN</label>
                                                <input 
                                                    type="text" 
                                                    value={zonaValues.fin} 
                                                    onChange={e => setZonaValues({ ...zonaValues, fin: e.target.value })}
                                                    placeholder="0.0000"
                                                    className="w-full bg-gray-50 dark:bg-black/20 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-white/5 outline-none focus:border-primary/50"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Asset Selector */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Par / Activo</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {PARES_COMUNES.map(par => (
                                            <button
                                                key={par}
                                                onClick={() => setSelectedPar(selectedPar === par ? '' : par)}
                                                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${selectedPar === par ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-primary/30 hover:text-primary'}`}
                                            >
                                                {par}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Category & Tags */}
                            <div className="flex gap-4">
                                {creationMode === 'post' && (
                                    <div className="flex-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Categoría</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value as any)}
                                            className="w-full bg-gray-50 dark:bg-black/20 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none border border-gray-200 dark:border-white/5"
                                        >
                                            <option value="General">General</option>
                                            <option value="Idea">Idea de Trading</option>
                                            <option value="Producto">Producto</option>
                                            <option value="Recurso">Recurso</option>
                                            <option value="Ayuda">Ayuda / Pregunta</option>
                                        </select>
                                    </div>
                                )}
                                <div className="flex-[2]">
                                    <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Tags (separados por coma)</label>
                                    <input
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="BTC, Scalping, SMC..."
                                        className="w-full bg-gray-50 dark:bg-black/20 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none border border-gray-200 dark:border-white/5"
                                    />
                                </div>
                            </div>

                            {/* TradingView URL */}
                            <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Link de TradingView (Captura/Snapshot - Opcional)</label>
                                <input
                                    value={tradingViewUrl}
                                    onChange={handleTvUrlChange}
                                    placeholder="https://www.tradingview.com/x/..."
                                    className="w-full bg-gray-50 dark:bg-black/20 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none border border-gray-200 dark:border-white/5"
                                />
                            </div>

                            {/* Icon Picker */}
                            <div className="p-3 bg-gray-50 dark:bg-black/30 rounded-xl border border-gray-200 dark:border-white/10">
                                <p className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-widest">Acceso Directo: Íconos</p>
                                <div className="flex flex-wrap gap-2">
                                    {ZONE_ICONS.map(icon => (
                                        <button
                                            key={icon.emoji}
                                            onClick={() => handleIconSelect(icon.emoji)}
                                            title={icon.label}
                                            className={`size-9 rounded-lg bg-white dark:bg-white/5 hover:bg-primary/10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-lg hover:scale-110 transition-all ${selectedIcon === icon.emoji ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                                        >
                                            {icon.emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* YouTube link paste input */}
                            {!videoUrl && (
                                <div>
                                    <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Link de YouTube (opcional)</label>
                                    <input
                                        value={youtubePasteUrl}
                                        onChange={handleYoutubePaste}
                                        placeholder="https://youtube.com/watch?v=... o https://youtu.be/..."
                                        className="w-full bg-gray-50 dark:bg-black/20 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none border border-gray-200 dark:border-white/5 focus:border-red-500/50"
                                    />
                                </div>
                            )}

                            {/* Actions Row */}
                            <div className="flex justify-between items-center">
                                <div className="flex gap-1">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        accept="image/*,video/mp4,video/webm,video/mov,video/quicktime"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className={`p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors ${isUploading ? 'animate-pulse' : ''}`}
                                        title="Subir Imagen o Video"
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {isUploading ? 'sync' : 'perm_media'}
                                        </span>
                                    </button>

                                    {/* TradingView Embed Toggle */}
                                    <button
                                        onClick={() => setShowTVEmbed(!showTVEmbed)}
                                        className={`p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors ${showTVEmbed ? 'bg-primary/10 text-primary' : ''}`}
                                        title="Gráfico TradingView en Vivo"
                                    >
                                        <span className="material-symbols-outlined text-lg">candlestick_chart</span>
                                    </button>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <span className={`text-[10px] font-bold ${content.length > 700 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {content.length}/800
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setIsExpanded(false);
                                                setShowIconPicker(false);
                                                setShowTVEmbed(false);
                                            }}
                                            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!content.trim() || content.length > 800}
                                            className={`px-6 py-2 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${creationMode === 'signal' ? 'bg-gradient-to-r from-primary to-violet-500 shadow-primary/20 hover:scale-105 active:scale-95' : 'bg-primary shadow-primary/20 hover:bg-blue-600'}`}
                                        >
                                            {creationMode === 'signal' ? 'Enviar Señal' : 'Publicar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatePostInline;
