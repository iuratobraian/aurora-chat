import React, { memo, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface FloatingSignalButtonProps {
    usuario: any;
    onLoginRequest?: () => void;
}

export const FloatingSignalButton: React.FC<FloatingSignalButtonProps> = memo(({
    usuario,
    onLoginRequest,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const canCreateSignal = usuario?.role >= 5 || usuario?.rol === 'admin' || usuario?.rol === 'creator';

    if (!canCreateSignal) return null;

    return (
        <>
            <div className="fixed bottom-24 right-6 z-40">
                <button
                    onClick={() => setShowModal(true)}
                    className="group relative size-14 rounded-full bg-gradient-to-br from-signal-green to-emerald-500 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-110 flex items-center justify-center"
                >
                    <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
                    <span className="material-symbols-outlined text-white text-2xl">trending_up</span>
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                            Publicar Señal
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-4 border-transparent border-l-gray-900" />
                        </div>
                    </div>
                </button>
            </div>

            {showModal && (
                <SignalPublishModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    usuario={usuario}
                    onLoginRequest={onLoginRequest}
                />
            )}
        </>
    );
});

interface SignalPublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    usuario: any;
    onLoginRequest?: () => void;
}

const SIGNAL_TYPES = [
    { id: 'forex', label: 'Forex', icon: '💱', color: 'from-blue-500 to-cyan-500' },
    { id: 'crypto', label: 'Crypto', icon: '₿', color: 'from-amber-500 to-orange-500' },
    { id: 'indices', label: 'Índices', icon: '📊', color: 'from-purple-500 to-pink-500' },
    { id: 'commodities', label: ' commodities', icon: '🛢️', color: 'from-yellow-500 to-amber-500' },
    { id: 'stocks', label: 'Acciones', icon: '📈', color: 'from-green-500 to-emerald-500' },
];

const TIMEFRAMES = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1', 'W1', 'MN'];
const PRIORITIES = [
    { id: 'free', label: 'Gratis', desc: 'Visible para todos' },
    { id: 'standard', label: 'Estándar', desc: 'Suscriptores básicos' },
    { id: 'premium', label: 'Premium', desc: 'Suscriptores premium' },
    { id: 'vip', label: 'VIP', desc: 'Solo VIP' },
];

const SignalPublishModal: React.FC<SignalPublishModalProps> = ({
    isOpen,
    onClose,
    usuario,
}) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showFollowUp, setShowFollowUp] = useState(false);
    const [signalStatus, setSignalStatus] = useState<'open' | 'closed'>('open');
    const [signalResult, setSignalResult] = useState<'profit' | 'loss' | null>(null);
    const [createdSignalId, setCreatedSignalId] = useState<string | null>(null);

    const updateSignalStatus = useMutation(api.signals.updateSignalStatus);
    const recordSubscriberAction = useMutation(api.signals.recordSubscriberAction);

    const handleFollowUpSubmit = async () => {
        if (!createdSignalId) return;
        
        setLoading(true);
        try {
            if (signalStatus === 'closed') {
                const status = signalResult === 'profit' ? 'hit' : 'canceled';
                await updateSignalStatus({ signalId: createdSignalId, status: status as any });
                
                if (signalResult) {
                    await recordSubscriberAction({
                        signalId: createdSignalId,
                        userId: usuario.id,
                        action: 'result_recorded',
                        result: signalResult,
                    });
                }
            }
            
            onClose();
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Error al actualizar la señal');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSuccess(false);
        setShowFollowUp(false);
        setSignalStatus('open');
        setSignalResult(null);
        setCreatedSignalId(null);
        setStep(1);
        setFormData({
            type: 'forex',
            pair: '',
            direction: 'buy',
            entryPrice: '',
            stopLoss: '',
            takeProfit1: '',
            takeProfit2: '',
            takeProfit3: '',
            timeframe: 'H1',
            priority: 'free',
            analysis: '',
            sentiment: 'bullish',
            tags: '',
        });
    };

    const [formData, setFormData] = useState({
        type: 'forex' as string,
        pair: '',
        direction: 'buy' as 'buy' | 'sell',
        entryPrice: '',
        stopLoss: '',
        takeProfit1: '',
        takeProfit2: '',
        takeProfit3: '',
        timeframe: 'H1',
        priority: 'free' as string,
        analysis: '',
        sentiment: 'bullish' as 'bullish' | 'bearish' | 'neutral',
        tags: '',
    });

    const createSignal = useMutation(api.signals.createSignal);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.pair.trim()) {
            setError('El par es obligatorio');
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
        if (!formData.analysis.trim()) {
            setError('El análisis es obligatorio');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const takeProfits = [];
            if (formData.takeProfit1) {
                takeProfits.push({ level: 1, price: parseFloat(formData.takeProfit1), reached: false });
            }
            if (formData.takeProfit2) {
                takeProfits.push({ level: 2, price: parseFloat(formData.takeProfit2), reached: false });
            }
            if (formData.takeProfit3) {
                takeProfits.push({ level: 3, price: parseFloat(formData.takeProfit3), reached: false });
            }

            const provider = await (await import('../../../convex/_generated/api')).api.signals.getProviderByUserId;
            
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
                sentiment: formData.sentiment,
                analysis: formData.analysis,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
                takeProfits,
            });

            setSuccess(true);
            setShowFollowUp(true);
            
        } catch (err: any) {
            setError(err.message || 'Error al publicar la señal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={onClose}
            >
            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
            <div 
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f1115] border border-signal-green/30 rounded-3xl shadow-2xl shadow-emerald-500/10"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-[#0f1115] z-10 p-6 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-xl bg-gradient-to-br from-signal-green/30 to-emerald-500/20 border border-signal-green/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-signal-green">trending_up</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">Publicar Señal</h2>
                                <p className="text-xs text-gray-500">Comparte tu análisis con la comunidad</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                Tipo de Señal
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {SIGNAL_TYPES.map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: t.id })}
                                        className={`p-3 rounded-xl border transition-all ${
                                            formData.type === t.id
                                                ? `bg-gradient-to-br ${t.color} border-transparent text-white`
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                        }`}
                                    >
                                        <span className="block text-xl mb-1">{t.icon}</span>
                                        <span className="text-xs font-bold">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                    Par (Ej: EUR/USD)
                                </label>
                                <input
                                    type="text"
                                    value={formData.pair}
                                    onChange={e => setFormData({ ...formData, pair: e.target.value.toUpperCase() })}
                                    placeholder="BTC/USD"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-signal-green focus:ring-1 focus:ring-signal-green"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                    Dirección
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, direction: 'buy' })}
                                        className={`p-3 rounded-xl border font-bold transition-all ${
                                            formData.direction === 'buy'
                                                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                        }`}
                                    >
                                        📈 COMPRAR
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, direction: 'sell' })}
                                        className={`p-3 rounded-xl border font-bold transition-all ${
                                            formData.direction === 'sell'
                                                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                        }`}
                                    >
                                        📉 VENDER
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                Precio Entrada
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.entryPrice}
                                onChange={e => setFormData({ ...formData, entryPrice: e.target.value })}
                                placeholder="1.0850"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-signal-green focus:ring-1 focus:ring-signal-green"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                Stop Loss
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.stopLoss}
                                onChange={e => setFormData({ ...formData, stopLoss: e.target.value })}
                                placeholder="1.0800"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                Timeframe
                            </label>
                            <select
                                value={formData.timeframe}
                                onChange={e => setFormData({ ...formData, timeframe: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-signal-green focus:ring-1 focus:ring-signal-green"
                            >
                                {TIMEFRAMES.map(tf => (
                                    <option key={tf} value={tf} className="bg-gray-900">{tf}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                            Take Profits (separados por coma)
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <input
                                type="number"
                                step="any"
                                value={formData.takeProfit1}
                                onChange={e => setFormData({ ...formData, takeProfit1: e.target.value })}
                                placeholder="TP 1"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-signal-green focus:ring-1 focus:ring-signal-green"
                            />
                            <input
                                type="number"
                                step="any"
                                value={formData.takeProfit2}
                                onChange={e => setFormData({ ...formData, takeProfit2: e.target.value })}
                                placeholder="TP 2 (opcional)"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-signal-green focus:ring-1 focus:ring-signal-green"
                            />
                            <input
                                type="number"
                                step="any"
                                value={formData.takeProfit3}
                                onChange={e => setFormData({ ...formData, takeProfit3: e.target.value })}
                                placeholder="TP 3 (opcional)"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-signal-green focus:ring-1 focus:ring-signal-green"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                            Prioridad / Visibilidad
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {PRIORITIES.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p.id })}
                                    className={`p-3 rounded-xl border transition-all ${
                                        formData.priority === p.id
                                            ? 'bg-signal-green/20 border-signal-green/50 text-signal-green'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                    }`}
                                >
                                    <div className="text-xs font-bold">{p.label}</div>
                                    <div className="text-[10px] opacity-70">{p.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                            Sentimiento
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'bullish', label: '📈 Alcista', color: 'green' },
                                { id: 'bearish', label: '📉 Bajista', color: 'red' },
                                { id: 'neutral', label: '➡️ Neutral', color: 'gray' },
                            ].map(s => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, sentiment: s.id as any })}
                                    className={`p-3 rounded-xl border font-bold text-sm transition-all ${
                                        formData.sentiment === s.id
                                            ? s.color === 'green' ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                            : s.color === 'red' ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                            : 'bg-gray-500/20 border-gray-500/50 text-gray-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                            Análisis
                        </label>
                        <textarea
                            value={formData.analysis}
                            onChange={e => setFormData({ ...formData, analysis: e.target.value })}
                            placeholder="Explica tu análisis técnico y razón para esta operación..."
                            rows={4}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-signal-green focus:ring-1 focus:ring-signal-green resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                            Tags (separados por coma)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="swing, intradia, euro"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-signal-green focus:ring-1 focus:ring-signal-green"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold hover:bg-white/10 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                loading
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : success && !showFollowUp
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-gradient-to-r from-signal-green to-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50'
                            }`}
                        >
                            {loading ? 'Publicando...' : success && !showFollowUp ? '¡Publicada!' : 'Publicar Señal'}
                        </button>
                    </div>
                </form>

                {/* Follow-up Modal */}
                {showFollowUp && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 z-50">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-signal-green to-emerald-500 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-3xl">check</span>
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">¡Señal Publicada!</h3>
                            <p className="text-sm text-gray-400">¿Cómo se encuentra esta operación?</p>
                        </div>

                        <div className="w-full space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Estado de la operación</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setSignalStatus('open')}
                                        className={`p-3 rounded-xl border font-bold transition-all ${
                                            signalStatus === 'open'
                                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-xl block mb-1">schedule</span>
                                        Sigue Abierta
                                    </button>
                                    <button
                                        onClick={() => setSignalStatus('closed')}
                                        className={`p-3 rounded-xl border font-bold transition-all ${
                                            signalStatus === 'closed'
                                                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-xl block mb-1">flag</span>
                                        Se Cerró
                                    </button>
                                </div>
                            </div>

                            {signalStatus === 'closed' && (
                                <div className="animate-fade-in">
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Resultado</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setSignalResult('profit')}
                                            className={`p-3 rounded-xl border font-bold transition-all ${
                                                signalResult === 'profit'
                                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                        >
                                            <span className="text-2xl block mb-1">📈</span>
                                            Ganancia
                                        </button>
                                        <button
                                            onClick={() => setSignalResult('loss')}
                                            className={`p-3 rounded-xl border font-bold transition-all ${
                                                signalResult === 'loss'
                                                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                        >
                                            <span className="text-2xl block mb-1">📉</span>
                                            Pérdida
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => { resetForm(); onClose(); }}
                                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold hover:bg-white/10 transition-all"
                                >
                                    Omitir
                                </button>
                                <button
                                    onClick={handleFollowUpSubmit}
                                    disabled={signalStatus === 'closed' && !signalResult}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-signal-green to-emerald-500 text-white font-bold hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloatingSignalButton;
