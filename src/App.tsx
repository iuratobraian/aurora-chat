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
import { Calendar, Ticket } from 'lucide-react';
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
  const [viewingStatus, setViewingStatus] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [viewingProfileUser, setViewingProfileUser] = useState<any>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
    };
    
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);


  
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
  const [editPassword, setEditPassword] = useState(user?.password || '');


  // Audio/Speech
  const [showEvents, setShowEvents] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Sync edit states with user
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditBio(user.bio || '');
      setEditPhone(user.phone || '');
      setEditAvatar(user.avatar || '');
      setEditPrivacy(user.privacyMode || 'everyone');
      setEditPassword(user.password || '');
    }
  }, [user]);



  // Convex
  const searchedUsers = useQuery(api.users.searchUsers, { query: userSearchQuery });
  const getOrCreateDM = useMutation(api.chat.getOrCreatePrivateChannel);
  const updateProfile = useMutation(api.users.updateProfile);
  const postStatus = useMutation(api.statuses.postStatus);
  const activeStatuses = useQuery(api.statuses.getActiveStatuses, user?._id ? { userId: user._id as any } : "skip");
  
  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);
  const acceptFriendRequest = useMutation(api.friends.acceptFriendRequest);
  const pendingFriendRequests = useQuery(api.friends.getPendingRequests, user?._id ? { userId: user._id as any } : "skip");
  const sentFriendRequests = useQuery(api.friends.getSentRequests, user?._id ? { userId: user._id as any } : "skip");
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

  const pinnedMessages = useQuery(api.chat.getPinnedMessages, { channelId: currentChannel });
  const channelData = useQuery(api.chat.getChannelBySlug, { slug: currentChannel });
  
  const togglePin = useMutation(api.chat.togglePinMessage);
  const togglePause = useMutation(api.chat.togglePauseChannel);

  const events = useQuery(api.events.getEventsByChannel, { channelId: currentChannel });
  const createEvent = useMutation(api.events.createEvent);
  const joinEvent = useMutation(api.events.joinEvent);
  const leaveEvent = useMutation(api.events.leaveEvent);

  const polls = useQuery(api.polls.getPollsByChannel, { channelId: currentChannel });
  const createPoll = useMutation(api.polls.createPoll);
  const voteInPoll = useMutation(api.polls.voteInPoll);

  const [showPolls, setShowPolls] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);




  // Notification Helper
  const showLocalNotification = useCallback((m: ChatMessage) => {
    if (m.userId === user?._id) return;
    if (document.visibilityState === 'visible') return;

    if ('Notification' in window && Notification.permission === 'granted') {
      const n = new Notification("Aurora Chat", {
        body: `Mensaje de ${m.autor}: ${decryptMessage(m.texto || '')}`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2593/2593635.png'
      });
      n.onclick = () => { window.focus(); n.close(); };
    }
  }, [user?._id]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);


  // Notifications
  const lastMessageId = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

   useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMessageId.current && lastMessageId.current !== lastMsg._id && lastMsg.userId !== user?._id) {
        audioRef.current?.play().catch(() => {});
        showLocalNotification(lastMsg as any);
      }
      lastMessageId.current = lastMsg._id || null;
    }
  }, [messages, user?._id, showLocalNotification]);


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
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

  // Offline Queue Processor
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0 && user) {
      const processQueue = async () => {
        const queueCopy = [...offlineQueue];
        setOfflineQueue([]);
        for (const msg of queueCopy) {
          try {
            await sendMessage({
              channelId: msg.channelId,
              userId: user._id,
              nombre: user.name,
              avatar: user.avatar,
              texto: msg.texto,
              imagenUrl: msg.imagenUrl
            });
          } catch (err) {
            setOfflineQueue(prev => [...prev, msg]);
          }
        }
      };
      processQueue();
    }
  }, [isOnline, user, sendMessage, offlineQueue.length]);


  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      const updatedUser = await updateProfile({
        userId: user._id as any,
        name: editName,
        bio: editBio,
        phone: editPhone,
        avatar: editAvatar,
        password: editPassword,
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
    if (typeof SpeechRecognition !== 'function') return setError("Error: El constructor de voz no es válido en este navegador.");
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
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      
      if (final) {
        setText(p => p + (p ? ' ' : '') + final);
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
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


  // Local Caching for Offline Support
  useEffect(() => {
    if (channelsList?.length > 0) localStorage.setItem('aurora_cache_channels', JSON.stringify(channelsList));
    if (messages?.length > 0) localStorage.setItem(`aurora_cache_msgs_${currentChannel}`, JSON.stringify(messages));
    if (activeStatuses?.length > 0) {
      localStorage.setItem('aurora_cache_statuses', JSON.stringify(activeStatuses));
      // Pre-download status images
      activeStatuses.forEach((s: any) => {
        if (s.contentUrl) {
          const img = new Image();
          img.src = s.contentUrl;
        }
      });
    }
  }, [channelsList, messages, activeStatuses, currentChannel]);

  const cachedChannels = JSON.parse(localStorage.getItem('aurora_cache_channels') || '[]');
  const cachedMessages = JSON.parse(localStorage.getItem(`aurora_cache_msgs_${currentChannel}`) || '[]');
  const cachedStatuses = JSON.parse(localStorage.getItem('aurora_cache_statuses') || '[]');

  const displayChannels = channelsList || cachedChannels;
  const displayMessages = messages || cachedMessages;
  const displayStatuses = activeStatuses || cachedStatuses;

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    if ((!text.trim() && !attachedImage) || uploading || !user) return;
    
    // Check if channel is paused
    if (channelData?.isPaused && channelData.createdBy !== user._id) {
      setError("El chat está pausado por el moderador");
      return;
    }

    const encryptedText = encryptMessage(text.trim(), currentChannel);

    if (!isOnline) {
      setOfflineQueue(prev => [...prev, {
        channelId: currentChannel,
        texto: encryptedText,
        imagenUrl: attachedImage || undefined
      }]);
      setText(''); setAttachedImage(null); setShowEmoji(false);
      return;
    }

    try {
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
    // Mentions highlighting
    const parts = content.split(/(@\w+)/g);
    const processedContent = parts.map(part => {
      if (part.startsWith('@')) return `**${part}**`;
      return part;
    }).join('');

    return (
      <div className="prose prose-invert max-w-none">

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
      </div>
    );
  };

  if (!user) return <Onboarding />;

  const currentChat = [...(displayChannels || []), ...(displayStatuses || [])].find(c => (c as any).slug === currentChannel) || { name: 'Chat' };


  return (
    <div className="flex h-screen bg-[#0f1115] overflow-hidden">
      <audio ref={audioRef} src={NOTIFICATION_SOUND} preload="auto" />
      
      {/* SIDEBAR */}
      <div className={`
        ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full'} 
        ${isMobile ? 'fixed inset-y-0 left-0 z-[150] shadow-2xl' : 'relative shrink-0'}
        border-r border-white/10 flex flex-col bg-black/90 transition-all duration-300 overflow-hidden
      `}>
        {isMobile && isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-white z-50 p-2 bg-white/5 rounded-lg"
          >
            <X size={20}/>
          </button>
        )}

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
          {displayStatuses?.map((s: any) => (
            <button key={s._id} onClick={() => setViewingStatus(s)} className="flex flex-col items-center gap-1 shrink-0">
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
                   <div className="flex items-center gap-2">
                     <img src={req.user?.avatar} className="w-6 h-6 rounded-lg" alt="" />
                     <span className="text-[10px] text-white font-bold">{req.user?.name}</span>
                   </div>
                   <button 
                    onClick={() => acceptFriendRequest({ friendId: req._id })}
                    className="bg-primary text-white text-[8px] font-bold px-3 py-1.5 rounded-lg uppercase transition-all active:scale-95"
                   >
                     Aceptar
                   </button>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* Sent Friend Requests */}
        {sentFriendRequests && sentFriendRequests.length > 0 && (
          <div className="p-4 border-b border-white/5">
             <h4 className="text-[9px] font-black text-gray-500 uppercase mb-2">Solicitudes Enviadas</h4>
             <div className="space-y-2">
               {sentFriendRequests.map((req: any) => (
                 <div key={req._id} className="flex items-center justify-between bg-black/10 p-2 rounded-xl">
                   <div className="flex items-center gap-2 opacity-60">
                     <img src={req.user?.avatar} className="w-6 h-6 rounded-lg" alt="" />
                     <span className="text-[10px] text-white">{req.user?.name}</span>
                   </div>
                   <span className="text-[8px] text-gray-600 font-bold uppercase">Pendiente</span>
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
              {isMobile ? <Plus size={20} className={isSidebarOpen ? 'rotate-45' : ''} /> : <MoreVertical size={20} className={isSidebarOpen ? '' : 'rotate-90'} />}
            </button>
            <div className="flex items-center gap-3">
              {!isOnline && (
                <div className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1">
                  <Clock size={10} /> Sin Conexión (Modo Offline)
                </div>
              )}
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">

                <span className="material-symbols-outlined text-lg">smart_toy</span>
              </div>
              <div>
                <h2 className="text-xs font-black text-white uppercase tracking-widest">{(currentChat as any).name}</h2>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${channelData?.isPaused ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                  <span className={`text-[9px] ${channelData?.isPaused ? 'text-amber-500' : 'text-emerald-500'} font-bold uppercase tracking-tighter`}>
                    {channelData?.isPaused ? 'Pausado por Moderador' : 'En Línea'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
               <button 
                onClick={() => setShowEvents(!showEvents)}
                className={`p-2 rounded-xl transition-all ${showEvents ? 'bg-primary text-white' : 'text-gray-500 hover:text-white bg-white/5'}`}
                title="Eventos del Equipo"
               >
                 <Calendar size={20}/>
               </button>
               <button 
                onClick={() => setShowPolls(!showPolls)}
                className={`p-2 rounded-xl transition-all ${showPolls ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:text-white bg-white/5'}`}
                title="Encuestas"
               >
                 <HardDrive size={20}/>
               </button>

               {channelData?.createdBy === user?._id && (
               <button 
                onClick={() => togglePause({ channelId: channelData._id, isPaused: !channelData.isPaused })}
                className={`p-2 rounded-xl transition-all ${channelData?.isPaused ? 'bg-amber-500 text-white' : 'text-gray-500 hover:text-white bg-white/5'}`}
                title={channelData?.isPaused ? "Reanudar Chat" : "Pausar Chat"}
               >
                 {channelData?.isPaused ? <Play size={20}/> : <Pause size={20}/>}
               </button>
             )}
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

        {/* Pinned Messages Area */}
        {pinnedMessages && pinnedMessages.length > 0 && (
          <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center gap-3 overflow-hidden relative group">
            <div className="bg-primary/20 p-1.5 rounded-lg text-primary">
              <Clock size={14} className="animate-spin-slow" />
            </div>
            <div className="flex-1 overflow-hidden">
               <div className="flex flex-col animate-marquee-vertical">
                  {pinnedMessages.map((m: any) => (
                    <div key={m._id} className="text-[10px] text-white/80 font-bold uppercase tracking-wide truncate">
                      <span className="text-primary mr-2">📌</span> {decryptMessage(m.texto, currentChannel)}
                    </div>
                  ))}
               </div>
            </div>
            <div className="text-[8px] font-black text-primary/50 uppercase tracking-widest whitespace-nowrap">Destacados</div>
          </div>
        )}

        {/* Messages Area */}
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          {displayMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <MessageSquare size={64} className="mb-4" />
              <h3 className="text-lg font-bold uppercase tracking-[0.2em]">Comienza la charla</h3>
            </div>
          ) : (
            displayMessages.map((m: ChatMessage, idx: number) => {

              const isMe = m.userId === user._id;
              return (
                <div key={m._id || idx} className={`flex items-end gap-3 ${isMe ? 'flex-reverse' : ''} message-enter`}>
                  {!isMe && (
                    <button 
                      onClick={() => setViewingProfileUser({ _id: m.userId, name: m.nombre, avatar: m.avatar })}
                      className="shrink-0 group"
                    >
                      <img src={m.avatar} className="w-9 h-9 rounded-xl shadow-lg border border-white/10 group-hover:border-primary transition-all" alt="" />
                    </button>
                  )}
                  <div className={`flex flex-col ${m.userId === user?._id ? 'items-end' : 'items-start'} gap-1 group`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      {m.userId !== user?._id && <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{m.nombre}</span>}
                      {channelData?.createdBy === user?._id && (
                        <button 
                          onClick={() => togglePin({ messageId: m._id, isPinned: !m.isPinned })}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10 ${m.isPinned ? 'text-primary' : 'text-gray-500'}`}
                        >
                          <Clock size={12}/>
                        </button>
                      )}
                    </div>
                    <div className={`
                      max-w-[85%] px-4 py-2.5 rounded-2xl relative
                      ${m.userId === user?._id ? 'bg-primary text-white rounded-tr-none' : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'}
                      ${m.isPinned ? 'ring-2 ring-primary/40' : ''}
                    `}>
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
                      <div className="text-[12px] leading-relaxed break-words">{formatText(decryptMessage(m.texto || '', currentChannel))}</div>
                    </div>
                    <span className="text-[9px] text-gray-600 px-1 font-mono">{new Date(m.createdAt).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-black/40 border-t border-white/10 backdrop-blur-md">
            {showEmoji && (
              <div className="absolute bottom-24 left-6 bg-[#1a1a1a] border border-white/10 p-2 rounded-2xl shadow-2xl flex gap-2 z-[100] animate-in fade-in slide-in-from-bottom-2">
                {EMOJIS.map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => { setText(text + emoji); setShowEmoji(false); }}
                    className="text-xl hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {attachedImage && (
             <div className="mb-4 flex items-center gap-3 p-2 bg-white/5 rounded-2xl border border-white/10 w-fit">
               <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                 <img src={attachedImage} className="w-full h-full object-cover" alt="" />
                 <button onClick={() => setAttachedImage(null)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg"><X size={14}/></button>
               </div>
               <span className="text-xs text-gray-400 pr-4">Imagen lista para enviar</span>
             </div>
           )}

           <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all shrink-0"><Plus size={22}/></button>
              
              <div className="flex-1 bg-white/5 border border-white/10 rounded-[1.5rem] p-1 focus-within:border-primary/40 transition-all flex items-end">
                <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-2.5 text-gray-500 hover:text-primary transition-colors"><Smile size={20}/></button>
                <textarea
                  value={text + (interimTranscript ? (text ? ' ' : '') + interimTranscript : '')}

                  onChange={e => { setText(e.target.value); handleTyping(); }}
                  onPaste={handlePaste}
                  placeholder={isRecording ? "Escuchando..." : "Escribe un mensaje..."}
                  className={`flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-600 px-3 py-2.5 resize-none max-h-32 min-h-[44px] ${isRecording ? 'text-primary' : ''}`}
                  rows={1}
                  onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey && !isMobile) { e.preventDefault(); handleSubmit(e); } }}
                />
                <button type="submit" disabled={(!text.trim() && !attachedImage) || uploading} className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-20 transition-all active:scale-90 m-0.5">
                  <Send size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <button type="button" onClick={() => cameraInputRef.current?.click()} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all">
                  <Camera size={20}/>
                </button>
                <button type="button" onClick={startSpeechToText} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/5 text-gray-500 hover:text-white border border-white/10'}`}>
                  {isRecording ? <MicOff size={20}/> : <Mic size={20}/>}
                </button>
              </div>

              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf,.docx,.xlsx,.xls,.csv" onChange={(e) => handleImageUpload(e, 'chat')} />
              <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handleImageUpload(e, 'chat')} />
            </form>
        </div>
        {isMobile && isSidebarOpen && (
           <div className="fixed inset-0 bg-black/40 z-[140] backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        )}
      </div>

      {/* MODALS */}
       {showEvents && (
         <div className="fixed inset-y-0 right-0 w-80 bg-[#1a1a1a] border-l border-white/10 z-[150] shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Calendar size={18} className="text-primary"/> Eventos</h2>
              <button onClick={() => setShowEvents(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
            </div>
            <button onClick={() => setShowCreateEvent(true)} className="w-full bg-primary/10 border border-primary/20 text-primary py-3 rounded-xl text-[10px] font-black uppercase hover:bg-primary/20 transition-all">Crear Nuevo Evento</button>
            <div className="space-y-4">
              {events?.map((ev: any) => (
                <div key={ev._id} className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold text-white">{ev.title}</h3>
                  <p className="text-[10px] text-gray-500 line-clamp-2">{ev.description}</p>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-primary bg-primary/5 px-2 py-1 rounded w-fit">
                    <Clock size={10}/> {new Date(ev.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[9px] text-gray-600 uppercase font-black">{ev.participants.length} Anotados</span>
                    {ev.participants.includes(user?._id) ? (
                      <button onClick={() => leaveEvent({ eventId: ev._id, userId: user?._id as any })} className="text-[9px] font-black text-red-400 uppercase">Salir</button>
                    ) : (
                      <button onClick={() => joinEvent({ eventId: ev._id, userId: user?._id as any })} className="text-[9px] font-black text-emerald-400 uppercase">Anotarme</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
         </div>
       )}

       {showPolls && (
         <div className="fixed inset-y-0 right-0 w-80 bg-[#1a1a1a] border-l border-white/10 z-[150] shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><HardDrive size={18} className="text-indigo-500"/> Encuestas</h2>
              <button onClick={() => setShowPolls(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
            </div>
            <button onClick={() => setShowCreatePoll(true)} className="w-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-500/20 transition-all">Crear Encuesta</button>
            <div className="space-y-4">
              {polls?.map((poll: any) => (
                <div key={poll._id} className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold text-white">{poll.question}</h3>
                  <div className="space-y-2">
                    {poll.options.map((opt: any, idx: number) => {
                      const totalVotes = poll.options.reduce((acc: number, o: any) => acc + o.votes.length, 0);
                      const percentage = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                      const hasVoted = poll.options.some((o: any) => o.votes.includes(user?._id));
                      
                      return (
                        <div key={idx} className="space-y-1">
                          <button 
                            disabled={hasVoted}
                            onClick={() => voteInPoll({ pollId: poll._id, optionIndex: idx, userId: user?._id as any })}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] transition-all ${hasVoted ? 'bg-white/10 text-gray-400' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                          >
                            <span>{opt.text}</span>
                            <span className="font-bold">{percentage}%</span>
                          </button>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
         </div>
       )}

       {showCreateEvent && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-[2rem] p-8 w-full max-w-sm space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest text-center">Nuevo Evento</h2>
              <div className="space-y-4">
                <input value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="Título del evento" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary" />
                <textarea value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} placeholder="Descripción..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary h-20 resize-none" />
                <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCreateEvent(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-500">Cancelar</button>
                <button 
                  onClick={async () => {
                    await createEvent({ channelId: currentChannel, title: newEventTitle, description: newEventDesc, date: new Date(newEventDate).getTime(), userId: user?._id as any });
                    setShowCreateEvent(false);
                    setNewEventTitle(''); setNewEventDesc(''); setNewEventDate('');
                  }}
                  className="flex-1 bg-primary text-white py-3 rounded-xl text-[10px] font-black uppercase"
                >
                  Crear
                </button>
              </div>
            </div>
         </div>
       )}

       {showCreatePoll && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-[2rem] p-8 w-full max-w-sm space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest text-center">Nueva Encuesta</h2>
              <div className="space-y-4">
                <input value={newPollQuestion} onChange={e => setNewPollQuestion(e.target.value)} placeholder="¿Qué quieres preguntar?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-indigo-500" />
                <div className="space-y-2">
                  {newPollOptions.map((opt, idx) => (
                    <input key={idx} value={opt} onChange={e => {
                      const copy = [...newPollOptions];
                      copy[idx] = e.target.value;
                      setNewPollOptions(copy);
                    }} placeholder={`Opción ${idx + 1}`} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-indigo-500" />
                  ))}
                  <button onClick={() => setNewPollOptions([...newPollOptions, ''])} className="text-[9px] font-black text-indigo-400 uppercase">+ Agregar Opción</button>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCreatePoll(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-500">Cancelar</button>
                <button 
                  onClick={async () => {
                    await createPoll({ channelId: currentChannel, question: newPollQuestion, options: newPollOptions.filter(o => o.trim()), userId: user?._id as any });
                    setShowCreatePoll(false);
                    setNewPollQuestion(''); setNewPollOptions(['', '']);
                  }}
                  className="flex-1 bg-indigo-500 text-white py-3 rounded-xl text-[10px] font-black uppercase"
                >
                  Crear
                </button>
              </div>
            </div>
         </div>
       )}

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
                <label className="text-[10px] font-bold text-gray-500 uppercase px-4">Contraseña</label>
                <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="Nueva contraseña" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-primary outline-none transition-all" />
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

       {viewingStatus && (
         <div className="fixed inset-0 bg-black z-[1000] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
            <div className="absolute top-8 left-8 flex items-center gap-4">
              <img src={viewingStatus.userAvatar} className="w-10 h-10 rounded-full border-2 border-primary" alt="" />
              <div>
                <p className="text-sm font-bold text-white">{viewingStatus.userName}</p>
                <p className="text-[10px] text-gray-500">{new Date(viewingStatus.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
            <button onClick={() => setViewingStatus(null)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-all"><X size={32}/></button>
            
            <div className="w-full max-w-sm aspect-[9/16] bg-white/5 rounded-[2rem] overflow-hidden relative shadow-2xl">
               {viewingStatus.type === 'text' ? (
                 <div className="w-full h-full flex items-center justify-center p-8 text-center text-xl font-bold text-white bg-gradient-to-br from-primary/20 to-purple-500/20">
                    {viewingStatus.text}
                 </div>
               ) : (
                 <img src={viewingStatus.contentUrl} className="w-full h-full object-cover" alt="" />
               )}
            </div>
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

      {/* Viewing Other User Profile Popup (Premium WhatsApp/Telegram Style) */}
      {viewingProfileUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setViewingProfileUser(null)}>
          <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/10 w-full max-w-[320px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative" onClick={e => e.stopPropagation()}>
            
            {/* Header / Avatar */}
            <div className="bg-gradient-to-b from-primary/20 to-transparent p-8 text-center relative">
              <button onClick={() => setViewingProfileUser(null)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"><X size={20}/></button>
              <div className="relative w-28 h-28 mx-auto mb-4 group">
                <img src={viewingProfileUser.avatar} className="w-full h-full rounded-[2.5rem] object-cover shadow-2xl ring-4 ring-primary/10 transition-transform group-hover:scale-105 duration-500" alt="" />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#1a1a1a]" title="En línea" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{viewingProfileUser.name}</h2>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] opacity-70">@{viewingProfileUser.username || 'usuario'}</p>
            </div>

            {/* Info Sections */}
            <div className="px-6 pb-8 space-y-4">
              <div className="space-y-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                  <Info size={12} className="text-primary"/> Información y Bio
                </label>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  {viewingProfileUser.bio || "Este usuario prefiere mantener su bio en misterio... ✨"}
                </p>
              </div>

              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-primary/70 italic px-2 animate-pulse">
                  <span className="w-1 h-1 bg-primary rounded-full" />
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'está escribiendo...' : 'están escribiendo...'}
                </div>
              )}
              
              {channelData?.isPaused && channelData.createdBy !== user?._id && (
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                    <AlertCircle size={18} className="animate-bounce" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Atención Equipo</p>
                    <p className="text-[11px] text-amber-500/80">El moderador está redactando un mensaje importante. El chat se reanudará pronto.</p>
                  </div>
                </div>
              )}

              {viewingProfileUser.phone && (
                <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">Teléfono</p>
                    <p className="text-sm text-white font-mono">{viewingProfileUser.phone}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-1 gap-2 pt-2">
                <button 
                  onClick={() => { startDM(viewingProfileUser); setViewingProfileUser(null); }} 
                  className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  <MessageSquare size={16} /> Chatear ahora
                </button>

                {user._id !== viewingProfileUser._id && !friendsList?.find((f:any) => f._id === viewingProfileUser._id) && !sentFriendRequests?.find((r:any) => r.user2Id === viewingProfileUser._id) && (
                  <button 
                    onClick={() => sendFriendRequest({ fromId: user._id as any, toId: viewingProfileUser._id })}
                    className="w-full bg-white/5 hover:bg-white/10 text-white/60 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Users size={16} /> Agregar Amigo
                  </button>
                )}

                {sentFriendRequests?.find((r:any) => r.user2Id === viewingProfileUser._id) && (
                  <div className="w-full bg-emerald-500/10 text-emerald-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] border border-emerald-500/20 flex items-center justify-center gap-2">
                    <Clock size={16} /> Solicitud Enviada
                  </div>
                )}
                
                {friendsList?.find((f:any) => f._id === viewingProfileUser._id) && (
                  <div className="py-2 text-center">
                    <span className="bg-emerald-500/20 text-emerald-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto w-fit">
                      <Users size={12} /> Amigo Mutuo
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
