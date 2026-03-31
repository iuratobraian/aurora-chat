import React, { useState, useEffect } from 'react';
import { api } from '../../convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';
import { useToast } from './ToastProvider';

interface PushStats {
  total: number;
  activeLast24h: number;
  activeLastWeek: number;
  timestamp: number;
}

interface PushAdminPanelProps {
  isAdmin?: boolean;
}

const PushAdminPanel: React.FC<PushAdminPanelProps> = ({ isAdmin = false }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [sendResult, setSendResult] = useState<any>(null);
  const { showToast } = useToast();

  const stats = useQuery(api.push.getPushSubscriptionStats);
  const vapidKey = useQuery(api.push.getVapidPublicKey);

  const sendToAll = useMutation(api.pushActions.sendPushToAll);
  const sendBulk = useMutation(api.pushActions.sendBulkPushNotification);
  const cleanupOld = useMutation(api.push.cleanupOldSubscriptions);

  useEffect(() => {
    if (!vapidKey) {
      showToast('warning', 'VAPID keys no configuradas');
    }
  }, [vapidKey]);

  const handleSendToAll = async () => {
    if (!title.trim() || !body.trim()) {
      showToast('error', 'Título y cuerpo son requeridos');
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const result = await sendToAll({
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || undefined
      });
      setSendResult(result);
      showToast('success', `Notificaciones enviadas: ${result.sent}/${result.total}`);
    } catch (err) {
      showToast('error', 'Error al enviar notificaciones');
    } finally {
      setSending(false);
    }
  };

  const handleSendToSelected = async () => {
    if (selectedUsers.length === 0) {
      showToast('error', 'Selecciona al menos un usuario');
      return;
    }
    if (!title.trim() || !body.trim()) {
      showToast('error', 'Título y cuerpo son requeridos');
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const result = await sendBulk({
        userIds: selectedUsers,
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || undefined
      });
      setSendResult(result);
      showToast('success', `Notificaciones enviadas: ${result.sent}/${result.total}`);
    } catch (err) {
      showToast('error', 'Error al enviar notificaciones');
    } finally {
      setSending(false);
    }
  };

  const handleCleanup = async () => {
    try {
      const result = await cleanupOld({ olderThanDays: 90 });
      showToast('success', `Eliminadas ${result.deleted} suscripciones antiguas`);
    } catch (err) {
      showToast('error', 'Error al limpiar suscripciones');
    }
  };

  const addUser = () => {
    const trimmed = userInput.trim();
    if (trimmed && !selectedUsers.includes(trimmed)) {
      setSelectedUsers([...selectedUsers, trimmed]);
      setUserInput('');
    }
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u !== userId));
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-primary">notifications_active</span>
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase">Panel Push Admin</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${vapidKey ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">{vapidKey ? 'VAPID Configurado' : 'VAPID No Configurado'}</span>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20">
              <p className="text-2xl font-black text-blue-500">{stats.total}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Suscripciones</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-4 border border-emerald-500/20">
              <p className="text-2xl font-black text-emerald-500">{stats.activeLast24h}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Últimas 24h</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-4 border border-purple-500/20">
              <p className="text-2xl font-black text-purple-500">{stats.activeLastWeek}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Última Semana</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase">Título de la Notificación</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nueva actualización disponible"
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase">Cuerpo de la Notificación</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Descripción de la notificación..."
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:border-primary outline-none h-20 resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase">URL (opcional)</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/posts/123"
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:border-primary outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSendToAll}
              disabled={sending || !vapidKey}
              className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20 text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">broadcast</span>
              {sending ? 'Enviando...' : 'Enviar a Todos'}
            </button>
            <button
              onClick={handleCleanup}
              className="px-6 py-3 border border-red-500/30 text-red-500 font-bold rounded-xl hover:bg-red-500/5 transition-colors text-xs uppercase tracking-widest"
            >
              Limpiar Antiguas
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-white/10 pt-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Enviar a Usuarios Específicos</h4>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="ID de usuario"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:border-primary outline-none"
                onKeyDown={(e) => e.key === 'Enter' && addUser()}
              />
              <button
                onClick={addUser}
                className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/30 rounded-lg text-xs font-bold transition-all"
              >
                Agregar
              </button>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedUsers.map(userId => (
                  <div key={userId} className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full">
                    <span className="text-xs text-gray-700 dark:text-gray-300">{userId}</span>
                    <button
                      onClick={() => removeUser(userId)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSendToSelected}
              disabled={sending || selectedUsers.length === 0 || !vapidKey}
              className="w-full px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">send</span>
              {sending ? 'Enviando...' : `Enviar a ${selectedUsers.length} Usuario(s)`}
            </button>
          </div>

          {sendResult && (
            <div className={`mt-4 p-4 rounded-xl ${sendResult.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <h5 className="text-xs font-bold uppercase mb-2">Resultado del Envío</h5>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p>Total: {sendResult.total}</p>
                <p>Enviadas: {sendResult.sent}</p>
                {sendResult.failed !== undefined && <p>Fallidas: {sendResult.failed}</p>}
                {sendResult.deleted !== undefined && sendResult.deleted > 0 && (
                  <p className="text-amber-500">Eliminadas (invalid): {sendResult.deleted}</p>
                )}
                {sendResult.errors && sendResult.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-red-500">Ver errores</summary>
                    <ul className="mt-1 pl-4 list-disc">
                      {sendResult.errors.slice(0, 5).map((err: string, i: number) => (
                        <li key={i} className="text-[10px]">{err}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-white/10">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Configuración de VAPID</h4>
        <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-[10px] text-gray-500 uppercase mb-1">Para generar nuevas VAPID keys:</p>
            <code className="text-xs bg-gray-200 dark:bg-white/5 px-2 py-1 rounded">
              npx web-push generate-vapid-keys
            </code>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase mb-1">Variables de entorno requeridas:</p>
            <div className="space-y-1 text-[10px] font-mono">
              <p>VAPID_PUBLIC_KEY=...</p>
              <p>VAPID_PRIVATE_KEY=...</p>
              <p>VAPID_SUBJECT=mailto:notifications@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushAdminPanel;
