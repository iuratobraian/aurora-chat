import { ChatMessage } from '../types';

const DB_NAME = 'aurora_db';
const STORES = {
  MESSAGES: 'messages',
  CHANNELS: 'channels',
  STATUSES: 'statuses'
};
const DB_VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e: any) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) db.createObjectStore(STORES.MESSAGES);
      if (!db.objectStoreNames.contains(STORES.CHANNELS)) db.createObjectStore(STORES.CHANNELS);
      if (!db.objectStoreNames.contains(STORES.STATUSES)) db.createObjectStore(STORES.STATUSES);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const persistenceService = {
  async saveMessages(channelId: string, messages: ChatMessage[]) {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.MESSAGES, 'readwrite');
      tx.objectStore(STORES.MESSAGES).put(messages.slice(-50), channelId); // Limit cache
      db.close();
    } catch (err) {
      console.warn("Storage quota or access issue", err);
    }
  },

  async getMessages(channelId: string): Promise<ChatMessage[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.MESSAGES, 'readonly');
        const req = tx.objectStore(STORES.MESSAGES).get(channelId);
        req.onsuccess = () => { db.close(); resolve(req.result || []); };
        req.onerror = () => { db.close(); resolve([]); };
      });
    } catch { return []; }
  },

  async saveChannels(channels: any[]) {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.CHANNELS, 'readwrite');
      tx.objectStore(STORES.CHANNELS).put(channels, 'list');
      db.close();
    } catch {}
  },

  async getChannels(): Promise<any[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.CHANNELS, 'readonly');
        const req = tx.objectStore(STORES.CHANNELS).get('list');
        req.onsuccess = () => { db.close(); resolve(req.result || []); };
        req.onerror = () => { db.close(); resolve([]); };
      });
    } catch { return []; }
  }
};
