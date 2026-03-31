import React, { useEffect, useMemo, useState } from 'react';
import logger from '../../utils/logger';

interface ProviderStatus {
  id: string;
  label: string;
  defaultModel?: string;
  available: boolean;
  priority: number;
  notes: string;
}

interface IncidentItem {
  id: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  detail: string;
}

const AIRoomSection: React.FC = () => {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await fetch('/api/ai/providers');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'No se pudo cargar el estado de proveedores externos.');
        }

        setProviders(data.providers || []);
      } catch (err) {
        logger.error('Failed to load external AI providers:', err);
        setLoadError('No se pudo cargar el estado de proveedores externos.');
      } finally {
        setLoadingProviders(false);
      }
    };

    void loadProviders();
  }, []);

  const availableProviders = useMemo(
    () => providers.filter((provider) => provider.available),
    [providers]
  );

  const incidents = useMemo<IncidentItem[]>(() => {
    const nextIncidents: IncidentItem[] = [
      {
        id: 'chat-disabled',
        severity: 'info',
        title: 'Chat deshabilitado',
        detail: 'La Sala IA ya no ejecuta consultas. Esta vista queda solo para monitoreo operativo y reporte de errores.',
      },
    ];

    if (loadError) {
      nextIncidents.unshift({
        id: 'providers-load-error',
        severity: 'error',
        title: 'Fallo al cargar providers',
        detail: loadError,
      });
    }

    if (!loadingProviders && providers.length > 0 && availableProviders.length === 0) {
      nextIncidents.unshift({
        id: 'providers-unavailable',
        severity: 'warning',
        title: 'Sin providers activos',
        detail: 'No hay proveedores externos disponibles o faltan claves. La sala queda en modo observación.',
      });
    }

    return nextIncidents;
  }, [availableProviders.length, loadError, loadingProviders, providers.length]);

  const getIncidentClasses = (severity: IncidentItem['severity']) => {
    switch (severity) {
      case 'error':
        return 'border-red-500/20 bg-red-500/10 text-red-200';
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/10 text-amber-200';
      default:
        return 'border-blue-500/20 bg-blue-500/10 text-blue-200';
    }
  };

  const getProviderBadgeClasses = (available: boolean) =>
    available
      ? 'bg-emerald-500/20 text-emerald-400'
      : 'bg-gray-500/20 text-gray-400';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">hub</span>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Sala de IA</h2>
            <p className="text-sm text-gray-400">
              Panel pasivo de monitoreo. No tiene chat ni envía prompts a proveedores externos.
            </p>
            <p className="text-xs text-gray-500">
              Usar esta vista para ver disponibilidad, faltantes de claves y errores de carga.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">Providers activos</p>
          <p className="mt-3 text-3xl font-black text-white">{availableProviders.length}</p>
          <p className="mt-1 text-xs text-gray-500">Disponibles para relay externo</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">Providers totales</p>
          <p className="mt-3 text-3xl font-black text-white">{providers.length}</p>
          <p className="mt-1 text-xs text-gray-500">Detectados por `/api/ai/providers`</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">Incidentes</p>
          <p className="mt-3 text-3xl font-black text-white">{incidents.length}</p>
          <p className="mt-1 text-xs text-gray-500">Hallazgos operativos en esta sala</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-white">Incidentes y estado</h3>
        <div className="space-y-3">
          {incidents.map((incident) => (
            <div key={incident.id} className={`rounded-xl border p-4 ${getIncidentClasses(incident.severity)}`}>
              <p className="text-sm font-black uppercase tracking-wider">{incident.title}</p>
              <p className="mt-2 text-sm leading-relaxed">{incident.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-white">Estado de proveedores</h3>
        {loadingProviders ? (
          <p className="text-sm text-gray-500">Cargando proveedores...</p>
        ) : (
          <div className="space-y-3">
            {providers.map((provider) => (
              <div key={provider.id} className="rounded-xl border border-white/5 bg-black/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-white">{provider.label}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${getProviderBadgeClasses(provider.available)}`}>
                    {provider.available ? 'activo' : 'sin clave'}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-gray-500">{provider.notes}</p>
                {provider.defaultModel && (
                  <p className="mt-2 text-[10px] text-primary">Modelo base: {provider.defaultModel}</p>
                )}
              </div>
            ))}
            {!providers.length && (
              <p className="text-sm text-gray-500">No se detectaron proveedores configurados.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRoomSection;
