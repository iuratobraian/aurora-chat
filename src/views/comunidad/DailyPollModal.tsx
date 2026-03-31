import React, { memo, useState, useEffect, useCallback } from 'react';

interface DailyPollModalProps {
    onAnswered?: () => void;
    onSkip?: () => void;
    onRemindLater?: () => void;
}

const POLL_ASSETS = ['NAS100', 'EUR/USD', 'GBP/USD', 'BTC/USD', 'XAU/USD'];

const getTodayKey = () => new Date().toISOString().split('T')[0];

export const DailyPollModal: React.FC<DailyPollModalProps> = memo(({ 
    onAnswered, 
    onSkip, 
    onRemindLater 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(POLL_ASSETS[0]);
    const [vote, setVote] = useState<'Long' | 'Short' | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const today = getTodayKey();
        const answered = localStorage.getItem(`daily_poll_answered_${today}`);
        const skipped = localStorage.getItem(`daily_poll_skipped_${today}`);
        const remindLater = localStorage.getItem('daily_poll_remind');
        
        if (answered || skipped) {
            setHasVoted(answered === 'true');
            setIsOpen(false);
        } else if (remindLater) {
            const remindData = JSON.parse(remindLater);
            if (remindData.date === today) {
                setIsOpen(false);
            } else {
                localStorage.removeItem('daily_poll_remind');
                setIsOpen(true);
            }
        } else {
            setIsOpen(true);
        }
    }, []);

    const handleVote = useCallback((direction: 'Long' | 'Short') => {
        setIsAnimating(true);
        setTimeout(() => {
            setVote(direction);
            setHasVoted(true);
            setIsAnimating(false);
            
            const today = getTodayKey();
            localStorage.setItem(`daily_poll_${selectedAsset}`, direction);
            localStorage.setItem(`daily_poll_answered_${today}`, 'true');
            localStorage.removeItem('daily_poll_remind');
            
            onAnswered?.();
        }, 200);
    }, [selectedAsset, onAnswered]);

    const handleSkip = useCallback(() => {
        const today = getTodayKey();
        localStorage.setItem(`daily_poll_skipped_${today}`, 'true');
        setIsOpen(false);
        onSkip?.();
    }, [onSkip]);

    const handleRemindLater = useCallback(() => {
        const today = getTodayKey();
        localStorage.setItem('daily_poll_remind', JSON.stringify({ date: today }));
        setIsOpen(false);
        onRemindLater?.();
    }, [onRemindLater]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-[#0f1115] border border-primary/30 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                {/* Header */}
                <div className="p-5 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">poll</span>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white">Encuesta del Día</h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">¿Cuál es tu sentimiento?</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSkip}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-gray-500">close</span>
                        </button>
                    </div>
                </div>

                {/* Asset Selector */}
                <div className="px-5 py-4 border-b border-white/5">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {POLL_ASSETS.map(asset => (
                            <button
                                key={asset}
                                onClick={() => !hasVoted && setSelectedAsset(asset)}
                                disabled={hasVoted}
                                className={`px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                                    selectedAsset === asset
                                        ? 'bg-primary/20 text-primary border border-primary/30'
                                        : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                                } ${hasVoted ? 'opacity-50 cursor-default' : ''}`}
                            >
                                {asset}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Voting Area */}
                <div className={`p-5 transition-all duration-200 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                    {hasVoted ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="text-center mb-4">
                                <div className="size-14 mx-auto mb-3 rounded-full bg-signal-green/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-signal-green text-3xl">check_circle</span>
                                </div>
                                <p className="text-sm font-bold text-white">¡Gracias por votar!</p>
                                <p className="text-xs text-gray-500 mt-1">Tu respuesta ha sido registrada</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-center text-xs text-gray-400 mb-4">
                                ¿Cuál es tu sentimiento para <span className="text-white font-semibold">{selectedAsset}</span>?
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleVote('Long')}
                                    className="group relative overflow-hidden rounded-2xl border border-signal-green/20 bg-gradient-to-br from-signal-green/5 to-transparent p-5 hover:border-signal-green/40 hover:from-signal-green/10 transition-all"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-signal-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative flex flex-col items-center gap-3">
                                        <div className="size-12 rounded-xl bg-gradient-to-br from-signal-green/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-signal-green text-2xl">trending_up</span>
                                        </div>
                                        <span className="text-sm font-bold text-signal-green uppercase tracking-wider">Long</span>
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => handleVote('Short')}
                                    className="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent p-5 hover:border-red-500/40 hover:from-red-500/10 transition-all"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative flex flex-col items-center gap-3">
                                        <div className="size-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-red-400 text-2xl">trending_down</span>
                                        </div>
                                        <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Short</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/5 flex items-center justify-between">
                    <button
                        onClick={handleSkip}
                        className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        Omitir
                    </button>
                    {!hasVoted && (
                        <button
                            onClick={handleRemindLater}
                            className="px-4 py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            Contestar después
                        </button>
                    )}
                    {hasVoted && (
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary/80 transition-colors"
                        >
                            Cerrar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

DailyPollModal.displayName = 'DailyPollModal';

export default DailyPollModal;
