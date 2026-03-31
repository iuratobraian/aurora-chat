import { useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import logger from '../utils/logger';

interface Operation {
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

const SYNC_INTERVAL = 30000;
const MAX_RETRIES = 5;

export function usePendingOperations(userId: string | null) {
  const pendingOps = useQuery(api.pendingOperations.getPendingOperations, { 
    userId: userId || '' 
  }) as Operation[] | undefined;

  const queueOperation = useMutation(api.pendingOperations.queueOperation);
  const retryAll = useMutation(api.pendingOperations.retryAllPending);
  
  return {
    pendingOperations: pendingOps || [],
    pendingCount: pendingOps?.filter(o => o.status !== 'completed').length || 0,
    queueOperation,
    retryAll: () => retryAll({ userId: userId || undefined }),
  };
}

export function useOperationQueue() {
  const isProcessingRef = useRef(false);
  
  const processOperation = useCallback(async (operation: Operation) => {
    try {
      switch (operation.operationType) {
        case 'create_post':
          await fetch('/api/createPost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(operation.payload),
          });
          break;
        case 'update_profile':
          await fetch('/api/updateProfile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(operation.payload),
          });
          break;
        case 'add_comment':
          await fetch('/api/addComment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(operation.payload),
          });
          break;
        default:
          logger.warn('Unknown operation type:', operation.operationType);
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const syncPendingOperations = useCallback(async (userId: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const response = await fetch(`/api/pendingOperations?userId=${userId}`);
      const operations: Operation[] = await response.json();

      for (const op of operations) {
        if (op.status !== 'pending') continue;
        if (op.retryCount >= MAX_RETRIES) continue;

        try {
          await processOperation(op);
          logger.info('Synced operation:', op.operationType);
        } catch (error: any) {
          logger.error('Failed to sync operation:', op.operationType, error);
        }
      }
    } catch (error) {
      logger.error('Failed to fetch pending operations:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [processOperation]);

  return { syncPendingOperations };
}

export function useAutoSync(userId: string | null, isOnline: boolean = true) {
  const { syncPendingOperations } = useOperationQueue();

  useEffect(() => {
    if (!userId || !isOnline) return;

    syncPendingOperations(userId);

    const interval = setInterval(() => {
      if (isOnline) {
        syncPendingOperations(userId);
      }
    }, SYNC_INTERVAL);

    const handleOnline = () => {
      logger.info('Back online, syncing pending operations...');
      syncPendingOperations(userId);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, [userId, isOnline, syncPendingOperations]);
}

export async function queueCriticalOperation(
  mutation: any,
  args: any,
  userId: string,
  operationType: string
): Promise<{ success: boolean; queued?: boolean }> {
  try {
    await mutation(args);
    return { success: true };
  } catch (error: any) {
    logger.error('Operation failed, queueing for retry:', error);

    try {
      const convex = (window as any).__convexClient;
      if (convex) {
        await convex.mutation(api.pendingOperations.queueOperation, {
          operationType,
          payload: args,
          userId,
        });
        logger.info('Operation queued for retry');
        return { success: true, queued: true };
      }
    } catch (queueError) {
      logger.error('Failed to queue operation:', queueError);
    }

    return { success: false };
  }
}

export default usePendingOperations;
