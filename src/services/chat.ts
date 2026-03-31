import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import logger from "../utils/logger";

export interface ChatChannel {
  _id: string;
  name: string;
  slug: string;
  type: "global" | "community" | "direct";
  communityId?: string;
  participants: string[];
  createdBy: string;
  createdAt: number;
}

export interface ChatMessage {
  _id: string;
  userId: string;
  nombre: string;
  avatar: string;
  texto: string;
  imagenUrl?: string;
  isAi?: boolean;
  flagged?: boolean;
  flaggedWords?: string[];
  channelId?: string;
  createdAt: number;
}

class ChatService {
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  getChannels() {
    return useQuery(api.chat.getChannels);
  }

  getMessages(channelId?: string, limit?: number) {
    return useQuery(
      api.chat.getMessagesByChannel,
      channelId ? { channelId, limit } : { limit }
    );
  }

  getMessagesByChannelWithCursor(channelId: string, limit: number, cursor?: string) {
    return useQuery(
      api.chat.getMessagesByChannel,
      { channelId, limit, cursor }
    );
  }

  getTypingUsers(channelId: string, excludeUserId: string) {
    return useQuery(
      api.chat.getTypingUsers,
      { channelId, excludeUserId }
    );
  }

  getMessagesLegacy(limit?: number) {
    return useQuery(api.chat.getMessages, { limit });
  }

  sendMessage() {
    return useMutation(api.chat.sendMessage);
  }

  setTyping() {
    return useMutation(api.chat.setTyping);
  }

  getOrCreateChannel() {
    return useMutation(api.chat.getOrCreateChannel);
  }

  subscribeToChannel(channelId: string, callback: (messages: ChatMessage[]) => void) {
    const messages = useQuery(
      api.chat.getMessagesByChannel,
      { channelId, limit: 50 }
    );
    if (messages !== undefined) {
      callback(messages as ChatMessage[]);
    }
    return () => {};
  }

  async sendMessageWithTyping(
    channelId: string,
    userId: string,
    nombre: string,
    avatar: string,
    content: string,
    imagenUrl?: string
  ) {
    const sendMessageMutation = this.sendMessage();
    const setTypingMutation = this.setTyping();

    await sendMessageMutation({
      userId,
      nombre,
      avatar,
      texto: content,
      imagenUrl,
      channelId,
    });

    const existingTimeout = this.typingTimeouts.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        await setTypingMutation({
          channelId,
          userId,
        });
      } catch (e) {
        logger.error("Failed to clear typing status", e);
      }
      this.typingTimeouts.delete(userId);
    }, 2000);

    this.typingTimeouts.set(userId, timeout);
  }
}

export const chatService = new ChatService();