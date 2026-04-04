import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from '../ToastProvider';

export const SystemErrorsPanel: React.FC = () => {
  const { showToast } = useToast();
  const unreviewedErrors = useQuery(api.systemErrors.getUnreviewedErrors) || [];
  const errorStats = useQuery(api.systemErrors.getErrorStats);
  const markErrorReviewed = useMutation(api.systemErrors.markErrorReviewed);
  const resolveError = useMutation(api.systemErrors.resolveError);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('es-AR', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handleMarkReviewed = async (errorId: any) => {
    try {
      await markErrorReviewed({ errorId });
      showToast('success', 'Error marcado como revisado');
    } catch (e) {
      showToast('error', 'Error al marcar');
    }
  };

  const handleResolve = async (errorId: any) => {
    try {
      await resolveError({ errorId });
      showToast('success', 'Error resuelto');
    } catch (e) {
      showToast('error', 'Error al resolver');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-red-400">bug_report</span>
            Errores del Sistema
          </h2>
          <p className="text-xs text-gray-500 mt-1">Monitoreo y resolución de errores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 bg-white/5">
          <p className="text-xs text-gray-500 uppercase">Sin Revisar</p>
          <p className="text-2xl font-black text-red-400">{errorStats?.new || unreviewedErrors.length}</p>
        </div>
        <div className="glass rounded-xl p-4 bg-white/5">
          <p className="text-xs text-gray-500 uppercase">Críticos</p>
          <p className="text-2xl font-black text-yellow-400">{errorStats?.critical || 0}</p>
        </div>
        <div className="glass rounded-xl p-4 bg-white/5">
          <p className="text-xs text-gray-500 uppercase">Warnings</p>
          <p className="text-2xl font-black text-orange-400">{errorStats?.critical || 0}</p>
        </div>
        <div className="glass rounded-xl p-4 bg-white/5">
          <p className="text-xs text-gray-500 uppercase">Resueltos</p>
          <p className="text-2xl font-black text-green-400">{errorStats?.resolved || 0}</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 bg-black/40 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Errores Pendientes</h3>
        <div className="space-y-3">
          {unreviewedErrors.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-green-400 mb-3">check_circle</span>
              <p className="text-white font-bold">Todo limpio</p>
              <p className="text-sm text-gray-500 mt-1">No hay errores sin revisar</p>
            </div>
          ) : (
            unreviewedErrors.map((err: any) => (
              <div key={err._id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        err.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        err.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {err.severity || 'info'}
                      </span>
                      <span className="text-[10px] text-gray-500">{err.source || 'unknown'}</span>
                    </div>
                    <p className="text-sm font-bold text-white truncate">{err.message || 'Error desconocido'}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{formatDate(err._creationTime)}</p>
                  </div>
                </div>
                {err.stack && (
                  <pre className="text-[10px] text-gray-500 bg-black/30 p-2 rounded-lg overflow-x-auto mt-2 max-h-16">
                    {err.stack.slice(0, 300)}...
                  </pre>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleMarkReviewed(err._id)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    Marcar revisado
                  </button>
                  <button
                    onClick={() => handleResolve(err._id)}
                    className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-all"
                  >
                    Resolver
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemErrorsPanel;
