import React, { useState, useEffect, useCallback, useMemo, memo, Suspense, lazy } from 'react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Usuario, Ad, Publicacion } from '../types';
import { StorageService } from '../services/storage';
import { useToast } from '../components/ToastProvider';
import ElectricLoader from '../components/ElectricLoader';
import logger from '../../lib/utils/logger';
import VoiceAgent from '../components/agents/VoiceAgent';
import KnowledgePanel from '../components/admin/KnowledgePanel';

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
const MarketingProDashboard = lazy(() => import('../components/admin/MarketingProDashboard'));
const ProductManagement = lazy(() => import('../components/admin/ProductManagement'));
const SignalManagement = lazy(() => import('../components/admin/SignalManagement'));
const AuroraSupportSection = lazy(() => import('../components/admin/AuroraSupportSection'));
const AppManagement = lazy(() => import('../components/admin/AppManagement'));
const GamingStatsPanel = lazy(() => import('../components/admin/GamingStatsPanel'));
const WhatsAppNotificationPanel = lazy(() => import('../components/admin/WhatsAppNotificationPanel'));
const AdminPanelDashboard = lazy(() => import('../components/admin/AdminPanelDashboard'));
const TrashPanel = lazy(() => import('../components/admin/TrashPanel'));
const MercadoPagoAdminPanel = lazy(() => import('./admin/MercadoPagoAdminPanel'));
const AgentPromptGenerator = lazy(() => import('../components/admin/AgentPromptGenerator'));
import { YouTubePsychotradingExtractor } from '../services/youtube/psychotradingExtractor';

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

type AdminSection = 'dashboard' | 'users' | 'ads' | 'communities' | 'propFirms' | 'posts' | 'products' | 'signals' | 'aiAgent' | 'auroraSupport' | 'marketing' | 'moderation' | 'referrals' | 'export' | 'config' | 'backup' | 'apps' | 'bitacora' | 'whatsapp' | 'trash' | 'payments' | 'resources' | 'agentPrompts';

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
    const convexAds = useQuery(api.ads.getAds);
    const saveAdMutation = useMutation(api.ads.saveAd);
    const deleteAdMutation = useMutation(api.ads.deleteAd);
    const stats = useQuery(api.stats.getStats);
    const seedMutation = useMutation(api.posts.seedCommunitiesAndAds);
    const seedPostsMutation = useMutation(api.posts.seedCommunityPosts);
    const convexCommunities = useQuery(api.communities.listPublicCommunities, { limit: 100 });
    const regularCommunities = convexCommunities || [];

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
    const permanentDeletePostMutation = useMutation(api.posts.permanentDeletePost);
    
    const trashPosts = useQuery(api.posts.getTrashPosts);


    const removeCommunityMemberMutation = useMutation(api.communities.removeCommunityMember);
    const restoreCommunityMutation = useMutation(api.communities.restoreCommunity);
    const permanentDeleteCommunityMutation = useMutation(api.communities.permanentDeleteCommunity);
    const restoreProfileMutation = useMutation(api.profiles.restoreProfile);

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

    // Bitácora / Trader Verification
    const allTraderVerifications = useQuery(api.traderVerification.listAllVerifications);

    const paymentStats = useQuery(api.mercadopagoApi.getPaymentStats);
    const recentPayments = useQuery(api.mercadopagoApi.getRecentPayments, { limit: 50 });
    const recentSubscriptions = useQuery(api.mercadopagoApi.getRecentSubscriptions, { limit: 50 });
    const creditBalances = useQuery(api.mercadopagoApi.getCreditBalances, { limit: 50 });
    const updateVerificationMutation = useMutation(api.traderVerification.updateVerificationStatus);

    const [users, setUsers] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [dashboardMode, setDashboardMode] = useState<'new' | 'old'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('adminDashboardMode') as 'new' | 'old') || 'new';
        }
        return 'new';
    });
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ label: 'Panel de Administración' }]);
    const [ads, setAds] = useState<Ad[]>([]);
    const [posts, setPosts] = useState<Publicacion[]>([]);
    const [seeding, setSeeding] = useState(false);
    const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([]);
    const [auroraFindings, setAuroraFindings] = useState<AuroraFindingPreview[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);
    const [resources, setResources] = useState<any[]>([]);
    const [selectedResource, setSelectedResource] = useState<any>(null);
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<any>(null);
    const [resourceFormData, setResourceFormData] = useState<any>({
        titulo: '', autor: '', descripcion: '', embedUrl: '', duracion: '', categoria: 'Psicotrading', tipo: 'video', thumbnail: ''
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab && ['dashboard', 'users', 'ads', 'communities', 'propFirms', 'posts', 'products', 'signals', 'aiAgent', 'auroraSupport', 'marketing', 'moderation', 'referrals', 'export', 'config', 'backup', 'apps', 'bitacora', 'whatsapp', 'trash'].includes(tab)) {
            setActiveSection(tab as AdminSection);
        } else {
            const savedTab = sessionStorage.getItem('adminPanelTab');
            if (savedTab && ['dashboard', 'users', 'ads', 'communities', 'propFirms', 'posts', 'products', 'signals', 'aiAgent', 'auroraSupport', 'marketing', 'moderation', 'referrals', 'export', 'config', 'backup', 'apps', 'bitacora', 'whatsapp', 'trash'].includes(savedTab)) {
                setActiveSection(savedTab as AdminSection);
                sessionStorage.removeItem('adminPanelTab');
            }
        }
    }, []);

    const handleDashboardModeChange = (mode: 'new' | 'old') => {
        setDashboardMode(mode);
        localStorage.setItem('adminDashboardMode', mode);
    };

    useEffect(() => {
        generateNotifications();
        if (convexAds) {
            setAds(convexAds.map((ad: any) => ({ ...ad, id: ad._id })));
        }
    }, [convexAds]);

    const convexAuroraFindings = useQuery(api.adminFindings.getFindings);
    
    useEffect(() => {
        if (convexAuroraFindings) {
            setAuroraFindings(convexAuroraFindings.map((f: any) => ({
                id: f._id,
                title: f.title,
                description: f.description,
                category: f.category,
                severity: f.severity,
                status: f.status,
                detectedAt: f.detectedAt,
            })));
        }
    }, [convexAuroraFindings]);

    const allProfiles = useQuery(api.profiles.getAllProfiles) as any;
    const allPosts = useQuery(api.posts.getPosts) as any;

    // Legacy fetch functions - now using Convex queries via useEffect below
    const fetchUsers = () => {
        if (allProfiles) {
            setUsers(allProfiles as any);
            setLoading(false);
        }
    };

    const fetchPosts = () => {
        if (allPosts) {
            const filtered = (allPosts as any[]).filter((p: any) => !p.esAnuncio && p.userId !== 'system');
            setPosts(filtered as any);
        }
    };

    // Auto-refresh from Convex queries
    useEffect(() => {
        if (allProfiles) {
            // Check if profiles is an object with { profiles, nextCursor } or an array
            const profilesData = (allProfiles as any).profiles || allProfiles;
            if (Array.isArray(profilesData)) {
                setUsers(profilesData as any);
                setLoading(false);
            }
        }
    }, [allProfiles]);

    useEffect(() => {
        if (allPosts) {
            const filtered = (allPosts as any[]).filter((p: any) => !p.esAnuncio && p.userId !== 'system');
            setPosts(filtered as any);
        }
    }, [allPosts]);

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
        try {
            await deletePendingMutation({ id });
            showToast('success', 'Post eliminado');
        } catch (err: any) {
            showToast('error', err.message || 'Error al eliminar post');
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
        try {
            await deletePostMutation({ id: postId as Id<'posts'>, userId: usuario?.id || '' });
            await fetchPosts();
            showToast('success', 'Post eliminado');
        } catch (err: any) {
            console.warn('Delete post error:', err?.message);
            showToast('error', err?.message || 'Error al eliminar post');
        }
    }, [deletePostMutation, fetchPosts, showToast, usuario]);

    const handleRestorePost = useCallback(async (postId: string) => {
        try {
            await restorePostMutation({ id: postId as Id<'posts'>, userId: usuario?.id || '' });
            await fetchPosts();
            showToast('success', 'Post restaurado');
        } catch (err: any) {
            console.warn('Restore post error:', err?.message);
            showToast('error', err?.message || 'Error al restaurar post');
        }
    }, [restorePostMutation, fetchPosts, showToast, usuario]);

    const handlePermanentDeletePost = useCallback(async (postId: string) => {
        try {
            await permanentDeletePostMutation({ id: postId as Id<'posts'>, userId: usuario?.id || '' });
            showToast('success', 'Post eliminado permanentemente');
        } catch (err: any) {
            console.warn('Permanent delete error:', err?.message);
            showToast('error', err?.message || 'Error al eliminar permanentemente');
        }
    }, [permanentDeletePostMutation, showToast, usuario]);

    const handleRestoreCommunity = useCallback(async (communityId: string) => {
        try {
            await restoreCommunityMutation({ id: communityId as Id<'communities'>, userId: usuario?.id || '' });
            showToast('success', 'Comunidad restaurada');
        } catch (err: any) {
            console.warn('Restore community error:', err?.message);
            showToast('error', err?.message || 'Error al restaurar comunidad');
        }
    }, [restoreCommunityMutation, showToast, usuario]);

    const handlePermanentDeleteCommunity = useCallback(async (communityId: string) => {
        try {
            await permanentDeleteCommunityMutation({ id: communityId as Id<'communities'>, userId: usuario?.id || '' });
            showToast('success', 'Comunidad eliminada permanentemente');
        } catch (err: any) {
            console.warn('Permanent delete community error:', err?.message);
            showToast('error', err?.message || 'Error al eliminar permanentemente');
        }
    }, [permanentDeleteCommunityMutation, showToast, usuario]);

    const handleRestoreProfile = useCallback(async (profileId: string) => {
        try {
            await restoreProfileMutation({ id: profileId as Id<'profiles'>, userId: usuario?.id || '' });
            showToast('success', 'Perfil restaurado');
        } catch (err: any) {
            console.warn('Restore profile error:', err?.message);
            showToast('error', err?.message || 'Error al restaurar perfil');
        }
    }, [restoreProfileMutation, showToast, usuario]);

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
        try {
            await removeCommunityMemberMutation({
                communityId: communityId as Id<'communities'>,
                userId,
            } as any);
            showToast('success', 'Miembro expulsado');
        } catch (err: any) {
            showToast('error', err.message || 'Error al expulsar miembro');
        }
    }, [removeCommunityMemberMutation, showToast]);

    const handleExportBackup = useCallback(async () => {
        try {
            showToast('info', 'Exportando backup...');
            const currentAdminId = usuario?.id || 'admin';
            const result = await exportBackupMutation({ adminId: currentAdminId } as any);
            
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
            await banUserMutation({ userId, adminUserId: usuario?.id || '', status: 'banned' });
            const userToBan = users.find(u => u.id === userId);
            if (userToBan) {
                const updated = { ...userToBan, isBlocked: true };
                await StorageService.updateUser(updated);
            }
            showToast('success', 'Usuario baneado');
        } catch {
            showToast('error', 'Error al banear usuario');
        }
    }, [banUserMutation, users, showToast, usuario]);

    const fetchResources = useCallback(async () => {
        const data = await StorageService.getVideos();
        setResources(data);
    }, []);

    const handleOpenResourceModal = useCallback((res?: any) => {
        if (res) {
            setEditingResource(res);
            setResourceFormData(res);
        } else {
            setEditingResource(null);
            setResourceFormData({ titulo: '', autor: '', descripcion: '', embedUrl: '', duracion: '', categoria: 'Psicotrading', tipo: 'video', thumbnail: '' });
        }
        setIsResourceModalOpen(true);
    }, []);

    const handleDeleteResource = useCallback(async (id: string) => {
        try {
            await StorageService.deleteVideo(id);
            await fetchResources();
            if (selectedResource?.id === id) setSelectedResource(null);
            showToast('success', 'Recurso eliminado');
        } catch (err: any) {
            showToast('error', err.message || 'Error al eliminar recurso');
        }
    }, [fetchResources, selectedResource, showToast]);

    const handleSaveResource = useCallback(async () => {
        if (!resourceFormData.titulo || !resourceFormData.embedUrl) {
            showToast('warning', 'Título y URL son obligatorios.');
            return;
        }
        let finalEmbedUrl = resourceFormData.embedUrl;
        if (resourceFormData.tipo === 'video' && resourceFormData.embedUrl.includes('youtube.com') || resourceFormData.embedUrl.includes('youtu.be')) {
            const ytId = resourceFormData.embedUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            if (ytId) {
                finalEmbedUrl = `https://www.youtube.com/embed/${ytId}`;
                resourceFormData.thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
            }
        }
         const resource = { ...resourceFormData, embedUrl: finalEmbedUrl };
         if (editingResource) {
             await StorageService.saveVideo({ ...resource, id: editingResource.id });
             showToast('success', 'Recurso actualizado');
         } else {
             await StorageService.saveVideo(resource);
             showToast('success', 'Recurso agregado');
         }
        setIsResourceModalOpen(false);
        await fetchResources();
    }, [resourceFormData, editingResource, fetchResources, showToast]);

    const handleExtractYouTube = useCallback(async () => {
        if (isExtracting) return;
        setIsExtracting(true);
        showToast('info', 'Extrayendo contenido de YouTube...');
        try {
            const { added, skipped } = await YouTubePsychotradingExtractor.syncWithStorage();
            await fetchResources();
            showToast('success', `Extracción completada: ${added} nuevos, ${skipped} existentes`);
        } catch (error) {
            console.error('Extraction failed:', error);
            showToast('error', 'Error en la extracción. Revisa la API key de YouTube.');
        } finally {
            setIsExtracting(false);
        }
    }, [isExtracting, fetchResources, showToast]);

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
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'users', label: 'Usuarios', icon: 'group' },
        { id: 'communities', label: 'Comunidades', icon: 'groups' },
        { id: 'posts', label: 'Posts', icon: 'article' },
        { id: 'ads', label: 'Ads', icon: 'campaign' },
        { id: 'products', label: 'Productos', icon: 'shopping_cart' },
        { id: 'signals', label: 'Ideas de Trading', icon: 'trending_up' },
        { id: 'propFirms', label: 'Prop Firms', icon: 'account_balance' },
        { id: 'referrals', label: 'Referidos', icon: 'group_add' },
        { id: 'resources', label: 'Recursos', icon: 'video_library' },
        { id: 'aiAgent', label: 'AI Agent', icon: 'smart_toy' },
        { id: 'auroraSupport', label: 'Aurora', icon: 'auto_awesome' },
        { id: 'marketing', label: 'Marketing', icon: 'campaign' },
        { id: 'moderation', label: 'Moderación', icon: 'gavel' },
        { id: 'trash', label: 'Papelera', icon: 'delete' },
        { id: 'bitacora', label: 'Bitácora', icon: 'menu_book' },
        { id: 'whatsapp', label: 'WhatsApp', icon: 'chat' },
        { id: 'config', label: 'Ajustes', icon: 'settings' },
        { id: 'backup', label: 'Backup', icon: 'backup' },
        { id: 'export', label: 'Export', icon: 'download' },
        { id: 'payments', label: 'Pagos', icon: 'payments' },
        { id: 'agentPrompts', label: 'Prompt Generator', icon: 'psychology' },
        { id: 'apps', label: 'Apps', icon: 'apps' },
    ] as const;

    return (
        <>
            <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
            {/* Sidebar - Only show in old mode */}
            {dashboardMode === 'old' && (
            <aside 
                className={`${sidebarCollapsed ? 'w-14' : 'w-52'} flex flex-col transition-all duration-300 flex-shrink-0`}
                style={{
                    background: 'rgba(15, 17, 21, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRight: '1px solid rgba(73, 68, 84, 0.15)',
                }}
            >
                <div 
                    className="p-2"
                    style={{ borderBottom: '1px solid rgba(73, 68, 84, 0.15)' }}
                >
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
                                boxShadow: '0 2px 8px rgba(160, 120, 255, 0.3)',
                            }}
                        >
                            <span className="material-symbols-outlined text-white text-base">admin_panel_settings</span>
                        </div>
                        {!sidebarCollapsed && (
                            <div>
                                <h1 
                                    className="text-xs font-black uppercase tracking-wider"
                                    style={{ 
                                        fontFamily: '"Space Grotesk", sans-serif',
                                        color: '#e5e2e1',
                                    }}
                                >
                                    Admin
                                </h1>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 p-1.5 space-y-0.5 overflow-y-auto">
                    {SIDEBAR_ITEMS.map(item => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigateTo(item.id as AdminSection, item.label)}
                                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-all relative`}
                                style={{
                                    background: isActive 
                                        ? 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)' 
                                        : 'transparent',
                                    color: isActive ? 'white' : '#86868B',
                                    boxShadow: isActive ? '0 2px 8px rgba(160, 120, 255, 0.3)' : 'none',
                                }}
                            >
                                <span 
                                    className="material-symbols-outlined text-lg"
                                    style={{ color: isActive ? 'white' : '#86868B' }}
                                >
                                    {item.icon}
                                </span>
                                {!sidebarCollapsed && <span>{item.label}</span>}
                                {item.id === 'aiAgent' && pendingPosts && pendingPosts.length > 0 && (
                                    <span 
                                        className={`${sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold`}
                                        style={{ background: 'rgba(255, 23, 68, 0.9)', color: 'white' }}
                                    >
                                        {pendingPosts.length}
                                    </span>
                                )}
                                {item.id === 'moderation' && spamReports && spamReports.filter((r: any) => r.status === 'pending').length > 0 && (
                                    <span 
                                        className={`${sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold`}
                                        style={{ background: 'rgba(255, 171, 0, 0.9)', color: 'white' }}
                                    >
                                        {spamReports.filter((r: any) => r.status === 'pending').length}
                                    </span>
                                )}
                                {item.id === 'auroraSupport' && auroraFindings.filter((finding) => finding.status === 'pending').length > 0 && (
                                    <span 
                                        className={`${sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold`}
                                        style={{ background: 'rgba(255, 23, 68, 0.9)', color: 'white' }}
                                    >
                                        {auroraFindings.filter((finding) => finding.status === 'pending').length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-3" style={{ borderTop: '1px solid rgba(73, 68, 84, 0.15)' }}>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{ color: '#86868B' }}
                    >
                        <span className="material-symbols-outlined text-lg">
                            {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
                        </span>
                        {!sidebarCollapsed && <span>Colapsar</span>}
                    </button>
                </div>
            </aside>
            )}

            {/* Main Content - Full Width */}
            <main className="flex-1 flex flex-col overflow-hidden w-full">
                {/* Compact Header */}
                <header 
                    className="h-12 flex items-center justify-between px-4"
                    style={{
                        background: 'rgba(15, 17, 21, 0.9)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(73, 68, 84, 0.15)',
                    }}
                >
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigateTo('dashboard', 'Dashboard')}
                            className="material-symbols-outlined transition-colors text-sm"
                            style={{ color: '#86868B' }}
                        >
                            home
                        </button>
                        <span style={{ color: 'rgba(73, 68, 84, 0.5)' }}>/</span>
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                <span 
                                    className="text-xs cursor-pointer"
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
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                            <button
                                onClick={() => handleDashboardModeChange('new')}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                                    dashboardMode === 'new' ? 'bg-blue-500/30 text-blue-400' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">dashboard</span>
                                <span>Nuevo</span>
                            </button>
                            <button
                                onClick={() => handleDashboardModeChange('old')}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                                    dashboardMode === 'old' ? 'bg-purple-500/30 text-purple-400' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">view_sidebar</span>
                                <span>Clásico</span>
                            </button>
                        </div>
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

                {/* Content Area - Full Width */}
                <div className="flex-1 overflow-y-auto p-4 w-full">
                    {activeSection === 'dashboard' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            {dashboardMode === 'new' ? (
                                <AdminPanelDashboard
                                    stats={{
                                        totalUsers: stats?.totalUsers || users.length,
                                        totalPosts: stats?.totalPosts || posts.length,
                                        totalCommunities: stats?.totalCommunities || regularCommunities.length || 0,
                                        activeAds: stats?.activeAds || ads.filter((a: any) => a.activo).length,
                                    }}
                                    users={users.map((u: any) => ({
                                        name: u.username || u.nombre || '@user',
                                        email: u.email || '',
                                        role: u.rol || 'User',
                                        status: u.verified ? 'Active' : 'Pending',
                                        avatar: (u.username || 'U')[0].toUpperCase(),
                                    }))}
                                    communities={regularCommunities.map((c: any) => ({
                                        name: c.nombre || 'Comunidad',
                                        members: c.currentMembers || 0,
                                        posts: c.postCount || 0,
                                        status: c.status || 'Active',
                                    }))}
                                    posts={posts.slice(0, 10).map((p: any) => ({
                                        title: p.titulo || p.title || 'Post',
                                        author: p.autor?.username || p.author || '@user',
                                        type: p.tipo || 'Post',
                                        status: p.status || 'Published',
                                        date: p.fecha || new Date().toLocaleTimeString(),
                                    }))}
                                    ads={ads.map((a: any) => ({
                                        name: a.titulo || a.name || 'Ad',
                                        position: a.ubicacion || a.position || 'Home',
                                        clicks: a.clicks || 0,
                                        status: a.activo ? 'Active' : 'Paused',
                                    }))}
                                    loading={loading}
                                    currentUser={usuario ? { userId: usuario.id, role: usuario.role } : undefined}
                                />
                            ) : (
                                <AdminDashboard
                                    stats={stats}
                                    users={users}
                                    posts={posts}
                                    ads={ads}
                                    notifications={systemNotifications}
                                    pendingPostsCount={pendingPosts?.length || 0}
                                    onNavigate={navigateTo}
                                />
                            )}
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
                                adminUserId={usuario?.id || ''}
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
                                communities={regularCommunities}
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
                                currentUserId={usuario?.id}
                                adminUserId={usuario?.id}
                            />
                        </Suspense>
                    )}

                    {activeSection === 'propFirms' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <PropFirmManagement />
                        </Suspense>
                    )}

                    {activeSection === 'bitacora' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-400">menu_book</span>
                                <h2 className="text-xl font-bold">Bitácora de Traders</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-[#1a1d24] rounded-xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                        <span className="material-symbols-outlined text-lg">group</span>
                                        Total Traders
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        {allTraderVerifications?.length || 0}
                                    </div>
                                </div>
                                <div className="bg-[#1a1d24] rounded-xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 text-yellow-400 text-sm mb-2">
                                        <span className="material-symbols-outlined text-lg">pending</span>
                                        Pendientes KYC
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        {allTraderVerifications?.filter((v: any) => v.kycStatus === 'pending').length || 0}
                                    </div>
                                </div>
                                <div className="bg-[#1a1d24] rounded-xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                                        <span className="material-symbols-outlined text-lg">verified</span>
                                        Verificados
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        {allTraderVerifications?.filter((v: any) => v.kycStatus === 'approved').length || 0}
                                    </div>
                                </div>
                                <div className="bg-[#1a1d24] rounded-xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
                                        <span className="material-symbols-outlined text-lg">trending_up</span>
                                        Trading Verif.
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        {allTraderVerifications?.filter((v: any) => v.tradingVerified).length || 0}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#1a1d24] rounded-xl border border-white/5 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/5">
                                            <tr>
                                                <th className="text-left p-3 text-gray-400 font-medium text-xs">Trader</th>
                                                <th className="text-left p-3 text-gray-400 font-medium text-xs">Nivel</th>
                                                <th className="text-left p-3 text-gray-400 font-medium text-xs">Email</th>
                                                <th className="text-left p-3 text-gray-400 font-medium text-xs">KYC</th>
                                                <th className="text-left p-3 text-gray-400 font-medium text-xs">Trading</th>
                                                <th className="text-left p-3 text-gray-400 font-medium text-xs">Broker</th>
                                                <th className="text-left p-3 text-gray-400 font-medium text-xs">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allTraderVerifications?.map((verification: any) => (
                                                <tr key={verification._id} className="border-t border-white/5 hover:bg-white/5">
                                                    <td className="p-3 text-white text-xs font-medium">{verification.oderId?.slice(0, 8)}...</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                                            verification.level === 'institutional' ? 'bg-purple-500/20 text-purple-400' :
                                                            verification.level === 'advanced' ? 'bg-blue-500/20 text-blue-400' :
                                                            verification.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            verification.level === 'basic' ? 'bg-green-500/20 text-green-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                            {verification.level}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-gray-300 text-xs">
                                                        {verification.emailVerified ? (
                                                            <span className="text-green-400 material-symbols-outlined text-sm">check_circle</span>
                                                        ) : (
                                                            <span className="text-gray-500 material-symbols-outlined text-sm">cancel</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                                            verification.kycStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                            verification.kycStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            verification.kycStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                            {verification.kycStatus}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-gray-300">
                                                        {verification.tradingVerified ? (
                                                            <span className="text-green-400 material-symbols-outlined text-sm">check_circle</span>
                                                        ) : (
                                                            <span className="text-gray-500 material-symbols-outlined text-sm">cancel</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-gray-300 text-xs">
                                                        {verification.brokerConnected ? verification.brokerName || 'Conectado' : '-'}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex gap-1">
                                                            {verification.kycStatus === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => updateVerificationMutation({ 
                                                                            oderId: verification.oderId, 
                                                                            kycStatus: 'approved' 
                                                                        })}
                                                                        className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                                                        title="Aprobar"
                                                                    >
                                                                        <span className="material-symbols-outlined text-xs">check</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateVerificationMutation({ 
                                                                            oderId: verification.oderId, 
                                                                            kycStatus: 'rejected' 
                                                                        })}
                                                                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                                                        title="Rechazar"
                                                                    >
                                                                        <span className="material-symbols-outlined text-xs">close</span>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!allTraderVerifications || allTraderVerifications.length === 0) && (
                                                <tr>
                                                    <td colSpan={7} className="p-6 text-center text-gray-500 text-sm">
                                                        No hay registros de verificación
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'whatsapp' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <WhatsAppNotificationPanel />
                        </Suspense>
                    )}

                    {activeSection === 'posts' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <PostManagement
                                posts={posts}
                                trashPosts={(trashPosts || []).map((p: any) => ({ ...p, id: p._id, status: 'trash' }))}
                                onRefresh={fetchPosts}
                                showToast={showToast}
                                onDelete={handleDeletePost}
                                onRestore={handleRestorePost}
                                onPermanentDelete={handlePermanentDeletePost}
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

                    {activeSection === 'resources' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Gestión de Recursos - Psicotrading</h2>
                                <p className="text-gray-500 mb-4">Administra los recursos educativos de Psicotrading.</p>
                                <a 
                                    href="/psicotrading" 
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                                >
                                    <span className="material-symbols-outlined">open_in_new</span>
                                    Ir a Psicotrading
                                </a>
                            </div>
                        </Suspense>
                    )}

                    {activeSection === 'marketing' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <MarketingProDashboard />
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

                    {activeSection === 'trash' && (
                        <Suspense fallback={<TrashPanel
                                onRestorePost={handleRestorePost}
                                onPermanentDeletePost={handlePermanentDeletePost}
                                onRestoreCommunity={handleRestoreCommunity}
                                onPermanentDeleteCommunity={handlePermanentDeleteCommunity}
                                onRestoreProfile={handleRestoreProfile}
                                showToast={showToast}
                            />}>
                            <TrashPanel
                                onRestorePost={handleRestorePost}
                                onPermanentDeletePost={handlePermanentDeletePost}
                                onRestoreCommunity={handleRestoreCommunity}
                                onPermanentDeleteCommunity={handlePermanentDeleteCommunity}
                                onRestoreProfile={handleRestoreProfile}
                                showToast={showToast}
                            />
                        </Suspense>
                    )}

                    {activeSection === 'payments' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <MercadoPagoAdminPanel
                                payments={recentPayments}
                                subscriptions={recentSubscriptions}
                                credits={creditBalances}
                                stats={paymentStats}
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

                    {activeSection === 'agentPrompts' && (
                        <Suspense fallback={<SectionSkeleton />}>
                            <AgentPromptGenerator usuario={usuario} />
                        </Suspense>
                    )}
                </div>
            </main>
        </div>
        </>
    );
};
export default AdminView;
