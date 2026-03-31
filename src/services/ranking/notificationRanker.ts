import { Notificacion, NotificacionType } from '../../types';

export interface RankedNotification {
    notification: Notificacion;
    score: number;
    boosted: boolean;
    reason: string;
    priority: NotificationPriority;
}

export type NotificationPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface NotificationSurface {
    items: RankedNotification[];
    surface: 'notifications';
    total: number;
    unreadCount: number;
    signal: 'live' | 'empty';
}

export interface NotificationRankingConfig {
    userId: string;
    includeRead: boolean;
    maxAgeDays: number;
    prioritizeNew: boolean;
}

const DEFAULT_CONFIG: NotificationRankingConfig = {
    userId: '',
    includeRead: false,
    maxAgeDays: 30,
    prioritizeNew: true,
};

const PRIORITY_WEIGHTS: Record<NotificacionType, { priority: NotificationPriority; score: number }> = {
    mention: { priority: 'urgent', score: 40 },
    comment: { priority: 'high', score: 30 },
    like: { priority: 'medium', score: 20 },
    follow: { priority: 'low', score: 10 },
    achievement: { priority: 'high', score: 35 },
    level_up: { priority: 'high', score: 35 },
    system: { priority: 'medium', score: 25 },
    message: { priority: 'high', score: 30 },
    moderation: { priority: 'urgent', score: 45 },
    suspension: { priority: 'urgent', score: 50 },
    streak: { priority: 'medium', score: 25 },
};

function parseTimeToMs(tiempo: string): number {
    const now = Date.now();

    if (tiempo === 'Ahora') return 0;
    if (tiempo === 'Hace un momento') return 60000;

    const minMatch = tiempo.match(/(\d+)\s*min/);
    if (minMatch) return now - parseInt(minMatch[1]) * 60000;

    const hourMatch = tiempo.match(/(\d+)\s*hora/);
    if (hourMatch) return now - parseInt(hourMatch[1]) * 3600000;

    const dayMatch = tiempo.match(/(\d+)\s*día|dias?/i);
    if (dayMatch) return now - parseInt(dayMatch[1]) * 86400000;

    return now;
}

function calculateNotificationScore(
    notification: Notificacion,
    config: NotificationRankingConfig
): { score: number; reason: string } {
    let score = 50;

    const typeWeight = PRIORITY_WEIGHTS[notification.tipo]?.score || 20;
    score += typeWeight;

    if (!notification.leida) {
        score += 20;
    }

    const ageMs = parseTimeToMs(notification.tiempo);
    const ageHours = ageMs / (1000 * 60 * 60);

    if (ageHours < 1) {
        score += 15;
    } else if (ageHours < 4) {
        score += 10;
    } else if (ageHours < 12) {
        score += 5;
    } else if (ageHours < 24) {
        score += 2;
    } else {
        score -= Math.min((ageHours - 24) * 0.5, 20);
    }

    let reason = '';

    if (!notification.leida && notification.tiempo.includes('min')) {
        reason = 'Nueva y reciente';
    } else if (notification.tipo === 'mention') {
        reason = 'Te mencionaron';
    } else if (notification.tipo === 'achievement') {
        reason = 'Logro desbloqueado';
    } else if (notification.tipo === 'level_up') {
        reason = 'Subiste de nivel';
    } else if (notification.tipo === 'moderation' || notification.tipo === 'suspension') {
        reason = 'Acción requerida';
    } else if (!notification.leida) {
        reason = 'No leída';
    } else {
        reason = 'Notificación';
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        reason,
    };
}

function getNotificationPriority(tipo: NotificacionType): NotificationPriority {
    return PRIORITY_WEIGHTS[tipo]?.priority || 'medium';
}

export const NotificationRanker = {
    rank(
        notifications: Notificacion[],
        config: Partial<NotificationRankingConfig> = {}
    ): RankedNotification[] {
        const fullConfig = { ...DEFAULT_CONFIG, ...config };

        let filtered = notifications;

        if (!fullConfig.includeRead) {
            filtered = notifications.filter(n => !n.leida);
        }

        const now = Date.now();
        const maxAgeMs = fullConfig.maxAgeDays * 24 * 60 * 60 * 1000;

        filtered = filtered.filter(n => {
            const age = now - parseTimeToMs(n.tiempo);
            return age < maxAgeMs;
        });

        const ranked: RankedNotification[] = filtered.map(notification => {
            const { score, reason } = calculateNotificationScore(notification, fullConfig);
            return {
                notification,
                score,
                boosted: score > 75,
                reason,
                priority: getNotificationPriority(notification.tipo),
            };
        });

        if (fullConfig.prioritizeNew) {
            ranked.sort((a, b) => {
                if (a.boosted !== b.boosted) return a.boosted ? -1 : 1;
                if (a.priority !== b.priority) {
                    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                return b.score - a.score;
            });
        } else {
            ranked.sort((a, b) => b.score - a.score);
        }

        return ranked;
    },

    surface(
        notifications: Notificacion[],
        config: Partial<NotificationRankingConfig> = {}
    ): NotificationSurface {
        const ranked = this.rank(notifications, config);
        const unreadCount = notifications.filter(n => !n.leida).length;

        return {
            items: ranked,
            surface: 'notifications',
            total: notifications.length,
            unreadCount,
            signal: ranked.length > 0 ? 'live' : 'empty',
        };
    },

    getUrgent(notifications: Notificacion[]): RankedNotification[] {
        return notifications
            .filter(n => {
                const priority = getNotificationPriority(n.tipo);
                return priority === 'urgent';
            })
            .map(notification => {
                const { score, reason } = calculateNotificationScore(notification, DEFAULT_CONFIG);
                return {
                    notification,
                    score,
                    boosted: true,
                    reason,
                    priority: 'urgent' as NotificationPriority,
                };
            })
            .sort((a, b) => b.score - a.score);
    },

    getUnread(notifications: Notificacion[]): Notificacion[] {
        return notifications.filter(n => !n.leida);
    },

    getByType(
        notifications: Notificacion[],
        tipo: NotificacionType
    ): Notificacion[] {
        return notifications.filter(n => n.tipo === tipo);
    },

    groupByPriority(
        notifications: Notificacion[],
        config?: Partial<NotificationRankingConfig>
    ): Record<NotificationPriority, RankedNotification[]> {
        const ranked = this.rank(notifications, config);

        return {
            urgent: ranked.filter(n => n.priority === 'urgent'),
            high: ranked.filter(n => n.priority === 'high'),
            medium: ranked.filter(n => n.priority === 'medium'),
            low: ranked.filter(n => n.priority === 'low'),
        };
    },

    getActionable(notifications: Notificacion[]): RankedNotification[] {
        const actionableTypes: NotificacionType[] = [
            'mention',
            'comment',
            'follow',
            'achievement',
            'level_up',
        ];

        return notifications
            .filter(n => actionableTypes.includes(n.tipo))
            .map(notification => {
                const { score, reason } = calculateNotificationScore(notification, DEFAULT_CONFIG);
                return {
                    notification,
                    score,
                    boosted: score > 70,
                    reason,
                    priority: getNotificationPriority(notification.tipo),
                };
            })
            .sort((a, b) => b.score - a.score);
    },
};
