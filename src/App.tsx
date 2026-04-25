import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from './api';
import { ChatMessage } from './types';
import { 
  Send, X, Smile, AlertCircle, Plus, Lock, Server, Users, 
  MessageSquare, HardDrive, Search, LogOut, FileText, 
  FileSpreadsheet, FileCode, Mic, MicOff, Loader2, Volume2, 
  Settings, User, Phone, Info, Camera, Clock, ChevronRight,
  MoreVertical, Hash, QrCode, ScanLine, Copy, Wallet, Mail,
  AtSign, Play, Pause
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
import { Html5Qrcode } from "html5-qrcode";
import { persistenceService } from './lib/persistence';
import { expenseAgent } from './lib/expenseAgent';
import ExpensesHub from './features/expenses/ExpensesHub';

const APP_VERSION = '1.0.8'; // Increment this to force cache clear


const EMOJIS = ['🚀', '📈', '📉', '🔥', '🧠', '💰', '❤️', '👍', '🎯', '⚡'];
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3';

export default function AuroraChat() {
  // 1. Hooks & State Declarations (Top Level)
  const { user, setUser, logout } = useUserStore();
  
  // Basic UI State
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
  const [isReady, setIsReady] = useState(false);
  const [viewingProfileUser, setViewingProfileUser] = useState<any>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [parsingFile, setParsingFile] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [attachedAudio, setAttachedAudio] = useState<string | null>(null);
  const [showReminders, setShowReminders] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [sharingEventId, setSharingEventId] = useState<string | null>(null);
  const [masterKey, setMasterKey] = useState(localStorage.getItem('aurora_master_key') || '');
  const [isBiometricVerified, setIsBiometricVerified] = useState(false);
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newPassSite, setNewPassSite] = useState('');
  const [newPassUser, setNewPassUser] = useState('');
  const [newPassVal, setNewPassVal] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [editPrivacy, setEditPrivacy] = useState(user?.privacyMode || 'everyone');
  const [editThemeColor, setEditThemeColor] = useState(user?.themeColor || '#6366f1');
  const [editPassword, setEditPassword] = useState(user?.password || '');

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const qrScannerRef = useRef<any>(null);
  const lastMessageId = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const isAtBottom = useRef(true);
  const hasInitiallyScrolled = useRef<string | null>(null);

  const isValidUser = user?._id && typeof user._id === 'string' && user._id.length > 5 && user._id !== 'guest';

  // Convex Queries
  const searchedUsers = useQuery(api.users.searchUsers, { query: userSearchQuery });
  const activeStatuses = useQuery(api.statuses.getActiveStatuses, isValidUser ? { userId: user._id as any } : "skip");
  const pendingFriendRequests = useQuery(api.friends.getPendingRequests, isValidUser ? { userId: user._id as any } : "skip");
  const sentFriendRequests = useQuery(api.friends.getSentRequests, isValidUser ? { userId: user._id as any } : "skip");
  const friendsList = useQuery(api.friends.getFriends, isValidUser ? { userId: user._id as any } : "skip");
  const rawChannels = useQuery(api.chat.getChannels);
  const rawMessagesData = useQuery(api.chat.getMessagesByChannel, { channelId: currentChannel, limit: 100 });
  const rawTypingUsers = useQuery(api.chat.getTypingUsers, { channelId: currentChannel, excludeUserId: (user?._id && typeof user._id === 'string') ? user._id : 'guest' });
  const reminders = useQuery(api.productivity.getReminders, isValidUser ? { userId: user._id as any } : "skip");
  const notes = useQuery(api.productivity.getNotes, isValidUser ? { userId: user._id as any } : "skip");
  const storedPasswords = useQuery(api.productivity.getPasswords, isValidUser ? { userId: user._id as any } : "skip");
  const rawServerStats = useQuery(api.chat.getServerStats);
  const pinnedMessages = useQuery(api.chat.getPinnedMessages, { channelId: currentChannel });
  const channelData = useQuery(api.chat.getChannelBySlug, { slug: currentChannel });
  const events = useQuery(api.events.getEventsByChannel, { channelId: currentChannel });
  const polls = useQuery(api.polls.getPollsByChannel, { channelId: currentChannel });

  // Convex Mutations
  const getOrCreateDM = useMutation(api.chat.getOrCreatePrivateChannel);
  const updateProfile = useMutation(api.users.updateProfile);
  const postStatus = useMutation(api.statuses.postStatus);
  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);
  const acceptFriendRequest = useMutation(api.friends.acceptFriendRequest);
  const addExpenseMutation = useMutation(api.expenses.addExpense);
  const sendMessage = useMutation(api.chat.sendMessage);
  const setTyping = useMutation(api.chat.setTyping);
  const createChannel = useMutation(api.chat.createChannel);
  const verifyPasswordMutation = useMutation(api.chat.verifyChannelPasswordMutation);
  const createReminder = useMutation(api.productivity.createReminder);
  const toggleReminder = useMutation(api.productivity.toggleReminder);
  const deleteReminder = useMutation(api.productivity.deleteReminder);
  const createNote = useMutation(api.productivity.createNote);
  const updateNote = useMutation(api.productivity.updateNote);
  const deleteNote = useMutation(api.productivity.deleteNote);
  const createPassword = useMutation(api.productivity.createPassword);
  const deletePassword = useMutation(api.productivity.deletePassword);
  const togglePin = useMutation(api.chat.togglePinMessage);
  const togglePause = useMutation(api.chat.togglePauseChannel);
  const createEvent = useMutation(api.events.createEvent);
  const joinEvent = useMutation(api.events.joinEvent);
  const leaveEvent = useMutation(api.events.leaveEvent);
  const createPoll = useMutation(api.polls.createPoll);
  const voteInPoll = useMutation(api.polls.voteInPoll);
  const updateChannelStatus = useMutation(api.chat.updateChannelStatus);
  const deleteChannel = useMutation(api.chat.deleteChannel);
  const addModerator = useMutation(api.chat.addModerator);
  const removeModerator = useMutation(api.chat.removeModerator);

  // Computed Values
  const channelsList = Array.isArray(rawChannels) ? rawChannels : [];
  const messages = (rawMessagesData?.messages && Array.isArray(rawMessagesData.messages)) ? rawMessagesData.messages as ChatMessage[] : [];
  const typingUsers = Array.isArray(rawTypingUsers) ? rawTypingUsers : [];
  const serverStats = rawServerStats || null;

  // 2. Lifecycle & Effects
  useEffect(() => {
    // Cache buster & Quota Management
    try {
      const currentVersion = localStorage.getItem('aurora_app_version');
      if (currentVersion !== APP_VERSION) {
        // Clear all legacy large cache keys
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('aurora_cache_') || key.startsWith('aurora_msgs_')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem('aurora_app_version', APP_VERSION);
        window.location.reload();
        return;
      }
    } catch (e) {
      console.warn("Storage access denied or failed", e);
    }

    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
    };
    handleResize();
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('resize', handleResize);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Aggressive Viewport Stabilization
    const preventShift = () => {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', preventShift);
    
    const lockScroll = (e: Event) => {
      if ((e.target as HTMLElement).closest('.overflow-y-auto')) return;
      e.preventDefault();
    };
    document.addEventListener('touchmove', lockScroll, { passive: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('scroll', preventShift);
      document.removeEventListener('touchmove', lockScroll);
    };
  }, []);

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

  useEffect(() => {
    if (showQRScanner) {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setScannedResult(decodedText);
          setShowQRScanner(false);
          html5QrCode.stop();
          const match = storedPasswords?.find((p: any) => 
            decodedText.toLowerCase().includes(p.site.toLowerCase()) || 
            decodedText.toLowerCase().includes(p.username.toLowerCase())
          );
          if (match) {
            alert(`Llave encontrada para ${match.site}: ${match.encryptedPassword}`);
          } else {
            alert(`Contenido del QR: ${decodedText}`);
          }
        },
        () => {}
      ).catch(err => {
        console.error("QR Error", err);
        setError("No se pudo iniciar la cámara");
        setShowQRScanner(false);
      });
      return () => {
        if (html5QrCode.isScanning) html5QrCode.stop();
      };
    }
  }, [showQRScanner, storedPasswords]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMessageId.current && lastMessageId.current !== lastMsg._id && lastMsg.userId !== user?._id) {
        audioRef.current?.play().catch(() => {});
        showLocalNotification(lastMsg as any);
      }
      lastMessageId.current = lastMsg._id || null;
      persistenceService.saveMessages(currentChannel, messages);
    }
  }, [messages, user?._id, currentChannel]);

  useEffect(() => {
    setIsReady(false);
  }, [currentChannel]);

  useEffect(() => {
    if (messages.length > 0 && scrollRef.current) {
      const shouldSmooth = hasInitiallyScrolled.current === currentChannel && isAtBottom.current;
      
      // Use scrollTop instead of scrollIntoView to prevent viewport shifting
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: shouldSmooth ? 'smooth' : 'auto'
      });
      
      hasInitiallyScrolled.current = currentChannel;
      if (!isReady) setIsReady(true);
    } else if (rawMessagesData !== undefined && messages.length === 0 && !isReady) {
      setIsReady(true);
    }
  }, [messages.length, currentChannel, isReady, rawMessagesData]);

  // Emergency visibility fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isReady) setIsReady(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isReady]);

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

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 3. Callbacks
  const showLocalNotification = useCallback((m: ChatMessage) => {
    if (m.userId === user?._id) return;
    if (document.visibilityState === 'visible') return;
    if ('Notification' in window && Notification.permission === 'granted') {
      const n = new Notification("Aurora Chat", {
        body: `Mensaje de ${m.nombre}: ${decryptMessage(m.texto || '', currentChannel)}`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2593/2593635.png'
      });
      n.onclick = () => { window.focus(); n.close(); };
    }
  }, [user?._id, currentChannel]);

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

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Tu navegador no soporta reconocimiento de voz");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'es-ES';
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) {
        setText(prev => prev + (prev ? ' ' : '') + final);
      }
      setInterimTranscript(interim);
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('No se pudo acceder al micrófono para dictado');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setInterimTranscript('');
    }
  };


  // Local Caching for Offline Support
  useEffect(() => {
    if (channelsList?.length > 0) persistenceService.saveChannels(channelsList);
    if (messages?.length > 0) persistenceService.saveMessages(currentChannel, messages);
    if (activeStatuses?.length > 0) {
      // Pre-download status images
      activeStatuses.forEach((s: any) => {
        if (s.contentUrl) {
          const img = new Image();
          img.src = s.contentUrl;
        }
      });
    }
  }, [channelsList, messages, activeStatuses, currentChannel]);

  // Dynamic Theme Support
  useEffect(() => {
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    };

    const targetColor = showProfileModal ? editThemeColor : (user?.themeColor || '#6366f1');
    document.documentElement.style.setProperty('--primary-color', targetColor);
    document.documentElement.style.setProperty('--primary-rgb', hexToRgb(targetColor));
  }, [user?.themeColor, editThemeColor, showProfileModal]);



  const [cachedChannels, setCachedChannels] = useState<any[]>([]);
  const [cachedMessages, setCachedMessages] = useState<any[]>([]);

  useEffect(() => {
    persistenceService.getChannels().then(setCachedChannels);
    persistenceService.getMessages(currentChannel).then(setCachedMessages);
  }, [currentChannel]);

  const displayChannels = channelsList || cachedChannels;
  
  // Combine server messages with local offline queue
  const displayMessages = [...(messages || cachedMessages), ...offlineQueue
    .filter(msg => msg.channelId === currentChannel)
    .map((msg, idx) => ({
      _id: `offline-${idx}`,
      userId: user?._id || '',
      nombre: user?.name || 'Yo',
      avatar: user?.avatar || '',
      texto: msg.texto,
      imagenUrl: msg.imagenUrl,
      createdAt: Date.now(),
      isOffline: true
    }))
  ].filter(msg => {
    if (!searchQuery) return true;
    const decrypted = decryptMessage(msg.texto || '', currentChannel).toLowerCase();
    return decrypted.includes(searchQuery.toLowerCase());
  });

  const recentStatuses = activeStatuses?.filter((s: any) => {
    const isExpired = s.expiresAt < Date.now();
    return !isExpired;
  }) || [];

  const displayStatuses = recentStatuses;


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
        texto: encryptedText, 
        imagenUrl: attachedImage || undefined,
        audioUrl: attachedAudio || undefined,
        channelId: currentChannel,
      });

      // AI Agent Expense Logic
      if (text.toLowerCase().includes('gasto') || text.toLowerCase().includes('ingreso')) {
        const parsed = expenseAgent.parse(text);
        if (parsed) {
          // Send "Recibido" message from system
          const systemMsg = `✅ *Recibido:* Registrando ${parsed.type === 'income' ? 'ingreso' : 'gasto'} de $${parsed.amount.toLocaleString()}. 
Categoría: *${parsed.category.toUpperCase()}*
Nota: ${parsed.note}`;
          
          setTimeout(async () => {
             await sendMessage({
               userId: 'system-bot',
               nombre: 'Aurora Finance Bot',
               avatar: 'https://cdn-icons-png.flaticon.com/512/2593/2593635.png',
               texto: encryptMessage(systemMsg, currentChannel),
               channelId: currentChannel
             });

             // Actually save to database
             await addExpenseMutation({
               userId: user._id,
               type: parsed.type,
               amount: parsed.amount,
               category: parsed.category,
               date: new Date().toISOString().split('T')[0],
               paymentMethod: 'Efectivo', // Default
               note: parsed.note
             });
          }, 1000);
        }
      }

      setText(''); setAttachedImage(null); setAttachedAudio(null); setAudioBlob(null); setShowEmoji(false);
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

  if (!user) return (
    <Onboarding />
  );

  const currentChat = [...(displayChannels || []), ...(displayStatuses || [])].find(c => (c as any).slug === currentChannel) || { name: 'Chat' };

  return (
    <div className="fixed inset-0 flex bg-[#0a0a0a] text-white overflow-hidden selection:bg-primary/30 overscroll-none">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
      
      <audio ref={audioRef} src={NOTIFICATION_SOUND} preload="auto" />
      
      {/* SIDEBAR */}
      <aside className={`
        ${isSidebarOpen ? (isMobile ? 'w-[280px]' : 'w-[320px]') : 'w-0'} 
        ${isMobile ? 'fixed inset-y-0 left-0 z-[150] shadow-2xl' : 'relative shrink-0'}
        border-r border-white/10 flex flex-col bg-[#0d0d0d] transition-all duration-500 ease-in-out overflow-hidden
        ${!isSidebarOpen && !isMobile ? 'border-none' : ''}
        safe-area-pt
      `}>

        {isMobile && isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-white z-50 p-2 bg-white/5 rounded-lg"
          >
            <X size={20}/>
          </button>
        )}

        {/* Coordination Tools */}
        <div className="p-6 space-y-4 border-t border-white/5 bg-white/[0.01]">
           <h4 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 px-1">Gestión Central</h4>
           <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setShowReminders(true)} className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all border border-white/5 group">
                <Clock size={20} className="text-amber-500 group-hover:scale-110 transition-transform"/>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Alertas</span>
              </button>
              <button onClick={() => setShowNotes(true)} className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all border border-white/5 group">
                <FileText size={20} className="text-emerald-500 group-hover:scale-110 transition-transform"/>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Notas</span>
              </button>
              <button onClick={() => setShowPasswords(true)} className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all border border-white/5 group">
                <Lock size={20} className="text-primary group-hover:scale-110 transition-transform"/>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Llaves</span>
              </button>
           </div>
           
           <button 
             onClick={() => setShowExpenses(true)}
             className="w-full flex items-center justify-center gap-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 py-4.5 rounded-2xl border border-emerald-500/20 transition-all font-black text-[10px] uppercase tracking-[0.2em] mt-2 shadow-lg shadow-emerald-500/5"
           >
             <Wallet size={18}/> Finanzas Aurora
           </button>

           <button 
             onClick={() => setShowFriendsModal(true)}
             className="w-full flex items-center justify-center gap-3 bg-primary/10 hover:bg-primary/20 text-primary py-4.5 rounded-2xl border border-primary/20 transition-all font-black text-[10px] uppercase tracking-[0.2em] mt-2 shadow-lg shadow-primary/5"
           >
             <Users size={18}/> Red de Contactos
           </button>
        </div>


        {/* User Profile Header */}

        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02] w-full">
          <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 group text-left">
            <div className="relative">
              <img src={user.avatar} className="w-10 h-10 rounded-lg shadow-lg border border-white/10 group-hover:border-primary/50 transition-all" alt="" />
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
        <div className="p-4 border-b border-white/10 bg-[#111111]/30 overflow-x-auto no-scrollbar flex gap-4 w-full">
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
                 <div key={req._id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5">
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
                 <div key={req._id} className="flex items-center justify-between bg-black/10 p-2 rounded-lg">
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
        <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
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
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${currentChannel === 'global' ? 'bg-primary/20 border-primary/20 text-white' : 'text-gray-400 hover:bg-white/5 border-transparent'} border`}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Hash size={16} className="text-primary"/></div>
                <div className="flex-1 text-left text-sm font-bold">General</div>
              </button>
              {channelsList.filter((c: any) => c.slug !== 'global' && !c.type).map((c: any) => (
                <button
                  key={c._id}
                  onClick={() => setCurrentChannel(c.slug)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${currentChannel === c.slug ? 'bg-primary/20 border-primary/20 text-white' : 'text-gray-400 hover:bg-white/5 border-transparent'} border`}
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
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${currentChannel === c.slug ? 'bg-emerald-500/20 border-emerald-500/20 text-white' : 'text-gray-400 hover:bg-white/5 border-transparent'} border`}
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
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${currentChannel === c.slug ? 'bg-primary/20 border-primary/20 text-white' : 'text-gray-400 hover:bg-white/5 border-transparent'} border`}
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
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative bg-[#0a0a0a] overflow-hidden min-h-0">

        {/* Chat Header */}
        <div className="min-h-[4rem] px-4 border-b border-white/10 flex items-center justify-between glass-panel z-10 safe-area-pt">

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-400 hover:text-white transition-all bg-white/5 rounded-lg border border-white/10"
            >
              {isMobile ? <Plus size={20} className={isSidebarOpen ? 'rotate-45' : ''} /> : <MoreVertical size={20} className={isSidebarOpen ? '' : 'rotate-90'} />}
            </button>
            <div className="flex items-center gap-3">
              {!isOnline && (
                <div className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1">
                  <Clock size={10} /> Sin Conexión (Modo Offline)
                </div>
              )}
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">

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
                className={`p-2 rounded-lg transition-all ${showEvents ? 'bg-primary text-white' : 'text-gray-500 hover:text-white bg-white/5'}`}
                title="Eventos del Equipo"
               >
                 <Calendar size={20}/>
               </button>
               <button 
                onClick={() => setShowPolls(!showPolls)}
                className={`p-2 rounded-lg transition-all ${showPolls ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:text-white bg-white/5'}`}
                title="Encuestas"
               >
                 <HardDrive size={20}/>
               </button>

               { (channelData?.createdBy === user?._id || channelData?.moderators?.includes(user?._id)) && (
                <button 
                 onClick={() => togglePause({ channelId: channelData._id, isPaused: !channelData.isPaused, userId: user?._id as any })}
                 className={`p-2.5 rounded-xl transition-all ${channelData?.isPaused ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-white bg-white/5'}`}
                 title={channelData?.isPaused ? "Reanudar Chat" : "Pausar Chat"}
                >
                  {channelData?.isPaused ? <Play size={20}/> : <Pause size={20}/>}
                </button>
              )}
             <button onClick={() => setShowSearch(!showSearch)} className={`p-2 rounded-lg transition-all ${showSearch ? 'bg-primary text-white' : 'text-gray-500 hover:text-white bg-white/5'}`}>
               <Search size={20}/>
             </button>
             <button className="p-2 text-gray-500 hover:text-white transition-all"><MoreVertical size={20}/></button>
          </div>
        </div>

        {/* Search Bar Area */}
        {showSearch && (
          <div className="px-4 py-2 bg-black/20 border-b border-white/5 animate-in slide-in-from-top duration-300">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar en la conversación..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-xs text-white outline-none focus:border-primary/50"
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Message Request Banner */}
        {channelsList.find((c:any) => c.slug === currentChannel && c.status === 'pending' && c.user2Id === user._id) && (
          <div className="bg-primary/10 border-b border-primary/20 p-4 flex flex-col items-center gap-3 text-center">
            <p className="text-xs text-white">¿Quieres aceptar la solicitud de mensaje de <span className="font-bold">{(currentChat as any).name}</span>?</p>
            <div className="flex gap-2">
              <button 
                onClick={() => updateChannelStatus({ channelId: (currentChat as any)._id, status: 'active' })} 
                className="bg-primary text-white px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider"
              >
                Aceptar
              </button>
              <button 
                onClick={() => deleteChannel({ channelId: (currentChat as any)._id })} 
                className="bg-white/5 text-gray-400 px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/10"
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
        <div 
          ref={scrollRef} 
          onScroll={handleScroll} 
          className={`flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
        >

          {rawMessagesData === undefined ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-0">
               <Loader2 size={32} className="animate-spin text-white/20" />
            </div>
          ) : displayMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <MessageSquare size={64} className="mb-4" />
              <h3 className="text-lg font-bold uppercase tracking-[0.2em]">Comienza la charla</h3>
            </div>
          ) : (
            displayMessages.map((m: ChatMessage, idx: number) => {
              const showSeparator = idx > 0 && displayMessages[idx - 1].userId !== m.userId;
              const isMe = m.userId === user?._id;

              return (
                <div key={m._id || idx} className={`flex flex-col ${showSeparator ? 'mt-8 pt-8 border-t border-white/5' : 'mt-2'}`}>
                  <div className={`flex gap-5 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <button 
                      onClick={() => {
                        setViewingProfileUser({ _id: m.userId, name: m.nombre, avatar: m.avatar });
                      }}
                      className={`shrink-0 transition-all hover:scale-110 ${idx > 0 && displayMessages[idx-1].userId === m.userId ? 'opacity-0 h-0 pointer-events-none' : 'opacity-100'}`}
                    >
                      <div className={`relative p-[1px] rounded-xl ${recentStatuses?.find((s:any) => s.userId === m.userId) ? 'bg-gradient-to-tr from-primary to-purple-500' : 'bg-white/10'}`}>
                        <img src={m.avatar} className="w-10 h-10 rounded-xl shadow-2xl border border-white/5 bg-[#111111] object-cover" alt="" />
                      </div>
                    </button>

                    <div className={`flex-1 flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                      {(idx === 0 || displayMessages[idx-1].userId !== m.userId) && (
                        <div className={`flex items-center gap-3 mb-2 ${isMe ? 'flex-row-reverse text-right' : 'text-left'}`}>
                          <button 
                            onClick={() => {
                              setViewingProfileUser({ _id: m.userId, name: m.nombre, avatar: m.avatar });
                            }}
                            className="text-[10px] font-black text-white uppercase tracking-[0.2em] hover:text-primary transition-colors"
                          >
                            {m.nombre}
                          </button>
                          {channelData?.moderators?.includes(m.userId) && (
                            <span className="text-[7px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-widest border border-primary/20">Mod</span>
                          )}
                          <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                      
                      <div className={`
                        w-full text-[14px] leading-[1.6] transition-all relative group
                        ${isMe ? 'text-right' : 'text-left'}
                        ${m.isPinned ? 'border-l-2 border-primary pl-4 my-2' : ''}
                      `}>
                        {m.imagenUrl && (
                          <div className={`mb-4 rounded-2xl overflow-hidden ring-1 ring-white/10 group/img relative inline-block max-w-md shadow-2xl`}>
                            <img src={m.imagenUrl} className="w-full h-auto max-h-[500px] cursor-zoom-in group-hover/img:scale-[1.02] transition-transform duration-700" alt="" onClick={() => setPreviewImage(m.imagenUrl!)} />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                              <Search className="text-white w-8 h-8" />
                            </div>
                          </div>
                        )}
                        
                        {m.audioUrl && (
                          <div className={`mb-4 flex items-center gap-4 bg-white/[0.03] backdrop-blur-md p-4 rounded-2xl border border-white/5 w-fit shadow-xl ${isMe ? 'flex-row-reverse text-right ml-auto' : ''}`}>
                             <button onClick={(e) => {
                               const audio = e.currentTarget.nextElementSibling as HTMLAudioElement;
                               if(audio.paused) audio.play(); else audio.pause();
                             }} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shrink-0 hover:scale-105 transition-transform shadow-xl">
                               <Volume2 size={20}/>
                             </button>
                             <audio src={m.audioUrl} className="hidden" />
                             <div className="flex flex-col gap-1.5">
                                <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Mensaje de Voz</span>
                                <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                                   <div className="h-full bg-white/40 animate-pulse w-full" />
                                </div>
                             </div>
                          </div>
                        )}

                        {m.eventId && (
                          <div className={`mb-6 bg-[#111111] border border-white/10 rounded-[2rem] p-6 space-y-5 max-w-sm shadow-2xl ${isMe ? 'ml-auto' : ''}`}>
                             <div className="flex items-center gap-3 text-white font-black text-[9px] uppercase tracking-[0.2em]">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10"><Calendar size={14}/></div> 
                                Invitación de Equipo
                             </div>
                             <h4 className="text-sm font-bold text-white uppercase tracking-tight leading-snug">Evento Interactivo en curso</h4>
                             <button 
                              onClick={() => { setShowEvents(true); }}
                              className="w-full bg-white text-black py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
                             >
                               Confirmar Asistencia
                             </button>
                          </div>
                        )}

                        <div className="whitespace-pre-wrap break-words text-white/90 selection:bg-primary/30">
                          {formatText(decryptMessage(m.texto || '', currentChannel))}
                        </div>
                        
                        <div className={`flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isMe ? 'justify-end' : 'justify-start'}`}>
                           {(m as any).isOffline && <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Pendiente</span>}
                           <span className="text-[8px] text-gray-700 font-bold uppercase tracking-widest">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-[#0d0d0d]/80 backdrop-blur-2xl border-t border-white/10 relative z-20">

            {showEmoji && (
              <div className="absolute bottom-28 left-6 bg-[#111111] border border-white/10 p-3 rounded-2xl shadow-2xl flex gap-2.5 z-[100] animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-200">
                {EMOJIS.map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => { setText(text + emoji); setShowEmoji(false); }}
                    className="text-2xl hover:scale-150 transition-transform p-1 active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {attachedAudio && (
              <div className="mb-4 flex items-center gap-3 p-4 glass-panel border border-primary/20 w-fit animate-in slide-in-from-bottom-4 duration-500 rounded-2xl shadow-xl shadow-primary/5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Volume2 size={24} className="animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Cápsula de Voz</span>
                  <span className="text-[9px] text-gray-500 uppercase tracking-tighter">Lista para transmisión</span>
                </div>
                <button onClick={() => { setAttachedAudio(null); setAudioBlob(null); }} className="ml-4 text-gray-500 hover:text-red-400 p-2 hover:bg-white/5 rounded-lg transition-colors"><X size={20}/></button>
              </div>
            )}

            {attachedImage && (
             <div className="mb-4 flex items-center gap-4 p-3 glass-panel border border-white/10 w-fit animate-in slide-in-from-bottom-4 duration-500 rounded-2xl shadow-xl">
               <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 shadow-inner">
                 <img src={attachedImage} className="w-full h-full object-cover" alt="" />
                 <div className="absolute inset-0 bg-black/20" />
                 <button onClick={() => setAttachedImage(null)} className="absolute top-1 right-1 bg-black/60 text-white p-1.5 rounded-lg backdrop-blur-md hover:bg-red-500 transition-colors"><X size={14}/></button>
               </div>
               <div className="flex flex-col pr-4">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Archivo Visual</span>
                  <span className="text-[9px] text-gray-500 uppercase">Procesado y optimizado</span>
               </div>
             </div>
            )}

             <form onSubmit={handleSubmit} className="flex items-end gap-3 max-w-6xl mx-auto">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0 active:scale-90"><Plus size={24}/></button>
              
              <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-[1.75rem] px-4 py-1.5 focus-within:border-primary/50 focus-within:bg-white/[0.05] transition-all flex items-end gap-1 shadow-inner backdrop-blur-xl">
                <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-3 text-gray-500 hover:text-white transition-colors shrink-0 active:scale-90"><Smile size={24}/></button>
                <textarea
                  value={text + (interimTranscript ? (text ? ' ' : '') + interimTranscript : '')}
                  onChange={e => { setText(e.target.value); handleTyping(); }}
                  onPaste={handlePaste}
                  placeholder={isRecording ? "Escuchando..." : "Escribe un mensaje..."}
                  className={`flex-1 bg-transparent text-[15px] text-white outline-none placeholder-gray-700 px-2 py-3.5 resize-none max-h-48 min-h-[52px] leading-relaxed ${isRecording ? 'text-primary' : ''}`}
                  rows={1}
                  onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                />
                
                 <button type="button" onClick={() => cameraInputRef.current?.click()} className="p-3 text-gray-500 hover:text-white transition-all active:scale-90">
                   <Camera size={24}/>
                 </button>
               </div>

               <div className="shrink-0">
                  { (text.trim() || attachedImage || audioBlob) ? (
                    <button type="submit" disabled={uploading} className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-2xl hover:bg-gray-200">
                      <Send size={24} fill="currentColor" />
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => isRecording ? stopRecording() : startRecording()}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-red-500/30' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5 shadow-lg'}`}
                    >
                      {isRecording ? <MicOff size={24}/> : <Mic size={24}/>}
                    </button>
                  )}
               </div>

               <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf,.docx,.xlsx,.xls,.csv" onChange={(e) => handleImageUpload(e, 'chat')} />
               <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handleImageUpload(e, 'chat')} />
             </form>

        </div>
        {isMobile && isSidebarOpen && (
           <div className="fixed inset-0 bg-black/40 z-[140] backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        )}
      </main>

      {/* MODALS */}
       {showEvents && (
         <div className="fixed inset-y-0 right-0 w-80 bg-[#111111] border-l border-white/10 z-[150] shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Calendar size={18} className="text-white"/> Eventos</h2>
              <button onClick={() => setShowEvents(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
            </div>
            <button onClick={() => setShowCreateEvent(true)} className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-lg text-[10px] font-black uppercase hover:bg-white/10 transition-all">Crear Nuevo Evento</button>
            <div className="space-y-4">
              {events?.map((ev: any) => (
                <div key={ev._id} className="bg-white/5 border border-white/5 p-4 rounded-lg space-y-3">
                  <h3 className="text-xs font-bold text-white">{ev.title}</h3>
                  <p className="text-[10px] text-gray-500 line-clamp-2">{ev.description}</p>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-white bg-white/5 px-2 py-1 rounded w-fit">
                    <Clock size={10}/> {new Date(ev.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[9px] text-gray-600 uppercase font-black">{ev.participants.length} Anotados</span>
                    {ev.participants.includes(user?._id) ? (
                      <button onClick={() => leaveEvent({ eventId: ev._id, userId: user?._id as any })} className="text-[9px] font-black text-red-400 uppercase">Salir</button>
                    ) : (
                      <button onClick={() => joinEvent({ eventId: ev._id, userId: user?._id as any })} className="text-[9px] font-black text-white uppercase">Anotarme</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
         </div>
       )}

       {showPolls && (
         <div className="fixed inset-y-0 right-0 w-80 bg-[#111111] border-l border-white/10 z-[150] shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><HardDrive size={18} className="text-white"/> Encuestas</h2>
              <button onClick={() => setShowPolls(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
            </div>
            <button onClick={() => setShowCreatePoll(true)} className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-lg text-[10px] font-black uppercase hover:bg-white/10 transition-all">Crear Encuesta</button>
            <div className="space-y-4">
              {polls?.map((poll: any) => (
                <div key={poll._id} className="bg-white/5 border border-white/5 p-4 rounded-lg space-y-4">
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
                            <div className="h-full bg-white transition-all duration-1000" style={{ width: `${percentage}%` }} />
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
            <div className="bg-[#111111] border border-white/10 rounded-[2rem] p-8 w-full max-w-sm space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest text-center">Nuevo Evento</h2>
              <div className="space-y-4">
                <input value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="Título del evento" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-white" />
                <textarea value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} placeholder="Descripción..." className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-white h-20 resize-none" />
                <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-white" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCreateEvent(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-500">Cancelar</button>
                 <button 
                   onClick={async () => {
                     const eventId = await createEvent({ channelId: currentChannel, title: newEventTitle, description: newEventDesc, date: new Date(newEventDate).getTime(), userId: user?._id as any });
                     setShowCreateEvent(false);
                     setNewEventTitle(''); setNewEventDesc(''); setNewEventDate('');
                     setSharingEventId(eventId as any);
                   }}
                   className="flex-1 bg-white text-black py-3 rounded-lg text-[10px] font-black uppercase"
                 >
                   Crear
                 </button>

              </div>
            </div>
         </div>
       )}

       {showCreatePoll && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-[#111111] border border-white/10 rounded-[2rem] p-8 w-full max-w-sm space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest text-center">Nueva Encuesta</h2>
              <div className="space-y-4">
                <input value={newPollQuestion} onChange={e => setNewPollQuestion(e.target.value)} placeholder="¿Qué quieres preguntar?" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-white" />
                <div className="space-y-2">
                  {newPollOptions.map((opt, idx) => (
                    <input key={idx} value={opt} onChange={e => {
                      const copy = [...newPollOptions];
                      copy[idx] = e.target.value;
                      setNewPollOptions(copy);
                    }} placeholder={`Opción ${idx + 1}`} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-white" />
                  ))}
                  <button onClick={() => setNewPollOptions([...newPollOptions, ''])} className="text-[9px] font-black text-white uppercase">+ Agregar Opción</button>
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
                  className="flex-1 bg-white text-black py-3 rounded-lg text-[10px] font-black uppercase"
                >
                  Crear
                </button>
              </div>
            </div>
         </div>
       )}

       {sharingEventId && (
         <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
           <div className="bg-[#111111] border border-white/10 rounded-xl p-8 w-full max-w-sm space-y-6 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto text-white mb-4">
                  <Calendar size={32}/>
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">¿Compartir Evento?</h2>
                <p className="text-[10px] text-gray-500 mt-2">Selecciona un chat para enviar la invitación interactiva.</p>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 no-scrollbar">
                {displayChannels?.map((c: any) => (
                  <button 
                    key={c._id} 
                    onClick={async () => {
                      const encrypted = encryptMessage(`📅 *Nuevo Evento:* ¡Se ha creado una actividad!`, c.slug);
                      await sendMessage({ userId: user._id, nombre: user.name, avatar: user.avatar, texto: encrypted, channelId: c.slug, eventId: sharingEventId });
                      setSharingEventId(null);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white"><Hash size={14}/></div>
                    <span className="text-xs text-white font-bold">{c.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setSharingEventId(null)} className="w-full text-[10px] text-gray-500 font-bold uppercase tracking-widest">No compartir, solo guardar</button>
           </div>
         </div>
       )}

       {/* Productivity Modals */}

       {showReminders && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <div className="bg-[#111111] border border-white/10 rounded-xl p-8 w-full max-w-sm space-y-6 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Clock size={18} className="text-white"/> Recordatorios</h2>
                <button onClick={() => setShowReminders(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
              </div>
              <div className="space-y-3">
                <input value={newReminderText} onChange={e => setNewReminderText(e.target.value)} placeholder="¿Qué quieres recordar?" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-white" />
                <input type="datetime-local" value={newReminderDate} onChange={e => setNewReminderDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-white" />
                <button onClick={async () => {
                  await createReminder({ userId: user?._id as any, text: newReminderText, date: new Date(newReminderDate).getTime() });
                  setNewReminderText(''); setNewReminderDate('');
                }} className="w-full bg-white text-black py-3 rounded-lg text-[10px] font-black uppercase">Agregar Alerta</button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 no-scrollbar">
                {reminders?.map((r: any) => (
                  <div key={r._id} className={`p-3 rounded-lg border border-white/5 flex items-center justify-between ${r.completed ? 'bg-white/5 opacity-50' : 'bg-white/[0.02]'}`}>
                    <div>
                      <p className={`text-xs text-white ${r.completed ? 'line-through' : ''}`}>{r.text}</p>
                      <p className="text-[8px] text-gray-500 uppercase font-black">{new Date(r.date).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleReminder({ reminderId: r._id })} className="text-white"><Clock size={14}/></button>
                      <button onClick={() => deleteReminder({ reminderId: r._id })} className="text-white/50"><X size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
           </div>
         </div>
       )}

       {showNotes && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <div className="bg-[#111111] border border-white/10 rounded-xl p-8 w-full max-w-sm space-y-6 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><FileText size={18} className="text-white"/> Mis Notas</h2>
                <button onClick={() => setShowNotes(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
              </div>
              <div className="space-y-3">
                <input value={newNoteTitle} onChange={e => setNewNoteTitle(e.target.value)} placeholder="Título..." className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs font-bold outline-none focus:border-white" />
                <textarea value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} placeholder="Contenido de la nota..." className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-white h-24 resize-none" />
                <div className="flex gap-2">
                  <button onClick={async () => {
                    if (editingNoteId) {
                      await updateNote({ noteId: editingNoteId as any, title: newNoteTitle, content: newNoteContent });
                    } else {
                      await createNote({ userId: user?._id as any, title: newNoteTitle, content: newNoteContent });
                    }
                    setNewNoteTitle(''); setNewNoteContent(''); setEditingNoteId(null);
                  }} className="flex-1 bg-white text-black py-3 rounded-lg text-[10px] font-black uppercase">
                    {editingNoteId ? 'Actualizar Nota' : 'Guardar Nota'}
                  </button>
                  {editingNoteId && (
                    <button onClick={() => { setEditingNoteId(null); setNewNoteTitle(''); setNewNoteContent(''); }} className="px-4 bg-white/5 text-gray-500 rounded-lg"><X size={16}/></button>
                  )}
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 no-scrollbar">
                {notes?.map((n: any) => (
                  <div key={n._id} className="p-3 rounded-lg border border-white/5 bg-white/[0.02] group">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[10px] font-black text-white uppercase">{n.title}</h4>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => {
                          setEditingNoteId(n._id);
                          setNewNoteTitle(n.title);
                          setNewNoteContent(n.content);
                        }} className="text-white"><Plus size={12} className="rotate-45"/></button>
                        <button onClick={async () => {
                          const encrypted = encryptMessage(`📒 *Nota compartida:* ${n.title}\n\n${n.content}`, currentChannel);
                          await sendMessage({ userId: user._id, nombre: user.name, avatar: user.avatar, texto: encrypted, channelId: currentChannel });
                          setShowNotes(false);
                        }} className="text-white"><Send size={12}/></button>
                        <button onClick={() => deleteNote({ noteId: n._id })} className="text-white"><X size={12}/></button>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-3">{n.content}</p>
                  </div>
                ))}
              </div>

           </div>
         </div>
       )}

       {showFriendsModal && (
         <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
           <div className="bg-[#111111] border border-white/10 rounded-xl p-8 w-full max-w-sm space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Users size={18} className="text-white"/> Contactos</h2>
                <button onClick={() => setShowFriendsModal(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-2 no-scrollbar">
                {friendsList?.length === 0 ? (
                  <p className="text-center text-[10px] text-gray-500 py-8 uppercase font-black">No tienes amigos agregados aún</p>
                ) : (
                  friendsList?.map((friend: any) => (
                    <button 
                      key={friend._id} 
                      onClick={() => { startDM(friend); setShowFriendsModal(false); }}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/5 group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={friend.avatar} className="w-10 h-10 rounded-lg border border-white/10" alt="" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-white">{friend.name}</p>
                          <p className="text-[9px] text-gray-500 uppercase font-black">@{friend.username}</p>
                        </div>
                      </div>
                      <div className="bg-white/10 p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <MessageSquare size={14}/>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <button 
                onClick={() => { setShowUserSearch(true); setShowFriendsModal(false); }}
                className="w-full bg-white/5 hover:bg-white/10 text-white/40 py-4 rounded-lg font-bold uppercase text-[10px] tracking-widest border border-white/10 transition-all"
              >
                Buscar más personas
              </button>
           </div>
         </div>
       )}

       {showPasswords && (

         <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
           <div className="bg-[#101010] border border-white/5 rounded-xl p-8 w-full max-w-sm space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-white" />
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Lock size={18} className="text-white"/> Key Manager</h2>
                <button onClick={() => { setShowPasswords(false); setIsBiometricVerified(false); }} className="text-gray-500 hover:text-white"><X size={20}/></button>
              </div>

              {!isBiometricVerified ? (
                <div className="text-center space-y-6 py-8">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto text-white animate-pulse">
                    <User size={40}/>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Seguridad Biométrica</h3>
                    <p className="text-[10px] text-gray-500 mt-2">Para acceder a tus llaves, usa tu huella o escaneo facial.</p>
                  </div>
                  <button 
                    onClick={async () => {
                      if (window.confirm('¿Deseas usar la autenticación biométrica de este dispositivo?')) {
                        setIsBiometricVerified(true);
                      }
                    }}
                    className="w-full bg-white text-black py-4 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-white/20"
                  >
                    Verificar Identidad
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowQRScanner(true)}
                      className="flex-1 bg-white/10 border border-white/20 text-white py-3 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2"
                    >
                      <ScanLine size={16}/> Escanear QR
                    </button>
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Bóveda Aurora</div>
                  </div>

                  {showQRScanner && (
                    <div className="fixed inset-0 bg-black/95 z-[500] flex flex-col items-center justify-center p-6">
                       <button onClick={() => setShowQRScanner(false)} className="absolute top-8 right-8 text-white/50"><X size={32}/></button>
                       <div id="qr-reader" className="w-full max-w-sm rounded-xl overflow-hidden border-4 border-white/30" />
                       <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mt-6">Apunta al código QR de acceso</p>
                    </div>
                  )}

                  <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">

                    <input value={newPassSite} onChange={e => setNewPassSite(e.target.value)} placeholder="Sitio Web / App" className="w-full bg-transparent border-b border-white/10 px-1 py-2 text-white text-xs outline-none focus:border-white" />
                    <input value={newPassUser} onChange={e => setNewPassUser(e.target.value)} placeholder="Usuario" className="w-full bg-transparent border-b border-white/10 px-1 py-2 text-white text-xs outline-none focus:border-white" />
                    <input type="password" value={newPassVal} onChange={e => setNewPassVal(e.target.value)} placeholder="Contraseña" className="w-full bg-transparent border-b border-white/10 px-1 py-2 text-white text-xs outline-none focus:border-white" />
                    <button onClick={async () => {
                      await createPassword({ userId: user?._id as any, site: newPassSite, username: newPassUser, encryptedPassword: newPassVal });
                      setNewPassSite(''); setNewPassUser(''); setNewPassVal('');
                    }} className="w-full bg-white/10 text-white py-3 rounded-lg text-[9px] font-black uppercase hover:bg-white/20 transition-all mt-2">Guardar Llave</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-3 no-scrollbar pr-1">
                    {storedPasswords?.map((p: any) => (
                      <div key={p._id} className="p-4 rounded-lg bg-white/[0.03] border border-white/5 space-y-2 relative group">
                        <button onClick={() => deletePassword({ passwordId: p._id })} className="absolute top-4 right-4 text-white/30 hover:text-white opacity-0 group-hover:opacity-100 transition-all"><X size={14}/></button>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{p.site}</h4>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-gray-500 uppercase font-bold">Usuario: {p.username}</span>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white font-mono">••••••••</span>
                            <button onClick={() => alert(`Contraseña: ${p.encryptedPassword}`)} className="text-white text-[9px] font-black uppercase">Revelar</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
           </div>
         </div>
       )}

       {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">


          <div className="bg-[#111111] rounded-[2rem] border border-white/10 p-8 w-full max-w-md space-y-8 shadow-2xl relative">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24}/></button>
            <div className="text-center space-y-4">
              <div className="relative w-32 h-32 mx-auto group">
                <img src={editAvatar} className="w-full h-full rounded-xl object-cover shadow-2xl ring-4 ring-white/10" alt="" />
                <button onClick={() => profileImageInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={32}/>
                </button>
                <input type="file" ref={profileImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-[0.2em]">Editar Perfil</h2>
            </div>
            <div className="space-y-4">
              <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nombre completo" className="w-full bg-white/5 border border-white/10 rounded-lg px-5 py-4 text-white text-sm outline-none focus:border-white" />
              <textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Biografía" className="w-full bg-white/5 border border-white/10 rounded-lg px-5 py-4 text-white text-sm outline-none focus:border-white resize-none h-24" />
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase px-4">Teléfono</label>
                <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+54 9..." className="w-full bg-white/5 border border-white/10 rounded-lg px-5 py-4 text-white text-sm focus:border-white outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase px-4">Contraseña</label>
                <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="Nueva contraseña" className="w-full bg-white/5 border border-white/10 rounded-lg px-5 py-4 text-white text-sm focus:border-white outline-none transition-all" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase px-4">Privacidad de Mensajes</label>
                <div className="flex gap-2 px-1">
                  <button 
                    onClick={() => setEditPrivacy('everyone')}
                    className={`flex-1 py-3 rounded-lg text-[10px] font-bold uppercase transition-all ${editPrivacy === 'everyone' ? 'bg-white text-black' : 'bg-white/5 text-gray-500'}`}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setEditPrivacy('requests')}
                    className={`flex-1 py-3 rounded-lg text-[10px] font-bold uppercase transition-all ${editPrivacy === 'requests' ? 'bg-white text-black' : 'bg-white/5 text-gray-500'}`}
                  >
                    Solicitudes
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase px-4">Color de Tema</label>
                <div className="flex gap-2 px-1">
                   {['#ffffff', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'].map(color => (
                     <button 
                        key={color} 
                        onClick={() => setEditThemeColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${editThemeColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50'}`}
                        style={{ backgroundColor: color }}
                     />
                   ))}
                </div>
              </div>
            </div>
            <button 
              onClick={async () => {
                const updated = await updateProfile({
                  userId: user._id as any,
                  name: editName,
                  bio: editBio,
                  phone: editPhone,
                  avatar: editAvatar,
                  password: editPassword,
                  privacyMode: editPrivacy as any,
                  themeColor: editThemeColor
                });
                if (updated) setUser(updated as any);
                setShowProfileModal(false);
              }} 
              className="w-full bg-white hover:bg-gray-200 text-black py-5 rounded-lg font-bold uppercase tracking-widest shadow-xl"
            >
              Guardar Cambios
            </button>


          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#111111] rounded-[2rem] border border-white/10 p-8 w-full max-w-sm space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white text-center uppercase tracking-widest">Publicar Estado</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { const text = prompt('Escribe tu estado:'); if(text) handlePostStatus(text, 'text'); }} className="aspect-square bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-3 text-white">
                <FileText size={32}/><span className="text-[10px] font-bold uppercase">Texto</span>
              </button>
              <button onClick={() => { const input = document.createElement('input'); input.type='file'; input.accept='image/*'; input.onchange=(e:any)=>handleImageUpload(e, 'status'); input.click(); }} className="aspect-square bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-3 text-white">
                <Camera size={32}/><span className="text-[10px] font-bold uppercase">Foto</span>
              </button>
            </div>
            <button onClick={() => setShowStatusModal(false)} className="w-full bg-white/5 text-gray-500 py-4 rounded-lg font-bold uppercase text-[10px]">Cancelar</button>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-8 animate-fadeIn" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-8 right-8 text-white/40 hover:text-white transition-all"><X size={48}/></button>
          <img src={previewImage} className="max-w-full max-h-full rounded-lg shadow-2xl object-contain ring-1 ring-white/10" alt="" onClick={e => e.stopPropagation()}/>
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
                    {viewingStatus.content}
                 </div>
               ) : (
                 <img src={viewingStatus.content} className="w-full h-full object-cover" alt="" />
               )}

               {/* Story Interactions */}
               <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent space-y-4">
                  <div className="flex justify-center gap-4">
                    {['❤️', '🔥', '😂', '👏', '😮'].map(emoji => (
                      <button 
                        key={emoji}
                        onClick={async () => {
                          const encrypted = encryptMessage(`Reaccionó a tu historia: ${emoji}`, `dm-${user._id}-${viewingStatus.userId}`);
                          await sendMessage({ userId: user._id, nombre: user.name, avatar: user.avatar, texto: encrypted, channelId: `dm-${user._id}-${viewingStatus.userId}` });
                          setViewingStatus(null);
                        }}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      placeholder="Responder historia..." 
                      className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white text-[11px] outline-none focus:border-primary"
                      onKeyDown={async (e) => {
                        if(e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value;
                          if(!val) return;
                          const encrypted = encryptMessage(`Respondió a tu historia: ${val}`, `dm-${user._id}-${viewingStatus.userId}`);
                          await sendMessage({ userId: user._id, nombre: user.name, avatar: user.avatar, texto: encrypted, channelId: `dm-${user._id}-${viewingStatus.userId}` });
                          setViewingStatus(null);
                        }
                      }}
                    />
                  </div>
               </div>
            </div>


         </div>
       )}

      {showUserSearch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#111111] rounded-xl border border-white/10 p-6 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Buscar Usuarios</h3>
            <input value={userSearchQuery} onChange={e => setUserSearchQuery(e.target.value)} placeholder="Nombre o @usuario..." className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-primary" autoFocus />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchedUsers?.filter((u: any) => u._id !== user._id).map((u: any) => (
                <button key={u._id} onClick={() => startDM(u)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all">
                  <img src={u.avatar} className="w-10 h-10 rounded-lg" alt="" />
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
          <div className="bg-[#111111] rounded-xl border border-white/10 w-full max-w-[320px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative" onClick={e => e.stopPropagation()}>
            
            {/* Header / Avatar */}
            <div className="bg-gradient-to-b from-primary/20 to-transparent p-8 text-center relative">
              <button onClick={() => setViewingProfileUser(null)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"><X size={20}/></button>
              <div className="relative w-28 h-28 mx-auto mb-4 group">
                <img src={viewingProfileUser.avatar} className="w-full h-full rounded-xl object-cover shadow-2xl ring-4 ring-primary/10 transition-transform group-hover:scale-105 duration-500" alt="" />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#1a1a1a]" title="En línea" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{viewingProfileUser.name}</h2>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] opacity-70">@{viewingProfileUser.username || 'usuario'}</p>
            </div>

            {/* Info Sections */}
            <div className="px-6 pb-8 space-y-4">
              <div className="space-y-1 bg-white/5 rounded-lg p-4 border border-white/5">
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
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-500">
                    <AlertCircle size={18} className="animate-bounce" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Atención Equipo</p>
                    <p className="text-[11px] text-amber-500/80">El moderador está redactando un mensaje importante. El chat se reanudará pronto.</p>
                  </div>
                </div>
              )}

              {viewingProfileUser.phone && (
                <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
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
                  className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  <MessageSquare size={16} /> Chatear ahora
                </button>

                {user._id !== viewingProfileUser._id && !friendsList?.find((f:any) => f._id === viewingProfileUser._id) && !sentFriendRequests?.find((r:any) => r.user2Id === viewingProfileUser._id) && (
                  <button 
                    onClick={() => sendFriendRequest({ fromId: user._id as any, toId: viewingProfileUser._id })}
                    className="w-full bg-white text-black py-4 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl"
                  >
                    <Users size={16} /> Agregar Amigo
                  </button>
                )}

                {channelData?.createdBy === user?._id && user?._id !== viewingProfileUser._id && (
                  <button 
                    onClick={async () => {
                      const isMod = channelData.moderators?.includes(viewingProfileUser._id);
                      if (isMod) {
                        await removeModerator({ channelId: channelData._id, userId: viewingProfileUser._id, ownerId: user?._id as any });
                      } else {
                        await addModerator({ channelId: channelData._id, userId: viewingProfileUser._id, ownerId: user?._id as any });
                      }
                    }}
                    className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] border transition-all ${channelData.moderators?.includes(viewingProfileUser._id) ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 text-white border-white/10'}`}
                  >
                    {channelData.moderators?.includes(viewingProfileUser._id) ? 'Quitar Moderador' : 'Hacer Moderador'}
                  </button>
                )}

                {sentFriendRequests?.find((r:any) => r.user2Id === viewingProfileUser._id) && (
                  <div className="w-full bg-emerald-500/10 text-emerald-500 py-4 rounded-lg font-black uppercase tracking-widest text-[9px] border border-emerald-500/20 flex items-center justify-center gap-2">
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

      {showExpenses && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl md:p-12">
          <div className="w-full h-full md:rounded-xl overflow-hidden border border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-500">
             <ExpensesHub userId={user._id} onClose={() => setShowExpenses(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
