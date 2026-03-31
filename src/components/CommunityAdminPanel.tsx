import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Usuario } from '../types';
import { Avatar } from './Avatar';
import { useToast } from './ToastProvider';

interface CommunityAdminPanelProps {
  usuario: Usuario | null;
  onNavigate?: (tab: string) => void;
}

interface Community {
  _id: string;
  name: string;
  slug: string;
  description: string;
  ownerId: string;
  currentMembers: number;
  maxMembers: number;
  visibility: string;
  accessType: string;
  priceMonthly: number;
  totalRevenue: number;
  createdAt: number;
}

interface CommunityMember {
  _id: string;
  communityId: string;
  userId: string;
  role: string;
  subscriptionStatus?: string;
  joinedAt: number;
  profile?: {
    nombre: string;
    usuario: string;
    avatar?: string;
    email?: string;
  } | null;
}

interface CommunityPost {
  _id: string;
  communityId: string;
  userId: string;
  titulo?: string;
  contenido: string;
  tipo: string;
  likes: string[];
  commentsCount: number;
  isPinned: boolean;
  isLocked: boolean;
  status: string;
  createdAt: number;
  author?: {
    nombre: string;
    usuario: string;
    avatar?: string;
  } | null;
}

interface CommunityStats {
  totalMembers: number;
  totalPosts: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

type TabType = 'overview' | 'posts' | 'members' | 'settings';

export default function CommunityAdminPanel({ usuario, onNavigate }: CommunityAdminPanelProps) {
  const { showToast } = useToast();
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [postFilter, setPostFilter] = useState<string>('all');

  const ownerCommunities = useQuery(api.communities.getOwnerCommunities, {
    userId: usuario?.id || '',
  }) as Community[] | undefined;

  const communityStats = useQuery(api.communities.getCommunityStats, {
    communityId: selectedCommunity?._id as any,
  }) as CommunityStats | null | undefined;

  const communityMembersResult = useQuery(api.communities.getCommunityMembers, {
    communityId: selectedCommunity?._id as any,
    limit: 50,
  });
  const communityMembers = communityMembersResult?.members as CommunityMember[] | undefined;

  const communityPosts = useQuery(api.communities.getCommunityPostsAdmin, {
    communityId: selectedCommunity?._id as any,
    status: postFilter !== 'all' ? postFilter : undefined,
  }) as CommunityPost[] | undefined;

  const removeMemberMutation = useMutation(api.communities.removeMember);
  const updateMemberRoleMutation = useMutation(api.communities.updateMemberRole);
  const deletePostMutation = useMutation(api.communities.deletePostAdmin);
  const hidePostMutation = useMutation(api.communities.hidePost);
  const pinPostMutation = useMutation(api.communities.pinPost);

  useEffect(() => {
    if (ownerCommunities && ownerCommunities.length > 0 && !selectedCommunity) {
      setSelectedCommunity(ownerCommunities[0]);
    }
  }, [ownerCommunities]);

  const filteredMembers = useMemo(() => {
    if (!communityMembers) return [];
    return communityMembers.filter(m => {
      const matchesSearch = !searchTerm || 
        m.profile?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.profile?.usuario?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = memberFilter === 'all' || m.role === memberFilter;
      return matchesSearch && matchesFilter;
    });
  }, [communityMembers, searchTerm, memberFilter]);

  const filteredPosts = useMemo(() => {
    if (!communityPosts) return [];
    return communityPosts.filter(p => {
      const matchesSearch = !searchTerm || 
        p.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.author?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [communityPosts, searchTerm]);

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!selectedCommunity || !usuario) return;
    if (!confirm(`¿Expulsar a ${userName} de la comunidad?`)) return;
    
    try {
      await removeMemberMutation({
        communityId: selectedCommunity._id as any,
        userId,
        adminId: usuario.id,
      });
      showToast('success', 'Miembro expulsado');
    } catch (error: any) {
      showToast('error', error.message || 'Error al expulsar miembro');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!selectedCommunity || !usuario) return;
    
    try {
      await updateMemberRoleMutation({
        communityId: selectedCommunity._id as any,
        userId,
        role: newRole as any,
        adminId: usuario.id,
      });
      showToast('success', 'Rol actualizado');
    } catch (error: any) {
      showToast('error', error.message || 'Error al actualizar rol');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!selectedCommunity || !usuario) return;
    if (!confirm('¿Eliminar esta publicación?')) return;
    
    try {
      await deletePostMutation({
        postId: postId as any,
        adminId: usuario.id,
      });
      showToast('success', 'Publicación eliminada');
    } catch (error: any) {
      showToast('error', error.message || 'Error al eliminar publicación');
    }
  };

  const handleHidePost = async (postId: string) => {
    if (!selectedCommunity || !usuario) return;
    
    try {
      await hidePostMutation({
        postId: postId as any,
        adminId: usuario.id,
      });
      showToast('success', 'Publicación ocultada');
    } catch (error: any) {
      showToast('error', error.message || 'Error al ocultar publicación');
    }
  };

  const handlePinPost = async (postId: string, isPinned: boolean) => {
    if (!selectedCommunity || !usuario) return;
    
    try {
      await pinPostMutation({
        postId: postId as any,
        isPinned: !isPinned,
        userId: usuario.id,
      });
      showToast('success', isPinned ? 'Publicación desafijada' : 'Publicación fijada');
    } catch (error: any) {
      showToast('error', error.message || 'Error al fijar publicación');
    }
  };

  if (!usuario || usuario.id === 'guest') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">lock</span>
          <h2 className="text-xl font-bold text-white mb-2">Acceso Restringido</h2>
          <p className="text-gray-400">Inicia sesión para acceder al panel de administración</p>
        </div>
      </div>
    );
  }

  if (!ownerCommunities || ownerCommunities.length === 0) {
    return (
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[80px] rounded-full" />
          
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/30 to-violet-600/20 border border-primary/30 flex items-center justify-center shadow-xl shadow-primary/10">
                <span className="material-symbols-outlined text-primary text-2xl">groups</span>
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-widest text-white">
                  Mi Comunidad
                </h1>
                <p className="text-gray-400 text-sm mt-1">Panel de administración</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-transparent" />
          
          <div className="relative glass rounded-2xl p-16 border border-white/10 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full mx-auto w-32 h-32" />
              <div className="relative size-20 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-600/10 border border-white/10 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-primary text-4xl">add_circle</span>
              </div>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">
              No tienes comunidades
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Crea tu primera comunidad y comienza a construir tu imperio de trading social
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'comunidad' }))}
              className="px-8 py-4 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center gap-2 mx-auto transition-all"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Crear Primera Comunidad
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[80px] rounded-full" />
        
        <div className="relative p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-primary/30 to-violet-600/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
              <span className="material-symbols-outlined text-primary text-xl">dashboard</span>
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-widest text-white">
                Panel de Comunidad
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">
                Gestiona {selectedCommunity?.name || 'tu comunidad'}
              </p>
            </div>
          </div>
          <select
            value={selectedCommunity?._id || ''}
            onChange={(e) => {
              const community = ownerCommunities?.find(c => c._id === e.target.value);
              setSelectedCommunity(community || null);
            }}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-bold hover:bg-white/10 transition-colors"
          >
            {ownerCommunities?.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-2xl p-1.5 flex gap-1 mb-6 border border-white/10">
        {[
          { id: 'overview', label: 'Estadísticas', icon: 'analytics' },
          { id: 'posts', label: 'Publicaciones', icon: 'article' },
          { id: 'members', label: 'Miembros', icon: 'group' },
          { id: 'settings', label: 'Config', icon: 'settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary to-violet-600 text-white shadow-lg shadow-primary/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glass rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-blue-500/5 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg text-blue-400">group</span>
              </div>
              <div>
                <p className="text-2xl font-black text-white">{communityStats?.totalMembers || 0}</p>
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Miembros</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-green-400">article</span>
              </div>
              <div>
                <p className="text-3xl font-black text-white">{communityStats?.totalPosts || 0}</p>
                <p className="text-xs text-gray-500 uppercase font-bold">Publicaciones</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-yellow-400">attach_money</span>
              </div>
              <div>
                <p className="text-3xl font-black text-white">
                  ${(communityStats?.totalRevenue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 uppercase font-bold">Ingresos Totales</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-purple-400">subscriptions</span>
              </div>
              <div>
                <p className="text-3xl font-black text-white">
                  {communityStats?.activeSubscriptions || 0}
                </p>
                <p className="text-xs text-gray-500 uppercase font-bold">Suscriptores</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar publicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500"
              />
            </div>
            <select
              value={postFilter}
              onChange={(e) => setPostFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="hidden">Ocultos</option>
              <option value="deleted">Eliminados</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredPosts?.map(post => (
              <div key={post._id} className="glass rounded-xl p-4 border border-white/10">
                <div className="flex items-start gap-4">
                  <Avatar 
                    src={post.author?.avatar}
                    name={post.author?.nombre || 'Usuario'}
                    seed={post.userId}
                    size="md"
                    rounded="lg"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{post.author?.nombre || 'Usuario'}</span>
                      <span className="text-gray-500 text-sm">@{post.author?.usuario || 'unknown'}</span>
                      {post.isPinned && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">
                          📌 Fijado
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        post.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        post.status === 'hidden' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {post.status === 'active' ? 'Activo' : post.status === 'hidden' ? 'Oculto' : 'Eliminado'}
                      </span>
                    </div>
                    {post.titulo && (
                      <h4 className="font-bold text-white mb-1">{post.titulo}</h4>
                    )}
                    <p className="text-gray-400 text-sm line-clamp-2">{post.contenido}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">favorite</span>
                        {post.likes?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">chat_bubble</span>
                        {post.commentsCount || 0}
                      </span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handlePinPost(post._id, post.isPinned)}
                      className={`p-2 rounded-lg transition-colors ${
                        post.isPinned 
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                      title={post.isPinned ? 'Desfijar' : 'Fijar'}
                    >
                      <span className="material-symbols-outlined text-sm">push_pin</span>
                    </button>
                    {post.status === 'active' && (
                      <button
                        onClick={() => handleHidePost(post._id)}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors"
                        title="Ocultar"
                      >
                        <span className="material-symbols-outlined text-sm">visibility_off</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredPosts?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2">article</span>
                <p>No hay publicaciones</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar miembros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500"
              />
            </div>
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
            >
              <option value="all">Todos</option>
              <option value="owner">Dueño</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderador</option>
              <option value="member">Miembro</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>

          <div className="space-y-2">
            {filteredMembers?.map(member => (
              <div key={member._id} className="glass rounded-xl p-4 border border-white/10 flex items-center gap-4">
                <Avatar 
                  src={member.profile?.avatar}
                  name={member.profile?.nombre || 'Usuario'}
                  seed={member.userId}
                  size="md"
                  rounded="full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{member.profile?.nombre || 'Usuario'}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      member.role === 'owner' ? 'bg-yellow-500/20 text-yellow-400' :
                      member.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                      member.role === 'moderator' ? 'bg-blue-500/20 text-blue-400' :
                      member.role === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-white/10 text-gray-400'
                    }`}>
                      {member.role === 'owner' ? '👑' : 
                       member.role === 'admin' ? '⚡' :
                       member.role === 'moderator' ? '🛡️' :
                       member.role === 'pending' ? '⏳' : '👤'} {member.role}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">@{member.profile?.usuario || member.userId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                  {member.subscriptionStatus && (
                    <span className={`text-xs ${
                      member.subscriptionStatus === 'active' ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {member.subscriptionStatus === 'active' ? '✓ Activo' : member.subscriptionStatus}
                    </span>
                  )}
                </div>
                {member.role !== 'owner' && (
                  <div className="flex gap-2">
                    {member.role !== 'admin' && (
                      <button
                        onClick={() => handleUpdateRole(member.userId, 'admin')}
                        className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/30 transition-colors"
                      >
                        Hacer Admin
                      </button>
                    )}
                    {member.role === 'admin' && (
                      <button
                        onClick={() => handleUpdateRole(member.userId, 'member')}
                        className="px-3 py-1.5 bg-white/10 text-gray-400 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors"
                      >
                        Quitar Admin
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member.userId, member.profile?.nombre || 'este usuario')}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-colors"
                    >
                      Expulsar
                    </button>
                  </div>
                )}
              </div>
            ))}
            {filteredMembers?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2">group</span>
                <p>No hay miembros</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && selectedCommunity && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Información de la Comunidad
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase">Nombre</label>
                <p className="text-white font-medium">{selectedCommunity.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase">Slug</label>
                <p className="text-white font-mono">/{selectedCommunity.slug}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase">Descripción</label>
                <p className="text-gray-300">{selectedCommunity.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase">Visibilidad</label>
                  <p className="text-white">{selectedCommunity.visibility}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase">Acceso</label>
                  <p className="text-white">{selectedCommunity.accessType}</p>
                </div>
              </div>
              {selectedCommunity.accessType === 'paid' && (
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase">Precio Mensual</label>
                  <p className="text-green-400 font-bold">${selectedCommunity.priceMonthly}/mes</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">link</span>
              Enlaces Rápidos
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate?.('comunidad')}
                className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-primary">visibility</span>
                <div className="text-left">
                  <p className="font-bold text-white">Ver Comunidad</p>
                  <p className="text-xs text-gray-500">Abrir la comunidad en el feed</p>
                </div>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/comunidad/${selectedCommunity.slug}`);
                  showToast('success', 'Enlace copiado al portapapeles');
                }}
                className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-primary">copy</span>
                <div className="text-left">
                  <p className="font-bold text-white">Copiar Enlace</p>
                  <p className="text-xs text-gray-500">Comparte este enlace para invitar miembros</p>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400">warning</span>
              Zona de Peligro
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Estas acciones son irreversibles. Por favor, ten precaución.
            </p>
            <button
              onClick={() => {
                if (confirm('¿Eliminar esta comunidad? Esta acción no se puede deshacer.')) {
                  showToast('warning', 'Función de eliminación deshabilitada por seguridad. Contacta a soporte.');
                }
              }}
              className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500/30 transition-colors"
            >
              Eliminar Comunidad
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
