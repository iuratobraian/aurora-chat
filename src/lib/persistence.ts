import { ChatMessage } from '../types';

const DB_NAME = 'aurora_db';
const STORE_NAME = 'messages';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const persistenceService = {
  async saveMessages(channelId: string, messages: ChatMessage[]) {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(messages, channelId);
      db.close();
    } catch (err) {
      // Fallback to localStorage
      try { localStorage.setItem(`aurora_msgs_${channelId}`, JSON.stringify(messages)); } catch {}
    }
  },

  async getMessages(channelId: string): Promise<ChatMessage[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(channelId);
        req.onsuccess = () => { db.close(); resolve(req.result || []); };
        req.onerror = () => { db.close(); resolve([]); };
      });
    } catch {
      try {
        return JSON.parse(localStorage.getItem(`aurora_msgs_${channelId}`) || '[]');
      } catch { return []; }
    }
  },
};
