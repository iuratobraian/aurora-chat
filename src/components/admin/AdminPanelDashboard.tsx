import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from '../ToastProvider';
import AgentPromptGenerator from './AgentPromptGenerator';

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-700/30 rounded ${className}`} />
);

const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'amber';
  trend?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, subtitle, icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    orange: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  };

  return (
    <div className="bg-[#1a1c20] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400">
          <span className="material-symbols-outlined text-xs">trending_up</span>
          <span>{trend}</span>
        </div>
      )}
      {subtitle && <div className="mt-1 text-[9px] text-gray-600 uppercase tracking-wider">{subtitle}</div>}
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  badge?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      active
        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
    }`}
  >
    <span className="material-symbols-outlined text-base">{icon}</span>
    <span>{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="ml-1 bg-red-500/20 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

const SectionCard: React.FC<{ title: string; icon?: string; children: React.ReactNode; actions?: React.ReactNode }> = ({ 
  title, icon, children, actions 
}) => (
  <div className="bg-[#1a1c20] rounded-xl border border-white/5">
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
      <div className="flex items-center gap-2">
        {icon && <span className="material-symbols-outlined text-gray-400 text-lg">{icon}</span>}
        <h3 className="text-sm font-bold text-gray-300">{title}</h3>
      </div>
      {actions}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const UserRowLegacy: React.FC<{ user: { name: string; email: string; role: string; status: string; avatar: string } }> = ({ user }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
        {user.avatar}
      </div>
      <div>
        <div className="text-sm text-white">{user.name}</div>
        <div className="text-[10px] text-gray-500">{user.email}</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
        user.role === 'Admin' ? 'bg-purple-500/20 text-purple-400' :
        user.role === 'Moderator' ? 'bg-blue-500/20 text-blue-400' :
        'bg-gray-500/20 text-gray-400'
      }`}>{user.role}</span>
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
        user.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' :
        user.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
        'bg-red-500/20 text-red-400'
      }`}>{user.status}</span>
      <button className="p-1 hover:bg-white/10 rounded"><span className="material-symbols-outlined text-gray-500 text-sm">edit</span></button>
      <button className="p-1 hover:bg-white/10 rounded"><span className="material-symbols-outlined text-gray-500 text-sm">delete</span></button>
    </div>
  </div>
);

const UserRow: React.FC<{ 
  user: ProfileData; 
  onEdit: (user: ProfileData) => void;
  onToggleBan: (userId: string, status: string) => void;
  onDelete: (userId: string) => void;
}> = ({ user, onEdit, onToggleBan, onDelete }) => {
  const roleNames = ['Free', 'Pro', 'Elite', 'Creator', 'Moderator', 'Admin', 'SuperAdmin'];
  const roleName = roleNames[user.role] || 'User';
  const status = user.status || 'active';
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
          {user.avatar || user.usuario?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <div className="text-sm text-white">@{user.usuario}</div>
          <div className="text-[10px] text-gray-500">{user.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
          roleName === 'Admin' || roleName === 'SuperAdmin' ? 'bg-purple-500/20 text-purple-400' :
          roleName === 'Moderator' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>{roleName}</span>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
          status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
          status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
          'bg-red-500/20 text-red-400'
        }`}>{status === 'active' ? 'Activo' : status === 'pending' ? 'Pendiente' : 'Baneado'}</span>
        <button 
          onClick={() => onEdit(user)} 
          className="p-1 hover:bg-white/10 rounded"
          title="Editar"
        >
          <span className="material-symbols-outlined text-gray-500 text-sm">edit</span>
        </button>
        <button 
          onClick={() => onToggleBan(user.userId, status)} 
          className="p-1 hover:bg-white/10 rounded"
          title={status === 'banned' ? 'Desbanear' : 'Banear'}
        >
          <span className={`material-symbols-outlined text-sm ${status === 'banned' ? 'text-emerald-500' : 'text-red-400'}`}>
            {status === 'banned' ? 'lock_open' : 'block'}
          </span>
        </button>
        <button 
          onClick={() => onDelete(user.userId)} 
          className="p-1 hover:bg-white/10 rounded"
          title="Eliminar"
        >
          <span className="material-symbols-outlined text-gray-500 text-sm">delete</span>
        </button>
      </div>
    </div>
  );
};

const CommunityRow: React.FC<{ community: { name: string; members: number; posts: number; status: string } }> = ({ community }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
    <div>
      <div className="text-sm text-white">{community.name}</div>
      <div className="text-[10px] text-gray-500">{community.members} miembros · {community.posts} posts</div>
    </div>
    <div className="flex items-center gap-2">
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
        community.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
      }`}>{community.status}</span>
      <button className="p-1 hover:bg-white/10 rounded"><span className="material-symbols-outlined text-gray-500 text-sm">settings</span></button>
    </div>
  </div>
);

const PostRow: React.FC<{ post: { title: string; author: string; type: string; status: string; date: string } }> = ({ post }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
    <div className="flex-1 min-w-0">
      <div className="text-sm text-white truncate">{post.title}</div>
      <div className="text-[10px] text-gray-500">{post.author} · {post.date}</div>
    </div>
    <div className="flex items-center gap-2 ml-4">
      <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-gray-500/20 text-gray-400">{post.type}</span>
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
        post.status === 'Published' ? 'bg-emerald-500/20 text-emerald-400' :
        post.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
        'bg-gray-500/20 text-gray-400'
      }`}>{post.status}</span>
      <button className="p-1 hover:bg-white/10 rounded"><span className="material-symbols-outlined text-gray-500 text-sm">visibility</span></button>
      <button className="p-1 hover:bg-white/10 rounded"><span className="material-symbols-outlined text-gray-500 text-sm">delete</span></button>
    </div>
  </div>
);

const mockUsers = [
  { name: '@trader_pro', email: 'trader@test.com', role: 'Admin', status: 'Active', avatar: 'T' },
  { name: '@market_wizard', email: 'wizard@test.com', role: 'Moderator', status: 'Active', avatar: 'M' },
  { name: '@signal_king', email: 'king@test.com', role: 'User', status: 'Pending', avatar: 'S' },
  { name: '@forex_ninja', email: 'ninja@test.com', role: 'User', status: 'Active', avatar: 'F' },
  { name: '@crypto_queen', email: 'queen@test.com', role: 'User', status: 'Banned', avatar: 'C' },
];

const mockCommunities = [
  { name: 'Forex Trading', members: 1250, posts: 342, status: 'Active' },
  { name: 'Crypto Signals', members: 890, posts: 215, status: 'Active' },
  { name: 'Stock Options', members: 567, posts: 98, status: 'Pending' },
  { name: 'Futures Master', members: 432, posts: 76, status: 'Active' },
];

const mockPosts = [
  { title: 'EUR/USD Signal - BUY @ 1.0850', author: '@signal_king', type: 'Signal', status: 'Published', date: '14:30' },
  { title: 'Análisis técnico semanal', author: '@market_wizard', type: 'Post', status: 'Pending', date: '14:15' },
  { title: 'Bitcoin prediction 2024', author: '@crypto_queen', type: 'Post', status: 'Published', date: '13:45' },
  { title: 'Gold trading setup', author: '@trader_pro', type: 'Signal', status: 'Draft', date: '12:20' },
];

const mockAds = [
  { name: 'Banner Principal', position: 'Home', clicks: 12500, status: 'Active' },
  { name: 'Sidebar Promo', position: 'Sidebar', clicks: 4300, status: 'Active' },
  { name: 'Newsletter', position: 'Email', clicks: 890, status: 'Paused' },
];

const mockTraders = [
  { name: '@forex_pro', kyc: 'approved', plan: 'Premium', date: '2024-01-10' },
  { name: '@crypto_trader', kyc: 'pending', plan: 'Pro', date: '2024-01-12' },
  { name: '@stock_master', kyc: 'reviewing', plan: 'VIP', date: '2024-01-14' },
  { name: '@day_trader', kyc: 'approved', plan: 'Premium', date: '2024-01-08' },
];

interface ProfileData {
  _id: string;
  userId: string;
  nombre: string;
  usuario: string;
  email: string;
  rol: string;
  role: number;
  status: string;
  avatar?: string;
  xp?: number;
  level?: number;
  isBlocked?: boolean;
  fechaRegistro?: string;
  ultimoLogin?: string;
  accuracy?: number;
  reputation?: number;
}

interface CommunityData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  visibility: string;
  status: string;
  ownerId: string;
  memberCount?: number;
  postCount?: number;
  createdAt?: string;
  isPortalExclusive?: boolean;
}

interface AdminPanelDashboardProps {
  stats?: {
    totalUsers?: number;
    totalPosts?: number;
    totalCommunities?: number;
    activeAds?: number;
  };
  users?: Array<{ name: string; email: string; role: string; status: string; avatar: string }>;
  communities?: Array<{ name: string; members: number; posts: number; status: string }>;
  posts?: Array<{ title: string; author: string; type: string; status: string; date: string }>;
  ads?: Array<{ name: string; position: string; clicks: number; status: string }>;
  loading?: boolean;
  currentUser?: { userId: string; role: number };
}

const AdminPanelDashboard: React.FC<AdminPanelDashboardProps> = ({ stats, users, communities, posts, ads, loading, currentUser }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userSearch, setUserSearch] = useState('');
  const [communitySearch, setCommunitySearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [postFilter, setPostFilter] = useState<'all' | 'active' | 'pending' | 'draft'>('all');
  const [globalSearch, setGlobalSearch] = useState('');
  const [editingUser, setEditingUser] = useState<ProfileData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'user' | 'community' | 'post'>('user');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Batch selection state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  const profilesData = useQuery(api.profiles.getAllProfiles, { limit: 100 });
  const communitiesData = useQuery(api.communities.listPublicCommunities, { limit: 100 });
  const postsData = useQuery(api.posts.getPosts);
  const profiles: ProfileData[] = profilesData?.profiles || [];
  const communitiesList: CommunityData[] = communitiesData || [];
  const postsList = postsData || [];

  const filteredPosts = useMemo(() => {
    let filtered = postsList;
    if (postFilter !== 'all') {
      filtered = filtered.filter(p => p.status === postFilter);
    }
    if (postSearch.trim()) {
      const search = postSearch.toLowerCase();
      filtered = filtered.filter(p => 
        p.contenido?.toLowerCase().includes(search) ||
        p.nombreUsuario?.toLowerCase().includes(search) ||
        p.usuarioManejo?.toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [postsList, postSearch, postFilter]);
  
  const filteredCommunities = useMemo(() => {
    if (!communitySearch.trim()) return communitiesList;
    const search = communitySearch.toLowerCase();
    return communitiesList.filter(c => 
      c.name?.toLowerCase().includes(search) ||
      c.slug?.toLowerCase().includes(search) ||
      c.description?.toLowerCase().includes(search)
    );
  }, [communitiesList, communitySearch]);

  const updateProfileMutation = useMutation(api.profiles.updateProfile);
  const banUserMutation = useMutation(api.profiles.banUser);
  const deleteProfileMutation = useMutation(api.profiles.deleteProfile);

  // Bitacora / KYC Queries & Mutations
  const verificationsData = useQuery(api.traderVerification.listAllVerifications);
  const verifications = verificationsData || [];
  const updateVerificationStatusMutation = useMutation(api.traderVerification.updateVerificationStatus);

  // Referrals Queries & Mutations
  const referralsData = useQuery(api.referrals.getAllReferrals, {});
  const allReferrals = referralsData || [];
  const completeReferralMutation = useMutation(api.referrals.completeReferral);

  // AI Agent Queries & Mutations
  const aiConfig = useQuery(api.aiAgent.getAIAgentConfig);
  const pendingAiPosts = useQuery(api.aiAgent.getPendingPosts);
  const toggleAiStatusMutation = useMutation(api.aiAgent.toggleAgentStatus);
  const approveAiPostMutation = useMutation(api.aiAgent.approvePendingPost);
  const rejectAiPostMutation = useMutation(api.aiAgent.rejectPendingPost);

  // Moderation Queries & Mutations
  const spamReports = useQuery(api.moderation.getSpamReports, { status: "pending" });
  const moderateContentMutation = useMutation(api.moderation.moderateContent);

  // Marketing Queries & Mutations
  const deleteAdMutation = useMutation(api.ads.deleteAd);

  // WhatsApp Queries & Mutations
  const waStats = useQuery(api.whatsappCron.getNotificationStats);
  const waNotifications = useQuery(api.whatsappCron.getAllNotifications);
  const retryWaNotificationMutation = useMutation(api.whatsappCron.retryFailedNotification);

  // Config / Backup
  const backupStats = useQuery(api.backup.getBackupStats);
  const createBackupMutation = useMutation(api.backup.createBackup);

  // Batch selection handlers
  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
    setSelectAll(false);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredProfiles.map((p: ProfileData) => p.userId)));
    }
    setSelectAll(!selectAll);
  };

  const handleBatchBan = async () => {
    if (selectedUsers.size === 0) return;
    setBatchActionLoading(true);
    try {
      for (const userId of selectedUsers) {
        await banUserMutation({ userId, reason: 'Batch ban from admin panel' });
      }
      setSelectedUsers(new Set());
      setSelectAll(false);
    } catch (e) {
      console.error('Error batch banning users:', e);
    }
    setBatchActionLoading(false);
  };

  const handleBatchDelete = async () => {
    if (selectedUsers.size === 0) return;
    setBatchActionLoading(true);
    try {
      for (const userId of selectedUsers) {
        await deleteProfileMutation({ userId });
      }
      setSelectedUsers(new Set());
      setSelectAll(false);
    } catch (e) {
      console.error('Error batch deleting users:', e);
    }
    setBatchActionLoading(false);
  };

  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', isPrivate: false });
  const [editingCommunity, setEditingCommunity] = useState<{id: string; name: string; description: string; visibility: string; isPortalExclusive?: boolean} | null>(null);

  const createCommunityMutation = useMutation(api.communities.createCommunity);
  const deleteCommunityMutation = useMutation(api.communities.deleteCommunity);
  const updateCommunityMutation = useMutation(api.communities.updateCommunity);

  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim()) {
      showToast('warning', 'El nombre de la comunidad es requerido');
      return;
    }
    if (!currentUser?.userId) {
      showToast('warning', 'Debes iniciar sesión para crear una comunidad');
      return;
    }
    
    try {
      const slugBase = newCommunity.name.toLowerCase()
        .replace(/[^a-z0-9áéíóúñ]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Generar slug único con timestamp
      const slug = `${slugBase}-${Date.now()}`;
      
      // Description es requerida, usar valor por defecto si está vacía
      const description = newCommunity.description.trim() || `Comunidad de ${newCommunity.name}`;
      
      await createCommunityMutation({
        ownerId: currentUser.userId,
        name: newCommunity.name.trim(),
        slug: slug,
        description: description,
        visibility: newCommunity.isPrivate ? 'private' : 'public',
        accessType: 'free',
        maxMembers: 999999,
        plan: 'free',
      });
      setNewCommunity({ name: '', description: '', isPrivate: false });
      setShowCommunityModal(false);
      showToast('success', 'Comunidad creada exitosamente');
    } catch (e: any) {
      console.error('Error creating community:', e);
      showToast('error', e?.message || 'Error al crear la comunidad');
    }
  };

  const handleDeleteCommunity = async (communityId: string) => {
    try {
      await deleteCommunityMutation({ id: communityId as any, userId: currentUser?.userId || '' });
      setShowDeleteConfirm(null);
    } catch (e) {
      console.error('Error deleting community:', e);
    }
  };

  const handleUpdateCommunity = async () => {
    if (!editingCommunity || !currentUser?.userId) return;
    try {
      await updateCommunityMutation({
        id: editingCommunity.id as any,
        userId: currentUser.userId,
        name: editingCommunity.name,
        description: editingCommunity.description,
        visibility: editingCommunity.visibility as any,
        isPortalExclusive: editingCommunity.isPortalExclusive,
      });
      setEditingCommunity(null);
    } catch (e) {
      console.error('Error updating community:', e);
    }
  };

  const globalSearchResults = useMemo(() => {
    if (!globalSearch.trim()) return null;
    const search = globalSearch.toLowerCase();
    const usersResults = profiles.filter(p => 
      p.usuario?.toLowerCase().includes(search) ||
      p.email?.toLowerCase().includes(search) ||
      p.nombre?.toLowerCase().includes(search)
    ).slice(0, 5).map(u => ({ type: 'user' as const, data: u }));
    
    const communitiesResults = communitiesList.filter(c => 
      c.name?.toLowerCase().includes(search) ||
      c.slug?.toLowerCase().includes(search)
    ).slice(0, 5).map(c => ({ type: 'community' as const, data: c }));
    
    const postsResults = postsList.filter((p: any) => 
      p.titulo?.toLowerCase().includes(search) ||
      p.autor?.username?.toLowerCase().includes(search)
    ).slice(0, 5).map(p => ({ type: 'post' as const, data: p }));
    
    return {
      users: usersResults,
      communities: communitiesResults,
      posts: postsResults,
      total: usersResults.length + communitiesResults.length + postsResults.length
    };
  }, [globalSearch, profiles, communitiesList, postsList]);

  const filteredProfiles = useMemo(() => {
    if (!userSearch.trim()) return profiles;
    const search = userSearch.toLowerCase();
    return profiles.filter(p => 
      p.usuario?.toLowerCase().includes(search) ||
      p.email?.toLowerCase().includes(search) ||
      p.nombre?.toLowerCase().includes(search)
    );
  }, [profiles, userSearch]);

  // Pagination
  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProfiles.slice(start, start + itemsPerPage);
  }, [filteredProfiles, currentPage]);

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [userSearch]);

  const adsData = useQuery(api.ads.getAds);
  const adsList = adsData || [];
  const activeAds = adsList.filter((a: any) => a.activo);
  const totalClicks = activeAds.reduce((sum: number, a: any) => sum + (a.clicks || 0), 0);
  const totalImpressions = activeAds.reduce((sum: number, a: any) => sum + (a.impresiones || 0), 0);

  const propFirmsData = useQuery(api.propFirms.getAllPropFirms);
  const propFirmsList = propFirmsData || [];
  const activePropFirms = propFirmsList.filter((p: any) => p.isActive);

  const handleToggleBan = async (userId: string, currentStatus: string) => {
    if (!currentUser?.userId) return;
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    try {
      await banUserMutation({ userId, adminUserId: currentUser.userId, status: newStatus });
    } catch (e) {
      console.error('Error banning user:', e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteProfileMutation({ userId });
      setShowDeleteConfirm(null);
    } catch (e) {
      console.error('Error deleting user:', e);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !currentUser?.userId) return;
    try {
      await updateProfileMutation({
        id: editingUser._id as any,
        userId: currentUser.userId,
        xp: editingUser.xp,
        level: editingUser.level,
        reputation: editingUser.reputation,
      });
      setEditingUser(null);
    } catch (e) {
      console.error('Error updating user:', e);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'users', label: 'Usuarios', icon: 'group' },
    { id: 'communities', label: 'Comunidades', icon: 'groups' },
    { id: 'posts', label: 'Contenido', icon: 'article' },
    { id: 'ads', label: 'Ads', icon: 'campaign' },
    { id: 'propFirms', label: 'Prop Firms', icon: 'account_balance' },
    { id: 'referrals', label: 'Referidos', icon: 'group_add' },
    { id: 'aiAgent', label: 'AI Agent', icon: 'smart_toy' },
    { id: 'marketing', label: 'Marketing', icon: 'campaign' },
    { id: 'moderation', label: 'Moderación', icon: 'gavel' },
    { id: 'bitacora', label: 'Bitácora', icon: 'menu_book' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'chat' },
    { id: 'config', label: 'Ajustes', icon: 'settings' },
    { id: 'agentPrompts', label: 'Agent Prompts', icon: 'psychology' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#1a1c20] rounded-xl p-4 border border-white/5">
                <Skeleton className="h-3 w-16 mb-3" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Cargando..." icon="person">
              <TableSkeleton rows={4} />
            </SectionCard>
            <SectionCard title="Cargando..." icon="history">
              <TableSkeleton rows={4} />
            </SectionCard>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            <div className="relative">
              <div className="bg-[#1a1c20] rounded-lg border border-white/5 px-3 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500 text-lg">search</span>
                <input 
                  type="text" 
                  placeholder="Búsqueda global: usuarios, comunidades, posts..." 
                  className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
                {globalSearch && (
                  <button onClick={() => setGlobalSearch('')} className="text-gray-500 hover:text-white">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
              {globalSearchResults && globalSearchResults.total > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-[#1a1c20] rounded-lg border border-white/10 shadow-xl max-h-96 overflow-y-auto">
                  {globalSearchResults.users.length > 0 && (
                    <div className="p-2 border-b border-white/5">
                      <div className="text-xs text-gray-500 px-2 py-1">Usuarios</div>
                      {globalSearchResults.users.map((r: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => { setActiveTab('users'); setUserSearch(r.data.usuario || ''); setGlobalSearch(''); }}>
                          <span className="material-symbols-outlined text-gray-400 text-sm">person</span>
                          <span className="text-sm text-white">{r.data.usuario}</span>
                          <span className="text-xs text-gray-500">{r.data.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {globalSearchResults.communities.length > 0 && (
                    <div className="p-2 border-b border-white/5">
                      <div className="text-xs text-gray-500 px-2 py-1">Comunidades</div>
                      {globalSearchResults.communities.map((r: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => { setActiveTab('communities'); setCommunitySearch(r.data.name || ''); setGlobalSearch(''); }}>
                          <span className="material-symbols-outlined text-gray-400 text-sm">groups</span>
                          <span className="text-sm text-white">{r.data.name}</span>
                          <span className="text-xs text-gray-500">@{r.data.slug}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {globalSearchResults.posts.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs text-gray-500 px-2 py-1">Posts</div>
                      {globalSearchResults.posts.map((r: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => { setActiveTab('posts'); setPostSearch(r.data.titulo || ''); setGlobalSearch(''); }}>
                          <span className="material-symbols-outlined text-gray-400 text-sm">article</span>
                          <span className="text-sm text-white truncate">{r.data.titulo}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatsCard label="Usuarios" value={stats?.totalUsers || '12,458'} icon="person" color="blue" trend="+8%" subtitle="Registrados" />
              <StatsCard label="Comunidades" value={stats?.totalCommunities || '24'} icon="groups" color="green" trend="+2" subtitle="Activas" />
              <StatsCard label="Publicaciones" value={stats?.totalPosts || '3,842'} icon="article" color="purple" trend="+15%" subtitle="Total" />
              <StatsCard label="Ads Activas" value={stats?.activeAds || '8'} icon="campaign" color="orange" subtitle="Campañas" />
            </div>

            {/* Analytics Charts Section */}
            <SectionCard title="Analytics" icon="analytics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Growth Chart - Users */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Crecimiento de Usuarios</span>
                    <span className="text-xs text-emerald-400">+12.5%</span>
                  </div>
                  <div className="h-24 flex items-end gap-1">
                    {[65, 78, 82, 75, 88, 95, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-500/30 rounded-t hover:bg-blue-500/50 transition-colors relative group" style={{ height: `${h}%` }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 opacity-0 group-hover:opacity-100">{h}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-600">
                    <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                  </div>
                </div>

                {/* Activity Chart - Posts */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Actividad Semanal</span>
                    <span className="text-xs text-purple-400">+156 posts</span>
                  </div>
                  <div className="h-24 flex items-end gap-1">
                    {[45, 62, 58, 70, 85, 92, 78].map((h, i) => (
                      <div key={i} className="flex-1 bg-purple-500/30 rounded-t hover:bg-purple-500/50 transition-colors relative group" style={{ height: `${h}%` }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 opacity-0 group-hover:opacity-100">{h}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-600">
                    <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                  </div>
                </div>

                {/* Revenue Chart - Subscriptions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Suscripciones</span>
                    <span className="text-xs text-emerald-400">$2,450</span>
                  </div>
                  <div className="h-24 flex items-end gap-1">
                    {[30, 45, 55, 48, 62, 75, 88].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-500/30 rounded-t hover:bg-emerald-500/50 transition-colors relative group" style={{ height: `${h}%` }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 opacity-0 group-hover:opacity-100">${h*10}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-600">
                    <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                  </div>
                </div>
              </div>

              {/* Metrics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/5">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">78%</div>
                  <div className="text-[10px] text-gray-500">Retención Semanal</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">4.2</div>
                  <div className="text-[10px] text-gray-500">Avg. Posts/Día</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">2.4k</div>
                  <div className="text-[10px] text-gray-500">Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">$19</div>
                  <div className="text-[10px] text-gray-500">ARPPU</div>
                </div>
              </div>
            </SectionCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SectionCard title="Últimos Usuarios" icon="person" actions={<button className="text-xs text-blue-400 hover:text-blue-300">Ver todos</button>}>
                {profiles.length > 0 ? (
                  profiles.slice(0, 4).map((user) => (
                    <UserRow 
                      key={user._id} 
                      user={user} 
                      onEdit={setEditingUser}
                      onToggleBan={handleToggleBan}
                      onDelete={(userId) => setShowDeleteConfirm(userId)}
                    />
                  ))
                ) : (
                  (users?.slice(0, 4) || mockUsers.slice(0, 4)).map((user, i) => <UserRowLegacy key={i} user={user} />)
                )}
              </SectionCard>
              <SectionCard title="Actividad Reciente" icon="history">
                {[
                  { icon: 'person_add', text: 'Nuevo usuario registrado', time: 'Hace 2m' },
                  { icon: 'article', text: 'Nuevo post publicado', time: 'Hace 5m' },
                  { icon: 'campaign', text: 'Campaña iniciada', time: 'Hace 15m' },
                  { icon: 'groups', text: 'Comunidad alcanzó 500', time: 'Hace 1h' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <span className="material-symbols-outlined text-blue-400 text-sm">{item.icon}</span>
                    <span className="text-xs text-gray-400 flex-1">{item.text}</span>
                    <span className="text-[10px] text-gray-600">{item.time}</span>
                  </div>
                ))}
              </SectionCard>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 bg-[#1a1c20] rounded-lg border border-white/5 px-3 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500 text-lg">search</span>
                <input 
                  type="text" 
                  placeholder="Buscar usuario..." 
                  className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <button className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/30 hover:bg-blue-500/30">
                + Nuevo
              </button>
            </div>
            
            {filteredProfiles.length > 0 && (
              <div className="flex items-center justify-between bg-[#1a1c20] rounded-lg border border-white/5 px-4 py-2">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="rounded bg-gray-700 border-gray-600 w-4 h-4"
                    />
                    <span className="text-xs text-gray-400">Seleccionar todos</span>
                  </label>
                  <span className="text-xs text-gray-500">|</span>
                  <span className="text-xs text-gray-400">{selectedUsers.size} seleccionados</span>
                </div>
                {selectedUsers.size > 0 && (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleBatchBan}
                      disabled={batchActionLoading}
                      className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50"
                    >
                      Banear ({selectedUsers.size})
                    </button>
                    <button 
                      onClick={handleBatchDelete}
                      disabled={batchActionLoading}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50"
                    >
                      Eliminar ({selectedUsers.size})
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <SectionCard title={`${filteredProfiles.length} Usuarios`} icon="group">
              {filteredProfiles.length > 0 ? (
                <>
                  <div className="flex items-center gap-3 py-2 border-b border-white/5 text-xs text-gray-500">
                    <div className="w-6"></div>
                    <div className="flex-1">Usuario</div>
                    <div className="w-32">Rol / Estado</div>
                    <div className="w-28">Acciones</div>
                  </div>
                  {paginatedProfiles.map((user: ProfileData) => (
                    <div key={user._id} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.has(user.userId)}
                        onChange={() => toggleUserSelection(user.userId)}
                        className="rounded bg-gray-700 border-gray-600 w-4 h-4"
                      />
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                          {user.avatar || user.usuario?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-white">@{user.usuario}</div>
                          <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-32">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                          user.role === 5 || user.role === 6 ? 'bg-purple-500/20 text-purple-400' :
                          user.role === 4 ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>{['Free', 'Pro', 'Elite', 'Creator', 'Moderator', 'Admin', 'SuperAdmin'][user.role] || 'User'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                          user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                          user.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>{user.status === 'active' ? 'Activo' : user.status === 'pending' ? 'Pendiente' : 'Baneado'}</span>
                      </div>
                      <div className="flex items-center gap-1 w-28">
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="p-1 hover:bg-white/10 rounded"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-gray-500 text-sm">edit</span>
                        </button>
                        <button 
                          onClick={() => handleToggleBan(user.userId, user.status || 'active')}
                          className="p-1 hover:bg-white/10 rounded"
                          title={user.status === 'banned' ? 'Desbanear' : 'Banear'}
                        >
                          <span className={`material-symbols-outlined text-sm ${user.status === 'banned' ? 'text-emerald-500' : 'text-red-400'}`}>
                            {user.status === 'banned' ? 'lock_open' : 'block'}
                          </span>
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(user.userId)}
                          className="p-1 hover:bg-white/10 rounded"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-gray-500 text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {userSearch ? 'No se encontraron usuarios' : 'No hay usuarios'}
                </div>
              )}
            </SectionCard>

            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-[#1a1c20] rounded-lg border border-white/5 px-4 py-3">
                <span className="text-xs text-gray-400">
                  Página {currentPage} de {totalPages} ({filteredProfiles.length} usuarios)
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-gray-700/30 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-gray-700/30 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
            
            {editingUser && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-[#1a1c20] rounded-xl p-6 w-full max-w-md border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Editar Usuario</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-400">Usuario</label>
                      <input 
                        type="text" 
                        value={editingUser.usuario || ''} 
                        disabled
                        className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-sm text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">XP</label>
                      <input 
                        type="number" 
                        value={editingUser.xp || 0} 
                        onChange={(e) => setEditingUser({...editingUser, xp: parseInt(e.target.value) || 0})}
                        className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Level</label>
                      <input 
                        type="number" 
                        value={editingUser.level || 0} 
                        onChange={(e) => setEditingUser({...editingUser, level: parseInt(e.target.value) || 0})}
                        className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Reputación</label>
                      <input 
                        type="number" 
                        value={editingUser.reputation || 0} 
                        onChange={(e) => setEditingUser({...editingUser, reputation: parseInt(e.target.value) || 0})}
                        className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => setEditingUser(null)}
                      className="flex-1 bg-gray-700/30 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleUpdateUser}
                      className="flex-1 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/30"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showCommunityModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-[#1a1c20] rounded-xl p-6 w-full max-w-md border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Crear Nueva Comunidad</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-400">Nombre</label>
                      <input 
                        type="text" 
                        placeholder="Nombre de la comunidad"
                        value={newCommunity.name}
                        onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                        className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Descripción</label>
                      <textarea 
                        placeholder="Descripción de la comunidad"
                        value={newCommunity.description}
                        onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                        className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-sm text-white h-24 resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="isPrivate"
                        checked={newCommunity.isPrivate}
                        onChange={(e) => setNewCommunity({...newCommunity, isPrivate: e.target.checked})}
                        className="rounded bg-gray-800 border-gray-600"
                      />
                      <label htmlFor="isPrivate" className="text-sm text-gray-300">Comunidad privada</label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => setShowCommunityModal(false)}
                      className="flex-1 bg-gray-700/30 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleCreateCommunity}
                      className="flex-1 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/30"
                    >
                      Crear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {editingCommunity && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-[#1a1c20] rounded-xl p-6 w-full max-w-sm border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Editar Comunidad</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
                      <input 
                        type="text"
                        value={editingCommunity.name}
                        onChange={(e) => setEditingCommunity({...editingCommunity, name: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Descripción</label>
                      <textarea 
                        value={editingCommunity.description}
                        onChange={(e) => setEditingCommunity({...editingCommunity, description: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white h-20"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Visibilidad</label>
                      <select 
                        value={editingCommunity.visibility}
                        onChange={(e) => setEditingCommunity({...editingCommunity, visibility: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
                      >
                        <option value="public">Pública</option>
                        <option value="unlisted">No listada</option>
                        <option value="private">Privada</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <input 
                        type="checkbox"
                        id="isPortalExclusive"
                        checked={editingCommunity.isPortalExclusive || false}
                        onChange={(e) => setEditingCommunity({...editingCommunity, isPortalExclusive: e.target.checked})}
                        className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-500"
                      />
                      <label htmlFor="isPortalExclusive" className="text-sm text-purple-300">
                        Excluir del feed global del Portal
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => setEditingCommunity(null)}
                      className="flex-1 bg-gray-700/30 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleUpdateCommunity}
                      className="flex-1 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/30"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-[#1a1c20] rounded-xl p-6 w-full max-w-sm border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-2">Confirmar Eliminación</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    {deleteType === 'community' 
                      ? '¿Estás seguro de que quieres eliminar esta comunidad? Esta acción no se puede deshacer.'
                      : '¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.'
                    }
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setShowDeleteConfirm(null); setDeleteType('user'); }}
                      className="flex-1 bg-gray-700/30 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => {
                        if (deleteType === 'community') {
                          handleDeleteCommunity(showDeleteConfirm);
                        } else {
                          handleDeleteUser(showDeleteConfirm);
                        }
                        setDeleteType('user');
                      }}
                      className="flex-1 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium border border-red-500/30"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'communities':
        return (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 bg-[#1a1c20] rounded-lg border border-white/5 px-3 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500 text-lg">search</span>
                <input 
                  type="text" 
                  placeholder="Buscar comunidad..." 
                  className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowCommunityModal(true)}
                className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/30 hover:bg-blue-500/30"
              >
                + Nueva
              </button>
            </div>
            <SectionCard title={`${filteredCommunities.length} Comunidades`} icon="groups">
              {filteredCommunities.length > 0 ? (
                filteredCommunities.map((c) => (
                  <div key={c._id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <div>
                      <div className="text-sm text-white">{c.name}</div>
                      <div className="text-[10px] text-gray-500">@{c.slug}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                        c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>{c.status === 'active' ? 'Activa' : 'Inactiva'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium bg-gray-500/20 text-gray-400`}>
                        {c.visibility}
                      </span>
                      <button 
                        onClick={() => window.open(`/comunidad/${c.slug}`, '_blank')}
                        className="p-1 hover:bg-white/10 rounded" 
                        title="Ver"
                      >
                        <span className="material-symbols-outlined text-gray-500 text-sm">visibility</span>
                      </button>
                      <button 
                        onClick={() => setEditingCommunity({ id: c._id, name: c.name, description: c.description || '', visibility: c.visibility || 'public', isPortalExclusive: c.isPortalExclusive })}
                        className="p-1 hover:bg-white/10 rounded" 
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-gray-500 text-sm">edit</span>
                      </button>
                      <button 
                        onClick={() => { setDeleteType('community'); setShowDeleteConfirm(c._id); }}
                        className="p-1 hover:bg-white/10 rounded" 
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-gray-500 text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {communitySearch ? 'No se encontraron comunidades' : 'No hay comunidades'}
                </div>
              )}
            </SectionCard>
          </div>
        );

      case 'posts':
        return (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 bg-[#1a1c20] rounded-lg border border-white/5 px-3 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500 text-lg">search</span>
                <input 
                  type="text" 
                  placeholder="Buscar contenido..." 
                  className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPostFilter('all')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${postFilter === 'all' ? 'bg-gray-500/50 text-white' : 'bg-gray-500/20 text-gray-400'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setPostFilter('active')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${postFilter === 'active' ? 'bg-emerald-500/50 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}
                >
                  Publicados
                </button>
                <button 
                  onClick={() => setPostFilter('pending')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${postFilter === 'pending' ? 'bg-amber-500/50 text-white' : 'bg-amber-500/20 text-amber-400'}`}
                >
                  Pendientes
                </button>
              </div>
            </div>
            <SectionCard title={`${filteredPosts.length} Contenidos`} icon="article">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post: any) => (
                  <div key={post._id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{post.titulo || 'Sin título'}</div>
                      <div className="text-[10px] text-gray-500">{post.autor?.username || '@user'} · {post.fecha || 'Reciente'}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-gray-500/20 text-gray-400">{post.tipo || 'Post'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                        post.estado === 'published' ? 'bg-emerald-500/20 text-emerald-400' :
                        post.estado === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>{post.estado === 'published' ? 'Publicado' : post.estado === 'pending' ? 'Pendiente' : 'Borrador'}</span>
                      <button 
                        onClick={() => setShowDeleteConfirm(post._id)}
                        className="p-1 hover:bg-white/10 rounded" 
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-gray-500 text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {postSearch || postFilter !== 'all' ? 'No se encontraron contenidos' : 'No hay contenidos'}
                </div>
              )}
            </SectionCard>
          </div>
        );

      case 'ads':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatsCard label="Clicks Totales" value={totalClicks.toLocaleString()} icon="touch_app" color="blue" />
              <StatsCard label="Impresiones" value={totalImpressions.toLocaleString()} icon="visibility" color="purple" />
              <StatsCard label="Campañas Activas" value={activeAds.length} icon="campaign" color="green" />
            </div>
            <SectionCard title={`${adsList.length} Campañas`} icon="campaign" actions={<button className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-xs font-medium">+ Nueva</button>}>
              {adsList.length > 0 ? (
                adsList.map((ad: any) => (
                  <div key={ad._id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <div className="text-sm text-white">{ad.titulo || 'Anuncio'}</div>
                      <div className="text-[10px] text-gray-500">{ad.sector || 'General'} · {(ad.clicks || 0).toLocaleString()} clicks</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                      ad.activo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>{ad.activo ? 'Activa' : 'Inactiva'}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No hay campañas</div>
              )}
            </SectionCard>
          </div>
        );

      case 'propFirms':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatsCard label="Prop Firms" value={propFirmsList.length} icon="account_balance" color="blue" />
              <StatsCard label="Activos" value={activePropFirms.length} icon="check_circle" color="green" />
              <StatsCard label="Inactivos" value={propFirmsList.length - activePropFirms.length} icon="cancel" color="orange" />
              <StatsCard label="Total" value={propFirmsList.length} icon="business" color="purple" />
            </div>
            <SectionCard title={`${propFirmsList.length} Prop Firms`} icon="business">
              {propFirmsList.length > 0 ? (
                propFirmsList.map((firm: any) => (
                  <div key={firm._id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      {firm.logoUrl && <img src={firm.logoUrl} alt={firm.name} className="w-8 h-8 rounded object-cover" />}
                      <div>
                        <div className="text-sm text-white">{firm.name}</div>
                        <div className="text-[10px] text-gray-500">{firm.description?.slice(0, 50)}...</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                      firm.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>{firm.isActive ? 'Activo' : 'Inactivo'}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No hay prop firms</div>
              )}
            </SectionCard>
          </div>
        );

      case 'referrals':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatsCard label="Referidos" value={allReferrals.length} icon="group_add" color="blue" subtitle="Total" />
              <StatsCard label="Completados" value={allReferrals.filter((r:any) => r.status === 'completed').length} icon="check_circle" color="green" />
              <StatsCard label="Pendientes" value={allReferrals.filter((r:any) => r.status === 'pending').length} icon="pending" color="orange" />
              <StatsCard label="Comisiones" value={`$${allReferrals.reduce((sum:number, r:any) => sum + (r.referrerReward || 0), 0)}`} icon="payments" color="purple" subtitle="Total XP/Saldo" />
            </div>
            <SectionCard title="Gestión de Referidos" icon="group_add">
              {allReferrals.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 pb-2 border-b border-white/5">
                    <span>Referente</span>
                    <span>Referido</span>
                    <span>Estado</span>
                    <span className="text-right">Acción</span>
                  </div>
                  {allReferrals.map((r: any) => (
                    <div key={r._id} className="grid grid-cols-4 items-center gap-4 py-2 px-2 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">@{r.referrerProfile?.usuario?.charAt(0)}</div>
                        <span className="text-white">@{r.referrerProfile?.usuario || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px]">@{r.referredProfile?.usuario?.charAt(0)}</div>
                        <span className="text-white">@{r.referredProfile?.usuario || 'N/A'}</span>
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          r.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 
                          r.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {r.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        {r.status === 'pending' && (
                          <button 
                            onClick={() => completeReferralMutation({ referralId: r._id })}
                            className="text-emerald-400 hover:text-emerald-300 font-bold"
                            title="Marcar como completado"
                          >
                            <span className="material-symbols-outlined text-sm">verified_user</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 italic">No hay registros de referidos</div>
              )}
            </SectionCard>
          </div>
        );

      case 'aiAgent':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatsCard label="Posts IA" value={pendingAiPosts?.length || 0} icon="auto_awesome" color="purple" subtitle="Pendientes" />
              <StatsCard label="Estado IA" value={aiConfig?.enabled ? "ACTIVO" : "INACTIVO"} icon="smart_toy" color={aiConfig?.enabled ? "green" : "red"} subtitle="Sistema" />
              <StatsCard label="Schedules" value={aiConfig?.schedules?.filter((s:any) => s.enabled).length || 0} icon="schedule" color="blue" subtitle="Activos" />
              <StatsCard label="Reputación" value="98%" icon="verified" color="green" subtitle="Precisión" />
            </div>
            
            <SectionCard 
              title="AI Agent Control Central" 
              icon="smart_toy"
              actions={
                <button 
                  onClick={() => toggleAiStatusMutation({ enabled: !aiConfig?.enabled })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    aiConfig?.enabled 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {aiConfig?.enabled ? 'DESACTIVAR AGENTE' : 'ACTIVAR AGENTE'}
                </button>
              }
            >
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Posts Pendientes de Aprobación</h4>
                {pendingAiPosts && pendingAiPosts.length > 0 ? (
                  pendingAiPosts.map((post: any) => (
                    <div key={post._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 group hover:border-white/10 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{post.titulo}</div>
                        <div className="text-[10px] text-gray-500">{post.categoria} · Programado: {new Date(post.programedAt).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => approveAiPostMutation({ id: post._id })}
                          className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                          title="Aprobar y Publicar"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                        <button 
                          onClick={() => rejectAiPostMutation({ id: post._id })}
                          className="p-1.5 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all"
                          title="Rechazar"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 text-sm italic">No hay posts pendientes de la IA</div>
                )}
              </div>
            </SectionCard>
          </div>
        );
        case 'marketing':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatsCard label="Ads Activas" value={(ads as any[]).filter(a => a.activo).length} icon="campaign" color="blue" />
              <StatsCard label="Sectores" value={new Set((ads as any[]).map(a => a.sector)).size} icon="grid_view" color="purple" />
              <StatsCard label="Enlace Clics" value="2.4k" icon="ads_click" color="green" />
              <StatsCard label="Impresiones" value="12.8k" icon="visibility" color="orange" />
            </div>
            <SectionCard title="Gestión de Anuncios / Banners" icon="campaign">
              {ads.length > 0 ? (
                <div className="space-y-3">
                  {ads.map((ad: any) => (
                    <div key={ad._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 group hover:border-white/10 transition-all">
                      <div className="w-16 h-10 bg-gray-800 rounded border border-white/10 overflow-hidden shrink-0">
                        {ad.imagenUrl ? (
                          <img src={ad.imagenUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full"><span className="material-symbols-outlined text-xs text-gray-600">image</span></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{ad.titulo}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{ad.sector} · {ad.activo ? 'ACTIVO' : 'INACTIVO'}</div>
                      </div>
                      <div className="flex items-center gap-1">
                         <button 
                          onClick={() => deleteAdMutation({ id: ad._id })}
                          className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-all"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 italic">No hay anuncios configurados</div>
              )}
            </SectionCard>
          </div>
        );

      case 'moderation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatsCard label="Reports" value={spamReports?.length || 0} icon="flag" color="orange" subtitle="Pendientes" />
              <StatsCard label="Posts Totales" value={stats?.totalPosts || 0} icon="article" color="blue" />
              <StatsCard label="Usuarios" value={stats?.totalUsers || 0} icon="group" color="green" />
              <StatsCard label="Seguridad" value="Protegido" icon="security" color="green" />
            </div>
            <SectionCard title="Reportes de Spam (Pendientes)" icon="gavel">
              {spamReports && spamReports.length > 0 ? (
                <div className="space-y-3">
                  {spamReports.map((report: any) => (
                    <div key={report._id} className="flex flex-col p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[9px] font-bold uppercase">{report.reason}</span>
                          <span className="text-[10px] text-gray-500">Reportado por @{report.userProfile?.usuario}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => moderateContentMutation({ contentId: report.contentId, contentType: report.contentType, action: 'dismiss', moderatorId: currentUser?.userId || '' })}
                            className="text-[10px] text-gray-400 hover:text-white"
                          >DESCARTAR</button>
                          <button 
                            onClick={() => moderateContentMutation({ contentId: report.contentId, contentType: report.contentType, action: 'delete', moderatorId: currentUser?.userId || '' })}
                            className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                          >ELIMINAR</button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 italic">"{report.content}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 italic">No hay reportes de moderación pendientes</div>
              )}
            </SectionCard>
          </div>
        );

      case 'bitacora':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatsCard label="Traders Sol." value={verifications.length} icon="person" color="blue" subtitle="Total" />
              <StatsCard label="Pendientes" value={verifications.filter((v:any) => v.kycStatus === 'pending').length} icon="pending" color="orange" />
              <StatsCard label="Verificados" value={verifications.filter((v:any) => v.kycStatus === 'approved').length} icon="verified" color="green" />
              <StatsCard label="Revisión" value={verifications.filter((v:any) => v.kycStatus === 'reviewing').length} icon="hourglass_empty" color="purple" />
            </div>
            <SectionCard title="Bitácora: Verificaciones KYC & Trading" icon="verified">
              {verifications.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 pb-2 border-b border-white/5">
                    <span>Usuario ID</span>
                    <span>Nivel</span>
                    <span>Estado KYC</span>
                    <span>Trading</span>
                    <span className="text-right">Acciones</span>
                  </div>
                  {verifications.map((v: any) => (
                    <div key={v._id} className="grid grid-cols-5 items-center gap-4 py-2 px-2 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0 text-xs text-white">
                      <span className="truncate">@{v.oderId.split('|')[0] || v.oderId}</span>
                      <span className="capitalize">{v.level}</span>
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          v.kycStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 
                          v.kycStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {v.kycStatus?.toUpperCase() || 'NONE'}
                        </span>
                      </div>
                      <span className={v.tradingVerified ? "text-emerald-400" : "text-gray-500"}>
                        {v.tradingVerified ? "VERIFICADO" : "PENDIENTE"}
                      </span>
                      <div className="text-right flex items-center justify-end gap-1">
                        <button 
                          onClick={() => updateVerificationStatusMutation({ oderId: v.oderId, kycStatus: 'approved', tradingVerified: true })}
                          className="p-1 hover:bg-white/10 rounded text-emerald-400"
                          title="Aprobar Todo"
                        >
                          <span className="material-symbols-outlined text-sm">how_to_reg</span>
                        </button>
                        <button 
                          onClick={() => updateVerificationStatusMutation({ oderId: v.oderId, kycStatus: 'rejected' })}
                          className="p-1 hover:bg-white/10 rounded text-red-500"
                          title="Rechazar"
                        >
                          <span className="material-symbols-outlined text-sm">cancel</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 italic">No hay solicitudes de verificación activas</div>
              )}
            </SectionCard>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatsCard label="Total" value={waStats?.total || 0} icon="send" color="blue" />
              <StatsCard label="Enviados" value={waStats?.sent || 0} icon="check_circle" color="green" />
              <StatsCard label="Fallidos" value={waStats?.failed || 0} icon="error" color="red" />
              <StatsCard label="Cola" value={waStats?.pending || 0} icon="schedule" color="orange" />
            </div>
            <SectionCard title="Historial de Notificaciones WhatsApp" icon="chat">
              {waNotifications && waNotifications.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 pb-2 border-b border-white/5">
                    <span>Usuario</span>
                    <span>Tipo</span>
                    <span>Destino</span>
                    <span>Estado</span>
                    <span className="text-right">Acción</span>
                  </div>
                  {waNotifications.map((n: any) => (
                    <div key={n._id} className="grid grid-cols-5 items-center gap-4 py-2 px-2 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0 text-xs">
                      <span className="text-white truncate">@{n.userName}</span>
                      <span className="text-gray-400 capitalize">{n.type}</span>
                      <span className="text-gray-400">{n.phoneNumber || 'N/A'}</span>
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          n.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' : 
                          n.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {n.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        {n.status === 'failed' && (
                          <button 
                            onClick={() => retryWaNotificationMutation({ id: n._id, moderatorId: currentUser?.userId || '' })}
                            className="text-emerald-400 hover:text-emerald-300 font-bold"
                            title="Reintentar envio"
                          >
                            <span className="material-symbols-outlined text-sm">refresh</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 italic">No hay historial de notificaciones</div>
              )}
            </SectionCard>
          </div>
        );
      case 'config':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: 'apps', label: 'Apps', desc: 'Aplicaciones' },
              { icon: 'backup', label: 'Backup', desc: 'Respaldo' },
              { icon: 'download', label: 'Export', desc: 'Exportar' },
              { icon: 'language', label: 'Idiomas', desc: 'i18n' },
              { icon: 'palette', label: 'Apariencia', desc: 'Tema' },
              { icon: 'security', label: 'Seguridad', desc: 'Auth' },
            ].map((item, i) => (
              <div key={i} className="bg-[#1a1c20] rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-blue-400">{item.icon}</span>
                </div>
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-[10px] text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        );

      case 'agentPrompts':
        return (
          <div className="max-w-6xl mx-auto">
            <AgentPromptGenerator usuario={currentUser as any} />
          </div>
        );

      default:
        return (
          <div className="bg-[#1a1c20] rounded-xl border border-white/5 p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-600">construction</span>
            <p className="text-gray-500 text-sm mt-2">Sección en desarrollo</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#0f1115] text-white">
      <main className="pb-6 px-2 max-w-[1800px] mx-auto">
        <nav className="flex flex-wrap gap-1 mb-4 pb-3 border-b border-white/5">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </nav>
        
        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </main>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default memo(AdminPanelDashboard);
