import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface Signal {
  _id: any;
  signalId: string;
  providerId: string;
  type: string;
  priority: string;
  pair: string;
  direction: string;
  entryPrice: number;
  stopLoss: number;
  status: string;
  rating: number;
  createdAt: number;
}

interface SignalManagementProps {
  showToast?: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

const SignalManagement: React.FC<SignalManagementProps> = ({ showToast }) => {
  const signalsFeatureEnabled = import.meta.env.VITE_FEATURE_SIGNALS === 'on';

  const signals = useQuery(
    api.signals.getActiveSignals,
    signalsFeatureEnabled ? {} : "skip"
  ) || [];
  const plans = useQuery(
    api.signals.getSignalPlans,
    signalsFeatureEnabled ? {} : "skip"
  ) || [];
  const providers = useQuery(
    api.signals.getSignalProviders,
    signalsFeatureEnabled ? {} : "skip"
  ) || [];
  const stats = useQuery(
    api.signals.getSignalStats,
    signalsFeatureEnabled ? {} : "skip"
  );

  const updateStatus = useMutation(api.signals.updateSignalStatus);
  const seedAll = useMutation(api.seedSignals.seedAllSignals);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<'signals' | 'plans' | 'providers'>('signals');

  const filteredSignals = signals.filter((s: Signal) => {
    if (selectedCategory !== 'all' && s.type !== selectedCategory) return false;
    if (searchQuery && !s.pair.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const result = await seedAll({});
      showToast?.('success', `¡${result.totalSeeded} elementos creados!`);
    } catch (error: any) {
      showToast?.('error', error.message || 'Error al seedear');
    } finally {
      setSeeding(false);
    }
  };

  const handleUpdateStatus = async (signal: Signal, newStatus: string) => {
    try {
      await updateStatus({ signalId: signal.signalId, status: newStatus as any });
      showToast?.('success', 'Estado actualizado');
    } catch (error) {
      showToast?.('error', 'Error al actualizar');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'buy' ? '#34d399' : '#f87171';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' };
      case 'hit': return { background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' };
      case 'canceled': return { background: 'rgba(134, 134, 139, 0.2)', color: '#86868B' };
      case 'expired': return { background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' };
      default: return { background: 'rgba(19, 19, 19, 0.6)', color: '#86868B' };
    }
  };

  if (!signalsFeatureEnabled) {
    return (
      <div 
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(32, 31, 31, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(251, 191, 36, 0.2)',
        }}
      >
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-3xl" style={{ color: '#fbbf24' }}>warning</span>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase" style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#e5e2e1' }}>Signals deshabilitado</h2>
            <p className="text-sm" style={{ color: '#e5e2e1' }}>
              La administración de señales está bloqueada temporalmente mientras se corrige el desync entre Vercel y Convex.
            </p>
            <p className="text-xs" style={{ color: '#86868B' }}>
              Mantener `VITE_FEATURE_SIGNALS=off` hasta que `signals:getActiveSignals` responda desde el deployment correcto.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase" style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#e5e2e1' }}>Gestión de Señales</h2>
          <p className="text-sm" style={{ color: '#86868B' }}>Planes, proveedores y señales de trading</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
            color: 'white',
            boxShadow: '0 4px 16px rgba(160, 120, 255, 0.3)',
          }}
        >
          <span className="material-symbols-outlined">auto_awesome</span>
          {seeding ? 'Creando...' : 'Seed Datos'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {[
          { label: 'Total Señales', value: stats?.totalSignals || 0, color: '#86868B', icon: 'signal_cellular_alt' },
          { label: 'Activas', value: stats?.activeSignals || 0, color: '#34d399', icon: 'sensors' },
          { label: 'Ganadoras', value: stats?.wonSignals || 0, color: '#60a5fa', icon: 'trending_up' },
          { label: 'Perdedoras', value: stats?.lostSignals || 0, color: '#f87171', icon: 'trending_down' },
          { label: 'Win Rate', value: stats?.winRate ? `${stats.winRate.toFixed(1)}%` : '0%', color: '#fbbf24', icon: 'percent' },
          { label: 'Proveedores', value: stats?.totalProviders || 0, color: '#d0bcff', icon: 'person' },
          { label: 'Suscriptores', value: stats?.totalSubscribers || 0, color: '#34d399', icon: 'group' },
          { label: 'Planes', value: plans.length, color: '#fbbf24', icon: 'workspace_premium' },
        ].map((stat, i) => (
          <div 
            key={i}
            className="rounded-xl p-3"
            style={{
              background: 'rgba(32, 31, 31, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(73, 68, 84, 0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-sm" style={{ color: stat.color }}>{stat.icon}</span>
              <p className="text-[10px] uppercase" style={{ color: '#86868B' }}>{stat.label}</p>
            </div>
            <p className="text-xl font-black" style={{ color: stat.color, fontFamily: '"Space Grotesk", sans-serif' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {stats && (stats.wonSignals > 0 || stats.lostSignals > 0) && (
        <div className="rounded-xl p-4" style={{
          background: 'rgba(32, 31, 31, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(73, 68, 84, 0.15)',
        }}>
          <p className="text-xs uppercase mb-3" style={{ color: '#86868B' }}>Rendimiento General</p>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: '#60a5fa' }}>Ganadoras: {stats.wonSignals}</span>
                <span style={{ color: '#f87171' }}>Perdedoras: {stats.lostSignals}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all"
                  style={{ 
                    width: `${stats.winRate || 0}%`,
                    background: stats.winRate >= 50 
                      ? 'linear-gradient(90deg, #34d399, #60a5fa)' 
                      : 'linear-gradient(90deg, #f87171, #fbbf24)'
                  }}
                />
              </div>
            </div>
            <div className="text-center px-4">
              <p className="text-2xl font-black" style={{ 
                color: stats.winRate >= 50 ? '#34d399' : '#f87171',
                fontFamily: '"Space Grotesk", sans-serif'
              }}>
                {stats.winRate?.toFixed(1)}%
              </p>
              <p className="text-[10px] uppercase" style={{ color: '#86868B' }}>Win Rate</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {(['signals', 'plans', 'providers'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={activeTab === tab 
              ? { background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)', color: 'white' } 
              : { background: 'rgba(19, 19, 19, 0.6)', color: '#86868B' }
            }
          >
            {tab === 'signals' ? 'Señales' : tab === 'plans' ? 'Planes' : 'Proveedores'}
          </button>
        ))}
      </div>

      {activeTab === 'signals' && (
        <>
          <div className="flex gap-4 items-center mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por par..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary outline-none cursor-pointer"
            >
              <option value="all">Todos los tipos</option>
              <option value="forex">Forex</option>
              <option value="crypto">Crypto</option>
              <option value="indices">Índices</option>
              <option value="commodities">Commodities</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Par</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Dirección</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Entrada</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">SL</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Fecha</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSignals.map((signal: Signal) => (
                  <tr key={signal._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-white">{signal.pair}</span>
                      <span className="text-xs text-gray-500 ml-2">{signal.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold uppercase ${getDirectionColor(signal.direction)}`}>
                        {signal.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-400 font-mono">{signal.entryPrice.toFixed(5)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-red-400 font-mono">{signal.stopLoss.toFixed(5)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(signal.status)}`}>
                        {signal.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{formatDate(signal.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={signal.status}
                          onChange={(e) => handleUpdateStatus(signal, e.target.value)}
                          className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs cursor-pointer"
                        >
                          <option value="active">Activa</option>
                          <option value="partially_hit">Parcial</option>
                          <option value="hit">Hit</option>
                          <option value="canceled">Cancelada</option>
                          <option value="expired">Expirada</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSignals.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">signal_cellular_alt</span>
                <h3 className="text-xl font-bold text-white mb-2">No hay señales</h3>
                <p className="text-gray-500">Usa "Seed Datos" para crear señales de ejemplo</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan: any) => (
            <div key={plan._id} className="glass rounded-2xl p-6 bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white uppercase">{plan.name}</h3>
                {plan.isFeatured && (
                  <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">DESTACADO</span>
                )}
              </div>
              <div className="text-3xl font-black text-primary mb-4">
                ${plan.priceMonthly}
                <span className="text-sm text-gray-500 font-normal">/mes</span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">{plan.signalsPerDay} señales por día</p>
                <p className="text-gray-400">{plan.signalTypes.join(', ')}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {plan.hasVIPSignals && <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">VIP</span>}
                  {plan.hasEntryConfirmation && <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px]">Confirmación</span>}
                  {plan.hasExitTiming && <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Exit Timing</span>}
                  {plan.hasRiskAnalysis && <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px]">Análisis</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider: any) => (
            <div key={provider._id} className="glass rounded-2xl p-5 bg-white/5 border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-xl font-black text-primary">
                  {provider.userId?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white uppercase">Proveedor</span>
                    {provider.isVerified && (
                      <span className="material-symbols-outlined text-primary text-lg">verified</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{provider.verificationLevel}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-lg p-3 bg-white/5 text-center">
                  <p className="text-[10px] text-gray-500 uppercase">Win Rate</p>
                  <p className="text-xl font-black text-emerald-400">{provider.avgWinRate.toFixed(1)}%</p>
                </div>
                <div className="glass rounded-lg p-3 bg-white/5 text-center">
                  <p className="text-[10px] text-gray-500 uppercase">Subs</p>
                  <p className="text-xl font-black text-white">{provider.subscribersCount}</p>
                </div>
                <div className="glass rounded-lg p-3 bg-white/5 text-center">
                  <p className="text-[10px] text-gray-500 uppercase">Pips</p>
                  <p className="text-xl font-black text-blue-400">+{provider.totalPipsGenerated.toLocaleString()}</p>
                </div>
                <div className="glass rounded-lg p-3 bg-white/5 text-center">
                  <p className="text-[10px] text-gray-500 uppercase">Rating</p>
                  <p className="text-xl font-black text-amber-400">★ {provider.avgRating.toFixed(1)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SignalManagement;
