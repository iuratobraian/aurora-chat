import { createContext, useContext, useState, useCallback, memo } from 'react';

interface ChatBadgeContextType {
  unreadMessages: number;
  unreadMentions: number;
  setUnreadMessages: (count: number) => void;
  setUnreadMentions: (count: number) => void;
  incrementUnread: (isMention: boolean) => void;
  clearUnread: () => void;
}

const ChatBadgeContext = createContext<ChatBadgeContextType | null>(null);

export const useChatBadge = () => {
  const context = useContext(ChatBadgeContext);
  if (!context) {
    return {
      unreadMessages: 0,
      unreadMentions: 0,
      setUnreadMessages: () => {},
      setUnreadMentions: () => {},
      incrementUnread: () => {},
      clearUnread: () => {},
    };
  }
  return context;
};

interface ChatBadgeProviderProps {
  children: React.ReactNode;
}

export const ChatBadgeProvider: React.FC<ChatBadgeProviderProps> = memo(({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadMentions, setUnreadMentions] = useState(0);

  const incrementUnread = useCallback((isMention: boolean) => {
    setUnreadMessages(prev => prev + 1);
    if (isMention) {
      setUnreadMentions(prev => prev + 1);
    }
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadMessages(0);
    setUnreadMentions(0);
  }, []);

  return (
    <ChatBadgeContext.Provider value={{
      unreadMessages,
      unreadMentions,
      setUnreadMessages,
      setUnreadMentions,
      incrementUnread,
      clearUnread,
    }}>
      {children}
    </ChatBadgeContext.Provider>
  );
});

ChatBadgeProvider.displayName = 'ChatBadgeProvider';
