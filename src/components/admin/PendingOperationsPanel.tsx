import React, { useState } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from '../ToastProvider';

export const PendingOperationsPanel: React.FC = () => {
  const { showToast } = useToast();
  const operations = useQuery(api.pendingOperations.getAllPendingOperations) || [];
  const stats = useQuery(api.pendingOperations.getPendingStats);
  const markCompleted = useMutation(api.pendingOperations.markOperationCompleted);
  const retryOp = useMutation(api.pendingOperations.retryOperation);
  const deleteOp = useMutation(api.pendingOperations.deleteOperation);
  const retryAll = useMutation(api.pendingOperations.retryAllPending);

  const handleMarkCompleted = async (opId: any) => {
    try {
      await markCompleted({ operationId: opId });
      showToast('success', 'Operación completada');
    } catch (e) { showToast('error', 'Error'); }
  };

  const handleRetry = async (opId: any) => {
    try {
      await retryOp({ operationId: opId });
      showToast('info', 'Reintentando...');
    } catch (e) { showToast('error', 'Error'); }
  };

  const handleDelete = async (opId: any) => {
    try {
      await deleteOp({ operationId: opId });
      showToast('success', 'Operación eliminada');
    } catch (e) { showToast('error', 'Error'); }
  };

  const handleRetryAll = async () => {
    try {
      await retryAll({});
      showToast('info', 'Reintentando todas las operaciones');
    } catch (e) { showToast('error', 'Error'); }
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleString('es-AR');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400">pending_actions</span>
            Operaciones Pendientes
          </h2>
          <p className="text-xs text-gray-500 mt-1">Cola de operaciones del sistema</p>
        </div>
        <button
          onClick={handleRetryAll}
          className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all"
        >
          Reintentar Todas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 bg-white/5">
          <p className="text-xs text-gray-500 uppercase">Pendientes</p>
          <p className="text-2xl font-black text-yellow-400">{stats?.pending || 0}</p>
        </div>
        <div className="glass rounded-xl p-4 bg-white/5">
          <p className="text-xs text-gray-500 uppercase">Procesando</p>
          <p className="text-2xl font-black text-blue-400">{stats?.processing || 0}</p>
        </div>
        <div className="glass rounded-xl p-4 bg-white/5">
          <p className="text-xs text-gray-500 uppercase">Fallidas</p>
          <p className="text-2xl font-black text-red-400">{stats?.failed || 0}</p>
        </div>
        <div className="glass rounded-xl p-4 bg-white/5">
          <p className="text-xs text-gray-500 uppercase">Completadas</p>
          <p className="text-2xl font-black text-green-400">{stats?.completed || 0}</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 bg-black/40 border border-white/10">
        <div className="space-y-3">
          {operations.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-green-400 mb-3">check_circle</span>
              <p className="text-white font-bold">Cola vacía</p>
            </div>
          ) : (
            operations.map((op: any) => (
              <div key={op._id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      op.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      op.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      op.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {op.status}
                    </span>
                    <span className="text-xs font-bold text-white">{op.type || 'operation'}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">{formatDate(op._creationTime)}</p>
                  {op.error && <p className="text-[10px] text-red-400 mt-1 truncate">{op.error}</p>}
                </div>
                <div className="flex gap-2">
                  {op.status === 'failed' && (
                    <button onClick={() => handleRetry(op._id)} className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 text-[9px] font-bold">Reintentar</button>
                  )}
                  {op.status === 'pending' && (
                    <button onClick={() => handleMarkCompleted(op._id)} className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-[9px] font-bold">Completar</button>
                  )}
                  <button onClick={() => handleDelete(op._id)} className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-[9px] font-bold">Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingOperationsPanel;
