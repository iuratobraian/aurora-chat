import React, { memo, useState, useEffect } from 'react';

interface DailyPollResultsProps {
    compact?: boolean;
}

const POLL_ASSETS = ['NAS100', 'EUR/USD', 'GBP/USD', 'BTC/USD', 'XAU/USD'];

const getTodayKey = () => new Date().toISOString().split('T')[0];

export const DailyPollResults: React.FC<DailyPollResultsProps> = memo(({ compact = false }) => {
    const [selectedAsset, setSelectedAsset] = useState(POLL_ASSETS[0]);
    const [userVote, setUserVote] = useState<'Long' | 'Short' | null>(null);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        const today = getTodayKey();
        const answered = localStorage.getItem(`daily_poll_answered_${today}`);
        setHasVoted(answered === 'true');
        
        const savedVote = localStorage.getItem(`daily_poll_${selectedAsset}`);
        if (savedVote) {
            setUserVote(savedVote as 'Long' | 'Short');
        }
    }, [selectedAsset]);

    if (!hasVoted) {
        return (
            <div className="glass rounded-2xl overflow-hidden border border-white/5 p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">poll</span>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-bold text-white">Encuesta del Día</h3>
                        <p className="text-[8px] text-gray-500">¡Participa desde el feed!</p>
                    </div>
                </div>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-daily-poll'))}
                    className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                >
                    Responder Encuesta
                </button>
            </div>
        );
    }

    const longPercent = 50 + Math.floor(Math.random() * 30);
    const shortPercent = 100 - longPercent;
    const participants = Math.floor(Math.random() * 500 + 100);

    if (compact) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Encuesta</span>
                    <span className="text-[8px] text-signal-green font-bold">✓ Votado</span>
                </div>
                
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {POLL_ASSETS.map(asset => (
                        <button
                            key={asset}
                            onClick={() => setSelectedAsset(asset)}
                            className={`px-2 py-1 rounded text-[9px] font-bold whitespace-nowrap transition-all ${
                                selectedAsset === asset
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-white/5 text-gray-500'
                            }`}
                        >
                            {asset}
                        </button>
                    ))}
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-signal-green text-xs">trending_up</span>
                            <span className={`text-[9px] font-bold ${userVote === 'Long' ? 'text-signal-green' : 'text-gray-400'}`}>
                                Long {userVote === 'Long' && '✓'}
                            </span>
                        </div>
                        <span className="text-[9px] font-bold text-gray-400">{longPercent}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-signal-green to-emerald-400 rounded-full"
                            style={{ width: `${longPercent}%` }}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-red-400 text-xs">trending_down</span>
                            <span className={`text-[9px] font-bold ${userVote === 'Short' ? 'text-red-400' : 'text-gray-400'}`}>
                                Short {userVote === 'Short' && '✓'}
                            </span>
                        </div>
                        <span className="text-[9px] font-bold text-gray-400">{shortPercent}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                            style={{ width: `${shortPercent}%` }}
                        />
                    </div>
                </div>

                <div className="text-center pt-1.5 border-t border-white/5">
                    <span className="text-[8px] text-gray-500">{participants} participantes</span>
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl overflow-hidden border border-white/5">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">poll</span>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-bold text-white">Encuesta del Día</h3>
                        <p className="text-[8px] text-gray-500">Resultados</p>
                    </div>
                </div>
                <span className="px-2 py-0.5 bg-signal-green/10 border border-signal-green/20 rounded-full text-[8px] font-bold text-signal-green">
                    ✓ Votado
                </span>
            </div>

            <div className="p-4">
                <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
                    {POLL_ASSETS.map(asset => (
                        <button
                            key={asset}
                            onClick={() => setSelectedAsset(asset)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                                selectedAsset === asset
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {asset}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-lg bg-gradient-to-br from-signal-green/20 to-emerald-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-signal-green text-sm">trending_up</span>
                            </div>
                            <span className={`text-[11px] font-bold ${userVote === 'Long' ? 'text-signal-green' : 'text-gray-400'}`}>
                                Long {userVote === 'Long' && '✓'}
                            </span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-400">{longPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-signal-green to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${longPercent}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-lg bg-gradient-to-br from-red-500/20 to-red-400/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-400 text-sm">trending_down</span>
                            </div>
                            <span className={`text-[11px] font-bold ${userVote === 'Short' ? 'text-red-400' : 'text-gray-400'}`}>
                                Short {userVote === 'Short' && '✓'}
                            </span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-400">{shortPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                            style={{ width: `${shortPercent}%` }}
                        />
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center gap-4">
                    <div className="text-center">
                        <p className="text-sm font-black text-white">{participants}</p>
                        <p className="text-[8px] text-gray-500 uppercase tracking-wider">participantes</p>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className="text-center">
                        <p className={`text-sm font-black ${longPercent > shortPercent ? 'text-signal-green' : 'text-red-400'}`}>
                            {longPercent > shortPercent ? 'Long' : 'Short'}
                        </p>
                        <p className="text-[8px] text-gray-500 uppercase tracking-wider">liderando</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

DailyPollResults.displayName = 'DailyPollResults';

export default DailyPollResults;
