import { Notificacion } from '../../types';
import { api } from "../../../convex/_generated/api";
import logger from '../../utils/logger';
import { convex } from './sync';
import { getLocalItem, setLocalItem, generateUUID } from './helpers';

export const getNotifications = async (userId: string): Promise<Notificacion[]> => {
    if (convex && userId !== 'guest') {
        try {
            const remote = await convex.query(api.notifications.getNotifications, { userId });
            if (remote) {
                return remote.map((n: any) => ({
                    id: n._id,
                    userId: n.userId,
                    tipo: n.type || n.tipo || 'system',
                    mensaje: n.body || n.mensaje || '',
                    leida: n.read ?? n.leida ?? false,
                    link: n.link,
                    avatarUrl: n.avatarUrl,
                    tiempo: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
            }
        } catch (err) {
            logger.error("Convex Get Notifs Error:", err);
        }
    }
    const allNotifs = getLocalItem<any[]>('local_notifications', []);
    return allNotifs.filter(n => n.user_id === userId).map(n => ({
        ...n, tiempo: new Date(n.created_at || Date.now()).toLocaleTimeString()
    }));
};

export const getNewNotifications = async (userId: string): Promise<Notification[]> => {
    if (convex && userId !== 'guest') {
        try {
            const remote = await convex.query(api.notifications.getNotifications, { userId });
            if (remote) {
                return remote.map((n: any) => ({
                    id: n._id,
                    userId: n.userId,
                    type: n.type || 'system',
                    title: n.title || 'Notificación',
                    body: n.body || n.mensaje || '',
                    data: n.data,
                    read: n.read ?? n.leida ?? false,
                    link: n.link,
                    avatarUrl: n.avatarUrl,
                    createdAt: n.createdAt
                }));
            }
        } catch (err) {
            logger.error("Convex Get New Notifs Error:", err);
        }
    }
    return [];
};

export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
    if (convex && userId !== 'guest') {
        try {
            return await convex.query(api.notifications.getUnreadCount, { userId });
        } catch (err) {
            logger.error("Convex Get Unread Count Error:", err);
        }
    }
    const allNotifs = getLocalItem<any[]>('local_notifications', []);
    return allNotifs.filter(n => n.user_id === userId && !n.leida).length;
};

export const addNotification = async (userId: string, notif: Partial<Notificacion>): Promise<void> => {
    const type = (notif.tipo === 'follow' || notif.tipo === 'mention' || notif.tipo === 'like' || 
                 notif.tipo === 'comment' || notif.tipo === 'achievement' || notif.tipo === 'level_up' || 
                 notif.tipo === 'system') ? notif.tipo : 'system';
    
    if (convex && userId !== 'guest') {
        try {
            await convex.mutation(api.notifications.createNotification, {
                userId,
                type: type as any,
                title: notif.mensaje?.substring(0, 100) || 'Notificación',
                body: notif.mensaje || '',
                link: notif.link,
                avatarUrl: notif.avatarUrl
            });
        } catch (err) {
            logger.error("Convex Add Notification Error:", err);
        }
    }

    const allNotifs = getLocalItem<any[]>('local_notifications', []);
    const newNotif = { id: generateUUID(), user_id: userId, ...notif, created_at: Date.now(), leida: false };
    allNotifs.unshift(newNotif);
    setLocalItem('local_notifications', allNotifs);
};

export const markNotificationRead = async (notifId: string): Promise<void> => {
    const isConvexId = notifId && notifId.length >= 15 && !notifId.includes('-');
    if (convex && isConvexId) {
        try {
            await convex.mutation(api.notifications.markAsRead, { id: notifId });
        } catch (err) { logger.error("Convex Mark Notif Error:", err); }
    }
    const allNotifs = getLocalItem<any[]>('local_notifications', []);
    const updated = allNotifs.map(n => (n.id === notifId || n._id === notifId) ? { ...n, leida: true } : n);
    setLocalItem('local_notifications', updated);
};

export const markAllNotificationsRead = async (userId: string): Promise<void> => {
    if (convex && userId !== 'guest') {
        try {
            await convex.mutation(api.notifications.markAllAsRead, { userId });
        } catch (err) { logger.error("Convex Mark All Read Error:", err); }
    }
    const allNotifs = getLocalItem<any[]>('local_notifications', []);
    const updated = allNotifs.map(n => n.user_id === userId ? { ...n, leida: true } : n);
    setLocalItem('local_notifications', updated);
};

export const deleteNotification = async (notifId: string): Promise<void> => {
    const isConvexId = notifId && notifId.length >= 15 && !notifId.includes('-');
    if (convex && isConvexId) {
        try {
            await convex.mutation(api.notifications.deleteNotification, { id: notifId });
        } catch (err) { logger.error("Convex Delete Notif Error:", err); }
    }
    const allNotifs = getLocalItem<any[]>('local_notifications', []);
    const updated = allNotifs.filter(n => n.id !== notifId && n._id !== notifId);
    setLocalItem('local_notifications', updated);
};

export const cleanupOldNotifications = async (userId: string, daysOld: number = 30): Promise<void> => {
    if (convex && userId !== 'guest') {
        try {
            await convex.mutation(api.notifications.deleteOldNotifications, { userId, daysOld });
        } catch (err) { logger.error("Convex Cleanup Notifs Error:", err); }
    }
};
