import React, { useState } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from '../ToastProvider';

export const ProviderPanel: React.FC<{ userId: string }> = ({ userId }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'signals' | 'providers' | 'become'>('signals');
  const [signalForm, setSignalForm] = useState({ pair: '', type: 'BUY', entry: '', sl: '', tp: '', notes: '' });

  const activeSignals = useQuery(api.signals.getActiveSignals) || [];
  const topProviders = useQuery(api.signals.getTopProviders) || [];
  const providerStats = useQuery(api.signals.getProviderStats, { userId });

  const becomeProvider = useMutation(api.signals.becomeProvider as any);
  const createSignal = useAction(api.signals.createSignal as any);

  const handleBecomeProvider = async () => {
    try {
      await becomeProvider({ userId, plan: 'basic' });
      showToast('success', '¡Ahora eres proveedor de señales!');
    } catch (e: any) {
      showToast('error', e.message || 'Error al convertirse en proveedor');
    }
  };

  const handleCreateSignal = async () => {
    try {
      await createSignal({
        userId,
        pair: signalForm.pair,
        type: signalForm.type,
        entryPrice: parseFloat(signalForm.entry),
        stopLoss: parseFloat(signalForm.sl),
        takeProfit: parseFloat(signalForm.tp),
        notes: signalForm.notes,
      });
      showToast('success', 'Señal creada');
      setSignalForm({ pair: '', type: 'BUY', entry: '', sl: '', tp: '', notes: '' });
    } catch (e: any) {
      showToast('error', e.message || 'Error al crear señal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[
          { id: 'signals', label: 'Señales', icon: 'notifications_active' },
          { id: 'providers', label: 'Proveedores', icon: 'star' },
          { id: 'become', label: 'Ser Proveedor', icon: 'workspace_premium' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'signals' && (
        <div className="glass rounded-2xl p-6 bg-black/40 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Señales Activas</h3>
          <div className="space-y-3">
            {activeSignals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2">notifications_none</span>
                <p>No hay señales activas</p>
              </div>
            ) : (
              activeSignals.map((s: any) => (
                <div key={s._id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{s.pair}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      s.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {s.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500">
                    <div><span className="uppercase">Entrada</span><p className="text-white font-bold">{s.entryPrice}</p></div>
                    <div><span className="uppercase">SL</span><p className="text-red-400 font-bold">{s.stopLoss}</p></div>
                    <div><span className="uppercase">TP</span><p className="text-green-400 font-bold">{s.takeProfit}</p></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'providers' && (
        <div className="glass rounded-2xl p-6 bg-black/40 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Top Proveedores</h3>
          <div className="space-y-3">
            {topProviders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay proveedores registrados</p>
              </div>
            ) : (
              topProviders.map((p: any, i: number) => (
                <div key={p.userId} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-white/30">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{p.nombre || p.userId}</p>
                      <p className="text-[10px] text-gray-500">{p.subscribers || 0} suscriptores</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-green-400">{p.winRate || 0}% WR</p>
                    <p className="text-[10px] text-gray-500">{p.totalSignals || 0} señales</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'become' && (
        <div className="space-y-6">
          {providerStats ? (
            <div className="glass rounded-2xl p-6 bg-black/40 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Tus Estadísticas como Proveedor</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-black text-white">{providerStats.totalSignals || 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Señales</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-black text-green-400">{providerStats.winRate || 0}%</p>
                  <p className="text-[10px] text-gray-500 uppercase">Win Rate</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-black text-primary">{providerStats.subscribers || 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Suscriptores</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-black text-yellow-400">{providerStats.revenue || 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Ingresos</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 bg-black/40 border border-white/10 text-center">
              <span className="material-symbols-outlined text-5xl text-primary mb-4">workspace_premium</span>
              <h3 className="text-lg font-bold text-white mb-2">Conviértete en Proveedor de Señales</h3>
              <p className="text-sm text-gray-500 mb-6">Comparte tus análisis y gana suscriptores</p>
              <button
                onClick={handleBecomeProvider}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                Activar Proveedor
              </button>
            </div>
          )}

          <div className="glass rounded-2xl p-6 bg-black/40 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Crear Nueva Señal</h3>
            <div className="grid grid-cols-2 gap-4">
              <input value={signalForm.pair} onChange={(e) => setSignalForm({ ...signalForm, pair: e.target.value })} placeholder="Par (ej: EUR/USD)" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary outline-none" />
              <select value={signalForm.type} onChange={(e) => setSignalForm({ ...signalForm, type: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary outline-none">
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
              <input value={signalForm.entry} onChange={(e) => setSignalForm({ ...signalForm, entry: e.target.value })} placeholder="Precio de entrada" type="number" step="any" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary outline-none" />
              <input value={signalForm.sl} onChange={(e) => setSignalForm({ ...signalForm, sl: e.target.value })} placeholder="Stop Loss" type="number" step="any" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary outline-none" />
              <input value={signalForm.tp} onChange={(e) => setSignalForm({ ...signalForm, tp: e.target.value })} placeholder="Take Profit" type="number" step="any" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary outline-none" />
              <input value={signalForm.notes} onChange={(e) => setSignalForm({ ...signalForm, notes: e.target.value })} placeholder="Notas (opcional)" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary outline-none" />
            </div>
            <button onClick={handleCreateSignal} className="mt-4 w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 transition-all">
              Publicar Señal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderPanel;
