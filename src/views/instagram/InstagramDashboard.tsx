import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { StorageService } from '../../services/storage';
import { useToast } from '../../components/ToastProvider';
import logger from '../../utils/logger';
import VoiceGenerator from './VoiceGenerator';
import AudioEnhancer from './AudioEnhancer';
import VideoCreator from './VideoCreator';

interface InstagramAccount {
  _id: any;
  instagramId: string;
  username: string;
  isBusiness: boolean;
  isConnected: boolean;
  followers?: number;
  autoPostEnabled: boolean;
  aiAutoReply: boolean;
  profilePicture?: string;
  biography?: string;
  totalPosts?: number;
  totalReplies?: number;
}

interface ScheduledPost {
  _id: any;
  caption: string;
  hashtags?: string[];
  imageUrl?: string;
  scheduledFor: number;
  status: string;
  aiEnhanced: boolean;
}

interface InstagramDashboardProps {
  userId: string;
}

const InstagramDashboard: React.FC<InstagramDashboardProps> = ({ userId }) => {
  const { showToast } = useToast();
  const instagramStorage = StorageService as {
    publishInstagramPostNow?: (userId: string, postId: string) => Promise<void>;
    deleteScheduledInstagramPost?: (userId: string, postId: string) => Promise<void>;
    updateInstagramSettings?: (settings: { accountId: string; userId: string; autoPostEnabled: boolean }) => Promise<void>;
    refreshInstagramStats?: (accountId: string) => Promise<void>;
    disconnectInstagramAccount?: (userId: string, accountId: string) => Promise<void>;
    createScheduledInstagramPost?: (postData: Record<string, unknown>) => Promise<void>;
  };
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'voice' | 'audio' | 'video' | 'messages' | 'analytics' | 'settings'>('overview');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  const accounts = useQuery(api.instagram.accounts.getUserInstagramAccounts, { userId });
  const scheduledPosts = useQuery(api.instagram.posts.getScheduledPosts, { 
    userId, 
    accountId: selectedAccount || undefined,
    limit: 20 
  });

  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0]._id);
    }
  }, [accounts, selectedAccount]);

  const connectAccount = useMutation(api.instagram.accounts.connectInstagramAccount);

  const handleConnect = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/instagram/auth-url?userId=${userId}`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      logger.error('Failed to get auth URL:', error);
    }
  };

  const handlePublishNow = async (postId: string) => {
    if (!window.confirm('¿Deseas publicar este post ahora mismo en Instagram?')) return;
    try {
      await instagramStorage.publishInstagramPostNow?.(userId, postId);
      showToast('success', '¡Publicación enviada!');
    } catch (error) {
      logger.error('Failed to publish now:', error);
      showToast('error', 'Error al publicar. Revisa la consola.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este post programado?')) return;
    try {
      await instagramStorage.deleteScheduledInstagramPost?.(userId, postId);
      showToast('success', 'Post eliminado');
    } catch (error) {
      logger.error('Failed to delete post:', error);
      showToast('error', 'Error al eliminar post');
    }
  };

  const handleToggleAutoPost = async (accountId: string, current: boolean) => {
    try {
      await instagramStorage.updateInstagramSettings?.({
        accountId,
        userId,
        autoPostEnabled: !current
      });
    } catch (error) {
      logger.error('Failed to toggle auto post:', error);
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const handleRefreshStats = async () => {
    if (!selectedAccount || refreshing) return;
    setRefreshing(true);
    try {
      await instagramStorage.refreshInstagramStats?.(selectedAccount);
    } catch (error) {
      logger.error('Failed to refresh stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedAccount || !window.confirm('¿Deseas desconectar esta cuenta de Instagram?')) return;
    try {
      await instagramStorage.disconnectInstagramAccount?.(userId, selectedAccount);
      setSelectedAccount(null);
      showToast('success', 'Cuenta desconectada');
    } catch (error) {
      logger.error('Failed to disconnect:', error);
      showToast('error', 'Error al desconectar cuenta');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-500/20 text-emerald-400';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'draft': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (!accounts || accounts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="size-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Conecta tu cuenta de Instagram</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Vincula tu cuenta de Instagram Business para comenzar a programar publicaciones, 
            automatizar respuestas y gestionar tu presencia social.
          </p>
          <button
            onClick={handleConnect}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/30"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
              </svg>
              Conectar con Instagram
            </span>
          </button>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-2xl mb-1">📅</div>
              <div className="text-xs text-gray-400">Programar posts</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-2xl mb-1">🤖</div>
              <div className="text-xs text-gray-400">Respuestas IA</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-xs text-gray-400">Analytics</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentAccount = accounts?.find((a: InstagramAccount) => a._id === selectedAccount);

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Instagram Hub</h1>
          <p className="text-sm text-gray-400">Gestiona tu contenido y analytics</p>
        </div>
        <button
          onClick={() => setShowComposer(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nuevo Post
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Cuentas Conectadas
            </div>
            {accounts?.map((account: InstagramAccount) => (
              <button
                key={account._id}
                onClick={() => setSelectedAccount(account._id)}
                className={`w-full p-3 rounded-xl transition-all flex items-center gap-3 ${
                  selectedAccount === account._id 
                    ? 'bg-purple-500/20 border border-purple-500/30' 
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                <img 
                  src={account.profilePicture || `https://ui-avatars.com/api/?name=${account.username}&background=random`}
                  alt={account.username}
                  className="size-10 rounded-full"
                />
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-white">@{account.username}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {account.isConnected ? (
                      <span className="text-[10px] text-emerald-400">✓ Conectado</span>
                    ) : (
                      <span className="text-[10px] text-red-400">✗ Desconectado</span>
                    )}
                  </div>
                </div>
                {account.followers && (
                  <div className="text-xs text-gray-400">
                    {formatFollowers(account.followers)}
                  </div>
                )}
              </button>
            ))}
            <button
              onClick={handleConnect}
              className="w-full p-3 rounded-xl border-2 border-dashed border-gray-600 hover:border-purple-500/50 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-purple-400"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Añadir cuenta
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex border-b border-white/10 overflow-x-auto">
              {[
                { id: 'overview', label: 'Resumen', icon: 'dashboard' },
                { id: 'posts', label: 'Posts', icon: 'schedule' },
                { id: 'voice', label: 'Voz IA', icon: 'record_voice_over' },
                { id: 'audio', label: 'Audio', icon: 'music_note' },
                { id: 'video', label: 'Video', icon: 'videocam' },
                { id: 'messages', label: 'Mensajes', icon: 'chat' },
                { id: 'analytics', label: 'Analytics', icon: 'analytics' },
                { id: 'settings', label: 'Config', icon: 'settings' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-purple-500/10 text-purple-400 border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Estado de la cuenta</h3>
                    <button 
                      onClick={handleRefreshStats}
                      disabled={refreshing}
                      className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all ${refreshing ? 'opacity-50' : ''}`}
                    >
                      <span className={`material-symbols-outlined text-sm ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
                      Actualizar Datos
                    </button>
                  </div>
                  {currentAccount && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                        <div className="text-2xl font-black text-white mb-1">
                          {formatFollowers(currentAccount.followers || 0)}
                        </div>
                        <div className="text-xs text-gray-400">Seguidores</div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                        <div className="text-2xl font-black text-white mb-1">
                          {currentAccount.totalPosts || 0}
                        </div>
                        <div className="text-xs text-gray-400">Publicaciones</div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
                        <div className="text-2xl font-black text-white mb-1">
                          {scheduledPosts?.filter((p: ScheduledPost) => p.status === 'scheduled').length || 0}
                        </div>
                        <div className="text-xs text-gray-400">Programados</div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
                        <div className="text-2xl font-black text-white mb-1">
                          {currentAccount.aiAutoReply ? '✓' : '✗'}
                        </div>
                        <div className="text-xs text-gray-400">Auto-respuestas IA</div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">Próximas Publicaciones</h3>
                    <div className="space-y-2">
                      {scheduledPosts?.slice(0, 5).map((post: ScheduledPost) => (
                        <div 
                          key={post._id}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            {post.imageUrl ? (
                              <img 
                                src={post.imageUrl} 
                                alt="" 
                                className="size-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="size-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-400">image</span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-white line-clamp-1">{post.caption}</p>
                              <p className="text-xs text-gray-400">{formatDate(post.scheduledFor)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getStatusColor(post.status)}`}>
                              {post.status}
                            </span>
                            {post.status === 'scheduled' && (
                              <button 
                                onClick={() => handlePublishNow(post._id)}
                                className="size-8 flex items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/40"
                                title="Publicar ahora"
                              >
                                <span className="material-symbols-outlined text-sm">send</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!scheduledPosts || scheduledPosts.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                          <p>No hay publicaciones programadas</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'posts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Todas las Publicaciones</h3>
                    <div className="flex gap-2">
                      {['scheduled', 'published', 'draft', 'failed'].map((status) => (
                        <button
                          key={status}
                          className="px-3 py-1 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors capitalize"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scheduledPosts?.map((post: ScheduledPost) => (
                      <div 
                        key={post._id}
                        className="p-4 bg-white/5 rounded-xl border border-white/10"
                      >
                        {post.imageUrl && (
                          <img 
                            src={post.imageUrl} 
                            alt="" 
                            className="w-full h-40 rounded-lg object-cover mb-3"
                          />
                        )}
                        <p className="text-sm text-white line-clamp-2 mb-2">{post.caption}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{formatDate(post.scheduledFor)}</span>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                          <div className="flex gap-1 ml-2">
                             {post.status !== 'published' && (
                               <button 
                                 onClick={() => handlePublishNow(post._id)}
                                 className="size-6 flex items-center justify-center rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/40"
                                 title="Publicar ahora"
                               >
                                 <span className="material-symbols-outlined text-xs">send</span>
                               </button>
                             )}
                             <button 
                               onClick={() => handleDeletePost(post._id)}
                               className="size-6 flex items-center justify-center rounded bg-red-500/20 text-red-400 hover:bg-red-500/40"
                               title="Eliminar"
                             >
                               <span className="material-symbols-outlined text-xs">delete</span>
                             </button>
                          </div>
                        </div>
                        {post.aiEnhanced && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-purple-400">
                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                            Mejorado con IA
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'voice' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Generador de Voz IA</h3>
                      <p className="text-sm text-gray-400">Crea narraciones profesionales para tus videos</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-medium text-emerald-400">ElevenLabs + Fish.Audio</span>
                    </div>
                  </div>
                  
                  <VoiceGenerator />
                </div>
              )}

              {activeTab === 'audio' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Mejorador de Audio</h3>
                      <p className="text-sm text-gray-400">Mejora la calidad de tus grabaciones de voz</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                      <div className="size-2 rounded-full bg-cyan-400" />
                      <span className="text-xs font-medium text-cyan-400">Reducción de ruido + EQ</span>
                    </div>
                  </div>
                  
                  <AudioEnhancer />
                </div>
              )}

              {activeTab === 'video' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Creador de Videos</h3>
                      <p className="text-sm text-gray-400">Combina voz + imagen para crear contenido</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full">
                      <div className="size-2 rounded-full bg-violet-400 animate-pulse" />
                      <span className="text-xs font-medium text-violet-400">Voz + Fondo</span>
                    </div>
                  </div>
                  
                  <VideoCreator />
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Bandeja de Entrada</h3>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-xs font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        Auto-respuestas
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-purple-400">mark_email_unread</span>
                        <span className="text-sm font-medium text-white">Mensajes No Leídos</span>
                      </div>
                      <div className="text-2xl font-black text-white">0</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-blue-400">forum</span>
                        <span className="text-sm font-medium text-white">Conversaciones</span>
                      </div>
                      <div className="text-2xl font-black text-white">0</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-emerald-400">smart_toy</span>
                        <span className="text-sm font-medium text-white">Respuestas IA</span>
                      </div>
                      <div className="text-2xl font-black text-white">0</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase">Mensajes Recientes</h4>
                    <div className="text-center py-8 text-gray-500">
                      <span className="material-symbols-outlined text-5xl mb-3">inbox</span>
                      <p className="text-sm">Conecta tu cuenta de Instagram para ver mensajes</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Reglas de Auto-respuesta</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-gray-400">rule</span>
                          <div>
                            <p className="text-sm text-white">Sin reglas configuradas</p>
                            <p className="text-xs text-gray-500">Crea reglas para automatizar respuestas</p>
                          </div>
                        </div>
                        <button className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-xs font-medium">
                          Crear Regla
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Estadísticas de Instagram</h3>
                    <select className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs">
                      <option>Últimos 7 días</option>
                      <option>Últimos 30 días</option>
                      <option>Últimos 90 días</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                      <div className="text-xs text-gray-400 mb-1">Seguidores</div>
                      <div className="text-2xl font-black text-white">0</div>
                      <div className="text-xs text-emerald-400 mt-1">+0 esta semana</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                      <div className="text-xs text-gray-400 mb-1">Alcance</div>
                      <div className="text-2xl font-black text-white">0</div>
                      <div className="text-xs text-gray-500 mt-1">impresiones</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
                      <div className="text-xs text-gray-400 mb-1">Engagement</div>
                      <div className="text-2xl font-black text-white">0%</div>
                      <div className="text-xs text-gray-500 mt-1">likes + comentarios</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
                      <div className="text-xs text-gray-400 mb-1">Cuentas Alcanzadas</div>
                      <div className="text-2xl font-black text-white">0</div>
                      <div className="text-xs text-gray-500 mt-1">seguidores únicos</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <h4 className="text-sm font-bold text-white mb-4">Rendimiento por Publicación</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Promedio de likes</span>
                          <span className="text-sm font-bold text-white">0</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '0%' }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Promedio de comentarios</span>
                          <span className="text-sm font-bold text-white">0</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Guardados</span>
                          <span className="text-sm font-bold text-white">0</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '0%' }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <h4 className="text-sm font-bold text-white mb-4">Mejores Publicaciones</h4>
                      <div className="space-y-3">
                        <div className="text-center py-6 text-gray-500">
                          <span className="material-symbols-outlined text-4xl mb-2">trending_up</span>
                          <p className="text-xs">No hay datos suficientes</p>
                          <p className="text-xs text-gray-600">Los datos aparecerán cuando publiques contenido</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-4">Mejores Horas para Publicar</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                        <div key={day} className="text-center">
                          <div className="text-[10px] text-gray-500 mb-1">{day}</div>
                          <div className="h-24 bg-white/5 rounded-lg flex flex-col justify-end p-1 gap-0.5">
                            {[8, 12, 18, 21].map((hour) => (
                              <div 
                                key={hour} 
                                className="h-2 bg-purple-500/30 rounded-sm"
                              />
                            ))}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1">{day.charAt(0)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-gray-500 text-center">
                      <span className="material-symbols-outlined text-sm align-middle">info</span>
                      {' '}Conecta tu cuenta para ver las mejores horas según tu audiencia
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && currentAccount && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <img 
                      src={currentAccount.profilePicture || `https://ui-avatars.com/api/?name=${currentAccount.username}&background=random`}
                      alt={currentAccount.username}
                      className="size-16 rounded-full"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white">@{currentAccount.username}</h3>
                      <p className="text-sm text-gray-400">{currentAccount.biography || 'Sin biografía'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white">Configuración de Publicación</h4>
                    
                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-purple-400">schedule</span>
                        <div>
                          <p className="text-sm font-medium text-white">Auto-post habilitado</p>
                          <p className="text-xs text-gray-400">Publica automáticamente según programación</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={currentAccount.autoPostEnabled}
                        onChange={() => handleToggleAutoPost(currentAccount._id, currentAccount.autoPostEnabled)}
                      />
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${currentAccount.autoPostEnabled ? 'bg-purple-500' : 'bg-gray-600'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${currentAccount.autoPostEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-purple-400">auto_awesome</span>
                        <div>
                          <p className="text-sm font-medium text-white">Respuestas automáticas con IA</p>
                          <p className="text-xs text-gray-400">Usa IA para responder mensajes</p>
                        </div>
                      </div>
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${currentAccount.aiAutoReply ? 'bg-purple-500' : 'bg-gray-600'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${currentAccount.aiAutoReply ? 'translate-x-7' : 'translate-x-1'}`} />
                      </div>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                      Desconectar Cuenta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showComposer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-center relative">
              <h2 className="text-xl font-bold text-white">Programar Publicación</h2>
              <button 
                onClick={() => setShowComposer(false)}
                className="absolute right-6 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-gray-400">close</span>
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const postData = {
                userId,
                accountId: formData.get('accountId') as string,
                caption: formData.get('caption') as string,
                hashtags: (formData.get('hashtags') as string).split(' ').filter(h => h.startsWith('#')),
                imageUrl: formData.get('imageUrl') as string,
                scheduledFor: new Date(formData.get('scheduledFor') as string).getTime(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                repeatEnabled: false
              };
              
              try {
                await instagramStorage.createScheduledInstagramPost?.(postData);
                setShowComposer(false);
                showToast('success', '¡Publicación programada exitosamente!');
              } catch (error) {
                logger.error('Failed to create post:', error);
                showToast('error', 'Error al programar. Revisa los datos.');
              }
            }}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Cuenta</label>
                    <select name="accountId" defaultValue={selectedAccount || ''} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all">
                      {accounts?.map((account: InstagramAccount) => (
                        <option key={account._id} value={account._id}>@{account.username}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Programar para</label>
                    <input 
                      type="datetime-local" 
                      name="scheduledFor"
                      required
                      defaultValue={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Caption</label>
                    <button 
                      type="button"
                      onClick={async () => {
                        const captionArea = document.querySelector('textarea[name="caption"]') as HTMLTextAreaElement;
                        if (!captionArea) return;
                        
                        captionArea.value = "Generando con IA...";
                        try {
                          // Note: In a real app, we'd use a more robust way to call the AI
                          // For now, we use our contentGenerator lib if available on the client
                          // or call an Express endpoint
                          const apiUrl = import.meta.env.VITE_API_URL || '/api';
                          const resp = await fetch(`${apiUrl}/ai/generate-caption`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ topic: 'trading forest risk management' })
                          });
                          const data = await resp.json();
                          captionArea.value = data.caption || "";
                        } catch (err) {
                          captionArea.value = "Error al generar. Intenta manual.";
                        }
                      }}
                      className="text-[10px] flex items-center gap-1 text-purple-400 font-bold hover:text-purple-300 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">auto_awesome</span>
                      GENERAR CON IA
                    </button>
                  </div>
                  <textarea 
                    name="caption"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white h-32 resize-none focus:border-purple-500 outline-none transition-all"
                    placeholder="Escribe el mensaje de tu publicación..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Hashtags</label>
                  <input 
                    name="hashtags"
                    type="text"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
                    placeholder="#trading #finanzas #invertir"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">URL de la Imagen</label>
                  <input 
                    name="imageUrl"
                    type="url"
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all mb-2"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-purple-500/30 transition-all group flex flex-col items-center">
                    <span className="material-symbols-outlined text-3xl text-gray-500 group-hover:text-purple-400 transition-colors mb-2">add_photo_alternate</span>
                    <p className="text-xs text-gray-500">O ingresa la URL arriba para previsualizar</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-white/2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className="px-6 py-2.5 bg-white/5 text-gray-400 font-bold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
                >
                  Confirmar y Programar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramDashboard;
