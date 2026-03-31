import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface SignalNotificationPrefsProps {
  userId: string;
}

const SIGNAL_TYPES = [
  { id: 'forex', label: 'Forex', icon: '💱' },
  { id: 'crypto', label: 'Crypto', icon: '₿' },
  { id: 'indices', label: 'Índices', icon: '📊' },
  { id: 'commodities', label: 'Commodities', icon: '🛢️' },
  { id: 'stocks', label: 'Acciones', icon: '📈' },
  { id: 'binary', label: 'Binarias', icon: '⚡' },
  { id: 'options', label: 'Opciones', icon: '🎯' },
];

const SignalNotificationPrefs: React.FC<SignalNotificationPrefsProps> = ({ userId }) => {
  const prefs = useQuery(api.signalNotifications.getSignalNotificationPrefs, {});
  const stats = useQuery(api.signalNotifications.getSignalNotificationStats, {});
  const updatePrefs = useMutation(api.signalNotifications.updateSignalNotificationPrefs);
  const toggleEnabled = useMutation(api.signalNotifications.toggleSignalNotifications);

  const [selectedTypes, setSelectedTypes] = useState<string[]>(['forex', 'crypto']);
  const [minRating, setMinRating] = useState(0);
  const [notifyOnNew, setNotifyOnNew] = useState(true);
  const [notifyOnResult, setNotifyOnResult] = useState(true);
  const [notifyOnUpdate, setNotifyOnUpdate] = useState(true);
  const [quietStart, setQuietStart] = useState<number | undefined>(undefined);
  const [quietEnd, setQuietEnd] = useState<number | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (prefs) {
      setSelectedTypes(prefs.signalTypes as string[]);
      setMinRating(prefs.minProviderRating);
      setNotifyOnNew(prefs.notifyOnNew);
      setNotifyOnResult(prefs.notifyOnResult);
      setNotifyOnUpdate(prefs.notifyOnUpdate);
      setQuietStart(prefs.quietHoursStart ?? undefined);
      setQuietEnd(prefs.quietHoursEnd ?? undefined);
    }
  }, [prefs]);

  const handleToggleType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTypes(SIGNAL_TYPES.map((t) => t.id));
  };

  const handleSelectNone = () => {
    setSelectedTypes([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePrefs({
        enabled: true,
        signalTypes: selectedTypes as any,
        minProviderRating: minRating,
        notifyOnNew,
        notifyOnResult,
        notifyOnUpdate,
        quietHoursStart: quietStart,
        quietHoursEnd: quietEnd,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEnabled = async () => {
    try {
      await toggleEnabled({ enabled: !prefs?.enabled });
    } catch (err) {
      console.error('Error toggling notifications:', err);
    }
  };

  const isEnabled = prefs?.enabled ?? true;

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <span className="text-xl">🔔</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Notificaciones de Señales</h3>
            <p className="text-sm text-slate-400">Configura cómo recibes alertas</p>
          </div>
        </div>
        <button
          onClick={handleToggleEnabled}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            isEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-slate-600'
          }`}
        >
          <span
            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
              isEnabled ? 'left-8' : 'left-1'
            }`}
          />
        </button>
      </div>

      {isEnabled ? (
        <>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-300">Tipos de Señales</label>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Seleccionar todos
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={handleSelectNone}
                    className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    Ninguno
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SIGNAL_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleToggleType(type.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                      selectedTypes.includes(type.id)
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300'
                        : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                    {selectedTypes.includes(type.id) && (
                      <span className="ml-auto text-green-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">
                Calificación mínima del proveedor: <span className="text-amber-400">{minRating}+</span>
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 block">Eventos a notificar</label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📢</span>
                    <div>
                      <span className="text-sm text-white">Nuevas señales</span>
                      <p className="text-xs text-slate-400">Recibe alertas cuando se publique una nueva señal</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnNew}
                    onChange={(e) => setNotifyOnNew(e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-amber-500 focus:ring-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📊</span>
                    <div>
                      <span className="text-sm text-white">Resultados</span>
                      <p className="text-xs text-slate-400">Recibe notificaciones cuando se cierre la operación</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnResult}
                    onChange={(e) => setNotifyOnResult(e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-amber-500 focus:ring-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔄</span>
                    <div>
                      <span className="text-sm text-white">Actualizaciones</span>
                      <p className="text-xs text-slate-400">Recibe alertas sobre cambios en señales activas</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnUpdate}
                    onChange={(e) => setNotifyOnUpdate(e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-amber-500 focus:ring-amber-500"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-3">
                Horario silencioso (opcional)
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block mb-1">Desde</label>
                  <select
                    value={quietStart ?? ''}
                    onChange={(e) => setQuietStart(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">Desactivado</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block mb-1">Hasta</label>
                  <select
                    value={quietEnd ?? ''}
                    onChange={(e) => setQuietEnd(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">Desactivado</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || selectedTypes.length === 0}
            className={`w-full mt-6 px-4 py-3 rounded-xl font-medium transition-all ${
              isSaving || selectedTypes.length === 0
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : showSuccess
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25'
            }`}
          >
            {isSaving ? 'Guardando...' : showSuccess ? '¡Guardado!' : 'Guardar preferencias'}
          </button>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <span className="text-3xl">🔕</span>
          </div>
          <h4 className="text-white font-medium mb-2">Notificaciones silenciadas</h4>
          <p className="text-sm text-slate-400 mb-4">
            Activa las notificaciones para recibir alertas de señales en tiempo real
          </p>
          <button
            onClick={handleToggleEnabled}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-400 hover:to-orange-400 transition-all"
          >
            Activar notificaciones
          </button>
        </div>
      )}

      {stats && stats.total > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Estadísticas</h4>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-slate-400">Total</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-green-400">{stats.sent}</div>
              <div className="text-xs text-slate-400">Enviadas</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-amber-400">{stats.opened}</div>
              <div className="text-xs text-slate-400">Abiertas</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-white">{stats.openRate}%</div>
              <div className="text-xs text-slate-400">Tasa</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalNotificationPrefs;
