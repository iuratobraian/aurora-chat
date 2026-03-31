import { useState, useEffect, useCallback } from 'react';
import { SyncService } from '../services/backup/syncService';
import logger from '../utils/logger';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface SyncStatusIndicatorProps {
    className?: string;
    autoHide?: boolean;
    autoHideDelay?: number;
}

export function SyncStatusIndicator({ 
    className = '', 
    autoHide = true, 
    autoHideDelay = 3000 
}: SyncStatusIndicatorProps) {
    const [status, setStatus] = useState<SyncStatus>('idle');
    const [pendingCount, setPendingCount] = useState(0);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const updateStatus = useCallback(() => {
        const syncStatus = SyncService.getSyncStatus();
        setPendingCount(syncStatus.pendingOperations);
        
        if (!syncStatus.isOnline) {
            setStatus('offline');
            setIsVisible(true);
        } else if (syncStatus.pendingOperations > 0) {
            setStatus('syncing');
            setIsVisible(true);
        } else {
            setStatus('idle');
        }
    }, []);

    const handleSync = useCallback(async () => {
        if (!navigator.onLine) {
            logger.warn('[SyncIndicator] No hay conexión');
            return;
        }

        setStatus('syncing');
        setIsVisible(true);

        try {
            const result = await SyncService.forceSyncNow();
            if (result.success > 0) {
                setLastSynced(new Date());
                setStatus('synced');
                if (autoHide) {
                    setTimeout(() => {
                        setStatus('idle');
                        setIsVisible(false);
                    }, autoHideDelay);
                }
            } else if (result.failed > 0) {
                setStatus('error');
            } else {
                setStatus('idle');
            }
        } catch (err) {
            logger.error('[SyncIndicator] Error al sincronizar:', err);
            setStatus('error');
        }

        updateStatus();
    }, [autoHide, autoHideDelay, updateStatus]);

    useEffect(() => {
        updateStatus();

        const handleOnline = () => {
            logger.info('[SyncIndicator] Conexión restaurada');
            updateStatus();
        };

        const handleOffline = () => {
            logger.info('[SyncIndicator] Conexión perdida');
            setStatus('offline');
            setIsVisible(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const interval = setInterval(updateStatus, 5000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, [updateStatus]);

    if (!isVisible && status === 'idle') return null;

    const statusConfig = {
        idle: { 
            icon: '✓', 
            text: 'Sincronizado', 
            bg: 'bg-signal-green/20', 
            border: 'border-signal-green/40',
            textColor: 'text-signal-green'
        },
        syncing: { 
            icon: '↻', 
            text: `Sincronizando${pendingCount > 0 ? ` (${pendingCount})` : ''}...`, 
            bg: 'bg-primary/20', 
            border: 'border-primary/40',
            textColor: 'text-primary'
        },
        synced: { 
            icon: '✓', 
            text: '✓ Sincronizado', 
            bg: 'bg-signal-green/20', 
            border: 'border-signal-green/40',
            textColor: 'text-signal-green'
        },
        error: { 
            icon: '✗', 
            text: 'Error de sincronización', 
            bg: 'bg-alert-red/20', 
            border: 'border-alert-red/40',
            textColor: 'text-alert-red'
        },
        offline: { 
            icon: '○', 
            text: 'Sin conexión', 
            bg: 'bg-amber-500/20', 
            border: 'border-amber-500/40',
            textColor: 'text-amber-500'
        },
    };

    const config = statusConfig[status];

    return (
        <div 
            className={`
                fixed bottom-20 left-4 z-50
                ${config.bg} ${config.border}
                border rounded-lg px-3 py-2
                backdrop-blur-sm
                animate-in fade-in slide-in-from-left duration-300
                ${className}
            `}
            role="status"
            aria-live="polite"
        >
            <div className="flex items-center gap-2">
                <span className={`
                    ${config.textColor}
                    ${status === 'syncing' ? 'animate-spin' : ''}
                    text-sm
                `}>
                    {config.icon}
                </span>
                <span className={`${config.textColor} text-xs font-medium`}>
                    {config.text}
                </span>
                {status === 'offline' && pendingCount > 0 && (
                    <span className="text-[10px] text-amber-400/70">
                        ({pendingCount} pendientes)
                    </span>
                )}
                {status === 'synced' && lastSynced && (
                    <span className="text-[10px] text-signal-green/60">
                        {lastSynced.toLocaleTimeString()}
                    </span>
                )}
                {(status === 'error' || status === 'offline') && (
                    <button
                        onClick={handleSync}
                        className="ml-1 text-[10px] text-white/60 hover:text-white underline"
                    >
                        Reintentar
                    </button>
                )}
            </div>
        </div>
    );
}

export default SyncStatusIndicator;
