import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from './api';
import { ChatMessage } from './types';
import { 
  Send, X, Smile, AlertCircle, Plus, Lock, Server, Users, 
  MessageSquare, HardDrive, Search, LogOut, FileText, 
  FileSpreadsheet, FileCode, Mic, MicOff, Loader2, Volume2, 
  Settings, User, Phone, Info, Camera, Clock, ChevronRight,
  MoreVertical, Hash
} from 'lucide-react';
import { useUserStore } from './store';
import Onboarding from './components/Onboarding';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { parseFile } from './lib/fileParser';
import imageCompression from 'browser-image-compression';
import { encryptMessage, decryptMessage } from './lib/encryption';

const EMOJIS = ['🚀', '📈', '📉', '🔥', '🧠', '💰', '❤️', '👍', '🎯', '⚡'];
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3';

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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewingProfileUser, setViewingProfileUser] = useState<any>(null);
  
  // User state
  const { user, setUser, logout } = useUserStore();
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [parsingFile, setParsingFile] = useState(false);
  
  // Profile editing state
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [editPrivacy, setEditPrivacy] = useState(user?.privacyMode || 'everyone');

  // Audio/Speech
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Convex
  const searchedUsers = useQuery(api.users.searchUsers, { query: userSearchQuery });
  const getOrCreateDM = useMutation(api.chat.getOrCreatePrivateChannel);
  const updateProfile = useMutation(api.users.updateProfile);
  const postStatus = useMutation(api.statuses.postStatus);
  const activeStatuses = useQuery(api.statuses.getActiveStatuses, user?._id ? { userId: user._id as any } : "skip");
  
  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);
  const acceptFriendRequest = useMutation(api.friends.acceptFriendRequest);
  const pendingFriendRequests = useQuery(api.friends.getPendingRequests, user?._id ? { userId: user._id as any } : "skip");
  const friendsList = useQuery(api.friends.getFriends, user?._id ? { userId: user._id as any } : "skip");

  // Safe Convex queries
  const rawChannels = useQuery(api.chat.getChannels);
  const channelsList = Array.isArray(rawChannels) ? rawChannels : [];
  
  const rawMessagesData = useQuery(api.chat.getMessagesByChannel, { channelId: currentChannel, limit: 100 });
  const messages = (rawMessagesData?.messages && Array.isArray(rawMessagesData.messages)) ? rawMessagesData.messages as ChatMessage[] : [];
  
  const rawTypingUsers = useQuery(api.chat.getTypingUsers, { channelId: currentChannel, excludeUserId: user?._id || 'guest' });
  const typingUsers = Array.isArray(rawTypingUsers) ? rawTypingUsers : [];
  
  const sendMessage = useMutation(api.chat.sendMessage);
  const setTyping = useMutation(api.chat.setTyping);
  const createChannel = useMutation(api.chat.createChannel);
  const verifyPasswordMutation = useMutation(api.chat.verifyChannelPasswordMutation);
  
  const rawServerStats = useQuery(api.chat.getServerStats);
  const serverStats = rawServerStats || null;

  // Notifications
  const lastMessageId = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMessageId.current && lastMessageId.current !== lastMsg._id && lastMsg.userId !== user?._id) {
        audioRef.current?.play().catch(() => {});
      }
      lastMessageId.current = lastMsg._id || null;
    }
  }, [messages, user?._id]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const isAtBottom = useRef(true);

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

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      const updatedUser = await updateProfile({
        userId: user._id as any,
        name: editName,
        bio: editBio,
        phone: editPhone,
        avatar: editAvatar,
        privacyMode: editPrivacy
      });
      setUser(updatedUser as any);
      setShowProfileModal(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePostStatus = async (content: string, type: 'text' | 'image') => {
    if (!user) return;
    try {
      await postStatus({
        userId: user._id as any,
        userName: user.name,
        userAvatar: user.avatar,
        content,
        type
      });
      setShowStatusModal(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleImageUpload = async (fileOrEvent: any, target: 'chat' | 'profile' | 'status') => {
    let file = fileOrEvent;
    if (fileOrEvent.target) file = fileOrEvent.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      let finalFile = file;
      if (file.type.startsWith('image/')) {
        const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1280, useWebWorker: true };
        finalFile = await imageCompression(file, options);
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        if (target === 'chat') {
          if (file.type.startsWith('image/')) {
            setAttachedImage(result);
          } else {
            setParsingFile(true);
            const text = await parseFile(file);
            if (text) setText(prev => prev + (prev ? '\n' : '') + text);
            setParsingFile(false);
          }
        } else if (target === 'profile') {
          setEditAvatar(result);
        } else if (target === 'status') {
          handlePostStatus(result, 'image');
        }
      };
      reader.readAsDataURL(finalFile);
    } catch (err) {
      console.error('Error al procesar imagen:', err);
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) handleImageUpload(file, 'chat');
      }
    }
  }, []);

  const startSpeechToText = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return setError("Navegador no compatible");
    if (isRecording) { recognitionRef.current?.stop(); return; }
    const rec = new SpeechRecognition();
    rec.lang = 'es-AR'; 
    rec.continuous = true; 
    rec.interimResults = true;
    
    rec.onstart = () => setIsRecording(true);
    rec.onend = () => setIsRecording(false);
    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error de voz: ${event.error}`);
      setIsRecording(false);
    };

    rec.onresult = (e: any) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        }
      }
      if (final) {
        setText(p => p + (p ? ' ' : '') + final);
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError("No se pudo iniciar el reconocimiento de voz");
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !attachedImage) || uploading || !user) return;
    try {
      const encryptedText = encryptMessage(text.trim());
      await sendMessage({
        userId: user._id, nombre: user.name, avatar: user.avatar,
        texto: encryptedText, imagenUrl: attachedImage || undefined,
        channelId: currentChannel,
      });
      setText(''); setAttachedImage(null); setShowEmoji(false);
      if (isRecording) { recognitionRef.current?.stop(); }
    } catch (err) { setError('Error al enviar'); }
  };

  const startDM = async (targetUser: any) => {
    if (!user) return;
    try {
      const channel = await getOrCreateDM({ user1Id: user._id as any, user2Id: targetUser._id });
      if (channel) {
        setCurrentChannel(channel.slug);
        setShowUserSearch(false);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };


  const formatText = (content: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" className="rounded-lg text-[10px] my-2">
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : <code className="bg-white/10 px-1 rounded text-[10px]">{children}</code>;
          },
          a: ({ children, ...props }: any) => <a className="text-primary hover:underline font-bold" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>,
          p: ({ children }: any) => <p className="mb-1 last:mb-0">{children}</p>
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  if (!user) return <Onboarding />;

  const currentChat = [...channelsList, ...(activeStatuses || [])].find(c => (c as any).slug === currentChannel) || { name: 'Chat' };

  return (
    <div className="flex h-screen bg-[#0f1115] overflow-hidden">
      <audio ref={audioRef} src={NOTIFICATION_SOUND} preload="auto" />
      
      {/* SIDEBAR */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} border-r border-white/10 flex flex-col bg-black/20 shrink-0 transition-all duration-300 overflow-hidden relative`}>
        {/* User Profile Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 min-w-[320px]">
          <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 group text-left">
            <div className="relative">
              <img src={user.avatar} className="w-10 h-10 rounded-xl shadow-lg border border-white/10 group-hover:border-primary/50 transition-all" alt="" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f1115]" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{user.name}</div>
              <div className="text-[10px] text-gray-500">@{user.username}</div>
            </div>
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowUserSearch(true)} className="p-2 text-gray-500 hover:text-white transition-colors"><Search size={18}/></button>
            <button onClick={() => setShowStats(!showStats)} className="p-2 text-gray-500 hover:text-white transition-colors"><Server size={18}/></button>
            <button onClick={() => logout()} className="p-2 text-gray-500 hover:text-red-400 transition-colors"><LogOut size={18}/></button>
          </div>
        </div>

        {/* Statuses Row */}
        <div className="p-4 border-b border-white/5 bg-black/10 overflow-x-auto no-scrollbar flex gap-4 min-w-[320px]">
          <button onClick={() => setShowStatusModal(true)} className="flex flex-col items-center gap-1 shrink-0 group">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center group-hover:border-primary transition-all">
              <Plus size={20} className="text-gray-500 group-hover:text-primary" />
            </div>
            <span className="text-[9px] text-gray-500 font-bold uppercase">Mi Estado</span>
          </button>
          {activeStatuses?.map((s: any) => (
            <button key={s._id} className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-12 h-12 rounded-full border-2 border-primary p-0.5 shadow-lg shadow-primary/20">
                <img src={s.userAvatar} className="w-full h-full rounded-full object-cover" alt="" />
              </div>
              <span className="text-[9px] text-white font-medium truncate w-12 text-center">{s.userName.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Pending Friend Requests */}
        {pendingFriendRequests && pendingFriendRequests.length > 0 && (
          <div className="p-4 bg-primary/10 border-b border-primary/20">
             <h4 className="text-[9px] font-black text-primary uppercase mb-2">Solicitudes de Amistad</h4>
             <div className="space-y-2">
               {pendingFriendRequests.map((req: any) => (
                 <div key={req._id} className="flex items-center justify-between bg-black/20 p-2 rounded-xl border border-white/5">
                   <span className="text-[10px] text-white">Nueva solicitud</span>
                   <button 
                    onClick={() => acceptFriendRequest({ friendId: req._id })}
                    className="bg-primary text-white text-[9px] font-bold px-3 py-1 rounded-lg uppercase"
                   >
                     Aceptar
                   </button>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* Channels & Chats List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-w-[320px]">
          {/* SECCIÓN SALAS PÚBLICAS */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <Hash size={12} /> SALAS PÚBLICAS
              </h4>
              <button onClick={() => setShowCreateChannel(true)} className="p-1 hover:bg-primary/10 rounded transition-all text-primary"><Plus size={16}/></button>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setCurrentChannel('global')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentChannel === 'global' ? 'bg-primary/20 border-primary/20 text-white' : 'text-gray-400 hover:bg-white/5 border-transparent'} border`}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Hash size={16} className="text-primary"/></div>
                <div className="flex-1 text-left text-sm font-bold">General</div>
              </button>
              {channelsList.filter((c: any) => c.slug !== 'global' && !c.type).map((c: any) => (
                <button
                  key={c._id}
                  onClick={() => setCurrentChannel(c.slug)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentChannel === c.slug ? 'bg-primary/20 border-primary/20 text-white' : 'text-gray-400 hover:bg-white/5 border-transparent'} border`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    {c.isPrivate ? <Lock size={14}/> : <Hash size={16}/>}
                  </div>
                  <div className="flex-1 text-left text-sm font-bold truncate">{c.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN CHATS PRIVADOS */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <MessageSquare size={12} /> CHATS PRIVADOS
              </h4>
              <button onClick={() => setShowUserSearch(true)} className="p-1 hover:bg-emerald-500/10 rounded transition-all text-emerald-500"><Plus size={16}/></button>
            </div>
            <div className="space-y-1">
              {channelsList.filter((c: any) => c.type === 'direct').length === 0 && (
                <p className="text-[10px] text-gray-600 text-center py-4">No hay chats privados aún</p>
              )}
              {channelsList.filter((c: any) => c.type === 'direct').map((c: any) => (
                <button
                  key={c._id}
                  onClick={() => setCurrentChannel(c.slug)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentChannel === c.slug ? 'bg-emerald-500/20 border-emerald-500/20 text-white' : 'text-gray-400 hover:bg-white/5 border-transparent'} border`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <User size={16}/>
                  </div>
                  <div className="flex-1 text-left text-sm font-bold truncate">{c.name}</div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN SOLICITUDES */}
          {channelsList.filter((c: any) => c.status === 'pending' && c.user2Id === user._id).length > 0 && (
            <div className="p-4 bg-primary/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  <Mail size={12} /> SOLICITUDES
                </h4>
              </div>
              <div className="space-y-1">
                {channelsList.filter((c: any) => c.status === 'pending' && c.user2Id === user._id).map((c: any) => (
                  <button
                    key={c._id}
                    onClick={() => setCurrentChannel(c.slug)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentChannel === c.slug ? 'bg-primary/20 border-primary/20 text-white' : 'text-gray-400 hover:bg-white/5 border-transparent'} border`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <AtSign size={16}/>
                    </div>
                    <div className="flex-1 text-left text-[11px] font-bold truncate">Solicitud de {c.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative bg-[#0f1115]">
        {/* Chat Header */}
        <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-500 hover:text-white transition-all bg-white/5 rounded-xl border border-white/10"
            >
              <MoreVertical size={20} className={isSidebarOpen ? '' : 'rotate-90'} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                <span className="material-symbols-outlined text-lg">smart_toy</span>
              </div>
              <div>
                <h2 className="text-xs font-black text-white uppercase tracking-widest">{(currentChat as any).name}</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter">En Línea</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button className="p-2 text-gray-500 hover:text-white transition-all"><Volume2 size={20}/></button>
             <button className="p-2 text-gray-500 hover:text-white transition-all"><MoreVertical size={20}/></button>
          </div>
        </div>

        {/* Message Request Banner */}
        {channelsList.find((c:any) => c.slug === currentChannel && c.status === 'pending' && c.user2Id === user._id) && (
          <div className="bg-primary/10 border-b border-primary/20 p-4 flex flex-col items-center gap-3 text-center">
            <p className="text-xs text-white">¿Quieres aceptar la solicitud de mensaje de <span className="font-bold">{(currentChat as any).name}</span>?</p>
            <div className="flex gap-2">
              <button 
                onClick={() => useMutation(api.chat.updateChannelStatus)({ channelId: (currentChat as any)._id, status: 'active' })} 
                className="bg-primary text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider"
              >
                Aceptar
              </button>
              <button 
                onClick={() => useMutation(api.chat.deleteChannel)({ channelId: (currentChat as any)._id })} 
                className="bg-white/5 text-gray-400 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-white/10"
              >
                Rechazar
              </button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <MessageSquare size={64} className="mb-4" />
              <h3 className="text-lg font-bold uppercase tracking-[0.2em]">Comienza la charla</h3>
            </div>
          ) : (
            messages.map((m: ChatMessage, idx: number) => {
              const isMe = m.userId === user._id;
              return (
                <div key={m._id || idx} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} message-enter`}>
                  {!isMe && (
                    <button 
                      onClick={() => setViewingProfileUser({ _id: m.userId, name: m.nombre, avatar: m.avatar })}
                      className="shrink-0 group"
                    >
                      <img src={m.avatar} className="w-9 h-9 rounded-xl shadow-lg border border-white/10 group-hover:border-primary transition-all" alt="" />
                    </button>
                  )}
                  <div className={`flex flex-col gap-1.5 max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && (
                      <button 
                        onClick={() => setViewingProfileUser({ _id: m.userId, name: m.nombre, avatar: m.avatar })}
                        className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wider hover:text-primary transition-colors"
                      >
                        {m.nombre}
                      </button>
                    )}
                    <div className={`px-4 py-3 rounded-2xl shadow-xl ${isMe ? 'bg-primary/20 text-white rounded-br-none border border-primary/30' : 'bg-white/[0.04] text-gray-200 rounded-bl-none border border-white/5'}`}>
                      {m.imagenUrl && (
                        <div className="mb-3 rounded-xl overflow-hidden ring-1 ring-white/10 group relative">
                          <img 
                            src={m.imagenUrl} 
                            className="max-w-full h-auto max-h-72 cursor-pointer group-hover:scale-105 transition-transform duration-500" 
                            alt="" 
                            onClick={(e) => { e.stopPropagation(); setPreviewImage(m.imagenUrl!); }} 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <Search className="text-white" />
                          </div>
                        </div>
                      )}
                      <div className="text-[12px] leading-relaxed break-words">{formatText(decryptMessage(m.texto || ''))}</div>
                    </div>
                    <span className="text-[9px] text-gray-600 px-1 font-mono">{new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-black/40 border-t border-white/10 backdrop-blur-md">
           {attachedImage && (
             <div className="mb-4 flex items-center gap-3 p-2 bg-white/5 rounded-2xl border border-white/10 w-fit">
               <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                 <img src={attachedImage} className="w-full h-full object-cover" alt="" />
                 <button onClick={() => setAttachedImage(null)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg"><X size={14}/></button>
               </div>
               <span className="text-xs text-gray-400 pr-4">Imagen lista para enviar</span>
             </div>
           )}

           <form onSubmit={handleSubmit} className="flex items-end gap-3">
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf,.docx,.xlsx,.xls,.csv" onChange={(e) => handleImageUpload(e, 'chat')} />
             <button type="button" onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shrink-0 hover:bg-white/10"><Plus size={24}/></button>
             
             <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-primary/50 transition-all flex flex-col">
               <textarea
                 value={text}
                 onChange={e => { setText(e.target.value); handleTyping(); }}
                 onPaste={handlePaste}
                 placeholder={isRecording ? "Capturando voz..." : "Escribe un mensaje..."}
                 className="bg-transparent text-sm text-white outline-none placeholder-gray-600 px-3 py-2 resize-none max-h-32 min-h-[44px]"
                 rows={1}
                 onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
               />
               <div className="flex justify-between items-center px-3 pt-1 border-t border-white/5">
                 <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="text-gray-500 hover:text-primary transition-colors"><Smile size={18}/></button>
                 <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">{text.length}/500</div>
               </div>
             </div>

             <div className="flex flex-col gap-2 shrink-0">
               <button type="button" onClick={startSpeechToText} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}>
                 {isRecording ? <MicOff size={22}/> : <Mic size={22}/>}
               </button>
               <button type="submit" disabled={!text.trim() && !attachedImage} className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 disabled:opacity-30 transition-all">
                 <Send size={22} />
               </button>
             </div>
           </form>
        </div>
      </div>

      {/* MODALS */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-[2rem] border border-white/10 p-8 w-full max-w-md space-y-8 shadow-2xl relative">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24}/></button>
            <div className="text-center space-y-4">
              <div className="relative w-32 h-32 mx-auto group">
                <img src={editAvatar} className="w-full h-full rounded-[2.5rem] object-cover shadow-2xl ring-4 ring-primary/20" alt="" />
                <button onClick={() => profileImageInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={32}/>
                </button>
                <input type="file" ref={profileImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-[0.2em]">Editar Perfil</h2>
            </div>
            <div className="space-y-4">
              <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nombre completo" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-primary" />
              <textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Biografía" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-primary resize-none h-24" />
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase px-4">Teléfono</label>
                <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+54 9..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-primary outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase px-4">Privacidad de Mensajes</label>
                <div className="flex gap-2 px-1">
                  <button 
                    onClick={() => setEditPrivacy('everyone')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${editPrivacy === 'everyone' ? 'bg-primary text-white' : 'bg-white/5 text-gray-500'}`}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setEditPrivacy('requests')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${editPrivacy === 'requests' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-500'}`}
                  >
                    Solicitudes
                  </button>
                </div>
              </div>
            </div>
            <button onClick={handleUpdateProfile} className="w-full bg-primary hover:bg-primary-hover text-white py-5 rounded-[1.5rem] font-bold uppercase tracking-widest shadow-xl shadow-primary/20">Guardar Cambios</button>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-[2rem] border border-white/10 p-8 w-full max-w-sm space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white text-center uppercase tracking-widest">Publicar Estado</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { const text = prompt('Escribe tu estado:'); if(text) handlePostStatus(text, 'text'); }} className="aspect-square bg-primary/10 rounded-3xl border border-primary/20 flex flex-col items-center justify-center gap-3 text-primary">
                <FileText size={32}/><span className="text-[10px] font-bold uppercase">Texto</span>
              </button>
              <button onClick={() => { const input = document.createElement('input'); input.type='file'; input.accept='image/*'; input.onchange=(e:any)=>handleImageUpload(e, 'status'); input.click(); }} className="aspect-square bg-purple-500/10 rounded-3xl border border-purple-500/20 flex flex-col items-center justify-center gap-3 text-purple-400">
                <Camera size={32}/><span className="text-[10px] font-bold uppercase">Foto</span>
              </button>
            </div>
            <button onClick={() => setShowStatusModal(false)} className="w-full bg-white/5 text-gray-500 py-4 rounded-2xl font-bold uppercase text-[10px]">Cancelar</button>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-8 animate-fadeIn" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-8 right-8 text-white/40 hover:text-white transition-all"><X size={48}/></button>
          <img src={previewImage} className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain ring-1 ring-white/10" alt="" onClick={e => e.stopPropagation()}/>
        </div>
      )}

      {showUserSearch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Buscar Usuarios</h3>
            <input value={userSearchQuery} onChange={e => setUserSearchQuery(e.target.value)} placeholder="Nombre o @usuario..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary" autoFocus />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchedUsers?.filter(u => u._id !== user._id).map(u => (
                <button key={u._id} onClick={() => startDM(u)} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all">
                  <img src={u.avatar} className="w-10 h-10 rounded-xl" alt="" />
                  <div className="text-left">
                    <div className="text-xs font-bold text-white">{u.name}</div>
                    <div className="text-[10px] text-gray-500">@{u.username}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowUserSearch(false)} className="w-full text-xs text-gray-500 py-2 uppercase font-bold tracking-widest">Cerrar</button>
          </div>
        </div>
      )}

      {/* Viewing Other User Profile Popup (Elegant & Subtle) */}
      {viewingProfileUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setViewingProfileUser(null)}>
          <div className="bg-[#1a1a1a]/90 rounded-[2rem] border border-white/10 p-6 w-full max-w-[280px] space-y-5 shadow-2xl relative animate-fadeIn" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingProfileUser(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X size={18}/></button>
            
            <div className="text-center space-y-3">
              <div className="relative w-20 h-20 mx-auto">
                <img src={viewingProfileUser.avatar} className="w-full h-full rounded-2xl object-cover shadow-lg ring-2 ring-primary/20" alt="" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1a1a1a]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">{viewingProfileUser.name}</h2>
                <p className="text-[9px] text-gray-500 font-mono tracking-tighter">PERFIL AURORA</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => { startDM(viewingProfileUser); setViewingProfileUser(null); }} 
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] border border-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageSquare size={14} /> Mensaje Privado
              </button>

              {user._id !== viewingProfileUser._id && !friendsList?.find((f:any) => f._id === viewingProfileUser._id) && (
                <button 
                  onClick={() => sendFriendRequest({ fromId: user._id, toId: viewingProfileUser._id })}
                  className="w-full bg-white/5 hover:bg-white/10 text-gray-400 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Users size={14} /> Añadir Amigo
                </button>
              )}
              
              {friendsList?.find((f:any) => f._id === viewingProfileUser._id) && (
                <div className="py-2 flex items-center justify-center gap-2 text-emerald-500 font-black uppercase text-[8px] tracking-tighter opacity-80">
                  <Users size={12} /> Amigo Confirmado
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
