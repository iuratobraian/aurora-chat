import { api } from "../../../convex/_generated/api";
import logger from '../../../lib/utils/logger';
import { PendingOperation, BackupEntry } from './types';
import { generateUUID, getLocalItem, setLocalItem, computeDiff } from './helpers';
import { MAX_RETRY_ATTEMPTS, RETRY_DELAY_MS, SYNC_QUEUE_KEY, BACKUP_PREFIX } from './constants';
import { getConvexClient } from '../../../lib/convex/client';

export const convex = getConvexClient();

export let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        isOnline = true;
        logger.info('[SYNC] Conexión restaurada, procesando cola...');
        SyncManager.processQueue();
    });
    window.addEventListener('offline', () => {
        isOnline = false;
        logger.info('[SYNC] Conexión perdida, almacenando operaciones localmente...');
    });
}

export const SyncManager = {
    queue: [] as PendingOperation[],

    init() {
        this.queue = getLocalItem<PendingOperation[]>(SYNC_QUEUE_KEY, []);
        if (isOnline && this.queue.length > 0) {
            this.processQueue();
        }
    },

    async addToQueue(op: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>) {
        const operation: PendingOperation = {
            ...op,
            id: generateUUID(),
            timestamp: Date.now(),
            retries: 0,
        };

        this.queue.push(operation);
        setLocalItem(SYNC_QUEUE_KEY, this.queue);

        if (isOnline) {
            await this.processQueue();
        }

        return operation.id;
    },

    async processQueue() {
        if (!isOnline || this.queue.length === 0) return;

        const toProcess = [...this.queue];
        const successful: string[] = [];

        for (const op of toProcess) {
            try {
                await this.executeOperation(op);
                successful.push(op.id);
            } catch (err: any) {
                op.retries++;
                op.lastError = err.message;
                setLocalItem(SYNC_QUEUE_KEY, this.queue);

                if (op.retries >= MAX_RETRY_ATTEMPTS) {
                    logger.error(`[SYNC] Operación ${op.id} falló después de ${MAX_RETRY_ATTEMPTS} intentos:`, err);
                    this.removeFromQueue(op.id);
                } else {
                    logger.warn(`[SYNC] Reintentando operación ${op.id} (${op.retries}/${MAX_RETRY_ATTEMPTS})...`);
                    await this.delay(RETRY_DELAY_MS * op.retries);
                }
            }
        }

        for (const id of successful) {
            this.removeFromQueue(id);
        }
    },

    async executeOperation(op: PendingOperation): Promise<void> {
        if (!convex) {
            throw new Error('Convex client not available');
        }

        logger.info(`[SYNC] Executing ${op.operation} on ${op.itemType}:`, op.itemId);

        switch (op.itemType) {
            case 'post':
                if (op.operation === 'create') {
                    await convex.mutation(api.posts.createPost, {
                        ...op.data,
                        userId: op.data.userId || op.data.idUsuario,
                    });
                } else if (op.operation === 'update') {
                    await convex.mutation(api.posts.updatePost, {
                        id: op.itemId,
                        userId: op.data.userId || op.data.idUsuario,
                        contenido: op.data.contenido,
                        titulo: op.data.titulo,
                        categoria: op.data.categoria,
                    });
                } else if (op.operation === 'delete') {
                    await convex.mutation(api.posts.deletePost, {
                        id: op.itemId,
                        userId: op.data.userId || 'system',
                    });
                }
                break;
            case 'like':
                await convex.mutation(api.posts.toggleLike, {
                    id: op.itemId,
                    userId: op.data.userId,
                });
                break;
            default:
                await convex.mutation(api.backup.createPendingSync, {
                    operation: op.operation,
                    itemType: op.itemType,
                    itemId: op.itemId,
                    data: op.data,
                });
        }
    },

    removeFromQueue(id: string) {
        this.queue = this.queue.filter(op => op.id !== id);
        setLocalItem(SYNC_QUEUE_KEY, this.queue);
    },

    getQueue() {
        return [...this.queue];
    },

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    getQueueSize() {
        return this.queue.length;
    },

    clearQueue() {
        this.queue = [];
        setLocalItem(SYNC_QUEUE_KEY, []);
    },
};

SyncManager.init();

export const BackupManager = {
    createBackup(itemId: string, itemType: string, operation: 'create' | 'update' | 'delete', previousData: any, newData: any, userId: string) {
        const backup: BackupEntry = {
            id: generateUUID(),
            itemId,
            itemType,
            previousData,
            newData,
            timestamp: Date.now(),
            operation,
        };

        const key = `${BACKUP_PREFIX}${itemType}_${itemId}`;
        const existing = getLocalItem<BackupEntry[]>(key, []);
        existing.unshift(backup);
        const limited = existing.slice(0, 100);
        setLocalItem(key, limited);

        if (isOnline && convex) {
            try {
                convex.mutation(api.backup.createBackup, {
                    itemId,
                    itemType,
                    operation,
                    previousData,
                    newData,
                    userId,
                }).catch(console.error);
            } catch (err) {
                logger.warn('[BACKUP] No se pudo crear backup en Convex:', err);
            }
        }

        return backup;
    },

    getBackupHistory(itemId: string, itemType: string): BackupEntry[] {
        const key = `${BACKUP_PREFIX}${itemType}_${itemId}`;
        return getLocalItem<BackupEntry[]>(key, []);
    },

    getBackupById(itemId: string, itemType: string, backupId: string): BackupEntry | null {
        const history = this.getBackupHistory(itemId, itemType);
        return history.find(b => b.id === backupId) || null;
    },

    restoreFromBackup(itemId: string, itemType: string, backupId: string): BackupEntry | null {
        const backup = this.getBackupById(itemId, itemType, backupId);
        if (!backup) return null;

        this.createBackup(
            itemId,
            itemType,
            'update',
            backup.newData,
            backup.previousData,
            'system_restore'
        );

        return backup;
    },

    clearOldBackups(daysOld: number = 30) {
        const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;
        const keys = Object.keys(localStorage).filter(k => k.startsWith(BACKUP_PREFIX));

        let cleared = 0;
        for (const key of keys) {
            const backups: BackupEntry[] = getLocalItem(key, []);
            const filtered = backups.filter(b => b.timestamp > cutoff);
            if (filtered.length !== backups.length) {
                if (filtered.length > 0) {
                    setLocalItem(key, filtered);
                } else {
                    localStorage.removeItem(key);
                }
                cleared++;
            }
        }

        return cleared;
    },
};

export async function withRetry<T>(
    operation: () => Promise<T>,
    context: string,
    options: { retries?: number; delay?: number } = {}
): Promise<{ data?: T; error?: string; localFallback?: boolean }> {
    const retries = options.retries ?? MAX_RETRY_ATTEMPTS;
    const delay = options.delay ?? RETRY_DELAY_MS;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const data = await operation();
            return { data };
        } catch (err: any) {
            logger.warn(`[RETRY] ${context} - Intento ${attempt}/${retries}:`, err.message);

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            } else {
                return { error: err.message };
            }
        }
    }

    return { error: 'Máximo número de intentos alcanzado' };
}
