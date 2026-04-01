import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from './api';
import { ChatMessage } from './types';
import { Send, ImagePlus, X, Smile, AlertCircle } from 'lucide-react';

const EMOJIS = ['🚀', '📈', '📉', '🔥', '🧠', '💰', '❤️', '👍', '🎯', '⚡'];

export default function AuroraChat() {
  const [text, setText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAtBottom = useRef(true);

  const messages = (useQuery(api.chat.getMessages, { limit: 100 }) as ChatMessage[] | undefined) || [];
  const typingUsers = (useQuery(api.chat.getTypingUsers, { channelId: 'global', excludeUserId: 'aurora-user' }) || []) as string[];
  const sendMessage = useMutation(api.chat.sendMessage);
  const setTyping = useMutation(api.chat.setTyping);

  // Error handling
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Chat Error:', event.error);
      setError(event.message);
      setTimeout(() => setError(null), 5000);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    if (isAtBottom.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    isAtBottom.current = scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  const handleTyping = useCallback(() => {
    setTyping({ channelId: 'global', userId: 'aurora-user', nombre: 'Tú' });
  }, [setTyping]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch {
      console.error('Error al leer imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !attachedImage) return;
    const sentText = text.trim();
    const sentImg = attachedImage;
    setText('');
    setAttachedImage(null);
    setShowEmoji(false);
    try {
      await sendMessage({
        userId: 'aurora-user',
        nombre: 'Tú',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=aurora&backgroundColor=6c63ff',
        texto: sentText || (sentImg ? '📷 Imagen' : ''),
        imagenUrl: sentImg || undefined,
        channelId: 'global',
      });
    } catch (err) {
      console.error('Error al enviar:', err);
    }
  };

  const formatText = (content: string) => {
    if (!content) return '';
    return content.split(/(@\w+)/g).map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-primary font-bold bg-primary/10 px-1 rounded">{part}</span>;
      }
      return part;
    });
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f1115]">
      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-900/30 border-b border-red-500/30 flex items-center gap-2 text-red-400 text-xs shrink-0">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-black/30 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
        </div>
        <div>
          <h3 className="text-xs font-bold text-white tracking-wider">AURORA CHAT</h3>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-gray-500 uppercase">En línea</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-4xl text-white/10 mb-3">chat</span>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Sin mensajes aún</p>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isMe = m.userId === 'aurora-user';
            return (
              <div key={m._id || idx} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} message-enter`}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-lg ring-1 ring-white/10 shrink-0 overflow-hidden">
                    <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`flex flex-col gap-0.5 max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <span className="text-[9px] font-bold text-gray-500 ml-1">{m.nombre}</span>}
                  <div className={`px-3 py-2 rounded-2xl ${isMe ? 'bg-primary/15 text-white rounded-br-none' : 'bg-white/[0.04] text-gray-200 rounded-bl-none'}`}>
                    {m.imagenUrl && (
                      <div className="mb-1.5 rounded-lg overflow-hidden ring-1 ring-white/10">
                        <img src={m.imagenUrl} className="max-w-full h-auto max-h-48 cursor-pointer" alt="" onClick={() => window.open(m.imagenUrl!, '_blank')} />
                      </div>
                    )}
                    <p className="text-[11px] leading-relaxed break-words">{formatText(m.texto || '')}</p>
                  </div>
                  <span className="text-[8px] text-gray-600 px-1">{formatTime(m.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1.5 text-[10px] text-gray-500 italic flex items-center gap-2 bg-black/20">
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
          {typingUsers.join(', ')} escribiendo...
        </div>
      )}

       {/* Input */}
       <div className="px-4 py-3 bg-black/30 border-t border-white/10 shrink-0 space-y-3">
         {attachedImage && (
           <div className="flex items-center gap-2">
             <div className="relative w-14 h-14 rounded-lg overflow-hidden ring-2 ring-primary">
               <img src={attachedImage} className="w-full h-full object-cover" alt="" />
               <button type="button" onClick={() => setAttachedImage(null)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg hover:bg-red-600 transition-colors">
                 <X size={10} />
               </button>
             </div>
             <span className="text-[9px] text-gray-500">Imagen lista para enviar</span>
           </div>
         )}

         <form onSubmit={handleSubmit} className="flex items-center gap-2">
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
           
           {/* Plus button - Add image */}
           <button 
             type="button" 
             onClick={() => fileInputRef.current?.click()} 
             className="w-9 h-9 rounded-full flex items-center justify-center bg-[#2d2d2d] border border-[#3f3f3f] text-gray-400 hover:text-white hover:bg-[#3d3d3d] transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
             disabled={uploading}
             title="Add an image"
           >
             {uploading ? (
               <span className="animate-spin text-xs">⏳</span>
             ) : (
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
               </svg>
             )}
           </button>

           {/* Message input container */}
           <div className="flex-1 flex items-center bg-[#2d2d2d] rounded-full border border-[#3f3f3f] px-5 py-2.5 focus-within:border-[#4f4f4f] transition-all duration-200">
             <input
               type="text"
               value={text}
               onChange={e => { setText(e.target.value); handleTyping(); }}
               placeholder="Message..."
               className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-500 leading-tight"
               maxLength={500}
             />
             <button 
               type="button" 
               onClick={() => setShowEmoji(!showEmoji)} 
               className="text-gray-400 hover:text-white ml-2 transition-colors flex-shrink-0"
               title="Add emoji"
             >
               <Smile size={18} />
             </button>
           </div>

           {/* Send button */}
           <button 
             type="submit" 
             disabled={(!text.trim() && !attachedImage) || uploading} 
             className="w-9 h-9 rounded-full bg-[#2d2d2d] border border-[#3f3f3f] text-white flex items-center justify-center active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 hover:bg-[#3d3d3d] flex-shrink-0"
             title="Send message"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M3 20.5V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16.5a.5.5 0 0 1-.75.433L12 15.075l-6.25 5.858A.5.5 0 0 1 5 20.5zm3-2.5l4.5-4.5L18 18V4H5v14z" />
             </svg>
           </button>
         </form>

         {/* Emoji picker */}
         {showEmoji && (
           <div className="flex gap-1 overflow-x-auto pb-1 pt-1">
             {EMOJIS.map(emoji => (
               <button 
                 type="button" 
                 key={emoji} 
                 onClick={() => { setText(prev => prev + emoji); setShowEmoji(false); }} 
                 className="text-sm bg-[#2d2d2d] hover:bg-[#3d3d3d] w-8 h-8 flex items-center justify-center rounded-lg border border-[#3f3f3f] transition-colors shrink-0"
               >
                 {emoji}
               </button>
             ))}
           </div>
         )}
       </div>
    </div>
  );
}
