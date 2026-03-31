import React, { memo, useState, useEffect } from 'react';

interface DailyPollWidgetFullProps {
    onAnswered?: () => void;
}

const POLL_ASSETS = ['NAS100', 'EUR/USD', 'GBP/USD', 'BTC/USD', 'XAU/USD'];

export const DailyPollWidgetFull: React.FC<DailyPollWidgetFullProps> = memo(({ onAnswered }) => {
    const [selectedAsset, setSelectedAsset] = useState(POLL_ASSETS[0]);
    const [vote, setVote] = useState<'Long' | 'Short' | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(`daily_poll_${selectedAsset}`);
        if (saved) {
            setVote(saved as 'Long' | 'Short');
            setHasVoted(true);
        }
    }, [selectedAsset]);

    const handleVote = (direction: 'Long' | 'Short') => {
        setIsAnimating(true);
        setTimeout(() => {
            setVote(direction);
            setHasVoted(true);
            setIsAnimating(false);
            localStorage.setItem(`daily_poll_${selectedAsset}`, direction);
            onAnswered?.();
        }, 200);
    };

    return (
        <div className="glass rounded-2xl overflow-hidden border border-white/5">
            {/* Header */}
            <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-lg">poll</span>
                        </div>
                        <div>
                            <h3 className="text-[11px] font-bold text-white tracking-wide">Encuesta del Día</h3>
                            <p className="text-[9px] text-gray-500">Sentimiento del mercado</p>
                        </div>
                    </div>
                    {hasVoted && (
                        <span className="px-2.5 py-1 bg-signal-green/10 border border-signal-green/20 rounded-full text-[9px] font-bold text-signal-green">
                            ✓ Votado
                        </span>
                    )}
                </div>
            </div>

            {/* Asset Selector */}
            <div className="px-5 pb-4">
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {POLL_ASSETS.map(asset => (
                        <button
                            key={asset}
                            onClick={() => !hasVoted && setSelectedAsset(asset)}
                            disabled={hasVoted}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                                selectedAsset === asset
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                            } ${hasVoted ? 'cursor-default opacity-50' : ''}`}
                        >
                            {asset}
                        </button>
                    ))}
                </div>
            </div>

            {/* Voting Area */}
            <div className={`px-5 pb-5 transition-all duration-200 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                {hasVoted ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Results */}
                        <div className="mb-3">
                            <p className="text-xs text-center text-gray-400 mb-3">
                                ¿Cuál es tu sentimiento para <span className="text-white font-semibold">{selectedAsset}</span>?
                            </p>
                            
                            <div className="space-y-3">
                                {/* Long Bar */}
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-lg bg-gradient-to-br from-signal-green/20 to-emerald-500/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-signal-green text-sm">trending_up</span>
                                            </div>
                                            <span className={`text-[11px] font-bold ${vote === 'Long' ? 'text-signal-green' : 'text-gray-400'}`}>
                                                Long {vote === 'Long' && '✓'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">65%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-signal-green to-emerald-400 rounded-full transition-all duration-500"
                                            style={{ width: '65%' }}
                                        />
                                    </div>
                                </div>

                                {/* Short Bar */}
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-lg bg-gradient-to-br from-red-500/20 to-red-400/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-red-400 text-sm">trending_down</span>
                                            </div>
                                            <span className={`text-[11px] font-bold ${vote === 'Short' ? 'text-red-400' : 'text-gray-400'}`}>
                                                Short {vote === 'Short' && '✓'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">35%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                                            style={{ width: '35%' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-4 pt-2 border-t border-white/5">
                            <div className="text-center">
                                <p className="text-lg font-black text-white">{Math.floor(Math.random() * 500 + 100)}</p>
                                <p className="text-[8px] text-gray-500 uppercase tracking-wider">participantes</p>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center">
                                <p className="text-lg font-black text-signal-green">65%</p>
                                <p className="text-[8px] text-gray-500 uppercase tracking-wider">Long</p>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center">
                                <p className="text-lg font-black text-red-400">35%</p>
                                <p className="text-[8px] text-gray-500 uppercase tracking-wider">Short</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-xs text-center text-gray-400 mb-4">
                            ¿Cuál es tu sentimiento para <span className="text-white font-semibold">{selectedAsset}</span>?
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleVote('Long')}
                                className="group relative overflow-hidden rounded-xl border border-signal-green/20 bg-gradient-to-br from-signal-green/5 to-transparent p-4 hover:border-signal-green/40 hover:from-signal-green/10 transition-all"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-signal-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex flex-col items-center gap-2">
                                    <div className="size-10 rounded-xl bg-gradient-to-br from-signal-green/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-signal-green text-xl">trending_up</span>
                                    </div>
                                    <span className="text-xs font-bold text-signal-green uppercase tracking-wider">Long</span>
                                </div>
                            </button>
                            
                            <button
                                onClick={() => handleVote('Short')}
                                className="group relative overflow-hidden rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent p-4 hover:border-red-500/40 hover:from-red-500/10 transition-all"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex flex-col items-center gap-2">
                                    <div className="size-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-red-400 text-xl">trending_down</span>
                                    </div>
                                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Short</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Glow */}
            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
    );
});

export default DailyPollWidgetFull;
