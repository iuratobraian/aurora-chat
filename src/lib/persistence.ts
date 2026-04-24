import { get, set, del } from 'idb-keyval';
import { ChatMessage } from '../types';

const MSG_CACHE_PREFIX = 'aurora_msgs_';

export const persistenceService = {
  async saveMessages(channelId: string, messages: ChatMessage[]) {
    try {
      await set(`${MSG_CACHE_PREFIX}${channelId}`, messages);
    } catch (err) {
      console.error('Error saving messages to persistence:', err);
    }
  },

  async getMessages(channelId: string): Promise<ChatMessage[]> {
    try {
      const msgs = await get(`${MSG_CACHE_PREFIX}${channelId}`);
      return msgs || [];
    } catch (err) {
      console.error('Error getting messages from persistence:', err);
      return [];
    }
  },

  async clearCache(channelId: string) {
    await del(`${MSG_CACHE_PREFIX}${channelId}`);
  }
};
