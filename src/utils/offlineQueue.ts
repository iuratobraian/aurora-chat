/**
 * Offline Action Queue
 * 
 * Queues actions when offline and syncs them when connection is restored.
 * Works with the service worker's background sync capability.
 */

interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retries: number;
}

const QUEUE_KEY = 'ts-offline-queue';
const MAX_RETRIES = 3;
const SYNC_TIMEOUT = 30000; // 30 seconds

class OfflineQueue {
  private queue: QueuedAction[] = [];
  private isSyncing = false;
  private onlineHandler: (() => void) | null = null;

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      this.queue = stored ? JSON.parse(stored) : [];
    } catch {
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[OfflineQueue] Failed to save queue:', error);
    }
  }

  /**
   * Setup listener for online events
   */
  private setupOnlineListener(): void {
    this.onlineHandler = () => {
      this.sync();
    };
    window.addEventListener('online', this.onlineHandler);
  }

  /**
   * Add action to queue
   */
  enqueue(type: string, payload: any): QueuedAction {
    const action: QueuedAction = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      payload,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(action);
    this.saveQueue();

    // Also queue in service worker for background sync
    this.queueInServiceWorker(action);

    return action;
  }

  /**
   * Queue action in service worker for background sync
   */
  private queueInServiceWorker(action: QueuedAction): void {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'QUEUE_ACTION',
        payload: {
          url: `/api/sync/${action.type}`,
          method: 'POST',
          body: action.payload,
        },
      });
    }
  }

  /**
   * Sync queued actions with server
   */
  async sync(): Promise<{ success: number; failed: QueuedAction[] }> {
    if (this.isSyncing || !navigator.onLine) {
      return { success: 0, failed: [...this.queue] };
    }

    this.isSyncing = true;
    let successCount = 0;
    const failed: QueuedAction[] = [];

    const queueCopy = [...this.queue];
    this.queue = [];

    for (const action of queueCopy) {
      try {
        const syncPromise = this.syncAction(action);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Sync timeout')), SYNC_TIMEOUT);
        });

        await Promise.race([syncPromise, timeoutPromise]);
        successCount++;
      } catch (error) {
        console.warn(`[OfflineQueue] Failed to sync action ${action.id}:`, error);

        if (action.retries < MAX_RETRIES) {
          action.retries++;
          failed.push(action);
        }
      }
    }

    this.queue = failed;
    this.saveQueue();
    this.isSyncing = false;

    return { success: successCount, failed };
  }

  /**
   * Sync a single action
   */
  private async syncAction(action: QueuedAction): Promise<void> {
    const response = await fetch(`/api/sync/${action.type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action.payload),
    });

    if (!response.ok) {
      throw new Error(`Sync failed with status ${response.status}`);
    }
  }

  /**
   * Get queue length
   */
  get length(): number {
    return this.queue.length;
  }

  /**
   * Get all queued actions
   */
  get actions(): QueuedAction[] {
    return [...this.queue];
  }

  /**
   * Clear all queued actions
   */
  clear(): void {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Cleanup old actions (older than 24 hours)
   */
  cleanup(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    this.queue = this.queue.filter((action) => action.timestamp > cutoff);
    this.saveQueue();
  }

  /**
   * Destroy the queue and remove listeners
   */
  destroy(): void {
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
      this.onlineHandler = null;
    }
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueue();

// Auto-cleanup old actions on module load
if (typeof window !== 'undefined') {
  offlineQueue.cleanup();
}

export { OfflineQueue };
export type { QueuedAction };
