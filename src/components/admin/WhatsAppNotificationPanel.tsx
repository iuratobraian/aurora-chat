import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface Notification {
  _id: string;
  type: string;
  phoneNumber: string;
  userId: string;
  userName: string;
  data: any;
  status: 'pending' | 'sent' | 'failed';
  createdAt: number;
  sentAt?: number;
  errorAt?: number;
}

interface NotificationStats {
  pending: number;
  sent: number;
  failed: number;
  total: number;
}

export const WhatsAppNotificationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'sent' | 'failed'>('pending');
  const [showSendModal, setShowSendModal] = useState(false);
  const [sending, setSending] = useState(false);

  const stats = useQuery(api.whatsappCron.getNotificationStats) as NotificationStats | undefined;
  const pending = useQuery(api.whatsappCron.getPendingNotifications) as Notification[] | undefined;
  const sent = useQuery(api.whatsappCron.getSentNotifications) as Notification[] | undefined;
  const failed = useQuery(api.whatsappCron.getFailedNotifications) as Notification[] | undefined;

  const processNotifications = useMutation(api.whatsappCron.processPendingNotificationsPublic);
  const deleteNotification = useMutation(api.whatsappCron.deleteNotification);
  const retryFailed = useMutation(api.whatsappCron.retryFailedNotification);
  const queueCustom = useMutation(api.whatsappCron.queueCustomNotificationPublic);

  const [customMessage, setCustomMessage] = useState({ phone: '', name: '', message: '' });

  const handleProcess = async () => {
    setSending(true);
    try {
      await processNotifications({});
    } finally {
      setSending(false);
    }
  };

  const handleSendCustom = async () => {
    if (!customMessage.phone || !customMessage.name || !customMessage.message) return;
    setSending(true);
    try {
      await queueCustom({
        phoneNumber: customMessage.phone,
        userName: customMessage.name,
        message: customMessage.message,
        type: 'custom',
      });
      setCustomMessage({ phone: '', name: '', message: '' });
      setShowSendModal(false);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      membership_reminder: 'Recordatorio Membresía',
      course_completion: 'Curso Completado',
      diploma: 'Diploma',
      custom: 'Personalizado',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'sent': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const notifications = activeTab === 'pending' ? pending : activeTab === 'sent' ? sent : failed;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-green-400">chat</span>
          WhatsApp Notifications
        </h3>
        <button
          onClick={() => setShowSendModal(true)}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg"
        >
          + Enviar Mensaje
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#1a1d24] rounded-xl p-4 border border-white/5">
          <div className="text-xs text-gray-400 mb-1">Pendientes</div>
          <div className="text-2xl font-black text-yellow-400">{stats?.pending || 0}</div>
        </div>
        <div className="bg-[#1a1d24] rounded-xl p-4 border border-white/5">
          <div className="text-xs text-gray-400 mb-1">Enviados</div>
          <div className="text-2xl font-black text-emerald-400">{stats?.sent || 0}</div>
        </div>
        <div className="bg-[#1a1d24] rounded-xl p-4 border border-white/5">
          <div className="text-xs text-gray-400 mb-1">Fallidos</div>
          <div className="text-2xl font-black text-red-400">{stats?.failed || 0}</div>
        </div>
        <div className="bg-[#1a1d24] rounded-xl p-4 border border-white/5">
          <div className="text-xs text-gray-400 mb-1">Total</div>
          <div className="text-2xl font-black text-white">{stats?.total || 0}</div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        {(['pending', 'sent', 'failed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold uppercase ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'pending' ? 'Pendientes' : tab === 'sent' ? 'Enviados' : 'Fallidos'}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notifications?.map((notification) => (
          <div
            key={notification._id}
            className="bg-[#1a1d24] rounded-lg p-3 border border-white/5 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{notification.userName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(notification.status)}`}>
                  {notification.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{notification.phoneNumber}</div>
              <div className="text-[10px] text-gray-600">{getTypeLabel(notification.type)}</div>
            </div>
            <div className="text-[10px] text-gray-500">
              {formatDate(notification.createdAt)}
            </div>
          </div>
        ))}
        {(!notifications || notifications.length === 0) && (
          <div className="text-center py-8 text-gray-500 text-xs">
            No hay notificaciones
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleProcess}
          disabled={sending}
          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg disabled:opacity-50"
        >
          {sending ? 'Procesando...' : 'Procesar Cola'}
        </button>
        {activeTab === 'failed' && (
          <button
            onClick={async () => {
              for (const n of failed || []) {
                await retryFailed({ id: n._id });
              }
            }}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded-lg"
          >
            Reintentar
          </button>
        )}
      </div>

      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1d24] rounded-xl p-6 w-96 border border-white/10">
            <h3 className="text-lg font-black text-white mb-4">Enviar Mensaje</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Número WhatsApp"
                value={customMessage.phone}
                onChange={(e) => setCustomMessage({ ...customMessage, phone: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm"
              />
              <input
                type="text"
                placeholder="Nombre del usuario"
                value={customMessage.name}
                onChange={(e) => setCustomMessage({ ...customMessage, name: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm"
              />
              <textarea
                placeholder="Mensaje"
                value={customMessage.message}
                onChange={(e) => setCustomMessage({ ...customMessage, message: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm h-24"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 py-2 bg-gray-600 text-white text-xs font-bold rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendCustom}
                disabled={sending}
                className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-lg disabled:opacity-50"
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppNotificationPanel;
