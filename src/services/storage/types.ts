export interface PendingOperation {
    id: string;
    operation: 'create' | 'update' | 'delete';
    itemType: string;
    itemId: string;
    data: any;
    timestamp: number;
    retries: number;
    lastError?: string;
}

export interface BackupEntry {
    id: string;
    itemId: string;
    itemType: string;
    previousData: any;
    newData: any;
    timestamp: number;
    operation: 'create' | 'update' | 'delete';
}
