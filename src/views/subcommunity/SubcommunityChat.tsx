import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface ChatMessage {
  _id: string;
  userId: string;
  nombre: string;
  avatar: string;
  texto: string;
  imagenUrl?: string;
  createdAt: number;
}

interface Props {
  subcommunityId: string;
  usuario: { id: string; nombre: string; avatar: string } | null;
  isMember: boolean;
}

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const OptimisticMessage: React.FC<{ nombre: string; avatar: string; texto: string }> = memo(({ nombre, avatar, texto }) => (
  <div className="flex gap-3 opacity-60 animate-pulse px-1">
    <div className="size-8 rounded-full bg-white/10 flex-shrink-0 overflow-hidden">
      {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary/30" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-white/60 truncate">{nombre}</span>
        <span className="text-[9px] text-gray-600">enviando...</span>
      </div>
      <div className="bg-white/5 rounded-xl rounded-tl-none px-3 py-2">
        <p className="text-sm text-white/60 break-words">{texto}</p>
      </div>
    </div>
  </div>
));

const MessageBubble: React.FC<{
  msg: ChatMessage;
  isOwn: boolean;
  onDelete: (id: string) => void;
}> = memo(({ msg, isOwn, onDelete }) => {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className={`flex gap-3 px-1 group ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => isOwn && setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="size-8 rounded-full bg-white/10 flex-shrink-0 overflow-hidden">
        {msg.avatar ? (
          <img src={msg.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/30 flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">{msg.nombre?.[0]?.toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 relative">
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-bold text-white/70 truncate">{msg.nombre}</span>
          <span className="text-[9px] text-gray-500">{formatTime(msg.createdAt)}</span>
          {showDelete && (
            <button
              onClick={() => onDelete(msg._id)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          )}
        </div>
        <div className={`px-3 py-2 inline-block max-w-[85%] ${isOwn
          ? 'bg-primary/20 border border-primary/20 rounded-xl rounded-tr-none'
          : 'bg-white/5 border border-white/5 rounded-xl rounded-tl-none'
        }`}>
          <p className="text-sm text-white/90 break-words">{msg.texto}</p>
          {msg.imagenUrl && (
            <img src={msg.imagenUrl} alt="" className="mt-2 rounded-lg max-w-full max-h-48 object-cover" />
          )}
        </div>
      </div>
    </div>
  );
});

const SubcommunityChat: React.FC<Props> = ({ subcommunityId, usuario, isMember }) => {
  const [texto, setTexto] = useState('');
  const [optimistic, setOptimistic] = useState<{ nombre: string; avatar: string; texto: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messagesData = useQuery(api.subcommunityChat.getMessages, {
    subcommunityId: subcommunityId as any,
    limit: 50,
  });

  const sendMsg = useMutation(api.subcommunityChat.sendMessage);
  const deleteMsg = useMutation(api.subcommunityChat.deleteMessage);

  const messages: ChatMessage[] = (messagesData as any)?.messages ?? [];

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages.length, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (!texto.trim() || !usuario || !isMember) return;
    const text = texto.trim();
    setTexto('');
    setOptimistic(prev => [...prev, { nombre: usuario.nombre, avatar: usuario.avatar, texto: text }]);
    try {
      await sendMsg({
        subcommunityId: subcommunityId as any,
        userId: usuario.id,
        nombre: usuario.nombre,
        avatar: usuario.avatar,
        texto: text,
      });
    } catch {
      setTexto(text);
    } finally {
      setOptimistic(prev => prev.filter(m => m.texto !== text));
    }
  }, [texto, usuario, isMember, sendMsg, subcommunityId]);

  const handleDelete = useCallback(async (messageId: string) => {
    if (!usuario) return;
    try {
      await deleteMsg({ messageId: messageId as any, userId: usuario.id, subcommunityId: subcommunityId as any });
    } catch { /* no-op */ }
  }, [usuario, deleteMsg, subcommunityId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f1115]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.length === 0 && optimistic.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
            <span className="material-symbols-outlined text-4xl text-gray-500">forum</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sin mensajes aún</span>
            <span className="text-[10px] text-gray-600">Sé el primero en escribir</span>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            msg={msg}
            isOwn={msg.userId === usuario?.id}
            onDelete={handleDelete}
          />
        ))}
        {optimistic.map((opt, i) => (
          <OptimisticMessage key={`opt-${i}`} {...opt} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/5 p-3">
        {isMember ? (
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              maxLength={500}
            />
            <button
              onClick={handleSend}
              disabled={!texto.trim()}
              className="size-9 rounded-lg bg-primary hover:bg-blue-600 disabled:bg-white/5 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all flex-shrink-0"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl border border-white/10">
            <span className="material-symbols-outlined text-gray-500 text-lg">lock</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Solo miembros pueden enviar mensajes</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(SubcommunityChat);
