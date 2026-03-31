import React, { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Usuario } from '../types';

interface FloatingActionsMenuProps {
    usuario: Usuario | null;
    onLoginRequest?: () => void;
    onOpenKimiChat?: () => void;
}

const SIGNAL_TYPES = [
    { id: 'forex', label: 'Forex', icon: '💱', color: 'from-blue-500 to-cyan-500' },
    { id: 'crypto', label: 'Crypto', icon: '₿', color: 'from-amber-500 to-orange-500' },
    { id: 'indices', label: 'Índices', icon: '📊', color: 'from-purple-500 to-pink-500' },
    { id: 'commodities', label: 'Commodities', icon: '🛢️', color: 'from-yellow-500 to-amber-500' },
    { id: 'stocks', label: 'Acciones', icon: '📈', color: 'from-green-500 to-emerald-500' },
];

const TIMEFRAMES = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1', 'W1', 'MN'];
const PRIORITIES = [
    { id: 'free', label: 'Gratis', desc: 'Visible para todos' },
    { id: 'standard', label: 'Estándar', desc: 'Suscriptores básicos' },
    { id: 'premium', label: 'Premium', desc: 'Suscriptores premium' },
    { id: 'vip', label: 'VIP', desc: 'Solo VIP' },
];

const ADMIN_SECTIONS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
    { id: 'users', label: 'Usuarios', icon: 'group', path: '/admin/users' },
    { id: 'posts', label: 'Posts', icon: 'article', path: '/admin/posts' },
    { id: 'communities', label: 'Comunidades', icon: 'groups', path: '/admin/communities' },
    { id: 'signals', label: 'Ideas de Trading', icon: 'trending_up', path: '/admin/signals' },
    { id: 'propFirms', label: 'Prop Firms', icon: 'account_balance', path: '/admin/propFirms' },
    { id: 'bitacora', label: 'Bitácora', icon: 'menu_book', path: '/admin/bitacora' },
    { id: 'ads', label: 'Publicidad', icon: 'campaign', path: '/admin/ads' },
    { id: 'marketing', label: 'Instagram', icon: 'camera', path: '/admin/marketing' },
    { id: 'config', label: 'Config', icon: 'settings', path: '/admin/config' },
];

interface SignalPublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    usuario: Usuario | null;
}

const SignalPublishModal: React.FC<SignalPublishModalProps> = ({ isOpen, onClose, usuario }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [signalType, setSignalType] = useState('forex');
    const [timeframe, setTimeframe] = useState('H1');
    const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
    const [pair, setPair] = useState('');
    const [entryPrice, setEntryPrice] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [takeProfits, setTakeProfits] = useState<string[]>(['', '']);
    const [priority, setPriority] = useState('free');
    const [showFollowUp, setShowFollowUp] = useState(false);
    const [signalStatus, setSignalStatus] = useState<'open' | 'closed'>('open');
    const [signalResult, setSignalResult] = useState<'profit' | 'loss' | null>(null);
    const [createdSignalId, setCreatedSignalId] = useState<string | null>(null);

    const createSignal = useMutation(api.signals.createSignal);
    const updateSignalStatus = useMutation(api.signals.updateSignalStatus);
    const recordSubscriberAction = useMutation(api.signals.recordSubscriberAction);

    const handleCreateSignal = async () => {
        if (!pair || !entryPrice) {
            setError('Por favor completa los campos requeridos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const signalData = {
                asset: pair,
                direction: direction,
                entryPrice,
                stopLoss: stopLoss || undefined,
                takeProfits: takeProfits.filter(tp => tp),
                timeframe,
                priority: priority as any,
            };

            const result = await createSignal({
                ...signalData,
                userId: usuario?.id || '',
            });

            if (result) {
                setCreatedSignalId(result);
                setShowFollowUp(true);
                setStep(3);
            }
        } catch (e) {
            setError('Error al crear la señal');
        } finally {
            setLoading(false);
        }
    };

    const handleFollowUpSubmit = async () => {
        if (!createdSignalId) return;

        setLoading(true);
        try {
            if (signalStatus === 'closed') {
                const status = signalResult === 'profit' ? 'hit' : 'canceled';
                await updateSignalStatus({ signalId: createdSignalId, status: status as any });
            }

            if (signalStatus === 'closed' && signalResult) {
                await recordSubscriberAction({
                    signalId: createdSignalId,
                    action: signalResult === 'profit' ? 'closed_profit' : 'closed_loss',
                });
            }

            onClose();
        } catch (e) {
            setError('Error al actualizar la señal');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const currentType = SIGNAL_TYPES.find(t => t.id === signalType);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="w-full max-w-md bg-[#0f1115] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="text-signal-green material-symbols-outlined">trending_up</span>
                        Nueva Señal
                    </h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-gray-400 text-lg">close</span>
                    </button>
                </div>

                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {step === 1 && (
                        <>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Tipo de Activo</label>
                                <div className="flex gap-2">
                                    {SIGNAL_TYPES.map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSignalType(type.id)}
                                            className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold transition-all ${
                                                signalType === type.id
                                                    ? `bg-gradient-to-br ${type.color} text-white shadow-lg`
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            <span className="block text-lg mb-0.5">{type.icon}</span>
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Par/Ticker</label>
                                <input
                                    type="text"
                                    value={pair}
                                    onChange={e => setPair(e.target.value.toUpperCase())}
                                    placeholder="EUR/USD, BTC/USD..."
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium placeholder:text-gray-500 focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Dirección</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setDirection('buy')}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                                            direction === 'buy'
                                                ? 'bg-signal-green text-white shadow-lg shadow-signal-green/30'
                                                : 'bg-white/5 text-gray-400 hover:bg-signal-green/10'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-lg mr-1 align-middle">trending_up</span>
                                        BUY
                                    </button>
                                    <button
                                        onClick={() => setDirection('sell')}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                                            direction === 'sell'
                                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                                : 'bg-white/5 text-gray-400 hover:bg-red-500/10'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-lg mr-1 align-middle">trending_down</span>
                                        SELL
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Timeframe</label>
                                <div className="flex gap-1">
                                    {TIMEFRAMES.map(tf => (
                                        <button
                                            key={tf}
                                            onClick={() => setTimeframe(tf)}
                                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                                                timeframe === tf
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {tf}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Precio de Entrada</label>
                                <input
                                    type="text"
                                    value={entryPrice}
                                    onChange={e => setEntryPrice(e.target.value)}
                                    placeholder="1.0850"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg font-mono placeholder:text-gray-500 focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Stop Loss</label>
                                <input
                                    type="text"
                                    value={stopLoss}
                                    onChange={e => setStopLoss(e.target.value)}
                                    placeholder="Opcional"
                                    className="w-full px-4 py-3 bg-white/5 border border-red-500/30 rounded-xl text-white text-lg font-mono placeholder:text-gray-500 focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Take Profits</label>
                                <div className="space-y-2">
                                    {takeProfits.map((tp, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            value={tp}
                                            onChange={e => {
                                                const newTPs = [...takeProfits];
                                                newTPs[idx] = e.target.value;
                                                setTakeProfits(newTPs);
                                            }}
                                            placeholder={`TP${idx + 1}`}
                                            className="w-full px-4 py-3 bg-white/5 border border-signal-green/30 rounded-xl text-white text-lg font-mono placeholder:text-gray-500 focus:outline-none focus:border-signal-green"
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => setTakeProfits([...takeProfits, ''])}
                                    className="mt-2 text-[10px] text-primary hover:text-primary/80 font-bold"
                                >
                                    + Agregar más TP
                                </button>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Visibilidad</label>
                                <div className="space-y-2">
                                    {PRIORITIES.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setPriority(p.id)}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
                                                priority === p.id
                                                    ? 'bg-primary/20 border border-primary/30 text-primary'
                                                    : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            <span className="text-sm font-bold">{p.label}</span>
                                            <span className="text-[10px]">{p.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {step === 3 && showFollowUp && (
                        <div className="text-center py-8">
                            <div className="size-16 mx-auto mb-4 rounded-full bg-signal-green/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-signal-green text-3xl">check_circle</span>
                            </div>
                            <h4 className="text-lg font-black text-white mb-2">¡Señal creada!</h4>
                            <p className="text-sm text-gray-400 mb-6">¿Deseas cerrar la señal o dejarla abierta?</p>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setSignalStatus('open'); setStep(4); }}
                                        className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-all"
                                    >
                                        Dejar Abierta
                                    </button>
                                    <button
                                        onClick={() => setSignalStatus('closed')}
                                        className="flex-1 py-3 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/80 transition-all"
                                    >
                                        Cerrar Ahora
                                    </button>
                                </div>
                                {signalStatus === 'closed' && (
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Resultado:</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setSignalResult('profit'); setStep(4); }}
                                                className="flex-1 py-3 rounded-xl font-bold text-sm bg-signal-green/20 text-signal-green hover:bg-signal-green/30 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-lg mr-1 align-middle">thumb_up</span>
                                                Ganancia
                                            </button>
                                            <button
                                                onClick={() => { setSignalResult('loss'); setStep(4); }}
                                                className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-lg mr-1 align-middle">thumb_down</span>
                                                Pérdida
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center py-8">
                            <div className="size-16 mx-auto mb-4 rounded-full bg-signal-green/20 flex items-center justify-center animate-pulse">
                                <span className="material-symbols-outlined text-signal-green text-3xl">rocket_launch</span>
                            </div>
                            <h4 className="text-lg font-black text-white mb-2">¡Señal Publicada!</h4>
                            <p className="text-sm text-gray-400">Tu señal está ahora disponible para la comunidad.</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 flex gap-3">
                    {step > 1 && step < 4 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
                        >
                            Atrás
                        </button>
                    )}
                    {step === 1 && (
                        <button
                            onClick={() => pair && setStep(2)}
                            disabled={!pair}
                            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-white/5 text-gray-400 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                    )}
                    {step === 2 && (
                        <button
                            onClick={handleCreateSignal}
                            disabled={loading || !entryPrice}
                            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-signal-green to-emerald-500 text-white hover:from-signal-green/90 hover:to-emerald-500/90 transition-all shadow-lg shadow-signal-green/30 disabled:opacity-50"
                        >
                            {loading ? 'Publicando...' : 'Publicar Señal'}
                        </button>
                    )}
                    {step === 4 && (
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-signal-green to-emerald-500 text-white hover:from-signal-green/90 hover:to-emerald-500/90 transition-all"
                        >
                            Listo
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const FloatingActionsMenu: React.FC<FloatingActionsMenuProps> = memo(({ usuario, onLoginRequest, onOpenKimiChat }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showSignalModal, setShowSignalModal] = useState(false);
    const navigate = useNavigate();

    const isAdmin = usuario && (
        usuario.rol === 'admin' ||
        usuario.rol === 'ceo' ||
        (usuario.role && usuario.role >= 5)
    );

    const canCreateSignal = usuario?.role >= 5 || usuario?.rol === 'admin';

    const hasActions = isAdmin || canCreateSignal;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        const handleToggleMenu = () => setIsOpen(prev => !prev);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('toggle-floating-menu', handleToggleMenu);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('toggle-floating-menu', handleToggleMenu);
        };
    }, []);

    const handleAction = useCallback((action: string) => {
        if (action === 'signal') {
            setShowSignalModal(true);
            setIsOpen(false);
        } else if (action === 'admin') {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'admin' }));
            setIsOpen(false);
        }
    }, []);

    if (!hasActions) return null;

    return (
        <>
            <div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end gap-2">
                {isOpen && (
                    <div className="animate-in slide-in-from-bottom-5 fade-in duration-300">
                        <div className="bg-[#0f1115] border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 overflow-hidden backdrop-blur-xl mb-3" style={{ minWidth: '220px' }}>
                            {/* Nueva Señal */}
                            {canCreateSignal && (
                                <button
                                    onClick={() => handleAction('signal')}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-signal-green/10 transition-all group border-b border-white/5"
                                >
                                    <div className="size-9 rounded-xl bg-gradient-to-br from-signal-green to-emerald-500 flex items-center justify-center shadow-lg shadow-signal-green/20">
                                        <span className="material-symbols-outlined text-white text-lg">trending_up</span>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-sm font-bold text-signal-green group-hover:text-signal-green/80">Nueva Señal</span>
                                        <p className="text-[9px] text-gray-500">Publicar trading signal</p>
                                    </div>
                                </button>
                            )}

                            {/* Admin Section */}
                            {isAdmin && (
                                <>
                                    <div className="p-3 border-b border-white/10">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Panel Admin</p>
                                    </div>
                                    <div className="p-2 max-h-64 overflow-y-auto">
                                        {ADMIN_SECTIONS.map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => {
                                                    window.location.hash = '#' + section.path;
                                                    setIsOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-500/10 text-left transition-all group"
                                            >
                                                <span className="material-symbols-outlined text-lg text-purple-400 group-hover:text-purple-300">
                                                    {section.icon}
                                                </span>
                                                <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                                                    {section.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-2 border-t border-white/10">
                                        <button
                                            onClick={() => {
                                                window.dispatchEvent(new CustomEvent('navigate', { detail: 'admin' }));
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-500/10 text-left transition-all group"
                                        >
                                            <span className="material-symbols-outlined text-lg text-purple-400 group-hover:text-purple-300">open_in_new</span>
                                            <span className="text-sm font-medium text-gray-300 group-hover:text-white">Ver Admin Completo</span>
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* GLM-4.7 Chat Button */}
                            <div className="p-2 border-t border-white/10">
                                <button
                                    onClick={() => {
                                        if (onOpenKimiChat) onOpenKimiChat();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-500/10 text-left transition-all group"
                                >
                                    <span className="material-symbols-outlined text-lg text-purple-400 group-hover:text-purple-300">smart_toy</span>
                                    <div className="text-left">
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">GLM-4.7 Chat</span>
                                        <p className="text-[9px] text-gray-500">Asistente de código avanzado</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toggle Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="size-12 rounded-xl bg-gradient-to-br from-purple-500/80 to-indigo-600/80 backdrop-blur-xl border border-purple-400/30 shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 transition-all"
                >
                    <span className="material-symbols-outlined text-white text-xl">
                        {isOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </div>

            <SignalPublishModal
                isOpen={showSignalModal}
                onClose={() => setShowSignalModal(false)}
                usuario={usuario}
            />

            {isOpen && (
                <div 
                    className="fixed inset-0 z-[9997] bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
});

FloatingActionsMenu.displayName = 'FloatingActionsMenu';

export default FloatingActionsMenu;
