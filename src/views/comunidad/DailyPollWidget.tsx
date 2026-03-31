import React, { memo, useState, useEffect } from 'react';

const POLL_ASSETS = ['NAS100', 'EUR/USD', 'GBP/USD', 'BTC/USD', 'XAU/USD'];

export const DailyPollWidget: React.FC = memo(() => {
    const [selectedAsset, setSelectedAsset] = useState(POLL_ASSETS[0]);
    const [vote, setVote] = useState<'Long' | 'Short' | null>(null);
    const [results, setResults] = useState({ long: 50, short: 50 });

    useEffect(() => {
        const saved = localStorage.getItem(`daily_poll_${selectedAsset}`);
        setVote(saved as 'Long' | 'Short' | null);
        setResults({ long: 50, short: 50 });
    }, [selectedAsset]);

    const handleVote = (direction: 'Long' | 'Short') => {
        setVote(direction);
        localStorage.setItem(`daily_poll_${selectedAsset}`, direction);
    };

    return (
        <div className="glass rounded-2xl p-4 border border-gray-100 dark:border-white/5 bg-white dark:bg-black/40">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4">
                Sentimiento {selectedAsset}
            </h3>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => handleVote('Long')}
                    className={`py-2 rounded-lg text-[9px] font-bold uppercase border transition-all ${
                        vote === 'Long'
                            ? 'bg-signal-green text-black border-signal-green'
                            : 'bg-signal-green/10 text-signal-green border-signal-green/20 hover:bg-signal-green/20'
                    }`}
                >
                    Long
                </button>
                <button
                    onClick={() => handleVote('Short')}
                    className={`py-2 rounded-lg text-[9px] font-bold uppercase border transition-all ${
                        vote === 'Short'
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                    }`}
                >
                    Short
                </button>
            </div>
        </div>
    );
});

export default DailyPollWidget;