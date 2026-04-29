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
  AtSign, Play, Pause, MessageCircle, PieChart, ChevronLeft,
  Edit2, Trash2, Check, Globe, CheckCheck, Sun, Moon, Share2
} from 'lucide-react';

import { useUserStore } from './store';
import Onboarding from './components/Onboarding';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Ticket, Type } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { parseFile } from './lib/fileParser';
import imageCompression from 'browser-image-compression';
import { encryptMessage, decryptMessage } from './lib/encryption';
import { Html5Qrcode } from "html5-qrcode";
import { persistenceService } from './lib/persistence';
import { expenseAgent } from './lib/expenseAgent';
import ExpensesHub from './features/expenses/ExpensesHub';
import ErrorDisplay from './components/ErrorDisplay';
import { parseExpenseMessage } from './lib/expenseAgent';

const APP_VERSION = '1.0.8'; // Increment this to force cache clear


const EMOJIS = ['🚀', '🔥', '🧠', '💰', '❤️', '👍', '🎯', '⚡', '✨', '💬'];
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3';

function AuroraChat() {
  // 1. Hooks & State Declarations (Top Level)
  const { user, setUser, logout } = useUserStore();

  // Basic UI State
  const [text, setText] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
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
  const [currentGallery, setCurrentGallery] = useState<string[]>([]);
  const [viewingGalleryIndex, setViewingGalleryIndex] = useState(0);
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('fontSize') || '14'));
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list'); // WhatsApp style view management
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallWindow, setIsSmallWindow] = useState(window.innerWidth <= 1024);
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

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
  const [selectedFriendsToInvite, setSelectedFriendsToInvite] = useState<string[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  // Edit / Delete / Context Menu
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingMsgText, setEditingMsgText] = useState('');
  const [contextMenu, setContextMenu] = useState<{ msgId: string; x: number; y: number; isMe: boolean } | null>(null);

  // Link previews cache: msgId -> preview data
  const [linkPreviews, setLinkPreviews] = useState<Record<string, any>>({});

  // Statuses already seen (stored in localStorage)
  const [seenStatuses, setSeenStatuses] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('aurora_seen_statuses') || '[]')); }
    catch { return new Set(); }
  });

  // Theme: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (localStorage.getItem('aurora_theme') as 'dark' | 'light') || 'dark'
  );

  // Apply / remove 'light' class on <html>
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('aurora_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [editPrivacy, setEditPrivacy] = useState(user?.privacyMode || 'everyone');
  const [editThemeColor, setEditThemeColor] = useState(user?.themeColor || '#6366f1');
  const [editPassword, setEditPassword] = useState(user?.password || '');
  const [viewingProfileUser, setViewingProfileUser] = useState<any>(null);

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
  const rawChannels = useQuery(api.chat.getChannels, isValidUser ? { userId: user._id as string } : "skip");
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
  const deleteMessageMutation = useMutation(api.chat.deleteMessage);
  const editMessageMutation = useMutation(api.chat.editMessage);
  const deleteChannelMutation = useMutation(api.chat.deleteChannel);
  const handleSelectChannel = (slug: string) => {
    const ch = channelsList.find((c: any) => c.slug === slug);
    if (ch?.isPrivate && !verifiedChannels.includes(slug) && ch.createdBy !== user?._id) {
      setSelectedPrivateChannel(slug);
      setShowPasswordModal(true);
      return;
    }
    setCurrentChannel(slug);
    if (isMobile) {
      setMobileView('chat');
      setIsSidebarOpen(false);
    }
  };
  const addModerator = useMutation(api.chat.addModerator);
  const removeModerator = useMutation(api.chat.removeModerator);

  // Local Storage Caching Hooks
  useEffect(() => {
    if (rawChannels) localStorage.setItem('aurora_cache_channels', JSON.stringify(rawChannels));
  }, [rawChannels]);

  useEffect(() => {
    if (rawMessagesData) localStorage.setItem('aurora_msgs_' + currentChannel, JSON.stringify(rawMessagesData));
  }, [rawMessagesData, currentChannel]);

  // Computed Values
  const channelsList = Array.isArray(rawChannels) ? rawChannels : (JSON.parse(localStorage.getItem('aurora_cache_channels') || '[]'));

  const rawMsgsToUse = rawMessagesData || JSON.parse(localStorage.getItem('aurora_msgs_' + currentChannel) || 'null');
  const messages = (rawMsgsToUse?.messages && Array.isArray(rawMsgsToUse.messages)) ? rawMsgsToUse.messages as ChatMessage[] : [];

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
      setIsMobile(window.innerWidth <= 768);
      setIsSmallWindow(window.innerWidth <= 1024);
      if (window.innerWidth <= 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
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
    const timer = setTimeout(() => setShowSplash(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Handle Join Link from URL
  useEffect(() => {
    if (!user || channelsList.length === 0) return;
    const searchParams = new URLSearchParams(window.location.search);
    const joinSlug = searchParams.get('join');
    if (joinSlug && joinSlug !== currentChannel) {
      window.history.replaceState({}, document.title, window.location.pathname);
      handleSelectChannel(joinSlug);
    }
  }, [user, channelsList.length]);

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
        () => { }
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
        audioRef.current?.play().catch(() => { });
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

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [contextMenu]);

  // Fetch link preview from a message (client-side via allorigins proxy)
  const fetchLinkPreview = useCallback(async (msgId: string, url: string) => {
    if (linkPreviews[msgId] !== undefined) return;
    setLinkPreviews(prev => ({ ...prev, [msgId]: null })); // mark as loading
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      // Use a CORS-friendly meta scraper
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      const getMeta = (name: string) =>
        doc.querySelector(`meta[property='${name}']`)?.getAttribute('content') ||
        doc.querySelector(`meta[name='${name}']`)?.getAttribute('content') || '';
      const preview = {
        url,
        domain,
        title: getMeta('og:title') || doc.title || domain,
        description: getMeta('og:description') || getMeta('description'),
        image: getMeta('og:image'),
      };
      setLinkPreviews(prev => ({ ...prev, [msgId]: preview }));
    } catch {
      setLinkPreviews(prev => ({ ...prev, [msgId]: { url, domain: '', title: url, description: '', image: '' } }));
    }
  }, [linkPreviews]);

  const markStatusSeen = useCallback((statusId: string) => {
    setSeenStatuses(prev => {
      const next = new Set(prev);
      next.add(statusId);
      localStorage.setItem('aurora_seen_statuses', JSON.stringify([...next]));
      return next;
    });
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
    let files: File[] = [];
    if (fileOrEvent.target) {
      files = Array.from(fileOrEvent.target.files || []);
    } else {
      files = [fileOrEvent];
    }
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      for (const file of files) {
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
              setAttachedImages(prev => [...prev, result]);
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
      }
    } catch (err) {
      console.error('Error al procesar imagen:', err);
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.indexOf('image') !== -1) {
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
    if ((!text.trim() && attachedImages.length === 0) || uploading || !user) return;

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
imagenUrl: attachedImages.length > 0 ? attachedImages[0] : undefined
      }]);
      setText(''); setAttachedImages([]); setShowEmoji(false);
      return;
    }

    try {
      await sendMessage({
        userId: user._id, nombre: user.name, avatar: user.avatar,
        texto: encryptedText,
        imagenUrl: attachedImages.length > 0 ? attachedImages[0] : undefined,
        audioUrl: attachedAudio || undefined,
        channelId: currentChannel,
      });

      // Expense Agent: parse natural language for expenses
      const parsedExpense = expenseAgent.parse(text);
      if (parsedExpense) {
        try {
          await addExpenseMutation({
            userId: user._id,
            amount: parsedExpense.amount,
            category: parsedExpense.category,
            note: parsedExpense.note,
            type: parsedExpense.type
          });
          await sendMessage({
            userId: 'aurora-ai',
            nombre: 'Aurora Agent',
            avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
            texto: encryptMessage(`✅ ${parsedExpense.type === 'expense' ? 'Gasto' : 'Ingreso'} registrado: $${parsedExpense.amount} en ${parsedExpense.category}`, currentChannel),
            channelId: currentChannel,
          });
        } catch (e) {
          console.error('Error saving expense:', e);
        }
      }

      // AI Agent Aurora logic
      if (text.toLowerCase().includes('@aurora')) {
        const prompt = text.replace(/@aurora/gi, '').trim();

        setTimeout(async () => {
          let response = `Hola ${user.name}, estoy procesando tu solicitud... 🧠`;

          try {
            const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": "Bearer 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",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                "model": "mistralai/mistral-7b-instruct:free",
                "messages": [
                  { "role": "system", "content": "Eres Aurora, una asistente inteligente avanzada de la plataforma Aurora Chat. Responde de forma concisa, útil y en español." },
                  { "role": "user", "content": prompt }
                ]
              })
            });
            const data = await aiRes.json();
            response = data.choices?.[0]?.message?.content || `He procesado tu mensaje: "${prompt}". Estoy a tu disposición para cualquier consulta.`;
          } catch (e) {
            response = `Lo siento, mi conexión con el servidor de IA está saturada. Pero sigo aquí para ayudarte en lo que pueda.`;
          }

          await sendMessage({
            userId: 'aurora-ai',
            nombre: 'Aurora Agent',
            avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
            texto: encryptMessage(response, currentChannel),
            channelId: currentChannel,
          });
        }, 500);
      }

      setText(''); setAttachedImages([]); setAttachedAudio(null); setAudioBlob(null); setShowEmoji(false);
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


  const formatText = (content: string, msgId?: string) => {
    const URL_REGEX = /(https?:\/\/[^\s<>"]+)/gi;
    const CODE_BLOCK_REGEX = /```(\w*)\n?([\s\S]*?)```/g;

    // Detect if content has a bare URL (no markdown)
    const urlMatch = content.match(URL_REGEX);
    if (urlMatch && msgId) {
      urlMatch.forEach(url => fetchLinkPreview(msgId, url));
    }

    const parts = content.split(/(@\w+)/g);
    const processedContent = parts.map(part => {
      if (part.startsWith('@')) return `**${part}**`;
      return part;
    }).join('');

    return (
      <div className="prose prose-invert max-w-none text-[13px]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const lang = match ? match[1] : 'code';
              const codeStr = String(children).replace(/\n$/, '');
              if (!inline && (match || (String(children).includes('\n')))) {
                return (
                  <CodeBlock lang={lang} code={codeStr} />
                );
              }
              return <code className="bg-sidebar/10 px-1.5 py-0.5 rounded text-[11px] font-mono text-primary/90">{children}</code>;
            },
            a: ({ children, href, ...props }: any) => (
              <a className="text-primary hover:underline font-semibold break-all" target="_blank" rel="noopener noreferrer" href={href} {...props}>{children}</a>
            ),
            p: ({ children }: any) => <p className="mb-0.5 last:mb-0 leading-relaxed">{children}</p>
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };

  // Separate CodeBlock component for copy button
  function CodeBlock({ lang, code }: { lang: string; code: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(code);
        } else {
          // Fallback for non-secure contexts or older browsers
          const textArea = document.createElement('textarea');
          textArea.value = code;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch (err) {
        console.warn('Failed to copy:', err);
      }
    };
    return (
      <div className="code-block-wrapper">
        <div className="code-block-header">
          <span className="code-block-lang">{lang}</span>
          <button className={`code-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? <><Check size={10} className="inline mr-1" />Copiado</> : <><Copy size={10} className="inline mr-1" />Copiar</>}
          </button>
        </div>
        <SyntaxHighlighter style={atomDark} language={lang} PreTag="div"
          customStyle={{ margin: 0, background: 'transparent', fontSize: '11px', padding: '10px 12px' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  if (!user) return (
    <Onboarding />
  );

  const currentChat = [...(displayChannels || []), ...(displayStatuses || [])].find(c => (c as any).slug === currentChannel) || { name: 'Chat' };

  return (
    <div className={`h-full w-full flex overflow-hidden theme-bg selection:bg-primary/20 view-transition ${showSplash ? 'scale-105 blur-sm' : 'scale-100 blur-0'}`}>
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <audio ref={audioRef} src={NOTIFICATION_SOUND} preload="auto" />



      {/* PORTAL / SIDEBAR */}
      <aside className={`
          ${isMobile ? (mobileView === 'list' ? 'w-full' : 'w-0 hidden') : (isSidebarOpen ? 'w-[300px]' : 'w-0')}
          ${isMobile ? 'relative z-[150]' : 'relative shrink-0'}
          border-r flex flex-col transition-all duration-300 ease-in-out overflow-hidden
          ${!isSidebarOpen && !isMobile ? 'border-none' : ''}
        `} style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border-glass)' }}>

        {/* Compact User Header */}
        <div className="pt-[env(safe-area-inset-top,12px)] pb-3 px-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar with electric loader ring when has unseen statuses */}
            <button
              onClick={() => {
                const unseenStatus = displayStatuses?.find((s: any) => !seenStatuses.has(s._id));
                if (unseenStatus) setViewingStatus(unseenStatus);
                else setShowStatusModal(true);
              }}
              className="relative"
            >
              <div className={`w-10 h-10 rounded-full overflow-hidden relative z-10 border-2 border-[#0d0d0d] ${displayStatuses?.some((s: any) => !seenStatuses.has(s._id)) ? 'status-ring' : ''
                }`}>
                <img src={user.avatar} className="w-full h-full object-cover rounded-full" alt="" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-[1.5px] border-[#0d0d0d] z-20" />
            </button>
            <div>
              <h2 className="text-sm font-bold theme-text tracking-tight">Aurora</h2>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-primary/40"/>
                <div className="w-1 h-1 rounded-full bg-primary/40"/>
                <div className="w-1 h-1 rounded-full bg-primary/40"/>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {channelData?.type !== 'direct' && (
              <button onClick={() => togglePause({ channelId: currentChannel })} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }} title={channelData?.isPaused ? 'Reanudar chat' : 'Pausar chat'}>
                {channelData?.isPaused ? <Play size={15}/> : <Pause size={15}/>}
              </button>
            )}
            <button onClick={() => setShowStatusModal(true)} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }} title="Nuevo estado"><Plus size={15} /></button>
            <button onClick={() => setShowNotes(true)} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }} title="Mis Notas"><FileText size={15} /></button>
            <button onClick={() => setShowUserSearch(true)} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }} title="Buscar Usuarios"><Search size={15} /></button>
            <button onClick={() => setShowPasswords(true)} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }} title="Bóveda de Claves"><Lock size={15} /></button>
            <button onClick={() => setShowExpenses(true)} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }} title="Finanzas"><PieChart size={15} /></button>
            <button onClick={() => setShowFontSettings(!showFontSettings)} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }} title="Tamaño de letra"><Edit2 size={15} /></button>
            <button onClick={toggleTheme} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        {showFontSettings && (
          <div className="px-4 py-3 border-b border-white/[0.06] bg-sidebar/50 animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold theme-text-sec uppercase tracking-widest">Tamaño de Texto: {fontSize}px</span>
              <button onClick={() => setShowFontSettings(false)} className="theme-text-muted"><X size={14}/></button>
            </div>
            <input 
              type="range" min="12" max="24" value={fontSize} 
              onChange={e => {
                const val = parseInt(e.target.value);
                setFontSize(val);
                localStorage.setItem('fontSize', val.toString());
              }}
              className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar w-full pb-16">

          {/* Channels & Chats List (WhatsApp compact) */}
          <div className="pt-2 pb-1 px-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Salas</span>
              <button onClick={() => setShowCreateChannel(true)} className="text-gray-600 hover:text-primary transition-all p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-sidebar/5 active:scale-95"><Plus size={18} /></button>
            </div>
            {/* Global */}
            <button onClick={() => handleSelectChannel('global')}
              className={`chat-item w-full ${currentChannel === 'global' ? 'bg-primary/10' : 'theme-hover'}`}>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                <Hash size={16} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-[13px] font-semibold theme-text">General</span>
                </div>
                <span className="text-[11px] theme-text-sec truncate block">Conversación global</span>
              </div>
            </button>
            {channelsList.filter((c: any) => c.slug !== 'global' && !c.type).map((c: any) => (
              <button key={c._id} onClick={() => handleSelectChannel(c.slug)}
                className={`chat-item w-full ${currentChannel === c.slug ? 'bg-primary/10' : 'hover:bg-sidebar/[0.04]'}`}>
                <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  {c.isPrivate ? <Lock size={15} /> : <Hash size={15} />}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[13px] font-semibold theme-text truncate">{c.name}</span>
                    {c.lastMessage && <span className="text-[10px] text-gray-600 shrink-0 ml-1">{new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  <span className="text-[11px] text-gray-500 truncate block">{c.lastMessage ? decryptMessage(c.lastMessage.texto, c.slug).slice(0, 40) : 'Sin mensajes'}</span>
                </div>
              </button>
            ))}
          </div>

          {/* DM list */}
          {channelsList.filter((c: any) => c.type === 'direct').length > 0 && (
            <div className="pt-2 pb-1 px-3">
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Mensajes</span>
                <button onClick={() => setShowUserSearch(true)} className="text-gray-600 hover:text-emerald-500 transition-all p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-sidebar/5 active:scale-95"><Plus size={18} /></button>
              </div>
              {channelsList.filter((c: any) => c.type === 'direct').map((c: any) => {
                // Calculate unread (simple mock or from seenStatuses if we had unread counts)
                // We'll use a visual placeholder for unread if the last message is not from me and not seen (if we track it that way)
                const lastMsgStr = c.lastMessage ? decryptMessage(c.lastMessage.texto, c.slug) : 'Inicia una conversación';
                const displayName = c.otherUser?.name || c.name;
                const isUnread = c.lastMessage && c.lastMessage.userId !== user?._id && currentChannel !== c.slug;
                return (
                  <button key={c._id} onClick={() => handleSelectChannel(c.slug)}
                    className={`chat-item w-full ${currentChannel === c.slug ? 'bg-emerald-500/5' : 'theme-hover'}`}>
                    <div className="w-11 h-11 rounded-full border theme-border overflow-hidden shrink-0">
                      {c.otherUser?.avatar ? (
                        <img src={c.otherUser.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-lg font-bold">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-[14px] font-semibold theme-text truncate">{displayName}</span>
                        {c.lastMessage && <span className={`text-[11px] shrink-0 ml-2 ${isUnread ? 'text-emerald-500 font-bold' : 'theme-text-muted'}`}>{new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-[12px] truncate block leading-snug ${isUnread ? 'theme-text font-semibold' : 'theme-text-sec'}`}>{lastMsgStr}</span>
                        {isUnread && <span className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] theme-text font-bold ml-2 shrink-0">1</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

        </div>


        {/* Bottom Nav */}
        <div className="absolute bottom-0 left-0 right-0 backdrop-blur-xl border-t flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,0px)] pt-2 z-[160] theme-nav theme-border">
          <button onClick={() => { setMobileView('list'); setShowExpenses(false); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${!showExpenses ? 'text-primary' : 'theme-text-sec'}`}>
            <MessageCircle size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Chats</span>
          </button>
          <button onClick={() => { setShowFriendsModal(true); }}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg theme-text-sec">
            <Users size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Gente</span>
          </button>
          <button onClick={() => setShowCreateChannel(true)}
            className="w-11 h-11 bg-primary theme-text-on-pri rounded-full flex items-center justify-center -translate-y-3 shadow-xl shadow-primary/30 border-2 active:scale-90 transition-transform">
            <Plus size={22} />
          </button>
          <button onClick={() => { setShowExpenses(true); setMobileView('chat'); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${showExpenses ? 'text-primary' : 'theme-text-sec'}`}>
            <Wallet size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Neto</span>
          </button>
          <button onClick={() => { setShowNotes(true); }}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg theme-text-sec">
            <FileText size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Notas</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`
          ${isMobile ? (mobileView === 'chat' ? 'w-full' : 'w-0 hidden') : 'flex-1'} 
          flex flex-col relative overflow-hidden min-h-0
        `} style={{ background: 'var(--bg-deep)' }}>

        {/* Chat Header - compact */}
        <div className="min-h-[3.5rem] pt-[env(safe-area-inset-top,8px)] pb-2 px-3 border-b flex items-center justify-between backdrop-blur-xl z-10" style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-glass)' }}>
          <div className="flex items-center gap-2">
            {isMobile && (
              <button onClick={() => setMobileView('list')} className="p-1.5 text-gray-500 hover:theme-text">
                <ChevronLeft size={20} />
              </button>
            )}
            {!isMobile && (
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 text-gray-500 hover:theme-text transition-all">
                <MoreVertical size={16} />
              </button>
            )}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                if ((currentChat as any).type === 'direct' && (currentChat as any).otherUser) {
                  setViewingProfileUser((currentChat as any).otherUser);
                }
              }}
            >
              {(currentChat as any).type === 'direct' && (currentChat as any).otherUser ? (
                <div className="w-9 h-9 rounded-full border theme-border overflow-hidden shrink-0">
                  {((currentChat as any).otherUser.avatar) ? (
                    <img src={(currentChat as any).otherUser.avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
                      {(currentChat as any).otherUser.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                  <Hash size={16} />
                </div>
              )}
              <div>
                <h2 className="text-[14px] font-bold theme-text">{(currentChat as any).otherUser ? (currentChat as any).otherUser.name : (currentChat as any).name}</h2>
                <div className="flex items-center gap-1">
                  <span className={`w-1 h-1 rounded-full ${channelData?.isPaused ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                  <span className={`text-[9px] ${channelData?.isPaused ? 'text-amber-500' : 'text-emerald-500'} font-semibold`}>
                    {channelData?.isPaused ? 'Pausado' : 'En línea'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {channelData && channelData.type !== 'direct' && channelData.slug !== 'global' && (
              <button
                onClick={() => {
                  const url = window.location.origin + '?join=' + channelData.slug;
                  navigator.clipboard.writeText(url);
                  alert('Enlace de invitación copiado al portapapeles:\n' + url);
                }}
                className="p-1.5 rounded-lg transition-all text-gray-500 hover:theme-text"
                title="Copiar enlace de invitación"
              >
                <Share2 size={16} />
              </button>
            )}
            <button onClick={() => setShowEvents(!showEvents)} className={`p-1.5 rounded-lg transition-all ${showEvents ? 'bg-primary theme-text' : 'text-gray-500 hover:theme-text'}`} title="Eventos"><Calendar size={16} /></button>
            <button onClick={() => setShowPolls(!showPolls)} className={`p-1.5 rounded-lg transition-all ${showPolls ? 'bg-indigo-500 theme-text' : 'text-gray-500 hover:theme-text'}`} title="Encuestas"><HardDrive size={16} /></button>
            {(channelData?.createdBy === user?._id || channelData?.moderators?.includes(user?._id)) && (
              <button onClick={() => togglePause({ channelId: channelData._id, isPaused: !channelData.isPaused, userId: user?._id as any })}
                className={`p-1.5 rounded-lg transition-all ${channelData?.isPaused ? 'bg-amber-500 theme-text' : 'text-gray-500 hover:theme-text'}`}>
                {channelData?.isPaused ? <Play size={16} /> : <Pause size={16} />}
              </button>
            )}
            <button onClick={() => setShowSearch(!showSearch)} className={`p-1.5 rounded-lg transition-all ${showSearch ? 'bg-primary theme-text' : 'text-gray-500 hover:theme-text'}`}><Search size={16} /></button>
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
                className="w-full bg-sidebar/5 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-xs theme-text outline-none focus:border-primary/50"
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:theme-text">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Message Request Banner */}
        {channelsList.find((c: any) => c.slug === currentChannel && c.status === 'pending' && c.user2Id === user._id) && (
          <div className="bg-primary/10 border-b border-primary/20 p-4 flex flex-col items-center gap-3 text-center">
            <p className="text-xs theme-text">¿Quieres aceptar la solicitud de mensaje de <span className="font-bold">{(currentChat as any).name}</span>?</p>
            <div className="flex gap-2">
              <button
                onClick={() => updateChannelStatus({ channelId: (currentChat as any)._id, status: 'active' })}
                className="bg-primary theme-text px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider"
              >
                Aceptar
              </button>
              <button
                onClick={() => deleteChannelMutation({ channelId: (currentChat as any)._id })}
                className="bg-sidebar/5 text-gray-400 px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/10"
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
                  <div key={m._id} className="text-[10px] theme-text/80 font-bold uppercase tracking-wide truncate">
                    <span className="text-primary mr-2">📌</span> {decryptMessage(m.texto, currentChannel)}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[8px] font-black text-primary/50 uppercase tracking-widest whitespace-nowrap">Destacados</div>
          </div>
        )}

        {/* Messages Area - WhatsApp compact */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto px-3 py-3 space-y-0.5 transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setContextMenu(null)}
          style={{ fontSize: `${fontSize}px` }}
        >
          {/* Context menu */}
          {contextMenu && (
            <div className="ctx-menu" style={{ position: 'fixed', top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 160) }} onClick={e => e.stopPropagation()}>
              {contextMenu.isMe && (
                <>
                  <div className="ctx-item" onClick={() => {
                    const m = displayMessages.find(m => m._id === contextMenu.msgId);
                    if (m) { setEditingMsgId(m._id!); setEditingMsgText(decryptMessage(m.texto || '', currentChannel)); }
                    setContextMenu(null);
                  }}><Edit2 size={12} /> Editar</div>
                  <div className="ctx-item danger" onClick={async () => {
                    try { await deleteMessageMutation({ messageId: contextMenu.msgId as any, userId: user._id }); }
                    catch (e) { setError('No se pudo eliminar'); }
                    setContextMenu(null);
                  }}><Trash2 size={12} /> Eliminar</div>
                </>
              )}
              <div className="ctx-item" onClick={() => {
                const m = displayMessages.find(m => m._id === contextMenu.msgId);
                if (m) navigator.clipboard.writeText(decryptMessage(m.texto || '', currentChannel));
                setContextMenu(null);
              }}><Copy size={12} /> Copiar</div>
            </div>
          )}

          {rawMessagesData === undefined ? (
            <div className="h-full flex items-center justify-center opacity-0"><Loader2 size={24} className="animate-spin theme-text/20" /></div>
          ) : displayMessages.filter(m => !(m as any).isDeleted).length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <MessageSquare size={40} className="mb-2" />
              <h3 className="text-sm font-semibold">Comienza la charla</h3>
            </div>
          ) : (
            displayMessages.map((m: any, idx: number) => {
              const isMe = m.userId === user?._id;
              const prevMsg = displayMessages[idx - 1];
              const sameAuthor = prevMsg && prevMsg.userId === m.userId;
              const decryptedText = decryptMessage(m.texto || '', currentChannel);
              const preview = linkPreviews[m._id!];
              const URL_REGEX = /(https?:\/\/[^\s<>"]+)/i;
              const hasUrl = URL_REGEX.test(decryptedText);
              if (hasUrl && m._id && !linkPreviews[m._id]) {
                const url = decryptedText.match(URL_REGEX)?.[0];
                if (url) setTimeout(() => fetchLinkPreview(m._id!, url), 0);
              }
              // Strip raw URL from display text when a preview is available, to avoid duplication
              const displayText = (hasUrl && preview)
                ? decryptedText.replace(/(https?:\/\/[^\s<>"]+)/gi, '').trim()
                : decryptedText;

              if (m.isDeleted) {
                return (
                  <div key={m._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-0.5`}>
                    <span className="text-[11px] text-gray-600 italic px-3 py-1">Mensaje eliminado</span>
                  </div>
                );
              }

              return (
                <div key={m._id || idx} className={`flex w-full gap-3 ${sameAuthor ? 'mt-0' : 'mt-4'} group border-b border-white/[0.03] py-2`}>
                  {/* Avatar */}
                  <button
                    onClick={() => setViewingProfileUser({ _id: m.userId, name: m.nombre, avatar: m.avatar })}
                    className={`shrink-0 transition-transform hover:scale-105 ${sameAuthor ? 'invisible' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full overflow-hidden border border-white/10 ${recentStatuses?.find((s: any) => s.userId === m.userId) ? 'ring-1 ring-primary' : ''
                      }`}>
                      <img src={m.avatar} className="w-full h-full object-cover" alt="" />
                    </div>
                  </button>

                  <div className="flex-1 flex flex-col min-w-0">
                    {/* Name tag & Time */}
                    {!sameAuthor && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-bold theme-text">{m.nombre}</span>
                        <span className="text-[9px] text-gray-500 uppercase">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}

                    {/* Text content or edit mode */}
                    {editingMsgId === m._id ? (
                      <div className="flex items-end gap-1 w-full">
                        <textarea
                          value={editingMsgText}
                          onChange={e => setEditingMsgText(e.target.value)}
                          className="flex-1 bg-sidebar/5 theme-text text-[13px] rounded-lg px-3 py-2 outline-none resize-none border border-white/10"
                          rows={2}
                          autoFocus
                          onKeyDown={async e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              try {
                                await editMessageMutation({ messageId: m._id as any, userId: user._id, newTexto: encryptMessage(editingMsgText, currentChannel) });
                              } catch { setError('No se pudo editar'); }
                              setEditingMsgId(null);
                            }
                            if (e.key === 'Escape') setEditingMsgId(null);
                          }}
                        />
                        <button onClick={() => setEditingMsgId(null)} className="p-1 text-gray-500"><X size={14} /></button>
                      </div>
                    ) : (
                      <div
                        onContextMenu={e => { e.preventDefault(); setContextMenu({ msgId: m._id!, x: e.clientX, y: e.clientY, isMe }); }}
                        className={`relative py-1 w-full text-left theme-text-msg ${m.isPinned ? 'bg-primary/5' : ''}`}
                      >
                        {m.imageUrl && (
                          <div className="relative mt-2 rounded-xl overflow-hidden cursor-zoom-in border border-white/5 shadow-lg group/img" 
                            onClick={() => { 
                               const gallery = (displayMessages || []).filter(msg => msg.imagenUrl).map(msg => msg.imagenUrl!);
                               const idx = gallery.indexOf(m.imagenUrl!);
                               setCurrentGallery(gallery);
                               setViewingGalleryIndex(idx !== -1 ? idx : 0);
                               setPreviewImage(m.imagenUrl!); 
                             }}>
                             <img src={m.imagenUrl} className="max-w-full max-h-[300px] object-cover transition-transform duration-500 group-hover/img:scale-105" alt=""/>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <Search size={24} className="theme-text/70" />
                            </div>
                          </div>
                        )}
                        {/* Audio */}
                        {m.audioUrl && (
                          <div className="flex items-center gap-2 my-1">
                            <button onClick={e => { const a = (e.currentTarget.nextSibling as HTMLAudioElement); a.paused ? a.play() : a.pause(); }}
                              className="w-8 h-8 rounded-full bg-sidebar/20 flex items-center justify-center"><Volume2 size={14} /></button>
                            <audio src={m.audioUrl} className="hidden" />
                            <div className="w-20 h-0.5 bg-sidebar/20 rounded-full" />
                          </div>
                        )}
                        {/* Text - use displayText (URL stripped when preview exists) */}
                        <div className="whitespace-pre-wrap break-words text-[13px] leading-relaxed selectable">
                          {displayText && formatText(displayText, m._id)}
                        </div>
                        {/* Video Embed */}
                        {hasUrl && preview?.url && (preview.url.includes('youtube.com') || preview.url.includes('youtu.be') || preview.url.includes('instagram.com')) && (
                          <div className="mt-2 rounded-xl overflow-hidden aspect-video border border-white/10 bg-black/20">
                            <iframe
                              src={preview.url.includes('youtube.com') || preview.url.includes('youtu.be')
                                ? preview.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                                : preview.url.split('?')[0] + 'embed'}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}

                        {/* Link preview (only if not a video embed or show both) */}
                        {hasUrl && preview && !(preview.url.includes('youtube.com') || preview.url.includes('youtu.be')) && (
                          <a href={preview.url} target="_blank" rel="noopener noreferrer" className="link-preview mt-2 block">
                            <div className="link-preview-accent" />
                            <div className="link-preview-body">
                              <div className="link-preview-domain">{preview.domain || 'enlace'}</div>
                              <div className="link-preview-title">{preview.title}</div>
                              {preview.description && <div className="link-preview-desc">{preview.description}</div>}
                            </div>
                            {preview.image && <img src={preview.image} className="link-preview-thumb" alt="" />}
                          </a>
                        )}
                        {/* Footer: time + edited */}
                        <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {m.isEdited && <span className="text-[9px] opacity-50 italic">editado</span>}
                          {(m as any).isOffline && <span className="text-[9px] text-amber-400">pendiente</span>}
                          <span className="text-[9px] opacity-40">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && <CheckCheck size={10} className="opacity-40" />}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1">
              <div className="flex gap-0.5">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
              <span className="text-[10px] text-gray-500">{typingUsers[0]} escribe...</span>
            </div>
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>

         {/* Input Area - WhatsApp style, always visible send on mobile */}
         <div className="border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] relative z-20" style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border-glass)' }}>
          {showEmoji && (
            <div className="absolute bottom-20 left-4 border p-2.5 rounded-2xl shadow-2xl flex gap-2 z-[100] animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-200 theme-sidebar theme-border">
              {EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => { setText(text + emoji); setShowEmoji(false); }}
                  className="text-xl hover:scale-125 transition-transform active:scale-90">{emoji}</button>
              ))}
            </div>
          )}
          <div className="px-3 pb-2 md:pb-4 pt-1 theme-surface">
            {attachedImages.length > 0 && (
              <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar border-t theme-border">
                {attachedImages.map((img, idx) => (
                  <div key={idx} className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border theme-border">
                    <img src={img} className="w-full h-full object-cover" alt=""/>
                    {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/></div>}
                    <button onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-0 right-0 bg-black/60 theme-text p-0.5 rounded-bl-lg"><X size={10}/></button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-500 hover:theme-text transition-all shrink-0"><Plus size={22}/></button>
              <div className="flex-1 flex items-center gap-2 min-h-[44px] bg-transparent">
                <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-gray-500 hover:text-gray-300 transition-colors shrink-0"><Smile size={20}/></button>
                <textarea
                  value={text + (interimTranscript ? (text ? ' ' : '') + interimTranscript : '')}
                  onChange={e => { setText(e.target.value); handleTyping(); }}
                  onPaste={handlePaste}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-transparent text-[15px] theme-text outline-none placeholder-gray-500 py-2.5 resize-none max-h-32 min-h-[44px] leading-relaxed no-scrollbar"
                  rows={1}
                  onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); } }}
                />
                <button type="button" onClick={() => cameraInputRef.current?.click()} className="p-2 text-gray-500 hover:theme-text transition-all"><Camera size={20}/></button>
              </div>
              <div className="shrink-0 flex items-center gap-1">
                {uploading ? (
                  <div className="w-10 h-10 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"/>
                  </div>
                ) : (text.trim() || attachedImages.length > 0 || audioBlob) ? (
                  <button type="submit"
                    className="w-11 h-11 bg-primary theme-text rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg">
                    <Send size={18} fill="currentColor" className="ml-0.5"/>
                  </button>
                ) : (
                  <button type="button" onClick={() => isRecording ? stopRecording() : startRecording()}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${isRecording ? 'bg-red-500 theme-text animate-pulse' : 'text-gray-400 hover:text-gray-300'}`}>
                    {isRecording ? <MicOff size={18}/> : <Mic size={18}/>}
                  </button>
                )}
              </div>
            </form>
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,.pdf,.docx,.xlsx,.xls,.csv" onChange={(e) => handleImageUpload(e, 'chat')}/>
            <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handleImageUpload(e, 'chat')}/>
          </div>
        </div>

        {isMobile && isSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-[140] backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        )}
      </main>

      {/* MODALS */}
      {showEvents && (
        <div className="fixed inset-y-0 right-0 w-80 bg-[#111111] border-l border-white/10 z-[150] shadow-2xl overflow-hidden">
          <CalendarView userId={user?._id || ''} channelId={currentChannel} onClose={() => setShowEvents(false)} />
        </div>
      )}

      {showPolls && (
        <div className="fixed inset-y-0 right-0 w-80 bg-[#111111] border-l border-white/10 z-[150] shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black theme-text uppercase tracking-widest flex items-center gap-2"><HardDrive size={18} className="theme-text" /> Encuestas</h2>
            <button onClick={() => setShowPolls(false)} className="text-gray-500 hover:theme-text"><X size={20} /></button>
          </div>
          <button onClick={() => setShowCreatePoll(true)} className="w-full bg-sidebar/5 border border-white/10 theme-text py-3 rounded-lg text-[10px] font-black uppercase hover:bg-sidebar/10 transition-all">Crear Encuesta</button>
          <div className="space-y-4">
            {polls?.map((poll: any) => (
              <div key={poll._id} className="bg-sidebar/5 border border-white/5 p-4 rounded-lg space-y-4">
                <h3 className="text-xs font-bold theme-text">{poll.question}</h3>
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] transition-all ${hasVoted ? 'bg-sidebar/10 text-gray-400' : 'bg-sidebar/5 hover:bg-sidebar/10 theme-text'}`}
                        >
                          <span>{opt.text}</span>
                          <span className="font-bold">{percentage}%</span>
                        </button>
                        <div className="h-1 bg-sidebar/5 rounded-full overflow-hidden">
                          <div className="h-full bg-sidebar transition-all duration-1000" style={{ width: `${percentage}%` }} />
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

      {showCreateChannel && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="theme-surface border theme-border w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 shadow-2xl relative">
            <button onClick={() => setShowCreateChannel(false)} className="absolute top-6 right-6 theme-text-sec hover:theme-text"><X size={24} /></button>
            <h2 className="text-lg font-bold theme-text uppercase tracking-widest mb-6">Crear Nueva Sala</h2>
            <div className="space-y-4">
              <input value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="Nombre de la sala" className="w-full theme-input border theme-border rounded-lg px-4 py-3 text-sm outline-none theme-text" />
              <input value={newChannelPassword} onChange={e => setNewChannelPassword(e.target.value)} placeholder="Contraseña (Requerida)" className="w-full theme-input border theme-border rounded-lg px-4 py-3 text-sm outline-none theme-text" type="password" />

              <div className="space-y-2">
                <p className="text-[10px] font-bold theme-text-sec uppercase tracking-widest">Invitar Amigos (Opcional)</p>
                <div className="max-h-40 overflow-y-auto no-scrollbar space-y-2">
                  {friendsList?.map((f: any) => (
                    <div key={f._id} className="flex items-center justify-between p-2 rounded-lg theme-input border theme-border">
                      <div className="flex items-center gap-2">
                        <img src={f.avatar} className="w-8 h-8 rounded-full" alt="" />
                        <span className="text-xs theme-text">{f.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedFriendsToInvite.includes(f._id)}
                        onChange={() => {
                          if (selectedFriendsToInvite.includes(f._id)) {
                            setSelectedFriendsToInvite(selectedFriendsToInvite.filter(id => id !== f._id));
                          } else {
                            setSelectedFriendsToInvite([...selectedFriendsToInvite, f._id]);
                          }
                        }}
                        className="accent-primary w-4 h-4 rounded"
                      />
                    </div>
                  ))}
                  {friendsList?.length === 0 && <p className="text-[10px] theme-text-muted italic text-center py-2">No tienes amigos para invitar</p>}
                </div>
              </div>

              <button
                disabled={!newChannelName.trim() || !newChannelPassword.trim()}
                onClick={async () => {
                  try {
                    const ch = await createChannel({
                      name: newChannelName,
                      createdBy: user?._id as string,
                      password: newChannelPassword,
                      initialParticipants: selectedFriendsToInvite
                    });
                    if (ch) handleSelectChannel(ch.slug);
                    setShowCreateChannel(false);
                    setNewChannelName('');
                    setNewChannelPassword('');
                    setSelectedFriendsToInvite([]);
                  } catch (err) {
                    console.error("Error al crear la sala", err);
                  }
                }}
                className="w-full bg-primary theme-text py-3 rounded-lg text-sm font-bold uppercase transition-all disabled:opacity-50"
              >
                Crear Sala
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserSearch && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="theme-surface border theme-border w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 shadow-2xl relative max-h-[80vh] flex flex-col">
            <button onClick={() => setShowUserSearch(false)} className="absolute top-6 right-6 theme-text-sec hover:theme-text"><X size={24} /></button>
            <h2 className="text-lg font-bold theme-text uppercase tracking-widest mb-4">Buscar Usuarios</h2>
            <input value={userSearchQuery} onChange={e => setUserSearchQuery(e.target.value)} placeholder="Buscar por nombre o username..." className="w-full theme-input border theme-border rounded-lg px-4 py-3 text-sm outline-none theme-text mb-4" />

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
              {searchedUsers?.map((u: any) => (
                <div key={u._id} className="flex items-center justify-between p-3 rounded-lg theme-input border theme-border">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div>
                      <p className="text-sm font-bold theme-text">{u.name}</p>
                      <p className="text-xs theme-text-sec">@{u.username}</p>
                    </div>
                  </div>
                  <button onClick={async () => {
                    await getOrCreateDM({ user1Id: user?._id as string, user2Id: u._id as string });
                    setShowUserSearch(false);
                  }} className="text-primary p-2 hover:bg-primary/10 rounded-lg transition-colors">
                    <MessageSquare size={16} />
                  </button>
                </div>
              ))}
              {searchedUsers?.length === 0 && userSearchQuery && (
                <p className="text-center text-sm theme-text-muted py-4">No se encontraron usuarios</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-white/10 rounded-[2rem] p-8 w-full max-w-sm space-y-6">
            <h2 className="text-sm font-black theme-text uppercase tracking-widest text-center">Nuevo Evento</h2>
            <div className="space-y-4">
              <input value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="Título del evento" className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-4 py-3 theme-text text-xs outline-none focus:border-white" />
              <textarea value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} placeholder="Descripción..." className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-4 py-3 theme-text text-xs outline-none focus:border-white h-20 resize-none" />
              <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-4 py-3 theme-text text-xs outline-none focus:border-white" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreateEvent(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-500">Cancelar</button>
              <button
                onClick={async () => {
                  const eventId = await createEvent({ channelId: currentChannel, title: newEventTitle, description: newEventDesc, date: new Date(newEventDate).getTime(), createdBy: user?._id as any });
                  await sendMessage({
                    userId: user?._id as string, nombre: user?.name || 'Usuario', avatar: user?.avatar || '',
                    texto: encryptMessage(`📅 *NUEVO EVENTO:* ${newEventTitle}\n\n📝 ${newEventDesc}\n⏰ ${new Date(newEventDate).toLocaleString()}`, currentChannel),
                    channelId: currentChannel,
                    eventId: eventId
                  });
                  setShowCreateEvent(false);
                  setNewEventTitle(''); setNewEventDesc(''); setNewEventDate('');
                }}
                className="flex-1 bg-sidebar text-black py-3 rounded-lg text-[10px] font-black uppercase"
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
            <h2 className="text-sm font-black theme-text uppercase tracking-widest text-center">Nueva Encuesta</h2>
            <div className="space-y-4">
              <input value={newPollQuestion} onChange={e => setNewPollQuestion(e.target.value)} placeholder="¿Qué quieres preguntar?" className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-4 py-3 theme-text text-xs outline-none focus:border-white" />
              <div className="space-y-2">
                {newPollOptions.map((opt, idx) => (
                  <input key={idx} value={opt} onChange={e => {
                    const copy = [...newPollOptions];
                    copy[idx] = e.target.value;
                    setNewPollOptions(copy);
                  }} placeholder={`Opción ${idx + 1}`} className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-4 py-3 theme-text text-xs outline-none focus:border-white" />
                ))}
                <button onClick={() => setNewPollOptions([...newPollOptions, ''])} className="text-[9px] font-black theme-text uppercase">+ Agregar Opción</button>
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
                className="flex-1 bg-sidebar text-black py-3 rounded-lg text-[10px] font-black uppercase"
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
              <div className="w-16 h-16 rounded-full bg-sidebar/10 flex items-center justify-center mx-auto theme-text mb-4">
                <Calendar size={32} />
              </div>
              <h2 className="text-sm font-black theme-text uppercase tracking-widest">¿Compartir Evento?</h2>
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
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-sidebar/5 hover:bg-sidebar/10 transition-all border border-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-sidebar/10 flex items-center justify-center theme-text"><Hash size={14} /></div>
                  <span className="text-xs theme-text font-bold">{c.name}</span>
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
              <h2 className="text-sm font-black theme-text uppercase tracking-widest flex items-center gap-2"><Clock size={18} className="theme-text" /> Recordatorios</h2>
              <button onClick={() => setShowReminders(false)} className="text-gray-500 hover:theme-text"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input value={newReminderText} onChange={e => setNewReminderText(e.target.value)} placeholder="¿Qué quieres recordar?" className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-4 py-3 theme-text text-xs outline-none focus:border-white" />
              <input type="datetime-local" value={newReminderDate} onChange={e => setNewReminderDate(e.target.value)} className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-4 py-3 theme-text text-xs outline-none focus:border-white" />
              <button onClick={async () => {
                await createReminder({ userId: user?._id as any, text: newReminderText, date: new Date(newReminderDate).getTime() });
                setNewReminderText(''); setNewReminderDate('');
              }} className="w-full bg-sidebar text-black py-3 rounded-lg text-[10px] font-black uppercase">Agregar Alerta</button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 no-scrollbar">
              {reminders?.map((r: any) => (
                <div key={r._id} className={`p-3 rounded-lg border border-white/5 flex items-center justify-between ${r.completed ? 'bg-sidebar/5 opacity-50' : 'bg-sidebar/[0.02]'}`}>
                  <div>
                    <p className={`text-xs theme-text ${r.completed ? 'line-through' : ''}`}>{r.text}</p>
                    <p className="text-[8px] text-gray-500 uppercase font-black">{new Date(r.date).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleReminder({ reminderId: r._id })} className="theme-text"><Clock size={14} /></button>
                    <button onClick={() => deleteReminder({ reminderId: r._id })} className="theme-text/50"><X size={14} /></button>
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
              <h2 className="text-sm font-black theme-text uppercase tracking-widest flex items-center gap-2"><FileText size={18} className="theme-text" /> Mis Notas</h2>
              <button onClick={() => setShowNotes(false)} className="text-gray-500 hover:theme-text"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input value={newNoteTitle} onChange={e => setNewNoteTitle(e.target.value)} placeholder="Título..." className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-4 py-3 theme-text text-xs font-bold outline-none focus:border-white" />
              <textarea value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} placeholder="Contenido de la nota..." className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-4 py-3 theme-text text-xs outline-none focus:border-white h-24 resize-none" />
              <div className="flex gap-2">
                <button onClick={async () => {
                  if (editingNoteId) {
                    await updateNote({ noteId: editingNoteId as any, title: newNoteTitle, content: newNoteContent });
                  } else {
                    await createNote({ userId: user?._id as any, title: newNoteTitle, content: newNoteContent });
                  }
                  setNewNoteTitle(''); setNewNoteContent(''); setEditingNoteId(null);
                }} className="flex-1 bg-sidebar text-black py-3 rounded-lg text-[10px] font-black uppercase">
                  {editingNoteId ? 'Actualizar Nota' : 'Guardar Nota'}
                </button>
                {editingNoteId && (
                  <button onClick={() => { setEditingNoteId(null); setNewNoteTitle(''); setNewNoteContent(''); }} className="px-4 bg-sidebar/5 text-gray-500 rounded-lg"><X size={16} /></button>
                )}
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 no-scrollbar">
              {notes?.map((n: any) => (
                <div key={n._id} className="p-3 rounded-lg border border-white/5 bg-sidebar/[0.02] group">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[10px] font-black theme-text uppercase">{n.title}</h4>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => {
                        setEditingNoteId(n._id);
                        setNewNoteTitle(n.title);
                        setNewNoteContent(n.content);
                      }} className="theme-text"><Plus size={12} className="rotate-45" /></button>
                      <button onClick={async () => {
                        const encrypted = encryptMessage(`📒 *Nota compartida:* ${n.title}\n\n${n.content}`, currentChannel);
                        await sendMessage({ userId: user._id, nombre: user.name, avatar: user.avatar, texto: encrypted, channelId: currentChannel });
                        setShowNotes(false);
                      }} className="theme-text"><Send size={12} /></button>
                      <button onClick={() => deleteNote({ noteId: n._id })} className="theme-text"><X size={12} /></button>
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
              <h2 className="text-sm font-black theme-text uppercase tracking-widest flex items-center gap-2"><Users size={18} className="theme-text" /> Contactos</h2>
              <button onClick={() => setShowFriendsModal(false)} className="text-gray-500 hover:theme-text"><X size={20} /></button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2 no-scrollbar">
              {friendsList?.length === 0 ? (
                <p className="text-center text-[10px] text-gray-500 py-8 uppercase font-black">No tienes amigos agregados aún</p>
              ) : (
                friendsList?.map((friend: any) => (
                  <button
                    key={friend._id}
                    onClick={() => { startDM(friend); setShowFriendsModal(false); }}
                    className="w-full flex items-center justify-between p-4 rounded-lg bg-sidebar/5 hover:bg-sidebar/10 transition-all border border-white/5 group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={friend.avatar} className="w-10 h-10 rounded-lg border border-white/10" alt="" />
                      <div className="text-left">
                        <p className="text-xs font-bold theme-text">{friend.name}</p>
                        <p className="text-[9px] text-gray-500 uppercase font-black">@{friend.username}</p>
                      </div>
                    </div>
                    <div className="bg-sidebar/10 p-2 rounded-lg theme-text opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageSquare size={14} />
                    </div>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => { setShowUserSearch(true); setShowFriendsModal(false); }}
              className="w-full bg-sidebar/5 hover:bg-sidebar/10 theme-text/40 py-4 rounded-lg font-bold uppercase text-[10px] tracking-widest border border-white/10 transition-all"
            >
              Buscar más personas
            </button>
          </div>
        </div>
      )}

      {showPasswords && (
        <div className="fixed inset-y-0 right-0 w-80 bg-[#111111] border-l border-white/10 z-[150] shadow-2xl overflow-hidden">
          <PasswordsView userId={user?._id || ''} onClose={() => setShowPasswords(false)} />
        </div>
      )}


      {showProfileModal && (
        <div className="fixed inset-0 z-[1000] theme-bg animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="sticky top-0 z-20 backdrop-blur-xl border-b theme-border px-4 pt-[env(safe-area-inset-top,8px)] pb-3 flex items-center justify-between">
            <button onClick={() => setShowProfileModal(false)} className="flex items-center gap-2 theme-text-sec hover:theme-text transition-colors">
              <ChevronLeft size={24} />
              <span className="text-sm font-bold uppercase tracking-widest">Ajustes</span>
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={async () => {
                  const updated = await updateProfile({ userId: user._id, name: editName, bio: editBio, avatar: editAvatar, privacy: editPrivacy, themeColor: editThemeColor, phone: editPhone, password: editPassword });
                  if (updated) setUser(updated as any);
                  setShowProfileModal(false);
                }}
                className="bg-primary theme-text-on-pri px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Guardar
              </button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto p-6 space-y-12 pb-24">
            {/* Visual Header */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-primary/10 shadow-2xl relative">
                  <img src={editAvatar} className="w-full h-full object-cover" alt="" />
                  <button 
                    onClick={() => profileImageInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center theme-text-on-pri gap-1"
                  >
                    <Camera size={24} />
                    <span className="text-[8px] font-bold uppercase">Cambiar</span>
                  </button>
                </div>
                <input type="file" ref={profileImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} />
              </div>
              <div>
                <h2 className="text-2xl font-black theme-text tracking-tighter">{editName || 'Tu Nombre'}</h2>
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">@{user.username}</p>
              </div>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Account Info */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black theme-text-sec uppercase tracking-[0.2em] border-b theme-border pb-2">Información Personal</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase px-1">Nombre Público</label>
                    <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="¿Cómo te llamas?" className="w-full bg-sidebar/5 border theme-border rounded-xl px-4 py-3 theme-text text-sm outline-none focus:border-primary/50 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase px-1">Biografía</label>
                    <textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Cuenta algo sobre ti..." className="w-full bg-sidebar/5 border theme-border rounded-xl px-4 py-3 theme-text text-sm outline-none focus:border-primary/50 resize-none h-24 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase px-1">Teléfono</label>
                    <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+54 9..." className="w-full bg-sidebar/5 border theme-border rounded-xl px-4 py-3 theme-text text-sm outline-none focus:border-primary/50 transition-all" />
                  </div>
                </div>
              </div>

              {/* App Settings */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black theme-text-sec uppercase tracking-[0.2em] border-b theme-border pb-2">Ajustes de la App</h3>
                <div className="space-y-6">
                  {/* Font Size */}
                  <div className="bg-sidebar/5 border theme-border p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 theme-text">
                        <Type size={16} />
                        <span className="text-[11px] font-bold uppercase">Tamaño de Letra</span>
                      </div>
                      <span className="text-[10px] font-black text-primary">{fontSize}px</span>
                    </div>
                    <input 
                      type="range" min="12" max="24" value={fontSize} 
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setFontSize(val);
                        localStorage.setItem('fontSize', val.toString());
                      }}
                      className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Privacy */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-gray-500 uppercase px-1">Privacidad de Chat</label>
                    <div className="flex bg-sidebar/5 border theme-border rounded-xl p-1">
                      <button
                        onClick={() => setEditPrivacy('everyone')}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${editPrivacy === 'everyone' ? 'bg-primary theme-text-on-pri shadow-md' : 'theme-text-sec'}`}
                      >
                        Abierto
                      </button>
                      <button
                        onClick={() => setEditPrivacy('requests')}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${editPrivacy === 'requests' ? 'bg-primary theme-text-on-pri shadow-md' : 'theme-text-sec'}`}
                      >
                        Privado
                      </button>
                    </div>
                  </div>

                  {/* Theme Color */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-gray-500 uppercase px-1">Acento de Color</label>
                    <div className="flex flex-wrap gap-3 px-1">
                      {['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#e8eaed'].map(color => (
                        <button
                          key={color}
                          onClick={() => setEditThemeColor(color)}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${editThemeColor === color ? 'border-primary scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between bg-sidebar/5 border theme-border p-4 rounded-xl">
                    <div className="flex items-center gap-2 theme-text">
                      {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                      <span className="text-[11px] font-bold uppercase">Tema {theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
                    </div>
                    <button 
                      onClick={toggleTheme}
                      className="w-10 h-5 bg-white/10 rounded-full relative transition-colors"
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-300 ${theme === 'dark' ? 'right-1 bg-primary' : 'left-1 bg-gray-400'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-12 border-t theme-border">
              <button 
                onClick={() => {
                  if(window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full py-4 border border-red-500/20 theme-bg text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500/5 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Cerrar Sesión Segura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Profile Modal */}
      {viewingProfileUser && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="theme-surface border theme-border w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button onClick={() => setViewingProfileUser(null)} className="absolute top-6 right-6 theme-text-sec hover:theme-text"><X size={24} /></button>
            <div className="text-center space-y-4 mb-6 shrink-0">
              <div className="relative w-28 h-28 mx-auto">
                {viewingProfileUser.avatar ? (
                  <img src={viewingProfileUser.avatar} className="w-full h-full rounded-full object-cover shadow-2xl ring-4 ring-primary/20" alt="" />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold ring-4 ring-primary/20">
                    {viewingProfileUser.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold theme-text">{viewingProfileUser.name}</h2>
                {viewingProfileUser.bio && <p className="text-sm theme-text-sec mt-2">{viewingProfileUser.bio}</p>}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-bold theme-text-sec uppercase tracking-widest px-2">Archivos Compartidos</h3>
                {messages.filter(m => m.imagenUrl || m.audioUrl).length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {messages.filter(m => m.imagenUrl).map((m: any) => (
                      <div key={m._id} className="aspect-square rounded-lg overflow-hidden border theme-border cursor-pointer" onClick={() => { setPreviewImage(m.imagenUrl); }}>
                        <img src={m.imagenUrl} className="w-full h-full object-cover" alt="Shared media" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] theme-text-muted px-2 italic">No hay archivos multimedia compartidos</p>
                )}
              </div>

              <div className="space-y-2 mt-6">
                <h3 className="text-xs font-bold theme-text-sec uppercase tracking-widest px-2">Enlaces</h3>
                {messages.filter(m => {
                  const txt = m.texto ? decryptMessage(m.texto, currentChannel) : '';
                  return txt.match(/https?:\/\/[^\s]+/);
                }).length > 0 ? (
                  <div className="space-y-2">
                    {messages.filter(m => {
                      const txt = m.texto ? decryptMessage(m.texto, currentChannel) : '';
                      return txt.match(/https?:\/\/[^\s]+/);
                    }).map((m: any) => {
                      const txt = m.texto ? decryptMessage(m.texto, currentChannel) : '';
                      const match = txt.match(/https?:\/\/[^\s]+/);
                      const url = match ? match[0] : '';
                      return url ? (
                        <a key={m._id} href={url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-xl theme-input border theme-border theme-text text-xs truncate hover:theme-text-sec transition-colors">
                          {url}
                        </a>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] theme-text-muted px-2 italic">No hay enlaces compartidos</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#111111] rounded-[2rem] border border-white/10 p-8 w-full max-w-sm space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold theme-text text-center uppercase tracking-widest">Publicar Estado</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { const text = prompt('Escribe tu estado:'); if (text) handlePostStatus(text, 'text'); }} className="aspect-square bg-sidebar/5 border border-white/5 flex flex-col items-center justify-center gap-3 theme-text">
                <FileText size={32} /><span className="text-[10px] font-bold uppercase">Texto</span>
              </button>
              <button onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = (e: any) => handleImageUpload(e, 'status'); input.click(); }} className="aspect-square bg-sidebar/5 border border-white/5 flex flex-col items-center justify-center gap-3 theme-text">
                <Camera size={32} /><span className="text-[10px] font-bold uppercase">Foto</span>
              </button>
            </div>
            <button onClick={() => setShowStatusModal(false)} className="w-full bg-sidebar/5 text-gray-500 py-4 rounded-lg font-bold uppercase text-[10px]">Cancelar</button>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/98 z-[9999] flex items-center justify-center p-4 md:p-8 animate-fadeIn" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-6 right-6 theme-text/40 hover:theme-text transition-all z-10"><X size={32}/></button>
          
          {currentGallery.length > 1 && (
            <>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const newIdx = (viewingGalleryIndex - 1 + currentGallery.length) % currentGallery.length;
                  setViewingGalleryIndex(newIdx);
                  setPreviewImage(currentGallery[newIdx]);
                }}
                className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center theme-text transition-all active:scale-90 border border-white/10"
              >
                <ChevronLeft size={24}/>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const newIdx = (viewingGalleryIndex + 1) % currentGallery.length;
                  setViewingGalleryIndex(newIdx);
                  setPreviewImage(currentGallery[newIdx]);
                }}
                className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center theme-text transition-all active:scale-90 border border-white/10"
              >
                <ChevronRight size={24}/>
              </button>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black theme-text/70 uppercase tracking-[0.2em] border border-white/10">
                Imagen {viewingGalleryIndex + 1} de {currentGallery.length}
              </div>
            </>
          )}

          <img 
            src={previewImage} 
            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain ring-1 ring-white/10 animate-in zoom-in duration-300" 
            alt="" 
            onClick={e => e.stopPropagation()} 
          />
        </div>
      )}

      {viewingStatus && (() => {
        // Auto-close after 5s and mark as seen
        return (
          <div className="fixed inset-0 bg-black z-[1000] flex flex-col items-center justify-center animate-in fade-in duration-200"
            onClick={() => { markStatusSeen(viewingStatus._id); setViewingStatus(null); }}>
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-sidebar/10 z-10">
              <div className="status-progress h-full bg-primary"
                onAnimationEnd={() => { markStatusSeen(viewingStatus._id); setViewingStatus(null); }}
              />
            </div>
            {/* Header */}
            <div className="absolute top-6 left-4 flex items-center gap-3 z-10">
              <img src={viewingStatus.userAvatar} className="w-9 h-9 rounded-full border-2 border-primary" alt="" />
              <div>
                <p className="text-sm font-semibold theme-text">{viewingStatus.userName}</p>
                <p className="text-[10px] text-gray-500">{new Date(viewingStatus.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); markStatusSeen(viewingStatus._id); setViewingStatus(null); }}
              className="absolute top-6 right-4 theme-text/50 hover:theme-text z-10"><X size={24} /></button>
            {/* Content */}
            <div className="w-full max-w-xs aspect-[9/16] bg-sidebar/5 rounded-2xl overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
              {viewingStatus.type === 'text' ? (
                <div className="w-full h-full flex items-center justify-center p-8 text-center text-lg font-bold theme-text bg-gradient-to-br from-primary/20 to-purple-500/20">
                  {viewingStatus.content}
                </div>
              ) : (
                <img src={viewingStatus.content} className="w-full h-full object-cover" alt="" />
              )}
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent space-y-3">
                <div className="flex justify-center gap-3">
                  {['❤️', '🔥', '😂', '👏', '😮'].map(emoji => (
                    <button key={emoji} onClick={async () => {
                      const enc = encryptMessage(`Reaccionó: ${emoji}`, `dm-${user._id}-${viewingStatus.userId}`);
                      await sendMessage({ userId: user._id, nombre: user.name, avatar: user.avatar, texto: enc, channelId: `dm-${user._id}-${viewingStatus.userId}` });
                      markStatusSeen(viewingStatus._id); setViewingStatus(null);
                    }} className="text-xl hover:scale-125 transition-transform">{emoji}</button>
                  ))}
                </div>
                <input placeholder="Responder..." className="w-full bg-sidebar/10 border border-white/10 rounded-lg px-3 py-2 theme-text text-[11px] outline-none focus:border-primary"
                  onKeyDown={async e => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (!val) return;
                      const enc = encryptMessage(`Respondió: ${val}`, `dm-${user._id}-${viewingStatus.userId}`);
                      await sendMessage({ userId: user._id, nombre: user.name, avatar: user.avatar, texto: enc, channelId: `dm-${user._id}-${viewingStatus.userId}` });
                      markStatusSeen(viewingStatus._id); setViewingStatus(null);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        );
      })()}


      {showUserSearch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#111111] rounded-xl border border-white/10 p-6 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold theme-text uppercase tracking-wider">Buscar Usuarios</h3>
            <input value={userSearchQuery} onChange={e => setUserSearchQuery(e.target.value)} placeholder="Nombre o @usuario..." className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-4 py-3 theme-text text-xs outline-none focus:border-primary" autoFocus />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchedUsers?.filter((u: any) => u._id !== user._id).map((u: any) => (
                <button key={u._id} onClick={() => startDM(u)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar/5 transition-all">
                  <img src={u.avatar} className="w-10 h-10 rounded-lg" alt="" />
                  <div className="text-left">
                    <div className="text-xs font-bold theme-text">{u.name}</div>
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
              <button onClick={() => setViewingProfileUser(null)} className="absolute top-6 right-6 theme-text/40 hover:theme-text transition-colors"><X size={20} /></button>
              <div className="relative w-28 h-28 mx-auto mb-4 group">
                <img src={viewingProfileUser.avatar} className="w-full h-full rounded-xl object-cover shadow-2xl ring-4 ring-primary/10 transition-transform group-hover:scale-105 duration-500" alt="" />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#1a1a1a]" title="En línea" />
              </div>
              <h2 className="text-xl font-black theme-text uppercase tracking-tight">{viewingProfileUser.name}</h2>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] opacity-70">@{viewingProfileUser.username || 'usuario'}</p>
            </div>

            {/* Info Sections */}
            <div className="px-6 pb-8 space-y-4">
              <div className="space-y-1 bg-sidebar/5 rounded-lg p-4 border border-white/5">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                  <Info size={12} className="text-primary" /> Información y Bio
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
                <div className="flex items-center gap-4 bg-sidebar/5 rounded-lg p-4 border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">Teléfono</p>
                    <p className="text-sm theme-text font-mono">{viewingProfileUser.phone}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-1 gap-2 pt-2">
                <button
                  onClick={() => { startDM(viewingProfileUser); setViewingProfileUser(null); }}
                  className="w-full bg-primary hover:bg-primary-hover theme-text py-4 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  <MessageSquare size={16} /> Chatear ahora
                </button>

                {user._id !== viewingProfileUser._id && !friendsList?.find((f: any) => f._id === viewingProfileUser._id) && !sentFriendRequests?.find((r: any) => r.user2Id === viewingProfileUser._id) && (
                  <button
                    onClick={() => sendFriendRequest({ fromId: user._id as any, toId: viewingProfileUser._id })}
                    className="w-full bg-sidebar text-black py-4 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl"
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
                    className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] border transition-all ${channelData.moderators?.includes(viewingProfileUser._id) ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-sidebar/5 theme-text border-white/10'}`}
                  >
                    {channelData.moderators?.includes(viewingProfileUser._id) ? 'Quitar Moderador' : 'Hacer Moderador'}
                  </button>
                )}

                {sentFriendRequests?.find((r: any) => r.user2Id === viewingProfileUser._id) && (
                  <div className="w-full bg-emerald-500/10 text-emerald-500 py-4 rounded-lg font-black uppercase tracking-widest text-[9px] border border-emerald-500/20 flex items-center justify-center gap-2">
                    <Clock size={16} /> Solicitud Enviada
                  </div>
                )}

                {friendsList?.find((f: any) => f._id === viewingProfileUser._id) && (
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

      {/* Error Display - Centrado y copiable */}
      {error && <ErrorDisplay error={error} onClose={() => setError(null)} />}

      {/* Splash Screen */}
      <div className={`splash-screen ${!showSplash ? 'splash-hidden' : ''}`}>
        <div className="splash-logo">
          <MessageSquare size={50} className="theme-text" fill="currentColor" />
        </div>
        <h1 className="splash-text">Aurora Chat</h1>
        <p className="text-[9px] theme-text-muted mt-2 font-black uppercase tracking-[0.5em]">Despertando Red...</p>
      </div>
    </div>
  );
}

export default AuroraChat;
