import React, { useState, useEffect, useCallback, useMemo, memo, Suspense, lazy, useRef } from 'react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Usuario, Ad, Publicacion } from '../types';
import { StorageService } from '../services/storage';
import { useToast } from '../components/ToastProvider';
import ElectricLoader from '../components/ElectricLoader';
import logger from '../utils/logger';

const ReferralPanel = lazy(() => import('../components/ReferralPanel'));
const ExportDataPanel = lazy(() => import('../components/ExportDataPanel'));
const AppearancePanel = lazy(() => import('../components/AppearancePanel'));
const LanguageSelector = lazy(() => import('../components/LanguageSelector'));
const AdminDashboard = lazy(() => import('../components/admin/AdminDashboard'));
const UserManagement = lazy(() => import('../components/admin/UserManagement'));
const AdManagement = lazy(() => import('../components/admin/AdManagement'));
const CommunityManagement = lazy(() => import('../components/admin/CommunityManagement'));
const ModerationPanel = lazy(() => import('../components/admin/ModerationPanel'));
const PropFirmManagement = lazy(() => import('../components/admin/PropFirmManagement'));
const PostManagement = lazy(() => import('../components/admin/PostManagement'));
const AIAgentSection = lazy(() => import('../components/admin/AIAgentSection'));
const SettingsPanel = lazy(() => import('../components/admin/SettingsPanel'));
const BackupPanel = lazy(() => import('../components/admin/BackupPanel'));
const InstagramMarketingView = lazy(() => import('./InstagramMarketingView'));
const ProductManagement = lazy(() => import('../components/admin/ProductManagement'));
const SignalManagement = lazy(() => import('../components/admin/SignalManagement'));
const AuroraSupportSection = lazy(() => import('../components/admin/AuroraSupportSection'));
const AppManagement = lazy(() => import('../components/admin/AppManagement'));
const GamingStatsPanel = lazy(() => import('../components/admin/GamingStatsPanel'));

const SectionSkeleton = memo(() => (
    <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded-lg w-48" />
        <div className="h-4 bg-white/5 rounded w-32" />
        <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded-xl" />
            ))}
        </div>
        <div className="h-64 bg-white/5 rounded-xl" />
    </div>
));

const SectionWrapper = memo(({ children, title, icon }: { children: React.ReactNode; title: string; icon: string }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-400">{icon}</span>
            <h2 className="text-xl font-bold">{title}</h2>
        </div>
        {children}
    </div>
));

type AdminSection = 'dashboard' | 'users' | 'ads' | 'communities' | 'propFirms' | 'posts' | 'products' | 'signals' | 'aiAgent' | 'auroraSupport' | 'marketing' | 'moderation' | 'referrals' | 'export' | 'config' | 'backup' | 'apps';

interface BreadcrumbItem {
  label: string;
  section?: AdminSection;
}

interface Schedule {
  period: 'morning' | 'afternoon' | 'evening';
  hours: number[];
  enabled: boolean;
}

interface AIAgentConfig {
  enabled: boolean;
  schedules: Schedule[];
}

interface PendingPost {
  _id: any;
  titulo: string;
  contenido: string;
  fuente: string;
  categoria: string;
  par?: string;
  imagenUrl?: string;
  sentiment?: string;
  programedAt: number;
  createdAt: number;
  status: string;
}

interface SystemNotification {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  message: string;
  time: string;
}

interface AuroraFindingPreview {
  id: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'reviewed' | 'resolved';
  summary: string;
  surfaceLabel: string;
  createdAt: string;
}

const AdminView: React.FC<{ onVisitProfile?: (id: string) => void; usuario?: Usuario | null }> = ({ onVisitProfile, usuario }) => {
    const { showToast } = useToast();
    const AURORA_FINDINGS_KEY = 'aurora_support_findings_v1';
    const convexAds = useQuery(api.ads.getAds);
    const saveAdMutation = useMutation(api.ads.saveAd);
    const deleteAdMutation = useMutation(api.ads.deleteAd);
    const stats = useQuery(api.stats.getStats);
    const seedMutation = useMutation(api.posts.seedCommunitiesAndAds);
    const seedPostsMutation = useMutation(api.posts.seedCommunityPosts);
    const convexCommunities = useQuery(api.communities.listPublicCommunities, { limit: 100 });

    const pendingPosts = useQuery(api.aiAgent.getPendingPosts);
    const publishedPosts = useQuery(api.aiAgent.getPublishedPosts);
    const agentConfig = useQuery(api.aiAgent.getAIAgentConfig);

    const toggleAgentMutation = useMutation(api.aiAgent.toggleAgentStatus);
    const updateSchedulesMutation = useMutation(api.aiAgent.updateSchedules);
    const generateNewsAction = useAction(api.aiAgent.generateNewsPosts);
    const approvePostMutation = useMutation(api.aiAgent.approvePendingPost);
    const rejectPostMutation = useMutation(api.aiAgent.rejectPendingPost);
    const deletePendingMutation = useMutation(api.aiAgent.deletePendingPost);
    const rescheduleMutation = useMutation(api.aiAgent.reschedulePost);
    const updatePendingMutation = useMutation(api.aiAgent.updatePendingPost);
    
    const deletePostMutation = useMutation(api.posts.deletePost);
    const restorePostMutation = useMutation(api.posts.restorePost);
    const updatePostMutation = useMutation(api.posts.updatePost);

    const removeCommunityMemberMutation = useMutation(api.communities.removeCommunityMember);

    const exportBackupMutation = useMutation(api.backup.exportSystemBackup);
    const systemBackups = useQuery(api.backup.getSystemBackups, { limit: 10 });
    const importBackupMutation = useMutation(api.backup.importSystemBackup);
    const resendEmailMutation = useMutation(api.profiles.resendConfirmationEmail);

    const spamReports = useQuery(api.moderation.getSpamReports, { status: undefined });
    const moderationStats = useQuery(api.moderation.getAutoModerationStats);
    const moderationLogs = useQuery(api.moderation.getModerationLogs, { limit: 50 });
    const moderateContentMutation = useMutation(api.moderation.moderateContent);
    const bulkModerateMutation = useMutation(api.moderation.bulkModerate);
    const banUserMutation = useMutation(api.profiles.banUser);

    const [users, setUsers] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ label: 'Panel' }]);
    const [ads, setAds] = useState<Ad[]>([]);
    const [posts, setPosts] = useState<Publicacion[]>([]);
    const [seeding, setSeeding] = useState(false);
    const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([]);
    const [auroraFindings, setAuroraFindings] = useState<AuroraFindingPreview[]>([]);

    useEffect(() => {
        fetchUsers();
        fetchPosts();
        generateNotifications();
        if (convexAds) {
            setAds(convexAds.map((ad: any) => ({ ...ad, id: ad._id })));
        }
    }, [convexAds]);

    useEffect(() => {
        const readAuroraFindings = () => {
            try {
                const raw = window.localStorage.getItem(AURORA_FINDINGS_KEY);
                if (!raw) {
                    setAuroraFindings([]);
                    return;
                }
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    setAuroraFindings(parsed);
                }
            } catch (error) {
                logger.error('Failed to read Aurora findings from localStorage:', error);
            }
        };

        readAuroraFindings();
        window.addEventListener('storage', readAuroraFindings);
        const interval = window.setInterval(readAuroraFindings, 4000);

        return () => {
            window.removeEventListener('storage', readAuroraFindings);
            window.clearInterval(interval);
        };
    }, []);

    const fetchUsers = async () => {
        const data = await StorageService.getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    const fetchPosts = async () => {
        const data = await StorageService.getPosts();
        setPosts(data);
    };

    const generateNotifications = () => {
        const notifications: SystemNotification[] = [];
        const now = new Date();

        if (pendingPosts && pendingPosts.length > 3) {
            notifications.push({
                id: '1',
                type: 'warning',
                message: `${pendingPosts.length} posts pendientes de revisión`,
                time: now.toISOString(),
            });
        }
        if (ads.filter(a => !a.activo).length > 0) {
            notifications.push({
                id: '2',
                type: 'info',
                message: `${ads.filter(a => !a.activo).length} publicidades inactivas`,
                time: now.toISOString(),
            });
        }
        notifications.push({
            id: '3',
            type: 'success',
            message: 'Sistema operativo correctamente',
            time: now.toISOString(),
        });

        const newUsersToday = users.filter(u => {
            if (!u.fechaRegistro) return false;
            return new Date(u.fechaRegistro).toDateString() === now.toDateString();
        }).length;

        if (newUsersToday > 0) {
            notifications.push({
                id: '4',
                type: 'success',
                message: `${newUsersToday} nuevos usuarios hoy`,
                time: now.toISOString(),
            });
        }

        const auroraPending = auroraFindings.filter((item) => item.status === 'pending');
        const auroraHigh = auroraPending.filter((item) => item.priority === 'high');

        if (auroraHigh.length > 0) {
            notifications.unshift({
                id: 'aurora-high',
                type: 'error',
                message: `Aurora detectó ${auroraHigh.length} hallazgo(s) críticos pendientes`,
                time: now.toISOString(),
            });
        } else if (auroraPending.length > 0) {
            notifications.unshift({
                id: 'aurora-pending',
                type: 'warning',
                message: `Aurora dejó ${auroraPending.length} hallazgo(s) pendientes de revisión`,
                time: now.toISOString(),
            });
        }

        setSystemNotifications(notifications);
    };

    useEffect(() => {
        generateNotifications();
    }, [auroraFindings.length]);

    const navigateTo = useCallback((section: AdminSection, label: string) => {
        setActiveSection(section);
        setBreadcrumbs([{ label: 'Panel' }, { label, section }]);
    }, []);

    const handleSeedData = useCallback(async () => {
        try {
            await seedMutation({} as any);
            showToast('success', '¡Datos de ejemplo creados!');
        } catch {
            showToast('error', 'Error al crear datos de ejemplo');
        }
    }, [seedMutation, showToast]);

    const handleToggleAgent = useCallback(async (enabled: boolean) => {
        try {
            await toggleAgentMutation({ enabled });
            showToast('success', enabled ? 'Agente IA Activado' : 'Agente IA Pausado');
        } catch {
            showToast('error', 'Error al cambiar estado del agente');
        }
    }, [toggleAgentMutation, showToast]);

    const handleGenerateNews = useCallback(async () => {
        try {
            showToast('info', 'Generando posts...');
            const result = await generateNewsAction({});
            showToast('success', `¡${result?.createdCount || 0} posts generados!`);
        } catch {
            showToast('error', 'Error al generar posts');
        }
    }, [generateNewsAction, showToast]);

    const handleApprovePost = useCallback(async (id: any) => {
        try {
            await approvePostMutation({ id });
            showToast('success', '¡Post publicado exitosamente!');
        } catch {
            showToast('error', 'Error al publicar post');
        }
    }, [approvePostMutation, showToast]);

    const handleRejectPost = useCallback(async (id: any) => {
        try {
            await rejectPostMutation({ id });
            showToast('success', 'Post rechazado');
        } catch {
            showToast('error', 'Error al rechazar post');
        }
    }, [rejectPostMutation, showToast]);

    const handleDeletePending = useCallback(async (id: any) => {
        if (!confirm('¿Eliminar este post pendiente?')) return;
        try {
            await deletePendingMutation({ id });
            showToast('success', 'Post eliminado');
        } catch {
            showToast('error', 'Error al eliminar post');
        }
    }, [deletePendingMutation, showToast]);

    const handleUpdatePost = useCallback(async (post: PendingPost) => {
        try {
            await updatePendingMutation({
                id: post._id,
                titulo: post.titulo,
                contenido: post.contenido,
                categoria: post.categoria,
            });
            showToast('success', 'Post actualizado');
        } catch {
            showToast('error', 'Error al actualizar post');
        }
    }, [updatePendingMutation, showToast]);

    const handleAdminUpdatePost = useCallback(async (postId: string, updates: { titulo?: string; contenido?: string; categoria?: string }) => {
        try {
            await updatePostMutation({
                id: postId as Id<'posts'>,
                titulo: updates.titulo,
                contenido: updates.contenido,
                categoria: updates.categoria,
            } as any);
            await fetchPosts();
            showToast('success', 'Post actualizado');
        } catch {
            showToast('error', 'Error al actualizar post');
        }
    }, [updatePostMutation, fetchPosts, showToast]);

    const handleReschedule = useCallback(async (post: PendingPost) => {
        try {
            await rescheduleMutation({
                id: post._id,
                newProgramedAt: post.programedAt,
            });
            showToast('success', 'Post reprogramado');
        } catch {
            showToast('error', 'Error al reprogramar post');
        }
    }, [rescheduleMutation, showToast]);

    const handleDeletePost = useCallback(async (postId: string) => {
        if (!confirm('¿Eliminar este post? Irá a la papelera.')) return;
        try {
            await deletePostMutation({ id: postId as Id<'posts'>, adminId: 'admin' } as any);
            await fetchPosts();
            showToast('success', 'Post eliminado');
        } catch {
            showToast('error', 'Error al eliminar post');
        }
    }, [deletePostMutation, fetchPosts, showToast]);

    const handleRestorePost = useCallback(async (postId: string) => {
        try {
            await restorePostMutation({ id: postId as Id<'posts'>, adminId: 'admin' } as any);
            await fetchPosts();
            showToast('success', 'Post restaurado');
        } catch {
            showToast('error', 'Error al restaurar post');
        }
    }, [restorePostMutation, fetchPosts, showToast]);

    const handleModerateContent = useCallback(async (contentId: string, contentType: 'post' | 'comment', action: 'approve' | 'reject' | 'delete' | 'dismiss') => {
        try {
            await moderateContentMutation({
                contentId,
                contentType,
                action,
                moderatorId: 'admin',
                notes: '',
            });
            showToast('success', action === 'approve' ? 'Contenido aprobado' : action === 'delete' ? 'Contenido eliminado' : action === 'reject' ? 'Contenido rechazado' : 'Reporte descartado');
        } catch {
            showToast('error', 'Error al moderar contenido');
        }
    }, [moderateContentMutation, showToast]);

    const handleBulkModerate = useCallback(async (contentIds: string[], contentType: 'post' | 'comment', action: 'approve' | 'reject' | 'delete' | 'dismiss') => {
        try {
            const result = await bulkModerateMutation({
                contentIds,
                contentType,
                action,
                moderatorId: 'admin',
                notes: 'Bulk action',
            });
            showToast('success', `${result?.processed || contentIds.length} elementos moderados`);
        } catch {
            showToast('error', 'Error en moderación masiva');
        }
    }, [bulkModerateMutation, showToast]);

    const handleRemoveCommunityMember = useCallback(async (communityId: string, userId: string) => {
        if (!confirm('¿Expulsar a este miembro de la comunidad?')) return;
        try {
            await removeCommunityMemberMutation({
                communityId: communityId as Id<'communities'>,
                userId,
                adminId: 'admin',
            } as any);
            showToast('success', 'Miembro expulsado');
        } catch {
            showToast('error', 'Error al expulsar miembro');
        }
    }, [removeCommunityMemberMutation, showToast]);

    const handleExportBackup = useCallback(async () => {
        try {
            showToast('info', 'Exportando backup...');
            const result = await exportBackupMutation({ adminId: 'admin' } as any);
            
            if (result?.data) {
                const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tradeportal_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
            
            showToast('success', 'Backup exportado exitosamente');
        } catch {
            showToast('error', 'Error al exportar backup');
        }
    }, [exportBackupMutation, showToast]);

    const handleResendEmail = useCallback(async (userId: string) => {
        try {
            await resendEmailMutation({ userId, adminId: 'admin' } as any);
            showToast('success', 'Email de confirmación reenviado');
        } catch {
            showToast('error', 'Error al reenviar email');
        }
    }, [resendEmailMutation, showToast]);

    const handleBanUser = useCallback(async (userId: string, reason: string) => {
        try {
            await banUserMutation({ userId, status: 'banned' });
            const userToBan = users.find(u => u.id === userId);
            if (userToBan) {
                const updated = { ...userToBan, isBlocked: true };
                await StorageService.updateUser(updated);
            }
            showToast('success', 'Usuario baneado');
        } catch {
            showToast('error', 'Error al banear usuario');
        }
    }, [banUserMutation, users, showToast]);

    const formatDateTime = useCallback((timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    const SIDEBAR_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', category: 'principal' },
        { id: 'users', label: 'Usuarios', icon: 'group', category: 'gestion' },
        { id: 'communities', label: 'Comunidades', icon: 'groups', category: 'gestion' },
        { id: 'posts', label: 'Publicaciones', icon: 'article', category: 'gestion' },
        { id: 'products', label: 'Marketplace', icon: 'shopping_cart', category: 'gestion' },
        { id: 'signals', label: 'Señales', icon: 'signal_cellular_alt', category: 'gestion' },
        { id: 'propFirms', label: 'Prop Firms', icon: 'account_balance', category: 'gestion' },
        { id: 'ads', label: 'Publicidad', icon: 'campaign', category: 'contenido' },
        { id: 'moderation', label: 'Moderación', icon: 'gavel', category: 'contenido', badge: spamReports?.filter((r: any) => r.status === 'pending').length },
        { id: 'marketing', label: 'Marketing IA', icon: 'campaign', category: 'contenido' },
        { id: 'aiAgent', label: 'AI Agent', icon: 'smart_toy', category: 'ai', badge: pendingPosts?.length },
        { id: 'auroraSupport', label: 'Aurora', icon: 'auto_awesome', category: 'ai', badge: auroraFindings.filter((f) => f.status === 'pending').length },
        { id: 'referrals', label: 'Referidos', icon: 'group_add', category: 'growth' },
        { id: 'export', label: 'Exportar', icon: 'download', category: 'sistema' },
        { id: 'config', label: 'Configuración', icon: 'settings', category: 'sistema' },
        { id: 'backup', label: 'Backup', icon: 'backup', category: 'sistema' },
        { id: 'apps', label: 'Apps & Juegos', icon: 'apps', category: 'apps' },
    ] as const;

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const fabRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node) && !fabRef.current?.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const categories = ['principal', 'gestion', 'contenido', 'ai', 'growth', 'sistema', 'apps'];
    const categoryLabels: Record<string, string> = {
        principal: 'Principal',
        gestion: 'Gestión',
        contenido: 'Contenido',
        ai: 'IA',
        growth: 'Growth',
        sistema: 'Sistema',
        apps: 'Apps',
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
            {/* FAB Flotante */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
                {/* Menú desplegable */}
                {menuOpen && (
                    <div 
                        ref={menuRef}
                        className="rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            background: 'rgba(15, 17, 21, 0.98)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(73, 68, 84, 0.3)',
                            minWidth: '220px',
                            animation: 'slideUp 0.2s ease-out',
                        }}
                    >
                        {categories.map((cat) => {
                            const catItems = SIDEBAR_ITEMS.filter((i) => i.category === cat);
                            if (catItems.length === 0) return null;
                            return (
                                <div key={cat}>
                                    <div 
                                        className="px-4 pt-3 pb-1 text-[9px] font-black uppercase tracking-widest"
                                        style={{ color: 'rgba(160, 120, 255, 0.7)' }}
                                    >
                                        {categoryLabels[cat]}
                                    </div>
                                    {catItems.map((item) => {
                                        const isActive = activeSection === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    navigateTo(item.id as AdminSection, item.label);
                                                    setMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-all"
                                                style={{
                                                    background: isActive ? 'rgba(160, 120, 255, 0.15)' : 'transparent',
                                                    color: isActive ? '#d0bcff' : '#86868B',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                                                }}
                                            >
                                                <span className="material-symbols-outlined text-base">{item.icon}</span>
                                                <span className="flex-1 text-left font-medium">{item.label}</span>
                                                {item.badge && item.badge > 0 && (
                                                    <span 
                                                        className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                                                        style={{ background: 'rgba(255, 23, 68, 0.9)', color: 'white' }}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                    <div className="h-px mx-4 my-1" style={{ background: 'rgba(73, 68, 84, 0.2)' }} />
                                </div>
                            );
                        })}
                        <div className="px-4 pb-2 pt-1">
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold"
                                style={{ color: 'rgba(134, 134, 139, 0.6)' }}
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}

                {/* FAB Button */}
                <button
                    ref={fabRef}
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
                    style={{
                        background: menuOpen 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
                        boxShadow: menuOpen 
                            ? '0 0 0 4px rgba(160, 120, 255, 0.2)' 
                            : '0 8px 32px rgba(160, 120, 255, 0.4)',
                    }}
                >
                    <span 
                        className="material-symbols-outlined text-white text-2xl transition-transform duration-300"
                        style={{ transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    >
                        {menuOpen ? 'close' : 'apps'}
                    </span>
                </button>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header 
                    className="h-16 flex items-center justify-between px-6"
                    style={{
                        background: 'rgba(15, 17, 21, 0.9)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(73, 68, 84, 0.15)',
                    }}
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigateTo('dashboard', 'Dashboard')}
                            className="material-symbols-outlined transition-colors"
                            style={{ color: '#86868B' }}
                        >
                            home
                        </button>
                        <span style={{ color: 'rgba(73, 68, 84, 0.5)' }}>/</span>
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                <span 
                                    className="text-sm cursor-pointer"
                                    style={{ 
                                        color: crumb.section ? '#86868B' : '#e5e2e1',
                                        fontWeight: crumb.section ? 400 : 700,
                                    }}
                                    onClick={() => crumb.section && navigateTo(crumb.section, crumb.label)}
                                >
                                    {crumb.label}
                                </span>
                                {index < breadcrumbs.length - 1 && (
                                    <span style={{ color: 'rgba(73, 68, 84, 0.5)' }}>/</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#86868B' }}>
                            <span 
                                className="w-2 h-2 rounded-full"
                                style={{ background: '#00e676' }}
                            />
                            Online
                        </div>
                        <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(160, 120, 255, 0.2)' }}
                        >
                            <span className="material-symbols-outlined" style={{ color: '#d0bcff' }}>notifications</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeSection === 'dashboard' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <AdminDashboard
                                stats={stats}
                                users={users}
                                posts={posts}
                                ads={ads}
                                notifications={systemNotifications}
                                pendingPostsCount={pendingPosts?.length || 0}
                                onNavigate={navigateTo}
                            />
                        </Suspense>
                    )}

                    {activeSection === 'users' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <UserManagement
                                users={users}
                                loading={loading}
                                onVisitProfile={onVisitProfile}
                                onRefresh={fetchUsers}
                                showToast={showToast}
                                onResendEmail={handleResendEmail}
                            />
                        </Suspense>
                    )}

                    {activeSection === 'ads' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <AdManagement
                                ads={ads}
                                onSave={async (data) => {
                                    try {
                                        await saveAdMutation({ ...data } as any);
                                        showToast('success', 'Publicidad guardada');
                                    } catch {
                                        showToast('error', 'Error al guardar publicidad');
                                    }
                                }}
                                onDelete={async (id) => {
                                    try {
                                        await deleteAdMutation({ id } as any);
                                        showToast('success', 'Publicidad eliminada');
                                    } catch {
                                        showToast('error', 'Error al eliminar');
                                    }
                                }}
                                onCreateNew={() => {}}
                                onEdit={(ad) => {}}
                                onSeed={handleSeedData}
                            />
                        </Suspense>
                    )}

                    {activeSection === 'communities' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <CommunityManagement
                                communities={convexCommunities}
                                seeding={seeding}
                                onSeed={async () => {
                                    try {
                                        setSeeding(true);
                                        await seedMutation({} as any);
                                        await seedPostsMutation({} as any);
                                        showToast('success', '¡Comunidades y posts de ejemplo creados!');
                                    } catch {
                                        showToast('error', 'Error al crear datos');
                                    } finally {
                                        setSeeding(false);
                                    }
                                }}
                                showToast={showToast}
                                onRemoveMember={handleRemoveCommunityMember}
                            />
                        </Suspense>
                    )}

                    {activeSection === 'propFirms' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <PropFirmManagement />
                        </Suspense>
                    )}

                    {activeSection === 'posts' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <PostManagement
                                posts={posts}
                                onRefresh={fetchPosts}
                                showToast={showToast}
                                onDelete={handleDeletePost}
                                onRestore={handleRestorePost}
                                onUpdate={handleAdminUpdatePost}
                            />
                        </Suspense>
                    )}

                    {activeSection === 'products' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <ProductManagement showToast={showToast} />
                        </Suspense>
                    )}

                    {activeSection === 'signals' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <SignalManagement showToast={showToast} />
                        </Suspense>
                    )}

                    {activeSection === 'aiAgent' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <AIAgentSection
                                pendingPosts={pendingPosts || []}
                                publishedPosts={publishedPosts || []}
                                agentConfig={agentConfig || { enabled: false, schedules: [] }}
                                onToggleAgent={handleToggleAgent}
                                onGenerateNews={handleGenerateNews}
                                onApprovePost={handleApprovePost}
                                onRejectPost={handleRejectPost}
                                onDeletePost={handleDeletePending}
                                onEditPost={handleUpdatePost}
                                onReschedule={handleReschedule}
                                formatDateTime={(ts: number) => new Date(ts).toLocaleString()}
                                onUpdateSchedules={() => {}}
                            />
                        </Suspense>
                    )}

                    {activeSection === 'marketing' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <InstagramMarketingView />
                        </Suspense>
                    )}

                    {activeSection === 'auroraSupport' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <AuroraSupportSection />
                        </Suspense>
                    )}

                    {activeSection === 'moderation' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <ModerationPanel
                                reports={spamReports || []}
                                stats={moderationStats}
                                logs={moderationLogs || []}
                                users={users}
                                onModerate={handleModerateContent}
                                onBulkModerate={handleBulkModerate}
                                onBanUser={handleBanUser}
                                showToast={showToast}
                            />
                        </Suspense>
                    )}

                    {activeSection === 'config' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <SettingsPanel showToast={showToast} />
                        </Suspense>
                    )}

                    {activeSection === 'backup' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <BackupPanel
                                showToast={showToast}
                                onExport={handleExportBackup}
                                backups={systemBackups || []}
                            />
                        </Suspense>
                    )}

                    {activeSection === 'referrals' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <ReferralPanel usuario={usuario} />
                        </Suspense>
                    )}

                    {activeSection === 'export' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <ExportDataPanel />
                        </Suspense>
                    )}

                    {activeSection === 'apps' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <AppManagement />
                            <div className="mt-8">
                                <GamingStatsPanel />
                            </div>
                        </Suspense>
                    )}
                </div>
            </main>
        </div>
    );
};
export default AdminView;
