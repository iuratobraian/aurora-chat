import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from './api';
import { ChatMessage } from './types';
import { Send, ImagePlus, X, Smile, AlertCircle, Plus, Lock, Server, Users, MessageSquare, HardDrive } from 'lucide-react';

const EMOJIS = ['🚀', '📈', '📉', '🔥', '🧠', '💰', '❤️', '👍', '🎯', '⚡'];

const DEFAULT_SERVER_STATS = {
  totalMessages: 0,
  todayMessages: 0,
  weekMessages: 0,
  totalChannels: 0,
  activeUsers: 0,
  estimatedStorageKB: 0,
  storagePercentage: 0
};

export default function AuroraChat() {
  const [text, setText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChannel, setCurrentChannel] = useState<string>('global');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelPassword, setNewChannelPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedPrivateChannel, setSelectedPrivateChannel] = useState<string | null>(null);
  const [verifiedChannels, setVerifiedChannels] = useState<string[]>(['global']);
  const [showStats, setShowStats] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAtBottom = useRef(true);

  // Safe Convex queries with proper null checks
  const rawChannels = useQuery(api.chat.getChannels);
  const channels = Array.isArray(rawChannels) ? rawChannels as { _id: string; name: string; slug: string; isPrivate?: boolean }[] : [];
  
  const rawMessagesData = useQuery(api.chat.getMessagesByChannel, { channelId: currentChannel, limit: 100 });
  const messages = (rawMessagesData?.messages && Array.isArray(rawMessagesData.messages)) ? rawMessagesData.messages as ChatMessage[] : [];
  
  const rawTypingUsers = useQuery(api.chat.getTypingUsers, { channelId: currentChannel, excludeUserId: 'aurora-user' });
  const typingUsers = Array.isArray(rawTypingUsers) ? rawTypingUsers : [];
  
  const sendMessage = useMutation(api.chat.sendMessage);
  const setTyping = useMutation(api.chat.setTyping);
  const createChannel = useMutation(api.chat.createChannel);
  
  const verifyPasswordQuery = useQuery(api.chat.verifyChannelPassword, 
    showPasswordModal && selectedPrivateChannel ? { channelSlug: selectedPrivateChannel, password: passwordInput } : undefined
  );
  const verifyPassword = verifyPasswordQuery && typeof verifyPasswordQuery === 'object' ? verifyPasswordQuery : null;
  
  const rawServerStats = useQuery(api.chat.getServerStats);
  const serverStats = rawServerStats && typeof rawServerStats === 'object' 
    ? { ...DEFAULT_SERVER_STATS, ...rawServerStats }
    : DEFAULT_SERVER_STATS;

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
    setTyping({ channelId: currentChannel, userId: 'aurora-user', nombre: 'Tú' });
  }, [setTyping, currentChannel]);

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      const result = await createChannel({
        name: newChannelName.trim(),
        password: newChannelPassword.trim() || undefined,
        createdBy: 'aurora-user',
      });
      setShowCreateChannel(false);
      setNewChannelName('');
      setNewChannelPassword('');
      setCurrentChannel(result.slug);
      setVerifiedChannels(prev => [...prev, result.slug]);
    } catch (err: any) {
      setError(err.message || 'Error al crear canal');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleChannelSelect = (channel: { slug: string; isPrivate?: boolean }) => {
    if (channel.isPrivate && !verifiedChannels.includes(channel.slug)) {
      setSelectedPrivateChannel(channel.slug);
      setShowPasswordModal(true);
      setPasswordInput('');
    } else {
      setCurrentChannel(channel.slug);
    }
  };

  const handlePasswordSubmit = () => {
    if (!selectedPrivateChannel) return;
    if (verifyPassword?.valid) {
      setVerifiedChannels(prev => [...prev, selectedPrivateChannel]);
      setCurrentChannel(selectedPrivateChannel);
      setShowPasswordModal(false);
      setPasswordInput('');
      setSelectedPrivateChannel(null);
    } else {
      setError('Contraseña incorrecta');
      setTimeout(() => setError(null), 3000);
    }
  };

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
    if ((!text.trim() && !attachedImage) || uploading) return;
    
    try {
      await sendMessage({
        userId: 'aurora-user',
        nombre: 'Tú',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aurora-user',
        texto: text.trim(),
        imagenUrl: attachedImage || undefined,
        channelId: currentChannel,
      });
      setText('');
      setAttachedImage(null);
      setShowEmoji(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error al enviar mensaje');
      setTimeout(() => setError(null), 3000);
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
      <div className="px-4 py-3 border-b border-white/10 bg-black/30 flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-3">
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
        
        {/* Channel Selector - Simple Dropdown */}
        <div className="px-4 py-2 bg-black/20 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Sala:</span>
            <div className="flex-1 flex flex-wrap gap-1">
              <button
                onClick={() => handleChannelSelect({ slug: 'global', isPrivate: false })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currentChannel === 'global'
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                General
              </button>
              {channels.filter(c => c.slug !== 'global').map(channel => (
                <button
                  key={channel._id}
                  onClick={() => handleChannelSelect(channel)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    currentChannel === channel.slug
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {channel.isPrivate ? <Lock size={10} /> : null}
                  {channel.name}
                </button>
              ))}
              <button
                onClick={() => setShowCreateChannel(true)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1"
              >
                <Plus size={10} />
                Nueva
              </button>
            </div>
            <button
              onClick={() => setShowStats(!showStats)}
              className={`p-2 rounded-lg text-xs transition-all ${showStats ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
              title="Estadísticas"
            >
              <Server size={14} />
            </button>
          </div>
        </div>
        
        {/* Server Stats Panel */}
        {showStats && serverStats && (
          <div className="px-4 py-3 bg-black/40 border-b border-white/5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-1 text-gray-400 text-[10px] mb-1">
                  <MessageSquare size={10} />
                  <span>Mensajes Hoy</span>
                </div>
                <div className="text-lg font-bold text-white">{serverStats.todayMessages}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-1 text-gray-400 text-[10px] mb-1">
                  <Users size={10} />
                  <span>Usuarios Activos</span>
                </div>
                <div className="text-lg font-bold text-white">{serverStats.activeUsers}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-1 text-gray-400 text-[10px] mb-1">
                  <MessageSquare size={10} />
                  <span>Total Mensajes</span>
                </div>
                <div className="text-lg font-bold text-white">{serverStats.totalMessages}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-1 text-gray-400 text-[10px] mb-1">
                  <Server size={10} />
                  <span>Canales</span>
                </div>
                <div className="text-lg font-bold text-white">{serverStats.totalChannels}</div>
              </div>
            </div>
            
            {/* Storage Progress Bar */}
            <div className="bg-white/5 rounded-lg p-2">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <div className="flex items-center gap-1 text-gray-400">
                  <HardDrive size={10} />
                  <span>Almacenamiento</span>
                </div>
                <span className="text-white font-medium">{serverStats.estimatedStorageKB} KB / 5 MB</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    serverStats.storagePercentage > 80 ? 'bg-red-500' : serverStats.storagePercentage > 50 ? 'bg-yellow-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${serverStats.storagePercentage}%` }}
                />
              </div>
              <div className="text-[9px] text-gray-500 mt-1 text-right">
                {serverStats.storagePercentage}% usado
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-4xl text-white/10 mb-3">chat</span>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Sin mensajes aún</p>
          </div>
        ) : (
          messages.map((m: ChatMessage, idx: number) => {
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

        {/* Create Channel Modal */}
        {showCreateChannel && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4 w-full max-w-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Crear Canal</h3>
                <button onClick={() => setShowCreateChannel(false)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <input
                type="text"
                value={newChannelName}
                onChange={e => setNewChannelName(e.target.value)}
                placeholder="Nombre del canal"
                className="w-full bg-[#2d2d2d] border border-[#3f3f3f] rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
              />
              <input
                type="password"
                value={newChannelPassword}
                onChange={e => setNewChannelPassword(e.target.value)}
                placeholder="Contraseña (opcional)"
                className="w-full bg-[#2d2d2d] border border-[#3f3f3f] rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
              />
              <button
                onClick={handleCreateChannel}
                disabled={!newChannelName.trim()}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-2 rounded-lg text-sm font-bold transition-colors"
              >
                Crear Canal
              </button>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4 w-full max-w-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock size={16} />
                  Canal Privado
                </h3>
                <button onClick={() => { setShowPasswordModal(false); setSelectedPrivateChannel(null); }} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-400">Este canal requiere contraseña</p>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Ingresa la contraseña"
                className="w-full bg-[#2d2d2d] border border-[#3f3f3f] rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
                onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
              />
              <button
                onClick={handlePasswordSubmit}
                className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg text-sm font-bold transition-colors"
              >
                Unirse
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
