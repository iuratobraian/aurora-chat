import logger from '../../utils/logger';

export interface DailyBackup {
  id: string;
  date: string;
  timestamp: number;
  sizeBytes: number;
  collections: string[];
  version: string;
}

export interface BackupCollection {
  name: string;
  count: number;
  data: unknown;
}

export interface DailyBackupResult {
  success: boolean;
  backupId?: string;
  date?: string;
  sizeBytes?: number;
  collections?: string[];
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  restored?: number;
  error?: string;
}

const BACKUP_PREFIX = 'daily_backup_';
const BACKUP_INDEX_KEY = 'daily_backup_index';
const RETENTION_DAYS = 3;
const BACKUP_VERSION = '1.0';

function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch { return defaultVal; }
}

function setLocalItem(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    logger.warn('[DailyBackup] Failed to write:', e);
  }
}

function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

function getBackupKey(date: string): string {
  return `${BACKUP_PREFIX}${date}`;
}

function getIndex(): DailyBackup[] {
  return getLocalItem<DailyBackup[]>(BACKUP_INDEX_KEY, []);
}

function saveIndex(index: DailyBackup[]): void {
  setLocalItem(BACKUP_INDEX_KEY, index);
}

const COLLECTION_KEYS = [
  'local_posts_db',
  'local_users_db',
  'user_interest_profile',
  'user_engagement_metrics',
  'user_signals_queue',
  'user_watchlist',
  'community_analytics_cache',
  'sync_queue',
  'user_preferences',
  'onboarding_completed',
  'notification_preferences',
];

export const DailyBackupService = {
  createBackup(): DailyBackupResult {
    try {
      const date = getDateString();
      const backupKey = getBackupKey(date);
      const timestamp = Date.now();

      const collections: BackupCollection[] = [];

      for (const key of COLLECTION_KEYS) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            collections.push({
              name: key,
              count: Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length,
              data: parsed,
            });
          } catch {
            collections.push({
              name: key,
              count: 0,
              data: null,
            });
          }
        }
      }

      const backupData = {
        version: BACKUP_VERSION,
        date,
        timestamp,
        collections,
      };

      const serialized = JSON.stringify(backupData);
      const sizeBytes = new Blob([serialized]).size;

      localStorage.setItem(backupKey, serialized);

      const index = getIndex();
      const existingIdx = index.findIndex(b => b.date === date);

      const newEntry: DailyBackup = {
        id: `backup_${date}_${timestamp}`,
        date,
        timestamp,
        sizeBytes,
        collections: collections.map(c => c.name),
        version: BACKUP_VERSION,
      };

      if (existingIdx >= 0) {
        index[existingIdx] = newEntry;
      } else {
        index.push(newEntry);
      }

      saveIndex(index);
      this.cleanupOldBackups();

      logger.info(`[DailyBackup] Backup created: ${date}, ${sizeBytes} bytes, ${collections.length} collections`);

      return {
        success: true,
        backupId: newEntry.id,
        date,
        sizeBytes,
        collections: newEntry.collections,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('[DailyBackup] createBackup failed:', message);
      return { success: false, error: message };
    }
  },

  getAvailableBackups(): DailyBackup[] {
    return getIndex().sort((a, b) => b.timestamp - a.timestamp);
  },

  getLatestBackup(): DailyBackup | null {
    const index = getIndex();
    if (index.length === 0) return null;
    return index.reduce((latest, b) => b.timestamp > latest.timestamp ? b : latest, index[0]);
  },

  getBackupByDate(date: string): DailyBackup | null {
    return getIndex().find(b => b.date === date) || null;
  },

  restoreBackup(date: string): RestoreResult {
    try {
      const backupKey = getBackupKey(date);
      const data = localStorage.getItem(backupKey);

      if (!data) {
        return { success: false, error: `Backup not found for ${date}` };
      }

      const backup = JSON.parse(data);
      if (!backup.collections || !Array.isArray(backup.collections)) {
        return { success: false, error: 'Invalid backup format' };
      }

      let restored = 0;

      for (const collection of backup.collections) {
        if (collection.data !== null) {
          localStorage.setItem(collection.name, JSON.stringify(collection.data));
          restored++;
        }
      }

      logger.info(`[DailyBackup] Restored ${restored} collections from ${date}`);

      return { success: true, restored };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('[DailyBackup] restoreBackup failed:', message);
      return { success: false, error: message };
    }
  },

  deleteBackup(date: string): boolean {
    try {
      const backupKey = getBackupKey(date);
      localStorage.removeItem(backupKey);

      const index = getIndex().filter(b => b.date !== date);
      saveIndex(index);

      logger.info(`[DailyBackup] Deleted backup for ${date}`);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('[DailyBackup] deleteBackup failed:', message);
      return false;
    }
  },

  cleanupOldBackups(): number {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
      const cutoffStr = getDateString(cutoffDate);

      const index = getIndex();
      const toDelete = index.filter(b => b.date < cutoffStr);
      let deleted = 0;

      for (const backup of toDelete) {
        localStorage.removeItem(getBackupKey(backup.date));
        deleted++;
      }

      const remaining = index.filter(b => b.date >= cutoffStr);
      saveIndex(remaining);

      if (deleted > 0) {
        logger.info(`[DailyBackup] Cleaned up ${deleted} old backups (older than ${RETENTION_DAYS} days)`);
      }

      return deleted;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('[DailyBackup] cleanupOldBackups failed:', message);
      return 0;
    }
  },

  getBackupStats(): {
    totalBackups: number;
    totalSizeBytes: number;
    oldestBackup: string | null;
    newestBackup: string | null;
    retentionDays: number;
  } {
    const index = getIndex();

    return {
      totalBackups: index.length,
      totalSizeBytes: index.reduce((sum, b) => sum + b.sizeBytes, 0),
      oldestBackup: index.length > 0 ? index[index.length - 1].date : null,
      newestBackup: index.length > 0 ? index[0].date : null,
      retentionDays: RETENTION_DAYS,
    };
  },

  shouldCreateBackup(): boolean {
    const latest = this.getLatestBackup();
    if (!latest) return true;

    const today = getDateString();
    return latest.date !== today;
  },

  scheduleBackupCheck(): void {
    if (typeof window === 'undefined') return;

    const checkAndBackup = () => {
      if (this.shouldCreateBackup()) {
        logger.info('[DailyBackup] Creating scheduled backup...');
        this.createBackup();
      } else {
        logger.info('[DailyBackup] Backup already exists for today');
      }
    };

    if (document.readyState === 'complete') {
      checkAndBackup();
    } else {
      window.addEventListener('load', checkAndBackup);
    }

    setInterval(() => {
      checkAndBackup();
    }, 60 * 60 * 1000);
  },
};

if (typeof window !== 'undefined') {
  DailyBackupService.scheduleBackupCheck();
}
