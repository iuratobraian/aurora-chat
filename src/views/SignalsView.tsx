import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Usuario } from '../types';
import { SignalsRanker, SignalItem } from '../services/ranking/signalsRanker';
import { isFeatureEnabled } from '../../lib/features';

interface SignalsViewProps {
  usuario: Usuario | null;
}

interface Signal {
  _id: any;
  signalId: string;
  providerId: string;
  type: string;
  priority: string;
  pair: string;
  pairCategory?: string;
  direction: 'buy' | 'sell';
  entryPrice: number;
  entryRangeMin?: number;
  entryRangeMax?: number;
  entryType: string;
  stopLoss: number;
  stopLossPips?: number;
  stopLossPercentage?: number;
  takeProfits: Array<{
    level: number;
    price: number;
    percentage?: number;
    reached: boolean;
    reachedAt?: number;
  }>;
  timeframe: string;
  sentiment: string;
  analysis: string;
  reason?: string;
  status: string;
  scheduledFor?: number;
  sentAt?: number;
  expiresAt?: number;
  totalSubscribersNotified: number;
  subscribersActed: number;
  subscribersWon: number;
  subscribersLost: number;
  tags: string[];
  provider?: any;
  createdAt: number;
  updatedAt: number;
}

interface SignalPlan {
  _id: any;
  name: string;
  slug: string;
  signalsPerDay: number;
  signalsPerWeek?: number;
  signalsPerMonth?: number;
  signalTypes: string[];
  hasVIPSignals: boolean;
  hasEntryConfirmation: boolean;
  hasExitTiming: boolean;
  hasRiskAnalysis: boolean;
  hasTradeManagement: boolean;
  hasDailyReport: boolean;
  priceMonthly: number;
  priceYearly?: number;
  currency: string;
  subscriberCount: number;
  avgRating: number;
  isActive: boolean;
  isFeatured: boolean;
}

const SignalsView: React.FC<SignalsViewProps> = ({ usuario }) => {
  const signalsFeatureEnabled = import.meta.env.VITE_FEATURE_SIGNALS === 'on';
  const [selectedTab, setSelectedTab] = useState<'signals' | 'plans' | 'providers' | 'create' | 'history'>('signals');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newSignal, setNewSignal] = useState({
    pair: '',
    direction: 'buy' as 'buy' | 'sell',
    entryPrice: '',
    stopLoss: '',
    takeProfit1: '',
    takeProfit2: '',
    takeProfit3: '',
    timeframe: 'H1' as const,
    priority: 'free' as const,
    analysis: '',
    tags: '',
  });

  const isAdmin = usuario?.rol === 'admin' || usuario?.rol === 'ceo' || (usuario?.role ?? 0) >= 8;
  const canCreateSignals = isAdmin || (usuario as any)?.canShareSignals || (usuario as any)?.role >= 5;

  const signals = useQuery(
    api.signals.getActiveSignals,
    signalsFeatureEnabled ? {} : "skip"
  ) || [];
  const plans = useQuery(
    api.signals.getSignalPlans,
    signalsFeatureEnabled ? {} : "skip"
  ) || [];
  const providers = useQuery(
    api.signals.getTopProviders,
    signalsFeatureEnabled ? { limit: 10 } : "skip"
  ) || [];
  const stats = useQuery(
    api.signals.getSignalStats,
    signalsFeatureEnabled ? {} : "skip"
  );
  const userSubscription = useQuery(
    api.signals.getUserSubscription, 
    signalsFeatureEnabled ? { userId: usuario?.id || '' } : "skip"
  );
  const signalHistory = useQuery(
    api.signals.getSignalHistory,
    signalsFeatureEnabled ? { limit: 50 } : "skip"
  ) || [];

  const subscribeToPlan = useMutation(api.signals.subscribeToPlan);
  const createSignal = useMutation(api.signals.createSignal);
  const sendToChat = useMutation(api.signals.sendSignalToChat);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const filteredSignals = selectedType === 'all' 
    ? signals 
    : signals.filter(s => s.type === selectedType);

  const rankedSignals = useMemo(() => {
    if (!filteredSignals || filteredSignals.length === 0) return [];
    const signalItems: SignalItem[] = filteredSignals.map(s => ({
      _id: s._id,
      pair: s.pair,
      direction: s.direction,
      entryPrice: s.entryPrice,
      stopLoss: s.stopLoss,
      takeProfit: s.takeProfits?.map(tp => tp.level) || [],
      providerName: s.provider?.nombreUsuario || 'Provider',
      providerAvatar: s.provider?.avatarUsuario || '',
      providerXp: s.provider?.xp || 0,
      winRate: s.provider?.winRate || 50,
      createdAt: s.createdAt || Date.now(),
      timeframe: s.timeframe,
      status: s.status,
    }));
    return SignalsRanker.surface(signalItems, {
      minWinRate: 0,
      maxSignals: 20,
      userXp: usuario?.xp || 0,
      userInterests: [],
      includeClosed: false,
    }).items;
  }, [filteredSignals, usuario]);

  const handleSubscribe = async (planId: any) => {
    if (!usuario || usuario.id === 'guest') return;
    
    try {
      await subscribeToPlan({
        userId: usuario.id,
        planId,
      });
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleCreateSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !canCreateSignals) return;
    
    setIsSubmitting(true);
    try {
      await createSignal({
        providerId: usuario.id,
        pair: newSignal.pair,
        direction: newSignal.direction,
        entryPrice: parseFloat(newSignal.entryPrice),
        stopLoss: parseFloat(newSignal.stopLoss),
        takeProfit1: parseFloat(newSignal.takeProfit1),
        takeProfit2: newSignal.takeProfit2 ? parseFloat(newSignal.takeProfit2) : undefined,
        takeProfit3: newSignal.takeProfit3 ? parseFloat(newSignal.takeProfit3) : undefined,
        timeframe: newSignal.timeframe,
        priority: newSignal.priority,
        analysis: newSignal.analysis,
        tags: newSignal.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      
      setNewSignal({
        pair: '',
        direction: 'buy',
        entryPrice: '',
        stopLoss: '',
        takeProfit1: '',
        takeProfit2: '',
        takeProfit3: '',
        timeframe: 'H1' as const,
        priority: 'free' as const,
        analysis: '',
        tags: '',
      });
      setSelectedTab('signals');
    } catch (error) {
      console.error('Error creating signal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendToChat = async (signalId: any) => {
    try {
      await sendToChat({ signalId });
    } catch (error) {
      console.error('Error sending to chat:', error);
    }
  };

  if (!signalsFeatureEnabled) {
    return (
      <div className="animate-in fade-in duration-700">
        <div className="glass rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <span className="material-symbols-outlined mb-4 text-5xl text-amber-400">build</span>
          <h1 className="mb-2 text-2xl font-black uppercase tracking-wider text-white">
            Señales temporalmente deshabilitadas
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-gray-300">
            Esta sección está apagada mientras se corrige la conexión entre Vercel y Convex.
            El portal sigue operativo y las señales volverán cuando el deployment correcto responda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-signal-green/5 -z-10" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(16,185,129,0.15) 0%, transparent 50%)' }} />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            📊 Ideas de Trading
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Oportunidades de trading en tiempo real para Forex, Crypto y más
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass rounded-xl px-4 py-2 bg-white/5">
            <p className="text-xs text-gray-500 uppercase">Ideas Activas</p>
            <p className="text-xl font-black text-signal-green">{stats?.activeSignals || 0}</p>
          </div>
          <div className="glass rounded-xl px-4 py-2 bg-white/5">
            <p className="text-xs text-gray-500 uppercase">Win Rate</p>
            <p className="text-xl font-black text-primary">{stats?.avgWinRate || 0}%</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'signals', label: 'Ideas', icon: 'show_chart' },
          { id: 'plans', label: 'Planes', icon: 'subscriptions' },
          { id: 'providers', label: 'Proveedores', icon: 'people' },
          ...(canCreateSignals ? [{ id: 'create', label: 'Crear', icon: 'add_circle' }] : []),
          ...(isAdmin ? [{ id: 'history', label: 'Historial', icon: 'history' }] : []),
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              selectedTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTab === 'signals' && (
        <>
          {!isFeatureEnabled('signals_feed', usuario.plan as 'free' | 'pro' | 'elite') && (
            <div className="glass rounded-2xl p-8 text-center mb-6 border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
              <span className="material-symbols-outlined text-5xl text-amber-400 mb-4">lock</span>
              <h3 className="text-lg font-black text-white mb-2">Señales en Vivo</h3>
              <p className="text-gray-400 text-sm mb-6">Accede a señales de trading en tiempo real de proveedores verificados</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setSelectedTab('plans')}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                >
                  Ver Planes
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { path: '/pricing' } }))}
                  className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                >
                  Mejorar a Pro
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'forex', label: 'Forex' },
              { id: 'crypto', label: 'Crypto' },
              { id: 'indices', label: 'Índices' },
              { id: 'commodities', label: 'Commodities' },
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedType === type.id
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSignals.map((signal: Signal) => (
              <div
                key={signal._id}
                onClick={() => setSelectedSignal(signal)}
                className="glass rounded-2xl p-4 bg-black/40 border border-white/10 hover:border-primary/40 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`size-12 rounded-xl flex items-center justify-center ${
                      signal.direction === 'buy' 
                        ? 'bg-signal-green/20 text-signal-green' 
                        : 'bg-signal-red/20 text-signal-red'
                    }`}>
                      <span className="material-symbols-outlined text-2xl">
                        {signal.direction === 'buy' ? 'trending_up' : 'trending_down'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        {signal.pair}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          signal.direction === 'buy' 
                            ? 'bg-signal-green/20 text-signal-green' 
                            : 'bg-signal-red/20 text-signal-red'
                        }`}>
                          {signal.direction === 'buy' ? 'BUY' : 'SELL'}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase">
                          {signal.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      signal.priority === 'vip' ? 'bg-amber-500/20 text-amber-400' :
                      signal.priority === 'premium' ? 'bg-primary/20 text-primary' :
                      'bg-white/5 text-gray-400'
                    }`}>
                      {signal.priority}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-1">
                      {signal.timeframe}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="glass rounded-lg p-2 bg-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Entrada</p>
                    <p className="font-bold text-signal-green">
                      {signal.entryPrice.toFixed(5)}
                    </p>
                  </div>
                  <div className="glass rounded-lg p-2 bg-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">SL</p>
                    <p className="font-bold text-signal-red">
                      {signal.stopLoss.toFixed(5)}
                    </p>
                  </div>
                  <div className="glass rounded-lg p-2 bg-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">TP</p>
                    <p className="font-bold text-primary">
                      {signal.takeProfits[0]?.price.toFixed(5) || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {signal.provider?.userId?.charAt(0) || '?'}
                    </div>
                    <span className="text-xs text-gray-400">
                      {signal.sentAt ? formatTimeAgo(signal.sentAt) : 'Ahora'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">
                      {signal.subscribersWon}/{signal.subscribersActed} ganados
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSignals.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">signal_cellular_alt</span>
              <h3 className="text-xl font-bold text-white mb-2">No hay señales activas</h3>
              <p className="text-gray-500">Las señales aparecerán aquí cuando estén disponibles</p>
            </div>
          )}
        </>
      )}

      {selectedTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: SignalPlan) => (
            <div
              key={plan._id}
              className={`glass rounded-2xl p-6 bg-black/40 border ${
                plan.isFeatured 
                  ? 'border-primary/50 shadow-lg shadow-primary/10' 
                  : 'border-white/10'
              }`}
            >
              {plan.isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-[10px] font-bold text-white uppercase">
                  Destacado
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-white uppercase mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black text-white">
                    {formatPrice(plan.priceMonthly, plan.currency)}
                  </span>
                  <span className="text-sm text-gray-500">/mes</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">check</span>
                  <span className="text-sm text-gray-300">
                    {plan.signalsPerDay} señales por día
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">check</span>
                  <span className="text-sm text-gray-300">
                    {plan.signalTypes.join(', ')}
                  </span>
                </div>
                {plan.hasVIPSignals && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-lg">star</span>
                    <span className="text-sm text-gray-300">Señales VIP</span>
                  </div>
                )}
                {plan.hasEntryConfirmation && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">check</span>
                    <span className="text-sm text-gray-300">Confirmación de entrada</span>
                  </div>
                )}
                {plan.hasExitTiming && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">check</span>
                    <span className="text-sm text-gray-300">Timing de salida</span>
                  </div>
                )}
                {plan.hasRiskAnalysis && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">check</span>
                    <span className="text-sm text-gray-300">Análisis de riesgo</span>
                  </div>
                )}
                {plan.hasDailyReport && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">check</span>
                    <span className="text-sm text-gray-300">Reporte diario</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                <span>{plan.subscriberCount} suscriptores</span>
                <span>★ {plan.avgRating.toFixed(1)}</span>
              </div>

              <button
                onClick={() => handleSubscribe(plan._id)}
                disabled={!!userSubscription || usuario?.id === 'guest'}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/30 text-white"
              >
                {userSubscription ? 'Suscrito' : usuario?.id === 'guest' ? 'Inicia sesión' : 'Suscribirse'}
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'providers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider: any) => (
            <div
              key={provider._id}
              className="glass rounded-2xl p-5 bg-black/40 border border-white/10"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="size-14 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                  <span className="text-2xl font-black text-primary">
                    {provider.userId?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white uppercase">
                      Proveedor
                    </h3>
                    {provider.isVerified && (
                      <span className="material-symbols-outlined text-primary text-lg">verified</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500 uppercase">
                      {provider.verificationLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="glass rounded-lg p-2 bg-white/5 text-center">
                  <p className="text-[10px] text-gray-500 uppercase">Win Rate</p>
                  <p className="text-lg font-black text-signal-green">
                    {provider.avgWinRate.toFixed(1)}%
                  </p>
                </div>
                <div className="glass rounded-lg p-2 bg-white/5 text-center">
                  <p className="text-[10px] text-gray-500 uppercase">Suscriptores</p>
                  <p className="text-lg font-black text-white">
                    {provider.subscribersCount}
                  </p>
                </div>
                <div className="glass rounded-lg p-2 bg-white/5 text-center">
                  <p className="text-[10px] text-gray-500 uppercase">Señales</p>
                  <p className="text-lg font-black text-white">
                    {provider.totalSignalsSent}
                  </p>
                </div>
                <div className="glass rounded-lg p-2 bg-white/5 text-center">
                  <p className="text-[10px] text-gray-500 uppercase">Pips</p>
                  <p className="text-lg font-black text-primary">
                    {provider.totalPipsGenerated > 0 ? '+' : ''}{provider.totalPipsGenerated.toFixed(0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500 uppercase">Rating:</span>
                  <span className="text-sm font-bold text-amber-400">★ {provider.avgRating.toFixed(1)}</span>
                </div>
                <button className="px-4 py-2 rounded-xl bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 transition-colors">
                  Ver Perfil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'create' && canCreateSignals && (
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-2xl p-6 bg-black/40 border border-white/10">
            <h2 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">add_circle</span>
              Nueva Señal
            </h2>

            <form onSubmit={handleCreateSignal} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Par</label>
                  <input
                    type="text"
                    required
                    value={newSignal.pair}
                    onChange={e => setNewSignal({...newSignal, pair: e.target.value.toUpperCase()})}
                    placeholder="EUR/USD"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Dirección</label>
                  <select
                    value={newSignal.direction}
                    onChange={e => setNewSignal({...newSignal, direction: e.target.value as 'buy' | 'sell'})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  >
                    <option value="buy">BUY (Compra)</option>
                    <option value="sell">SELL (Venta)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Entrada</label>
                  <input
                    type="number"
                    step="0.00001"
                    required
                    value={newSignal.entryPrice}
                    onChange={e => setNewSignal({...newSignal, entryPrice: e.target.value})}
                    placeholder="1.0850"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Stop Loss</label>
                  <input
                    type="number"
                    step="0.00001"
                    required
                    value={newSignal.stopLoss}
                    onChange={e => setNewSignal({...newSignal, stopLoss: e.target.value})}
                    placeholder="1.0800"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">TP 1</label>
                  <input
                    type="number"
                    step="0.00001"
                    required
                    value={newSignal.takeProfit1}
                    onChange={e => setNewSignal({...newSignal, takeProfit1: e.target.value})}
                    placeholder="1.0900"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Timeframe</label>
                  <select
                    value={newSignal.timeframe}
                    onChange={e => setNewSignal({...newSignal, timeframe: e.target.value as any})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  >
                    <option value="M5">M5</option>
                    <option value="M15">M15</option>
                    <option value="H1">H1</option>
                    <option value="H4">H4</option>
                    <option value="D1">D1</option>
                    <option value="W1">W1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Prioridad</label>
                  <select
                    value={newSignal.priority}
                    onChange={e => setNewSignal({...newSignal, priority: e.target.value as any})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  >
                    <option value="basic">Básico</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Análisis</label>
                <textarea
                  value={newSignal.analysis}
                  onChange={e => setNewSignal({...newSignal, analysis: e.target.value})}
                  placeholder="Análisis de la operación..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Tags (separados por coma)</label>
                <input
                  type="text"
                  value={newSignal.tags}
                  onChange={e => setNewSignal({...newSignal, tags: e.target.value})}
                  placeholder="forex, eur, tendencia"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/30 text-white font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Creando...' : 'Publicar Señal'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTab('signals')}
                  className="px-6 py-4 bg-white/5 text-gray-400 font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTab === 'history' && isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white uppercase">Historial de Señales</h2>
            <span className="text-sm text-gray-500">{signalHistory.length} señales</span>
          </div>

          {signalHistory.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">history</span>
              <h3 className="text-lg font-bold text-white">Sin historial</h3>
              <p className="text-gray-500">No hay señales publicadas aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signalHistory.map((signal: Signal) => (
                <div key={signal._id} className="glass rounded-xl p-4 bg-black/40 border border-white/10 flex items-center gap-4">
                  <div className={`shrink-0 size-10 rounded-lg flex items-center justify-center ${
                    signal.direction === 'buy' ? 'bg-signal-green/20 text-signal-green' : 'bg-signal-red/20 text-signal-red'
                  }`}>
                    <span className="material-symbols-outlined">{signal.direction === 'buy' ? 'trending_up' : 'trending_down'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{signal.pair}</span>
                      <span className={`text-xs ${signal.direction === 'buy' ? 'text-signal-green' : 'text-signal-red'}`}>
                        {signal.direction.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {signal.entryPrice.toFixed(5)} → SL: {signal.stopLoss.toFixed(5)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      signal.status === 'active' ? 'bg-signal-green/20 text-signal-green' :
                      signal.status === 'closed_won' ? 'bg-green-500/20 text-green-400' :
                      signal.status === 'closed_lost' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {signal.status}
                    </span>
                    <p className="text-[10px] text-gray-600 mt-1">{formatTimeAgo(signal.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendToChat(signal._id)}
                      className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-bold rounded-lg hover:bg-primary/30 transition-colors"
                    >
                      Enviar Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedSignal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedSignal(null)}
        >
          <div 
            className="glass rounded-2xl p-6 bg-black/90 border border-white/20 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white uppercase">
                {selectedSignal.pair}
              </h2>
              <button
                onClick={() => setSelectedSignal(null)}
                className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`size-16 rounded-xl flex items-center justify-center ${
                  selectedSignal.direction === 'buy' 
                    ? 'bg-signal-green/20 text-signal-green' 
                    : 'bg-signal-red/20 text-signal-red'
                }`}>
                  <span className="material-symbols-outlined text-3xl">
                    {selectedSignal.direction === 'buy' ? 'trending_up' : 'trending_down'}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-white uppercase">
                    {selectedSignal.direction === 'buy' ? 'COMPRAR' : 'VENDER'}
                  </p>
                  <p className="text-sm text-gray-400">{selectedSignal.type} • {selectedSignal.timeframe}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="glass rounded-xl p-3 bg-white/5">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Entrada</p>
                  <p className="font-black text-signal-green text-lg">
                    {selectedSignal.entryPrice.toFixed(5)}
                  </p>
                </div>
                <div className="glass rounded-xl p-3 bg-white/5">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Stop Loss</p>
                  <p className="font-black text-signal-red text-lg">
                    {selectedSignal.stopLoss.toFixed(5)}
                  </p>
                </div>
                <div className="glass rounded-xl p-3 bg-white/5">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Risk</p>
                  <p className="font-black text-amber-400 text-lg">
                    {selectedSignal.stopLossPips || '-'} pips
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-500 uppercase mb-2">Take Profits</p>
                <div className="space-y-2">
                  {selectedSignal.takeProfits.map((tp, i) => (
                    <div key={i} className="flex items-center justify-between glass rounded-lg p-2 bg-white/5">
                      <div className="flex items-center gap-2">
                        <span className={`size-6 rounded flex items-center justify-center text-[10px] font-bold ${
                          tp.reached ? 'bg-signal-green text-white' : 'bg-primary/20 text-primary'
                        }`}>
                          TP{i + 1}
                        </span>
                        <span className="text-sm text-white">{tp.price.toFixed(5)}</span>
                      </div>
                      {tp.percentage && (
                        <span className={`text-xs font-bold ${
                          tp.reached ? 'text-signal-green' : 'text-gray-400'
                        }`}>
                          {tp.percentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-xl p-4 bg-white/5">
                <p className="text-[10px] text-gray-500 uppercase mb-2">Análisis</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedSignal.analysis}
                </p>
                {selectedSignal.reason && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Razón</p>
                    <p className="text-sm text-gray-400">{selectedSignal.reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalsView;
