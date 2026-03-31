import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Usuario, MensajeChat } from '../types';
import { ImageUploadService } from '../services/imageUpload';
import { useToast } from './ToastProvider';
import logger from '../utils/logger';
import { soundManager } from '../utils/soundManager';

interface Channel {
  _id: string;
  name: string;
  slug: string;
  type: "global" | "community" | "direct";
}

interface Props {
  usuario: Usuario | null;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  initialChannel?: string;
  communityName?: string;
}

const PAGE_SIZE = 50;
const TYPING_DEBOUNCE = 1000;

const LiveChatWidget: React.FC<Props> = memo(({ usuario, isOpen, onOpen, onClose, initialChannel, communityName }) => {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [mentionsMe, setMentionsMe] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  const isTypingRef = useRef(false);
  const [currentChannel, setCurrentChannel] = useState<string>(initialChannel || "global");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const isCommunityMode = !!initialChannel;
  const { showToast } = useToast();
  
  const messagesEndRef = useRef<HTMLDivElement>(null); 
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);
  const isAtBottom = useRef(true);
  const typingDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSeenCount = useRef(0);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const channelsQuery = useQuery(api.chat.getChannels);
  const channels: Channel[] = (() => {
    if (Array.isArray(channelsQuery)) return channelsQuery;
    if (channelsQuery && typeof channelsQuery === 'object' && 'channels' in channelsQuery) {
      return Array.isArray((channelsQuery as any).channels) ? (channelsQuery as any).channels : [];
    }
    return [];
  })();

  const messagesQuery = useQuery(api.chat.getMessages, { limit: 100 }) as MensajeChat[] | undefined;
  const typing = (useQuery(api.chat.getTypingUsers, { channelId: currentChannel, excludeUserId: usuario?.id || "" }) || []) as string[];
  const sendMessageMutation = useMutation(api.chat.sendMessage);
  const setTypingMutation = useMutation(api.chat.setTyping);

  const messages: MensajeChat[] = (() => {
    if (!messagesQuery) return [];
    if (Array.isArray(messagesQuery)) return messagesQuery;
    return [];
  })();

  const channelMessages = messages.filter(m => m.channelId === currentChannel || (!m.channelId && currentChannel === "global"));

  useEffect(() => {
    if (typing.length > 0) {
      setTypingUsers(typing);
    }
  }, [typing]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      showToast('warning', 'Tu navegador no soporta notificaciones');
      return;
    }
    
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        showToast('success', 'Notificaciones habilitadas');
      }
    } else {
      showToast('warning', 'Notificaciones bloqueadas');
    }
  }, [showToast]);

  const showSystemNotification = useCallback((title: string, body: string) => {
    if (!notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: '/logo.png',
      tag: 'chat-message',
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      onOpen();
      notification.close();
    };

    setTimeout(() => notification.close(), 8000);
  }, [notificationsEnabled, onOpen]);

  const playNotificationSound = useCallback(() => {
    soundManager.playNotification(mentionsMe ? 'mention' : 'chat');
  }, [mentionsMe]);

  const showInAppNotification = useCallback(() => {
    setShowNotificationBadge(true);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotificationBadge(false);
    }, 5000);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowNotificationBadge(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !usuario || channelMessages.length === 0) return;

    const latestMsg = channelMessages[channelMessages.length - 1];
    const prevCount = lastSeenCount.current;
    
    if (channelMessages.length > prevCount && prevCount > 0) {
      if (latestMsg && latestMsg.userId !== usuario.id) {
        if (!isOpen) {
          playNotificationSound();
          showInAppNotification();
          showSystemNotification(
            latestMsg.nombre || 'Nuevo mensaje',
            latestMsg.texto?.substring(0, 100) || ''
          );
        } else if (!isAtBottom.current) {
          setNewMessagesCount(prev => prev + (channelMessages.length - prevCount));
        }

        if (usuario && latestMsg.texto?.includes(`@${usuario.usuario}`)) {
          setMentionsMe(true);
          setTimeout(() => setMentionsMe(false), 5000);
        }
      }
    }

    lastSeenCount.current = channelMessages.length;
  }, [channelMessages, usuario, isOpen, playNotificationSound, showInAppNotification, showSystemNotification]);

  useEffect(() => {
    if (isOpen) {
      isAtBottom.current = true;
      lastSeenCount.current = 0;
      setNewMessagesCount(0);
    }
  }, [isOpen, currentChannel]);

  useEffect(() => {
    if (!isOpen || !messagesEndRef.current) return;
    
    if (isAtBottom.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channelMessages.length, isOpen]);

  const handleTyping = useCallback(() => {
    if (!usuario || !currentChannel) return;
    
    if (!isTypingRef.current) isTypingRef.current = true;
    
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
    
    typingDebounceRef.current = setTimeout(async () => {
      try {
        await setTypingMutation({ channelId: currentChannel, userId: usuario.id, nombre: usuario.usuario || usuario.nombre });
      } catch (e) {
        logger.error("Failed to set typing", e);
      }
      isTypingRef.current = false;
    }, TYPING_DEBOUNCE);
  }, [usuario, currentChannel, setTypingMutation]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    isAtBottom.current = distanceFromBottom < 100;
    
    if (isAtBottom.current) {
      setNewMessagesCount(0);
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;
    setUploading(true);
    try {
      const url = await ImageUploadService.uploadImage(file);
      setAttachedImage(url);
    } catch (err) {
      showToast('error', "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!usuario || uploading) return;
    
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          setUploading(true);
          try {
            const url = await ImageUploadService.uploadImage(file);
            setAttachedImage(url);
            showToast('success', "Imagen pegada");
          } catch (err) {
            showToast('error', "Error al subir imagen");
          } finally {
            setUploading(false);
          }
        }
        break;
      }
    }
  }, [usuario, uploading, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !attachedImage) || !usuario || usuario.id === 'guest') return;
    
    const sentText = text.trim();
    const sentImg = attachedImage;
    setText('');
    setAttachedImage(null);
    isAtBottom.current = true;
    setNewMessagesCount(0);
    
    try {
      soundManager.playMessageSend();
      await sendMessageMutation({
        userId: usuario.id,
        nombre: usuario.usuario || usuario.nombre,
        avatar: usuario.avatar,
        texto: sentText || (sentImg ? "📷 Imagen" : ""),
        imagenUrl: sentImg || undefined,
        channelId: currentChannel,
      });
    } catch (err) {
      logger.error("Failed to send msg", err);
    }
  };

  const insertEmoji = (emoji: string) => setText(prev => prev + emoji);

  const formatText = (content: string) => {
    if (!content) return "";
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-primary font-black bg-primary/10 px-1 rounded">{part}</span>;
      }
      return part;
    });
  };

  const formatTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0]} está escribiendo...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} y ${typingUsers[1]} están escribiendo...`;
    return `${typingUsers.length} usuarios están escribiendo...`;
  };

  const scrollToBottom = useCallback(() => {
    isAtBottom.current = true;
    setNewMessagesCount(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleChannelChange = (channelId: string) => {
    setCurrentChannel(channelId);
    lastSeenCount.current = 0;
    setNewMessagesCount(0);
    isAtBottom.current = true;
  };

  if (!isOpen) return (
    <div className="relative">
      <button 
        onClick={onOpen}
        className={`fixed bottom-24 right-4 sm:bottom-24 sm:right-6 z-[60] size-12 rounded-xl flex items-center justify-center shadow-xl transition-all hover:scale-110 group ${showNotificationBadge ? 'bg-gradient-to-br from-yellow-500 to-orange-500 animate-pulse' : mentionsMe ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-br from-indigo-600 to-purple-700'}`}
      >
        <span className="material-symbols-outlined text-2xl text-white relative z-10">forum</span>
        
        {showNotificationBadge && !mentionsMe && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-black border-2 border-white animate-bounce">
            <span className="material-symbols-outlined text-xs">notifications_active</span>
          </span>
        )}
        
        {mentionsMe && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border border-white"></span>
          </span>
        )}
        {newMessagesCount > 0 && !mentionsMe && !showNotificationBadge && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white border-2 border-white">
            {newMessagesCount > 9 ? '9+' : newMessagesCount}
          </span>
        )}
      </button>
    </div>
  );

  return (
    <div className="fixed bottom-2 left-2 right-2 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[380px] md:w-[480px] bg-black/95 backdrop-blur-3xl border border-white/20 rounded-2xl z-[900] shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col h-[calc(100dvh-5rem)] sm:h-[560px] animate-in zoom-in-95 fade-in duration-300 overflow-hidden">
      
      <div className="px-4 py-2 flex items-center justify-between cursor-pointer border-b border-white/5 bg-black/20" onClick={onClose}>
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-base animate-pulse">{isCommunityMode ? 'groups' : 'live_tv'}</span>
          </div>
          <div>
              <h3 className="text-[10px] font-black text-white tracking-[0.15em] leading-none">{isCommunityMode ? `CHAT: ${communityName || 'COMMUNITY'}` : 'TRADESHARE LIVE'}</h3>
              <div className="flex items-center gap-1">
                <span className="size-1 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[7px] font-medium text-gray-500 uppercase tracking-wider">{isCommunityMode ? communityName || 'Comunidad' : 'Sincronizado'}</span>
              </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {!notificationsEnabled && (
            <button 
              onClick={(e) => { e.stopPropagation(); requestNotificationPermission(); }}
              className="text-gray-500 hover:text-yellow-500 transition-colors p-1"
              title="Activar notificaciones"
            >
              <span className="material-symbols-outlined text-base">notifications_off</span>
            </button>
          )}
          {notificationsEnabled && (
            <div className="text-yellow-500 p-1" title="Notificaciones activas">
              <span className="material-symbols-outlined text-base">notifications</span>
            </div>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </div>

      {!isCommunityMode && channels.length > 0 && (
        <div className="flex gap-1 px-3 py-1.5 border-b border-white/5 overflow-x-auto no-scrollbar bg-black/20">
          {[{ _id: "global", name: "General", slug: "global", type: "global" as const }, ...channels].slice(0, 5).map(channel => (
            <button
              key={channel._id}
              onClick={() => handleChannelChange(channel._id)}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                currentChannel === channel._id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {channel.name}
            </button>
          ))}
        </div>
      )}

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-gradient-to-b from-transparent to-black/20"
      >
        {!usuario || usuario.id === 'guest' ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-4xl text-white/10 mb-3">lock</span>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Identifícate para participar</p>
          </div>
        ) : (
          <>
            <div ref={messagesStartRef} />
            
            {isLoadingMore && (
                <div className="flex justify-center py-2 animate-pulse">
                    <span className="material-symbols-outlined text-primary text-sm animate-spin">refresh</span>
                </div>
            )}
            
            {channelMessages.length === 0 && !isLoadingMore ? (
              <div className="text-center text-[9px] text-gray-600 font-black uppercase mt-10 tracking-[0.3em]">Sin mensajes aún</div>
            ) : (
              channelMessages.map((m, idx) => {
                const isMe = m.userId === usuario.id;
                const isAi = m.isAi;
                const isMention = usuario && m.texto?.includes(`@${usuario.usuario}`);

                return (
                  <div key={m._id || idx} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                    {!isMe && (
                      <div className="size-7 rounded-lg ring-1 ring-white/10 shadow-xl shrink-0 overflow-hidden">
                        <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 max-w-[80%]">
                        {!isMe && (
                            <span className={`text-[7px] font-bold tracking-[0.15em] ml-1 uppercase ${isAi ? 'text-purple-400' : 'text-gray-500/80'}`}>
                                {m.nombre}
                            </span>
                        )}
                        <div className={`px-3 py-2 rounded-2xl border transition-all ${
                            isMe ? 'bg-primary/10 border-primary/20 text-white rounded-br-none shadow-lg shadow-primary/5' : 
                            isMention ? 'bg-red-500/10 border-red-500/30 text-white rounded-bl-none animate-pulse shadow-lg shadow-red-500/5' :
                            'bg-white/[0.03] border-white/[0.05] text-gray-200 rounded-bl-none backdrop-blur-md shadow-sm'
                        }`}>
                          {m.imagenUrl && (
                            <div className="mb-1.5 rounded-lg overflow-hidden ring-1 ring-white/10">
                                <img src={m.imagenUrl} className="max-w-full h-auto cursor-zoom-in max-h-48" alt="" onClick={() => window.open(m.imagenUrl!, '_blank')} />
                            </div>
                          )}
                          <p className="text-[11px] leading-relaxed break-words">{formatText(m.texto || '')}</p>
                        </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {newMessagesCount > 0 && (
        <button 
          onClick={scrollToBottom}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-bounce flex items-center gap-2 z-10"
        >
          <span className="material-symbols-outlined text-sm">expand_more</span>
          {newMessagesCount} nuevo{newMessagesCount > 1 ? 's' : ''}
        </button>
      )}

      {formatTypingIndicator() && (
        <div className="px-6 py-2 text-[10px] text-gray-500 italic flex items-center gap-2 bg-black/20">
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
          {formatTypingIndicator()}
        </div>
      )}

      {usuario && usuario.id !== 'guest' && (
        <div className="p-3 bg-black/40 border-t border-white/10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {attachedImage && (
                <div className="flex items-center gap-2 animate-in zoom-in">
                    <div className="relative size-14 rounded-lg overflow-hidden ring-2 ring-primary">
                        <img src={attachedImage} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={() => setAttachedImage(null)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg">
                            <span className="material-symbols-outlined text-[9px]">close</span>
                        </button>
                    </div>
                    <span className="text-[9px] text-gray-500">Imagen lista para enviar</span>
                </div>
            )}
            <div className="flex items-center gap-1.5 bg-white/5 rounded-xl border border-white/10 px-2 py-1.5 focus-within:border-primary/40 focus-within:bg-white/5 transition-all">
              <input type="file" id="chat-img" className="hidden" accept="image/*" onChange={handleImageUpload} />
              <button 
                type="button" 
                onClick={() => document.getElementById('chat-img')?.click()}
                className={`size-8 rounded-lg flex items-center justify-center transition-colors ${uploading ? 'animate-pulse text-primary' : 'text-gray-500 hover:text-white'}`}
                disabled={uploading}
                title="Adjuntar imagen"
              >
                <span className="material-symbols-outlined text-base">{uploading ? 'cloud_upload' : 'add_photo_alternate'}</span>
              </button>
              
              <input
                type="text"
                value={text}
                onChange={e => { setText(e.target.value); handleTyping(); }}
                onPaste={handlePaste}
                placeholder="Escribe... (pega imagen con Ctrl+V)"
                className="flex-1 bg-transparent text-[11px] text-white px-1.5 outline-none placeholder-gray-600"
                maxLength={500}
              />

              <button 
                type="submit" 
                disabled={(!text.trim() && !attachedImage) || uploading} 
                className="size-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-md active:scale-95 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {['🚀', '📈', '📉', '🔥', '🧠', '💰'].map(emoji => (
                <button type="button" key={emoji} onClick={() => insertEmoji(emoji)} className="text-xs bg-white/5 hover:bg-white/10 size-6 flex items-center justify-center rounded-md border border-white/5 transition-colors">
                  {emoji}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}
    </div>
  );
});

LiveChatWidget.displayName = 'LiveChatWidget';

export default LiveChatWidget;
