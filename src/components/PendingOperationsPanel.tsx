import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from './ToastProvider';

interface PendingOperation {
  _id: any;
  operationType: string;
  payload: any;
  targetId?: string;
  userId: string;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  createdAt: number;
}

interface PendingStats {
  total: number;
  pending: number;
  failed: number;
  processing: number;
  byType: Record<string, number>;
  criticalUsers: { userId: string; count: number }[];
}

const OPERATION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  'create_post': { label: 'Crear Post', icon: 'article', color: 'text-blue-400' },
  'update_post': { label: 'Actualizar Post', icon: 'edit', color: 'text-blue-400' },
  'delete_post': { label: 'Eliminar Post', icon: 'delete', color: 'text-red-400' },
  'add_comment': { label: 'Agregar Comentario', icon: 'comment', color: 'text-green-400' },
  'update_profile': { label: 'Actualizar Perfil', icon: 'person', color: 'text-purple-400' },
  'toggle_follow': { label: 'Seguir/Dejar de Seguir', icon: 'group', color: 'text-yellow-400' },
  'like_post': { label: 'Dar Like', icon: 'favorite', color: 'text-pink-400' },
  'share_post': { label: 'Compartir Post', icon: 'share', color: 'text-cyan-400' },
};

export const PendingOperationsPanel: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'failed'>('all');
  const { showToast } = useToast();

  const stats = useQuery(api.pendingOperations.getPendingStats) as PendingStats | undefined;
  const operations = useQuery(api.pendingOperations.getAllPendingOperations, { status: selectedStatus }) as PendingOperation[] | undefined;
  const retryAllMutation = useMutation(api.pendingOperations.retryAllPending);
  const retryOperation = useMutation(api.pendingOperations.retryOperation);
  const deleteOperation = useMutation(api.pendingOperations.deleteOperation);

  const handleRetryAll = async () => {
    try {
      const result = await retryAllMutation({});
      showToast('success', `Se reintentaron ${result.retried} operaciones`);
    } catch (err: any) {
      showToast('error', 'Error al reintentar operaciones');
    }
  };

  const handleRetryOne = async (operationId: any) => {
    try {
      await retryOperation({ operationId });
      showToast('success', 'Operación reintentada');
    } catch (err: any) {
      showToast('error', 'Error al reintentar');
    }
  };

  const handleDelete = async (operationId: any) => {
    try {
      await deleteOperation({ operationId });
      showToast('success', 'Operación eliminada');
    } catch (err: any) {
      showToast('error', 'Error al eliminar');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOps = operations?.filter(op => {
    if (selectedStatus === 'all') return op.status !== 'completed';
    return op.status === selectedStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-500">pending_actions</span>
          Operaciones Pendientes
        </h2>
        <button
          onClick={handleRetryAll}
          className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Reintentar Todos
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-black text-white">{stats.total}</div>
            <div className="text-xs text-white/60 uppercase">Total</div>
          </div>
          <div className="glass rounded-xl p-4 border border-yellow-500/20">
            <div className="text-2xl font-black text-yellow-400">{stats.pending}</div>
            <div className="text-xs text-white/60 uppercase">Pendientes</div>
          </div>
          <div className="glass rounded-xl p-4 border border-red-500/20">
            <div className="text-2xl font-black text-red-400">{stats.failed}</div>
            <div className="text-xs text-white/60 uppercase">Fallidas</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-black text-purple-400">{stats.processing}</div>
            <div className="text-xs text-white/60 uppercase">Procesando</div>
          </div>
        </div>
      )}

      {Object.keys(stats?.byType || {}).length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-bold text-white/60 uppercase mb-3">Por Tipo</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats?.byType || {}).map(([type, count]) => {
              const config = OPERATION_LABELS[type] || { label: type, icon: 'help', color: 'text-gray-400' };
              return (
                <div
                  key={type}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 ${config.color}`}
                >
                  <span className="material-symbols-outlined text-sm">{config.icon}</span>
                  <span className="text-sm font-medium">{config.label}</span>
                  <span className="text-xs opacity-60">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats?.criticalUsers && stats.criticalUsers.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-bold text-white/60 uppercase mb-3">Usuarios Críticos</h3>
          <div className="space-y-2">
            {stats.criticalUsers.slice(0, 5).map((user) => (
              <div key={user.userId} className="flex items-center justify-between">
                <span className="text-sm text-white/80 font-mono">{user.userId.slice(0, 20)}...</span>
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                  {user.count} ops
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {(['all', 'pending', 'failed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedStatus === status
                ? 'bg-primary text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {status === 'all' ? 'Todas' : status === 'pending' ? 'Pendientes' : 'Fallidas'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredOps?.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
            <p>No hay operaciones {selectedStatus === 'all' ? 'pendientes' : selectedStatus}</p>
          </div>
        )}

        {filteredOps?.map((op) => {
          const config = OPERATION_LABELS[op.operationType] || { label: op.operationType, icon: 'help', color: 'text-gray-400' };
          
          return (
            <div key={op._id} className="glass rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/5 ${config.color}`}>
                    <span className="material-symbols-outlined">{config.icon}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{config.label}</div>
                    <div className="text-xs text-white/40 font-mono">
                      {op.userId.slice(0, 20)}... • {formatTime(op.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {op.status === 'pending' && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">
                      PENDIENTE
                    </span>
                  )}
                  {op.status === 'failed' && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                      FALLIDA ({op.retryCount}/{op.maxRetries})
                    </span>
                  )}
                  {op.status === 'processing' && (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-bold animate-pulse">
                      PROCESANDO
                    </span>
                  )}
                </div>
              </div>

              {op.lastError && (
                <div className="mb-3 p-2 bg-red-500/10 rounded-lg">
                  <p className="text-xs text-red-400">Último error: {op.lastError}</p>
                </div>
              )}

              <details className="mb-3">
                <summary className="text-xs text-white/40 cursor-pointer hover:text-white/60">
                  Ver payload
                </summary>
                <pre className="mt-2 p-2 bg-black/20 rounded text-[10px] text-white/60 overflow-auto max-h-32">
                  {JSON.stringify(op.payload, null, 2)}
                </pre>
              </details>

              <div className="flex gap-2">
                {(op.status === 'pending' || op.status === 'failed') && (
                  <button
                    onClick={() => handleRetryOne(op._id)}
                    className="flex-1 py-2 px-3 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Reintentar
                  </button>
                )}
                <button
                  onClick={() => handleDelete(op._id)}
                  className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingOperationsPanel;
