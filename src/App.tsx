import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from './api';
import { ChatMessage } from './types';
import { Send, ImagePlus, X, Smile, AlertCircle, Plus, Lock, Server, Users, MessageSquare, HardDrive, Search, LogOut, FileText, FileSpreadsheet, FileCode, Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { useUserStore } from './store';
import Onboarding from './components/Onboarding';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { parseFile } from './lib/fileParser';

const EMOJIS = ['🚀', '📈', '📉', '🔥', '🧠', '💰', '❤️', '👍', '🎯', '⚡'];
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'; // Delicate blip

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
  
  // User state
  const { user, logout } = useUserStore();
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [parsingFile, setParsingFile] = useState(false);
  
  // Audio/Speech
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Convex
  const searchedUsers = useQuery(api.users.searchUsers, { query: userSearchQuery });
  const getOrCreateDM = useMutation(api.chat.getOrCreatePrivateChannel);

  // Safe Convex queries
  const rawChannels = useQuery(api.chat.getChannels);
  const channels = Array.isArray(rawChannels) ? rawChannels as { _id: string; name: string; slug: string; isPrivate?: boolean }[] : [];
  
  const rawMessagesData = useQuery(api.chat.getMessagesByChannel, { channelId: currentChannel, limit: 100 });
  const messages = (rawMessagesData?.messages && Array.isArray(rawMessagesData.messages)) ? rawMessagesData.messages as ChatMessage[] : [];
  
  const rawTypingUsers = useQuery(api.chat.getTypingUsers, { channelId: currentChannel, excludeUserId: user?._id || 'guest' });
  const typingUsers = Array.isArray(rawTypingUsers) ? rawTypingUsers : [];
  
  const sendMessage = useMutation(api.chat.sendMessage);
  const setTyping = useMutation(api.chat.setTyping);
  const createChannel = useMutation(api.chat.createChannel);
  const verifyPasswordMutation = useMutation(api.chat.verifyChannelPasswordMutation);
  
  const rawServerStats = useQuery(api.chat.getServerStats);
  const serverStats = rawServerStats && typeof rawServerStats === 'object' 
    ? { ...DEFAULT_SERVER_STATS, ...rawServerStats }
    : DEFAULT_SERVER_STATS;

  // Notifications Sound
  const lastMessageId = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMessageId.current && lastMessageId.current !== lastMsg._id && lastMsg.userId !== user?._id) {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }
      lastMessageId.current = lastMsg._id || null;
    }
  }, [messages, user?._id]);

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
    if (!user) return;
    setTyping({ channelId: currentChannel, userId: user._id, nombre: user.name });
  }, [setTyping, currentChannel, user]);

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      const result = await createChannel({
        name: newChannelName.trim(),
        password: newChannelPassword.trim() || undefined,
        createdBy: user?._id || 'guest',
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

  const handlePasswordSubmit = async () => {
    if (!selectedPrivateChannel) return;
    try {
      const result = await verifyPasswordMutation({
        channelSlug: selectedPrivateChannel,
        password: passwordInput
      });
      if (result.valid) {
        setVerifiedChannels(prev => [...prev, selectedPrivateChannel]);
        setCurrentChannel(selectedPrivateChannel);
        setShowPasswordModal(false);
        setPasswordInput('');
        setSelectedPrivateChannel(null);
      } else {
        setError(result.reason || 'Contraseña incorrecta');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Error al verificar contraseña');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type.startsWith('image/')) {
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
    } else {
      setParsingFile(true);
      try {
        const text = await parseFile(file);
        if (text) {
          setText(prev => prev + (prev ? '\n' : '') + text);
        }
      } catch (err) {
        console.error('Error parsing file:', err);
        setError("Error al procesar el archivo");
        setTimeout(() => setError(null), 3000);
      } finally {
        setParsingFile(false);
      }
    }
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setAttachedImage(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }, []);

  const startSpeechToText = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Tu navegador no soporta reconocimiento de voz");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-AR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsRecording(true);
    recognition.onerror = (e: any) => {
      console.error('Speech error', e);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        setText(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !attachedImage) || uploading || parsingFile) return;
    
    try {
      if (!user) throw new Error("Debes iniciar sesión");
      await sendMessage({
        userId: user._id,
        nombre: user.name,
        avatar: user.avatar,
        texto: text.trim(),
        imagenUrl: attachedImage || undefined,
        channelId: currentChannel,
      });
      setText('');
      setAttachedImage(null);
      setShowEmoji(false);
      if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error al enviar mensaje');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatText = (content: string) => {
    if (!content) return '';
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                className="rounded-lg text-[10px] my-2"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={`${className} bg-white/10 px-1 rounded text-[10px]`} {...props}>
                {children}
              </code>
            );
          },
          a({ node, children, ...props }: any) {
            return (
              <a className="text-primary hover:underline font-bold" target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
          p({ children }: any) {
            return <p className="mb-1 last:mb-0">{children}</p>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const startDM = async (otherUser: any) => {
    if (!user) return;
    try {
      const channel = await getOrCreateDM({ user1Id: user._id, user2Id: otherUser._id });
      setCurrentChannel(channel.slug);
      setShowUserSearch(false);
      setUserSearchQuery('');
    } catch (err) {
      console.error('Error starting DM:', err);
    }
  };

  if (!user) return <Onboarding />;

  return (
    <div className="flex flex-col h-screen bg-[#0f1115]">
      <audio ref={audioRef} src={NOTIFICATION_SOUND} preload="auto" />
      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-900/30 border-b border-red-500/30 flex items-center gap-2 text-red-400 text-xs shrink-0">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-black/30 flex items-center justify-between shrink-0">
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
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
              <img src={user.avatar} className="w-5 h-5 rounded-md" alt="" />
              <span className="text-[10px] text-white font-bold">{user.username}</span>
            </div>
            <button onClick={() => logout()} className="p-2 text-gray-500 hover:text-white transition-colors" title="Cerrar Sesión">
              <LogOut size={14} />
            </button>
          </div>
        </div>
        
        {/* Channel Selector */}
        <div className="px-4 py-2 bg-black/20 border-b border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-gray-500 uppercase font-bold shrink-0">Sala:</span>
            <div className="flex flex-1 gap-1">
              <button
                onClick={() => handleChannelSelect({ slug: 'global', isPrivate: false })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${currentChannel === 'global' ? 'bg-primary text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
              >
                General
              </button>
              {channels.filter(c => c.slug !== 'global').map(channel => (
                <button
                  key={channel._id}
                  onClick={() => handleChannelSelect(channel)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 shrink-0 ${currentChannel === channel.slug ? 'bg-primary text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                >
                  {channel.isPrivate ? <Lock size={10} /> : null}
                  {channel.name}
                </button>
              ))}
              <button onClick={() => setShowCreateChannel(true)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 transition-all flex items-center gap-1 shrink-0">
                <Plus size={10} />
                Nueva
              </button>
              <button onClick={() => setShowUserSearch(true)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center gap-1 border border-primary/20 shrink-0">
                <Search size={10} />
                Privado
              </button>
            </div>
            <button onClick={() => setShowStats(!showStats)} className={`p-2 rounded-lg text-xs transition-all shrink-0 ${showStats ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              <Server size={14} />
            </button>
          </div>
        </div>
        
        {showStats && (
          <div className="px-4 py-3 bg-black/40 border-b border-white/5 grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-400 text-[10px] mb-1 flex items-center gap-1"><MessageSquare size={10}/> Hoy</div>
              <div className="text-sm font-bold text-white">{serverStats.todayMessages}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-400 text-[10px] mb-1 flex items-center gap-1"><Users size={10}/> Activos</div>
              <div className="text-sm font-bold text-white">{serverStats.activeUsers}</div>
            </div>
          </div>
        )}

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-4xl text-white/10 mb-3">chat</span>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Sin mensajes aún</p>
          </div>
        ) : (
          messages.map((m: ChatMessage, idx: number) => {
            const isMe = m.userId === user._id;
            return (
              <div key={m._id || idx} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} message-enter`}>
                {!isMe && (
                  <div className="w-8 h-8 rounded-xl ring-1 ring-white/10 shrink-0 overflow-hidden">
                    <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`flex flex-col gap-1 max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <span className="text-[10px] font-bold text-gray-500 ml-1">{m.nombre}</span>}
                  <div className={`px-4 py-2.5 rounded-2xl ${isMe ? 'bg-primary/20 text-white rounded-br-none border border-primary/20' : 'bg-white/[0.04] text-gray-200 rounded-bl-none border border-white/5'}`}>
                    {m.imagenUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden ring-1 ring-white/10">
                        <img src={m.imagenUrl} className="max-w-full h-auto max-h-64 cursor-pointer" alt="" onClick={() => window.open(m.imagenUrl!, '_blank')} />
                      </div>
                    )}
                    <div className="text-[11px] leading-relaxed break-words">{formatText(m.texto || '')}</div>
                  </div>
                  <span className="text-[9px] text-gray-600 px-1">{formatTime(m.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing & Recording Indicators */}
      {(typingUsers.length > 0 || isRecording) && (
        <div className="px-4 py-2 text-[10px] text-gray-500 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2">
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 italic">
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                </span>
                {typingUsers.join(', ')} escribiendo...
              </div>
            )}
          </div>
          {isRecording && (
            <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
              <Mic size={12} />
              <span>Escuchando...</span>
            </div>
          )}
        </div>
      )}

       {/* Input */}
       <div className="px-4 py-3 bg-black/30 border-t border-white/10 shrink-0 space-y-3">
         {attachedImage && (
           <div className="flex items-center gap-2">
             <div className="relative w-16 h-16 rounded-xl overflow-hidden ring-2 ring-primary">
               <img src={attachedImage} className="w-full h-full object-cover" alt="" />
               <button type="button" onClick={() => setAttachedImage(null)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg hover:bg-red-600 transition-colors">
                 <X size={12} />
               </button>
             </div>
             <span className="text-[10px] text-gray-500">Imagen adjunta</span>
           </div>
         )}

         <form onSubmit={handleSubmit} className="flex items-end gap-2">
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf,.docx,.xlsx,.xls,.csv" onChange={handleImageUpload} />
           
           <button 
             type="button" 
             onClick={() => fileInputRef.current?.click()} 
             className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all shrink-0"
             disabled={uploading || parsingFile}
           >
             {uploading || parsingFile ? <Loader2 className="animate-spin" size={18} /> : <Plus size={20} />}
           </button>

           <div className="flex-1 flex flex-col bg-white/5 rounded-2xl border border-white/10 px-4 py-2 focus-within:border-primary/50 transition-all">
             <textarea
               value={text}
               onChange={e => { setText(e.target.value); handleTyping(); }}
               onPaste={handlePaste}
               placeholder={isRecording ? "Hablale a Aurora..." : "Mensaje... (Pega imágenes o archivos)"}
               className="bg-transparent text-xs text-white outline-none placeholder-gray-600 leading-relaxed resize-none min-h-[24px] max-h-32 py-1"
               rows={1}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSubmit(e);
                 }
               }}
             />
             <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="text-gray-500 hover:text-gray-300 transition-colors"><Smile size={16} /></button>
                <div className="text-[9px] text-gray-700 font-mono">{text.length}/500</div>
             </div>
           </div>

           <div className="flex flex-col gap-1">
             <button 
                type="button" 
                onClick={startSpeechToText}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 ${isRecording ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}
                title="Dictar mensaje (Voz a Texto)"
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
             </button>
             <button 
                type="submit" 
                disabled={(!text.trim() && !attachedImage) || uploading || parsingFile} 
                className="w-10 h-10 rounded-2xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-all disabled:opacity-30 shrink-0 shadow-lg shadow-primary/20"
              >
                <Send size={18} />
             </button>
           </div>
         </form>

         {showEmoji && (
           <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar border-t border-white/5">
             {EMOJIS.map(emoji => (
               <button type="button" key={emoji} onClick={() => { setText(prev => prev + emoji); setShowEmoji(false); }} className="text-lg hover:scale-125 transition-transform shrink-0">{emoji}</button>
             ))}
           </div>
         )}
       </div>

        {/* Modals */}
        {showCreateChannel && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 w-full max-w-sm space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Crear Canal</h3>
                <button onClick={() => setShowCreateChannel(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <input type="text" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="Nombre del canal" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary transition-all" />
                <input type="password" value={newChannelPassword} onChange={e => setNewChannelPassword(e.target.value)} placeholder="Contraseña (opcional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary transition-all" />
              </div>
              <button onClick={handleCreateChannel} disabled={!newChannelName.trim()} className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-4 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-primary/20">Crear Canal</button>
            </div>
          </div>
        )}

        {showPasswordModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 w-full max-w-sm space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Lock size={18} className="text-primary" /> CANAL PRIVADO</h3>
                <button onClick={() => { setShowPasswordModal(false); setSelectedPrivateChannel(null); }} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Ingresa la clave de acceso</p>
              <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Contraseña..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary transition-all" autoFocus onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()} />
              <button onClick={handlePasswordSubmit} className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-primary/20">Acceder</button>
            </div>
          </div>
        )}

        {showUserSearch && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 w-full max-w-sm space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Search size={18} className="text-primary" /> BUSCAR USUARIO</h3>
                <button onClick={() => { setShowUserSearch(false); setUserSearchQuery(''); }} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <input type="text" value={userSearchQuery} onChange={e => setUserSearchQuery(e.target.value)} placeholder="Nombre o @usuario..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary transition-all" autoFocus />
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {searchedUsers?.filter(u => u._id !== user._id).map(u => (
                  <button key={u._id} onClick={() => startDM(u)} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-left">
                    <img src={u.avatar} className="w-10 h-10 rounded-xl shadow-lg" alt="" />
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-white">{u.name}</div>
                      <div className="text-[10px] text-gray-500">@{u.username}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
