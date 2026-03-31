import { type LangGraphState } from './types';

export interface PersistedCheckpoint {
  id: string;
  state: LangGraphState;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
}

export interface CheckpointPersistenceConfig {
  storageKey: string;
  maxCheckpoints: number;
  ttlMinutes: number;
  storageType: 'localStorage' | 'sessionStorage' | 'memory';
}

const DEFAULT_PERSISTENCE_CONFIG: CheckpointPersistenceConfig = {
  storageKey: 'langgraph_checkpoints',
  maxCheckpoints: 50,
  ttlMinutes: 60,
  storageType: 'localStorage'
};

export class LangGraphPersistence {
  private config: CheckpointPersistenceConfig;
  private storage: Storage | Map<string, PersistedCheckpoint>;

  constructor(config: Partial<CheckpointPersistenceConfig> = {}) {
    this.config = { ...DEFAULT_PERSISTENCE_CONFIG, ...config };
    this.storage = this.initializeStorage();
  }

  private initializeStorage(): Storage | Map<string, PersistedCheckpoint> {
    if (this.config.storageType === 'memory') {
      return new Map();
    }

    if (typeof window === 'undefined') {
      return new Map();
    }

    if (this.config.storageType === 'sessionStorage') {
      return window.sessionStorage;
    }

    return window.localStorage;
  }

  private isStorageMap(): boolean {
    return this.storage instanceof Map;
  }

  private getAllCheckpoints(): Map<string, PersistedCheckpoint> {
    const now = Date.now();
    const checkpoints = new Map<string, PersistedCheckpoint>();

    if (this.isStorageMap()) {
      const map = this.storage as Map<string, PersistedCheckpoint>;
      for (const [id, checkpoint] of map.entries()) {
        if (checkpoint.expiresAt > now) {
          checkpoints.set(id, checkpoint);
        } else {
          map.delete(id);
        }
      }
      return checkpoints;
    }

    try {
      const stored = (this.storage as Storage).getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, PersistedCheckpoint>;
        for (const [id, checkpoint] of Object.entries(parsed)) {
          if (checkpoint.expiresAt > now) {
            checkpoints.set(id, checkpoint);
          }
        }
      }
    } catch (error) {
      console.error('Error reading checkpoints:', error);
    }

    return checkpoints;
  }

  private saveAllCheckpoints(checkpoints: Map<string, PersistedCheckpoint>): void {
    if (this.isStorageMap()) {
      return;
    }

    try {
      const obj = Object.fromEntries(checkpoints);
      (this.storage as Storage).setItem(this.config.storageKey, JSON.stringify(obj));
    } catch (error) {
      console.error('Error saving checkpoints:', error);
    }
  }

  save(id: string, state: LangGraphState): void {
    const checkpoints = this.getAllCheckpoints();
    const now = Date.now();

    const checkpoint: PersistedCheckpoint = {
      id,
      state,
      createdAt: checkpoints.get(id)?.createdAt || now,
      updatedAt: now,
      expiresAt: now + this.config.ttlMinutes * 60 * 1000
    };

    checkpoints.set(id, checkpoint);

    if (checkpoints.size > this.config.maxCheckpoints) {
      const sorted = Array.from(checkpoints.entries())
        .sort((a, b) => a[1].updatedAt - b[1].updatedAt);
      
      const toRemove = sorted.slice(0, checkpoints.size - this.config.maxCheckpoints);
      toRemove.forEach(([key]) => checkpoints.delete(key));
    }

    this.saveAllCheckpoints(checkpoints);
  }

  load(id: string): LangGraphState | null {
    const checkpoints = this.getAllCheckpoints();
    const checkpoint = checkpoints.get(id);
    return checkpoint?.state || null;
  }

  delete(id: string): void {
    const checkpoints = this.getAllCheckpoints();
    checkpoints.delete(id);
    this.saveAllCheckpoints(checkpoints);
  }

  list(): PersistedCheckpoint[] {
    return Array.from(this.getAllCheckpoints().values())
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  listIds(): string[] {
    return this.list().map(c => c.id);
  }

  clear(): void {
    if (this.isStorageMap()) {
      (this.storage as Map<string, PersistedCheckpoint>).clear();
    } else {
      (this.storage as Storage).removeItem(this.config.storageKey);
    }
  }

  cleanup(): number {
    const before = this.getAllCheckpoints().size;
    const now = Date.now();

    if (this.isStorageMap()) {
      const map = this.storage as Map<string, PersistedCheckpoint>;
      for (const [id, checkpoint] of map.entries()) {
        if (checkpoint.expiresAt <= now) {
          map.delete(id);
        }
      }
    } else {
      const checkpoints = this.getAllCheckpoints();
      this.saveAllCheckpoints(checkpoints);
    }

    const after = this.getAllCheckpoints().size;
    return before - after;
  }

  getSize(): number {
    return this.getAllCheckpoints().size;
  }
}

export const langGraphPersistence = new LangGraphPersistence();
