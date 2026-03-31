import { api } from "../../../convex/_generated/api";
import logger from '../../../lib/utils/logger';
import { getConvexClient } from '../../../lib/convex/client';

const convex = getConvexClient();

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const SYNC_QUEUE_KEY = 'pending_sync_queue';
const BACKUP_PREFIX = 'local_backup_';

interface PendingOperation {
    id: string;
    operation: 'create' | 'update' | 'delete';
    itemType: string;
    itemId: string;
    data: any;
    timestamp: number;
    retries: number;
    lastError?: string;
}

interface BackupEntry {
    id: string;
    itemId: string;
    itemType: string;
    previousData: any;
    newData: any;
    timestamp: number;
    operation: 'create' | 'update' | 'delete';
}

const getLocalItem = <T>(key: string, defaultVal: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch { return defaultVal; }
};

const setLocalItem = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function computeDiff(prev: any, next: any): any {
    if (!prev || !next) return null;
    const diff: Record<string, { from: any; to: any }> = {};
    const allKeys = new Set([...Object.keys(prev || {}), ...Object.keys(next || {})]);
    for (const key of allKeys) {
        if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
            diff[key] = { from: prev[key], to: next[key] };
        }
    }
    return Object.keys(diff).length > 0 ? diff : null;
}

let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

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
        if (convex) {
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

export const BackupManager = {
    createBackup(itemId: string, itemType: string, operation: 'create' | 'update' | 'delete', previousData: any, newData: any, userId: string) {
        const diff = computeDiff(previousData, newData);
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
        const history = BackupManager.getBackupHistory(itemId, itemType);
        return history.find(b => b.id === backupId) || null;
    },

    restoreFromBackup(itemId: string, itemType: string, backupId: string): BackupEntry | null {
        const backup = BackupManager.getBackupById(itemId, itemType, backupId);
        if (!backup) return null;

        BackupManager.createBackup(
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

    getBackupStats: async (): Promise<{
        totalBackups: number;
        byType: Record<string, number>;
        pendingSync: number;
    }> => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(BACKUP_PREFIX));
        const byType: Record<string, number> = {};
        let totalBackups = 0;

        for (const key of keys) {
            const backups: BackupEntry[] = getLocalItem(key, []);
            totalBackups += backups.length;
            const typeMatch = key.match(/local_backup_(.+?)_/);
            if (typeMatch) {
                byType[typeMatch[1]] = (byType[typeMatch[1]] || 0) + backups.length;
            }
        }

        return {
            totalBackups,
            byType,
            pendingSync: SyncManager.getQueueSize(),
        };
    },
};

SyncManager.init();

export const SyncService = {
    getSyncStatus: () => ({
        isOnline,
        pendingOperations: SyncManager.getQueueSize(),
        queue: SyncManager.getQueue(),
    }),

    forceSyncNow: async (): Promise<{ success: number; failed: number }> => {
        if (!isOnline) return { success: 0, failed: 0 };

        const queue = SyncManager.getQueue();
        let success = 0;
        let failed = 0;

        for (const op of queue) {
            try {
                await SyncManager.executeOperation(op);
                SyncManager.removeFromQueue(op.id);
                success++;
            } catch {
                failed++;
            }
        }

        return { success, failed };
    },

    getBackupHistory: (itemId: string, itemType: string) => {
        return BackupManager.getBackupHistory(itemId, itemType);
    },

    getBackupById: (itemId: string, itemType: string, backupId: string) => {
        return BackupManager.getBackupById(itemId, itemType, backupId);
    },

    clearOldLocalBackups: (daysOld: number = 30) => {
        return BackupManager.clearOldBackups(daysOld);
    },

    getBackupStats: async () => BackupManager.getBackupStats(),
};
