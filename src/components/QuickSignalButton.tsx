import React, { useState, memo } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface QuickSignalButtonProps {
    usuario: any;
}

export const QuickSignalButton: React.FC<QuickSignalButtonProps> = memo(({
    usuario,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const canCreateSignal = usuario?.role >= 5 || usuario?.rol === 'admin' || usuario?.rol === 'creator';

    if (!canCreateSignal) return null;

    return (
        <>
            <div className="z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative size-12 rounded-xl bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-signal-green text-xl">bolt</span>
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <div className="bg-gray-900/90 backdrop-blur-xl text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap shadow-xl flex items-center gap-2 border border-white/10">
                            <span className="material-symbols-outlined text-signal-green text-base">flash_on</span>
                            Señal Rápida
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-6 border-transparent border-l-gray-900" />
                        </div>
                    </div>
                </button>
            </div>

            {isOpen && (
                <QuickSignalModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    usuario={usuario}
                />
            )}
        </>
    );
});

interface QuickSignalModalProps {
    isOpen: boolean;
    onClose: () => void;
    usuario: any;
}

const QUICK_TYPES = [
    { id: 'forex', label: 'Forex', icon: '💱', color: 'blue' },
    { id: 'crypto', label: 'Crypto', icon: '₿', color: 'amber' },
    { id: 'indices', label: 'Índices', icon: '📊', color: 'purple' },
];

const POPULAR_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'BTC/USD', 'ETH/USD', 'XAU/USD', 'NAS100', 'US30'];

const DISTRIBUTION_CHANNELS = [
    { id: 'platform', label: 'Plataforma', icon: '🏠', desc: 'Feed principal', color: 'primary' },
    { id: 'telegram', label: 'Telegram', icon: '✈️', desc: 'Canal público', color: 'blue' },
    { id: 'discord', label: 'Discord', icon: '🎮', desc: 'Servidor', color: 'indigo' },
    { id: 'twitter', label: 'Twitter/X', icon: '𝕏', desc: 'Auto-post', color: 'gray' },
];

const QuickSignalModal: React.FC<QuickSignalModalProps> = ({
    isOpen,
    onClose,
    usuario,
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showFollowUp, setShowFollowUp] = useState(false);
    const [signalStatus, setSignalStatus] = useState<'open' | 'closed'>('open');
    const [signalResult, setSignalResult] = useState<'profit' | 'loss' | null>(null);

    const [formData, setFormData] = useState({
        type: 'forex',
        pair: '',
        direction: 'buy' as 'buy' | 'sell',
        entryPrice: '',
        stopLoss: '',
        takeProfit: '',
        timeframe: 'H1',
        priority: 'free',
        channels: ['platform'],
        analysis: '',
    });

    const [selectedChannels, setSelectedChannels] = useState<string[]>(['platform']);

    const createSignal = useMutation(api.signals.createSignal);
    const updateSignalStatus = useMutation(api.signals.updateSignalStatus);

    const toggleChannel = (channelId: string) => {
        setSelectedChannels(prev => 
            prev.includes(channelId) 
                ? prev.filter(c => c !== channelId)
                : [...prev, channelId]
        );
    };

    const handlePairSelect = (pair: string) => {
        setFormData(prev => ({ ...prev, pair }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.pair.trim()) {
            setError('Selecciona un par');
            return;
        }
        if (!formData.entryPrice || isNaN(parseFloat(formData.entryPrice))) {
            setError('Precio de entrada inválido');
            return;
        }
        if (!formData.stopLoss || isNaN(parseFloat(formData.stopLoss))) {
            setError('Stop Loss obligatorio');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const takeProfits = formData.takeProfit 
                ? [{ level: 1, price: parseFloat(formData.takeProfit), reached: false }]
                : [];

            await createSignal({
                providerId: usuario.id,
                type: formData.type as any,
                priority: formData.priority as any,
                pair: formData.pair.toUpperCase().trim(),
                direction: formData.direction,
                entryPrice: parseFloat(formData.entryPrice),
                entryType: 'instant',
                stopLoss: parseFloat(formData.stopLoss),
                timeframe: formData.timeframe as any,
                sentiment: formData.direction === 'buy' ? 'bullish' : 'bearish',
                analysis: formData.analysis || `${formData.direction === 'buy' ? '📈 Long' : '📉 Short'} ${formData.pair} en ${formData.timeframe}`,
                tags: [formData.type, formData.timeframe.toLowerCase()],
                takeProfits,
                distributeTo: selectedChannels,
            });

            setSuccess(true);
            setShowFollowUp(true);
            
        } catch (err: any) {
            setError(err.message || 'Error al publicar la señal');
        } finally {
            setLoading(false);
        }
    };

    const handleFollowUpSubmit = async () => {
        setLoading(true);
        try {
            if (signalStatus === 'closed' && signalResult) {
                // Signal would be updated with result
            }
            onClose();
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSuccess(false);
        setShowFollowUp(false);
        setSignalStatus('open');
        setSignalResult(null);
        setSelectedChannels(['platform']);
        setFormData({
            type: 'forex',
            pair: '',
            direction: 'buy',
            entryPrice: '',
            stopLoss: '',
            takeProfit: '',
            timeframe: 'H1',
            priority: 'free',
            channels: ['platform'],
            analysis: '',
        });
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-lg bg-gradient-to-b from-[#0a1510] via-[#0f1a15] to-[#0a1510] border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-500/20 overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative p-6 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-transparent">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <span className="material-symbols-outlined text-white text-2xl">bolt</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Señal Rápida</h2>
                                <p className="text-xs text-emerald-400/70">Publica en segundos</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="size-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Quick Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Type Selector */}
                    <div className="flex gap-2">
                        {QUICK_TYPES.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: t.id })}
                                className={`flex-1 p-3 rounded-xl border transition-all ${
                                    formData.type === t.id
                                        ? t.color === 'blue' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                                        : t.color === 'amber' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                                        : 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                }`}
                            >
                                <span className="text-2xl block mb-1">{t.icon}</span>
                                <span className="text-xs font-bold">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Popular Pairs */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                            Par Rápido
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {POPULAR_PAIRS.map(pair => (
                                <button
                                    key={pair}
                                    type="button"
                                    onClick={() => handlePairSelect(pair)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                        formData.pair === pair
                                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                                            : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                                    }`}
                                >
                                    {pair}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={formData.pair}
                            onChange={e => setFormData({ ...formData, pair: e.target.value.toUpperCase() })}
                            placeholder="O escribe otro par..."
                            className="mt-2 w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                        />
                    </div>

                    {/* Direction */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, direction: 'buy' })}
                            className={`p-4 rounded-xl border font-black text-sm transition-all ${
                                formData.direction === 'buy'
                                    ? 'bg-green-500/20 border-green-500/50 text-green-400 shadow-lg shadow-green-500/20'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-green-500/30'
                            }`}
                        >
                            <span className="text-2xl block mb-1">📈</span>
                            COMPRAR
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, direction: 'sell' })}
                            className={`p-4 rounded-xl border font-black text-sm transition-all ${
                                formData.direction === 'sell'
                                    ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-lg shadow-red-500/20'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-red-500/30'
                            }`}
                        >
                            <span className="text-2xl block mb-1">📉</span>
                            VENDER
                        </button>
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                Entrada
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.entryPrice}
                                onChange={e => setFormData({ ...formData, entryPrice: e.target.value })}
                                placeholder="0.0000"
                                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-emerald-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-red-400/70 mb-1.5 uppercase tracking-wider">
                                SL
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.stopLoss}
                                onChange={e => setFormData({ ...formData, stopLoss: e.target.value })}
                                placeholder="0.0000"
                                className="w-full px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-400/70 mb-1.5 uppercase tracking-wider">
                                TP
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.takeProfit}
                                onChange={e => setFormData({ ...formData, takeProfit: e.target.value })}
                                placeholder="0.0000"
                                className="w-full px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-white placeholder-gray-600 focus:border-emerald-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Timeframe */}
                    <div className="flex gap-2">
                        {['M5', 'M15', 'H1', 'H4', 'D1'].map(tf => (
                            <button
                                key={tf}
                                type="button"
                                onClick={() => setFormData({ ...formData, timeframe: tf })}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                    formData.timeframe === tf
                                        ? 'bg-primary text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    {/* Distribution Channels */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                            Distribuir a
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {DISTRIBUTION_CHANNELS.map(ch => (
                                <button
                                    key={ch.id}
                                    type="button"
                                    onClick={() => toggleChannel(ch.id)}
                                    className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${
                                        selectedChannels.includes(ch.id)
                                            ? ch.color === 'primary' ? 'bg-primary/20 border-primary/50 text-primary'
                                            : ch.color === 'blue' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                            : ch.color === 'indigo' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                                            : 'bg-gray-500/20 border-gray-500/50 text-gray-300'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                    }`}
                                >
                                    <span className="text-lg">{ch.icon}</span>
                                    <div className="text-left">
                                        <div className="text-xs font-bold">{ch.label}</div>
                                        <div className="text-[10px] opacity-60">{ch.desc}</div>
                                    </div>
                                    {selectedChannels.includes(ch.id) && (
                                        <span className="material-symbols-outlined text-sm ml-auto">check_circle</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="flex gap-2">
                        {[
                            { id: 'free', label: 'Gratis', color: 'emerald' },
                            { id: 'standard', label: 'Standard', color: 'blue' },
                            { id: 'premium', label: 'Premium', color: 'amber' },
                        ].map(p => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, priority: p.id })}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                    formData.priority === p.id
                                        ? p.color === 'emerald' ? 'bg-emerald-500 text-white'
                                        : p.color === 'blue' ? 'bg-blue-500 text-white'
                                        : 'bg-amber-500 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${
                            loading 
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02]'
                        }`}
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">sync</span>
                                Publicando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">send</span>
                                Publicar en {selectedChannels.length} canal{selectedChannels.length > 1 ? 'es' : ''}
                            </>
                        )}
                    </button>
                </form>

                {/* Follow-up Overlay */}
                {showFollowUp && (
                    <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-8">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/40 animate-bounce-in">
                                <span className="material-symbols-outlined text-white text-4xl">check</span>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">¡Señal Publicada!</h3>
                            <p className="text-sm text-gray-400">
                                Distribuida a {selectedChannels.length} canal{selectedChannels.length > 1 ? 'es' : ''}
                            </p>
                        </div>

                        <div className="w-full space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider text-center">
                                    Estado de la Operación
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setSignalStatus('open')}
                                        className={`p-4 rounded-xl border font-bold transition-all ${
                                            signalStatus === 'open'
                                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-2xl block mb-1">schedule</span>
                                        Sigue Abierta
                                    </button>
                                    <button
                                        onClick={() => setSignalStatus('closed')}
                                        className={`p-4 rounded-xl border font-bold transition-all ${
                                            signalStatus === 'closed'
                                                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-2xl block mb-1">flag</span>
                                        Cerrar Ahora
                                    </button>
                                </div>
                            </div>

                            {signalStatus === 'closed' && (
                                <div className="animate-fade-in space-y-3">
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider text-center">
                                        Resultado
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setSignalResult('profit')}
                                            className={`p-4 rounded-xl border font-bold transition-all ${
                                                signalResult === 'profit'
                                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                        >
                                            <span className="text-3xl block mb-1">📈</span>
                                            Ganancia
                                        </button>
                                        <button
                                            onClick={() => setSignalResult('loss')}
                                            className={`p-4 rounded-xl border font-bold transition-all ${
                                                signalResult === 'loss'
                                                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                        >
                                            <span className="text-3xl block mb-1">📉</span>
                                            Pérdida
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => { resetForm(); onClose(); }}
                                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold hover:bg-white/10 transition-all"
                                >
                                    Listo
                                </button>
                                <button
                                    onClick={handleFollowUpSubmit}
                                    disabled={signalStatus === 'closed' && !signalResult}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes bounce-in {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default QuickSignalButton;
