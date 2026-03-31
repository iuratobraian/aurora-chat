import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { InstagramConnect, InstagramAccountCard, InstagramPostEditor, InstagramMediaLibrary, InstagramCalendar, InstagramAnalytics, InstagramQueue, InstagramInbox, InstagramAutoReply } from '../components/instagram';
import { InstagramConnectedAccounts } from '../components/admin/InstagramConnectedAccounts';
import type { InstagramAccount, MediaItem, ScheduledPost, InstagramStats, QueuedPost } from '../components/instagram';
import { FluxImageGenerator } from '../components/marketing/FluxImageGenerator';
import { useToast } from '../components/ToastProvider';
import { Usuario } from '../types';
import logger from '../utils/logger';

interface InstagramMarketingViewProps {
    usuario: Usuario | null;
}

type Tab = 'accounts' | 'create' | 'media' | 'images' | 'video' | 'calendar' | 'queue' | 'analytics' | 'inbox' | 'autoreply';
type DesignTheme = 'original' | 'obsidian';

const THEME_PROFILES = {
    original: {
        name: 'Original',
        description: 'Diseño clásico con gradientes',
        icon: 'palette',
        colors: {
            bg: 'bg-gray-900',
            card: 'bg-gray-800/50',
            border: 'border-gray-600',
            text: 'text-white',
            textSecondary: 'text-gray-400',
            accent: 'from-purple-500 via-pink-500 to-orange-500',
            accentSolid: 'bg-purple-600',
            tabActive: 'bg-purple-600 text-white',
            tabInactive: 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700',
            accentText: '#e5e2e1',
            cyanText: '#4cd7f6',
            surface: 'rgba(28, 27, 27, 0.6)',
            surfaceContainer: 'rgba(32, 31, 31, 0.8)',
            glassBorder: 'rgba(73, 68, 84, 0.15)',
            glassShadow: '0 8px 32px rgba(160, 120, 255, 0.08)',
            gradient: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
            gradientGlow: '0 0 20px rgba(160, 120, 255, 0.4)',
            fontDisplay: '"Space Grotesk", sans-serif',
            fontBody: 'Inter, sans-serif',
        }
    },
    obsidian: {
        name: 'Obsidian Ether',
        description: 'Glass premium con tonos violet',
        icon: 'dark_mode',
        colors: {
            bg: '#050505',
            card: 'rgba(28, 27, 27, 0.8)',
            border: 'rgba(73, 68, 84, 0.3)',
            text: '#e5e2e1',
            textSecondary: '#86868B',
            accent: 'from-purple-500 via-pink-500 to-orange-500',
            accentSolid: '#d0bcff',
            tabActive: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
            tabInactive: 'rgba(28, 27, 27, 0.8)',
            accentText: '#e5e2e1',
            cyanText: '#4cd7f6',
            surface: 'rgba(28, 27, 27, 0.6)',
            surfaceContainer: 'rgba(32, 31, 31, 0.8)',
            glassBorder: 'rgba(73, 68, 84, 0.15)',
            glassShadow: '0 8px 32px rgba(60, 0, 145, 0.08)',
            gradient: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
            gradientGlow: '0 0 20px rgba(160, 120, 255, 0.4)',
            fontDisplay: '"Space Grotesk", sans-serif',
            fontBody: 'Inter, sans-serif',
        }
    }
} as const;

export default function InstagramMarketingView({ usuario }: InstagramMarketingViewProps) {
    const { showToast } = useToast();
    const userId = usuario?.id || '';
    const [activeTab, setActiveTab] = useState<Tab>('accounts');
    const [connecting, setConnecting] = useState(false);
    const [analyticsPeriod, setAnalyticsPeriod] = useState<'7d' | '30d' | '90d'>('30d');
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [designTheme, setDesignTheme] = useState<DesignTheme>('original');
    
    const theme = THEME_PROFILES[designTheme];
    const c = theme.colors;

    const disconnectMutation = useMutation(api.instagram.accounts.disconnectInstagramAccount);
    const refreshMutation = useMutation(api.instagram.accounts.refreshAccountStats);

    // Check for success feedback from App.tsx redirect
    React.useEffect(() => {
        const successNotify = sessionStorage.getItem('instagram_connected_notify');
        if (successNotify === 'true') {
            sessionStorage.removeItem('instagram_connected_notify');
            // Assuming there's a toast or notification system, but for now we'll log it
            // and maybe we can add a local state for a success message
            logger.info('Instagram connected successfully!', { context: 'InstagramMarketingView' });
            // Remove the connected=true from URL to keep it clean
            const url = new URL(window.location.href);
            url.searchParams.delete('connected');
            window.history.replaceState({}, '', url.pathname + url.search);
        }
    }, []);

    const instagramAccounts = useQuery(api.instagram.accounts.getUserInstagramAccounts, { userId });
    const accounts: InstagramAccount[] = useMemo(() => {
        if (!instagramAccounts) return [];
        return instagramAccounts.map((a: any) => ({
            id: a._id,
            username: a.username,
            avatarUrl: a.profilePicture || `https://ui-avatars.com/api/?name=${a.username}&background=random`,
            followers: a.followers || 0,
            posts: a.totalPosts || 0,
            status: a.isConnected ? 'connected' : 'disconnected',
            lastSync: a.updatedAt,
        }));
    }, [instagramAccounts]);

    const scheduledPosts = useQuery(api.instagram.posts.getScheduledPosts, { 
        userId, 
        accountId: selectedAccountId || undefined,
    });
    
    const queuePosts = useMemo(() => {
        if (!scheduledPosts) return [];
        return scheduledPosts.filter((p: any) => p.status === 'draft' || p.status === 'pending').map((p: any) => ({
            id: p._id,
            caption: p.caption || '',
            scheduledAt: p.scheduledFor,
            accountUsername: accounts[0]?.username || '',
            status: p.status
        }));
    }, [scheduledPosts, accounts]);

    const currentAccountId = selectedAccountId || accounts[0]?.id;
    const weeklyReport = useQuery(api.instagram.analytics?.getWeeklyReport, 
        currentAccountId ? { accountId: currentAccountId } : 'skip'
    );
    const performanceMetrics = useQuery(api.instagram.analytics?.getPerformanceMetrics, 
        currentAccountId ? { accountId: currentAccountId, period: analyticsPeriod, metric: 'engagement' } : 'skip'
    );

    const stats: InstagramStats = useMemo(() => {
        if (!weeklyReport) {
            return {
                followers: 0,
                followersChange: 0,
                posts: 0,
                postsChange: 0,
                engagement: 0,
                engagementChange: 0,
                reach: 0,
                reachChange: 0,
                impressions: 0,
                impressionsChange: 0,
                profileViews: 0,
                profileViewsChange: 0,
                topPosts: [],
                weeklyData: [],
            };
        }

        const current = weeklyReport.current;
        const changes = weeklyReport.changes;
        const topPosts = (weeklyReport.topPosts || []).map((p: any, i: number) => ({
            id: p.postId || `top-${i}`,
            imageUrl: p.imageUrl || `https://picsum.photos/200/200?random=${i + 10}`,
            likes: p.likes || 0,
            comments: p.comments || 0,
            caption: p.caption || 'Publicación destacada',
        }));

        const weeklyData = performanceMetrics?.data?.map((d: any) => ({
            day: new Date(d.date).toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
            followers: 0,
            engagement: d.value,
        })) || [];

        return {
            followers: current.followers || 0,
            followersChange: changes.followersDelta || 0,
            posts: current.posts || 0,
            postsChange: 0,
            engagement: current.posts > 0 ? ((current.likes + current.comments) / current.posts) : 0,
            engagementChange: changes.engagement || 0,
            reach: 0,
            reachChange: 0,
            impressions: (current.likes || 0) + (current.comments || 0),
            impressionsChange: changes.likes || 0,
            profileViews: 0,
            profileViewsChange: 0,
            topPosts,
            weeklyData,
        };
    }, [weeklyReport, performanceMetrics]);

    const handleExportReport = (format: 'csv' | 'json' = 'csv') => {
        if (!weeklyReport) {
            showToast('warning', 'No hay datos para exportar');
            return;
        }

        const accountName = accounts[0]?.username || 'instagram';
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];

        if (format === 'json') {
            const exportData = {
                format: 'json',
                account: accountName,
                period: { start: startDate, end: endDate },
                summary: {
                    followers: stats.followers,
                    followersChange: stats.followersChange,
                    posts: stats.posts,
                    engagement: stats.engagement,
                    engagementChange: stats.engagementChange,
                },
                weeklyData: stats.weeklyData,
                topPosts: stats.topPosts,
                exportedAt: new Date().toISOString(),
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `instagram-report-${accountName}-${startDate}-${endDate}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            const csvHeaders = ['Fecha', 'Seguidores', 'Cambio Seguidores', 'Posts', 'Likes', 'Comentarios', 'Engagement'];
            const csvRows = stats.weeklyData.map(d => [
                new Date().toISOString().split('T')[0],
                stats.followers.toString(),
                stats.followersChange.toString(),
                stats.posts.toString(),
                '0',
                '0',
                stats.engagement.toString(),
            ]);
            
            const csvContent = [
                `Instagram Analytics Report - @${accountName}`,
                `Periodo: ${startDate} - ${endDate}`,
                '',
                csvHeaders.join(','),
                ...csvRows.map(row => row.join(',')),
                '',
                'RESUMEN',
                `Seguidores,${stats.followers}`,
                `Cambio Seguidores,${stats.followersChange}%`,
                `Publicaciones,${stats.posts}`,
                `Engagement,${stats.engagement}%`,
                `Cambio Engagement,${stats.engagementChange}%`,
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `instagram-report-${accountName}-${startDate}-${endDate}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const scheduledPostsForDisplay: ScheduledPost[] = useMemo(() => {
        if (!scheduledPosts) return [];
        return scheduledPosts.map((p: any) => ({
            id: p._id,
            caption: p.caption || '',
            scheduledAt: p.scheduledFor,
            status: p.status,
            accountUsername: accounts[0]?.username || '',
        }));
    }, [scheduledPosts, accounts]);

    const mediaLibrary: MediaItem[] = useMemo(() => {
        if (!scheduledPosts) return [];
        return scheduledPosts
            .filter((p: any) => p.imageUrl)
            .map((p: any) => ({
                id: p._id,
                url: p.imageUrl,
                type: 'image' as const,
                filename: p.caption?.slice(0, 30) || 'image.jpg',
                size: 0,
                uploadedAt: p._creationTime || Date.now(),
            }));
    }, [scheduledPosts]);

    const tabs = [
        { id: 'accounts' as const, label: 'Cuentas', icon: '📱' },
        { id: 'create' as const, label: 'Crear', icon: '✏️' },
        { id: 'media' as const, label: 'Media', icon: '📷' },
        { id: 'images' as const, label: 'Imágenes IA', icon: '🖼️' },
        { id: 'video' as const, label: 'Video IA', icon: '🎬' },
        { id: 'calendar' as const, label: 'Calendario', icon: '📅' },
        { id: 'queue' as const, label: 'Cola', icon: '📋' },
        { id: 'analytics' as const, label: 'Analytics', icon: '📊' },
        { id: 'inbox' as const, label: 'Bandeja', icon: '💬' },
        { id: 'autoreply' as const, label: 'Auto-Reply', icon: '🤖' },
    ];

    const authUrl = useQuery(api["instagram/accounts"].getInstagramAuthUrl, { userId });

    const handleConnect = () => {
        if (authUrl) {
            setConnecting(true);
            // Store current path in session storage before redirecting
            sessionStorage.setItem('postAuthRedirectPath', window.location.pathname + window.location.search);
            window.location.href = authUrl;
        } else {
            logger.error('No auth URL available');
            showToast('error', 'Error al conectar con Instagram. Por favor, intenta de nuevo.');
        }
    };

    const isObsidian = designTheme === 'obsidian';

    return (
        <div 
            className={`min-h-screen p-4 md:p-6 ${isObsidian ? '' : c.bg}`}
            style={isObsidian ? { background: c.bg as string } : {}}
        >
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {isObsidian ? (
                            <div 
                                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: c.gradient as string,
                                    boxShadow: `0 8px 32px rgba(160, 120, 255, 0.3), 0 0 0 1px rgba(160, 120, 255, 0.2)`,
                                }}
                            >
                                <span className="material-symbols-outlined text-white" style={{ fontSize: 28 }}>camera</span>
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                                <span className="text-white text-lg">📸</span>
                            </div>
                        )}
                        <div>
                            <h1 
                                className={`text-2xl font-bold ${isObsidian ? '' : ''}`}
                                style={isObsidian ? { fontFamily: c.fontDisplay as string, letterSpacing: '-0.02em', color: c.accentText as string } : {}}
                            >
                                Instagram Marketing
                            </h1>
                            <p 
                                className={`text-sm ${isObsidian ? '' : 'text-gray-400'}`}
                                style={isObsidian ? { color: c.cyanText as string, fontWeight: 500 } : {}}
                            >
                                Gestiona tu contenido de Instagram
                            </p>
                        </div>
                    </div>

                    {/* Connected Accounts Section */}
                    <div className="mt-6">
                        <InstagramConnectedAccounts />
                    </div>

                    {/* Design Theme Selector */}
                    <div className="flex items-center gap-2">
                        {(Object.keys(THEME_PROFILES) as DesignTheme[]).map((themeKey) => {
                            const tp = THEME_PROFILES[themeKey];
                            const isActive = designTheme === themeKey;
                            return (
                                <button
                                    key={themeKey}
                                    onClick={() => setDesignTheme(themeKey)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                                        ${isActive 
                                            ? isObsidian 
                                                ? 'text-white' 
                                                : 'text-white' 
                                            : isObsidian
                                                ? 'text-gray-400'
                                                : 'text-gray-400'
                                        }
                                    `}
                                    style={{
                                        background: isActive 
                                            ? (isObsidian ? c.gradient as string : 'bg-purple-600')
                                            : (isObsidian ? 'rgba(28, 27, 27, 0.8)' : 'bg-gray-800'),
                                        border: isActive ? 'none' : `1px solid ${isObsidian ? 'rgba(73, 68, 84, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                                        backdropFilter: isObsidian ? 'blur(12px)' : 'none',
                                        boxShadow: isActive && isObsidian ? c.gradientGlow as string : 'none',
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                        {tp.icon}
                                    </span>
                                    <span className="hidden md:inline">{tp.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all
                                ${activeTab === tab.id 
                                    ? isObsidian 
                                        ? 'text-white' 
                                        : c.tabActive 
                                    : isObsidian
                                        ? 'text-gray-400 hover:text-white'
                                        : c.tabInactive
                                }
                            `}
                            style={activeTab === tab.id && isObsidian ? {
                                background: c.tabActive as string,
                                boxShadow: c.gradientGlow as string,
                            } : {}}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {activeTab === 'accounts' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Connect Card */}
                            <div 
                                className={`rounded-2xl p-6 ${isObsidian ? '' : c.card}`}
                                style={isObsidian ? {
                                    background: c.surfaceContainer as string,
                                    backdropFilter: 'blur(20px)',
                                    border: `1px solid ${c.glassBorder as string}`,
                                    boxShadow: c.glassShadow as string,
                                } : {}}
                            >
                                <InstagramConnect 
                                    onConnect={handleConnect} 
                                    loading={connecting} 
                                    isConnected={accounts.length > 0} 
                                />
                            </div>
                            
                            {/* Connected Accounts */}
                            <div className="space-y-4">
                                <h3 className={`font-bold ${isObsidian ? '' : ''}`} style={isObsidian ? { fontFamily: c.fontDisplay as string, color: c.accentText as string } : {}}>
                                    Cuentas Conectadas
                                </h3>
                                {accounts.length === 0 ? (
                                    <p className={`text-sm ${isObsidian ? '' : 'text-gray-400'}`} style={isObsidian ? { color: c.textSecondary as string } : {}}>
                                        No hay cuentas conectadas
                                    </p>
                                ) : (
                                    accounts.map(account => (
                                        <InstagramAccountCard
                                            key={account.id}
                                            account={account}
                                            onManage={() => showToast('info', 'Función próximamente disponible')}
                                            onRefresh={async () => {
                                                try {
                                                    showToast('info', 'Sincronizando cuenta...');
                                                    await refreshMutation({ accountId: account.id });
                                                    showToast('success', 'Cuenta sincronizada');
                                                } catch (err) {
                                                    showToast('error', 'Error al sincronizar');
                                                }
                                            }}
                                            onDisconnect={async () => {
                                                if (!confirm('¿Desconectar esta cuenta de Instagram?')) return;
                                                try {
                                                    await disconnectMutation({ userId, accountId: account.id });
                                                    showToast('success', 'Cuenta desconectada');
                                                } catch (err: any) {
                                                    showToast('error', err.message || 'Error al desconectar');
                                                }
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'create' && (
                        <div 
                            className={`rounded-2xl p-6 ${isObsidian ? '' : c.card}`}
                            style={isObsidian ? {
                                background: c.surface as string,
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${c.glassBorder as string}`,
                            } : {}}
                        >
                            <InstagramPostEditor selectedMedia={[]} />
                        </div>
                    )}

                    {activeTab === 'media' && (
                        <div 
                            className={`rounded-2xl p-6 ${isObsidian ? '' : c.card}`}
                            style={isObsidian ? {
                                background: c.surface as string,
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${c.glassBorder as string}`,
                            } : {}}
                        >
                            <InstagramMediaLibrary
                                media={mediaLibrary}
                                onUpload={() => showToast('info', 'Función próximamente disponible')}
                                onDelete={(id) => showToast('info', 'Función próximamente disponible')}
                                onSelect={(media) => showToast('info', 'Función próximamente disponible')}
                                selectionLimit={10}
                            />
                        </div>
                    )}

                    {activeTab === 'images' && (
                        <div 
                            className={`rounded-2xl p-6 ${isObsidian ? '' : c.card}`}
                            style={isObsidian ? {
                                background: c.surface as string,
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${c.glassBorder as string}`,
                            } : {}}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: c.text }}>🖼️ Generador de Imágenes IA</h3>
                                    <p style={{ color: c.textSecondary }} className="text-sm">Genera imágenes de alta calidad con FLUX.1 Schnell</p>
                                </div>
                            </div>
                            <FluxImageGenerator />
                        </div>
                    )}

                    {activeTab === 'video' && (
                        <div 
                            className={`rounded-2xl p-6 ${isObsidian ? '' : c.card}`}
                            style={isObsidian ? {
                                background: c.surface as string,
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${c.glassBorder as string}`,
                            } : {}}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: c.text }}>🎬 Video IA</h3>
                                    <p style={{ color: c.textSecondary }} className="text-sm">Genera videos con inteligencia artificial</p>
                                </div>
                                <a 
                                    href="https://huggingface.co/spaces/deddytoyota/Free-Unlimited-Google-Veo-3"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium"
                                    style={{ 
                                        background: c.accentSolid, 
                                        color: c.text 
                                    }}
                                >
                                    Abrir en nueva pestaña ↗
                                </a>
                            </div>
                            <div className="w-full h-[600px] rounded-xl overflow-hidden border" style={{ borderColor: c.glassBorder }}>
                                <iframe
                                    src="https://deddytoyota-free-unlimited-google-veo-3.hf.space"
                                    className="w-full h-full"
                                    allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; hid; layout-insets; magnetometer; microphone; midi; payment; picture-in-picture; usb; vr; wake-lock; xr-spatial-tracking"
                                    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'calendar' && (
                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <div 
                                    className={`rounded-2xl p-6 ${isObsidian ? '' : c.card}`}
                                    style={isObsidian ? {
                                        background: c.surfaceContainer as string,
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${c.glassBorder as string}`,
                                    } : {}}
                                >
                                    <InstagramCalendar
                                        posts={scheduledPostsForDisplay}
                                        onDateClick={(date) => showToast('info', 'Función próximamente disponible')}
                                        onPostClick={(post) => showToast('info', 'Función próximamente disponible')}
                                    />
                                </div>
                            </div>
                            <div>
                                <div 
                                    className={`rounded-2xl p-5 ${isObsidian ? '' : c.card}`}
                                    style={isObsidian ? {
                                        background: c.surface as string,
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${c.glassBorder as string}`,
                                        boxShadow: c.glassShadow as string,
                                    } : {}}
                                >
                                    <h3 className={`font-bold mb-4 ${isObsidian ? '' : ''}`} style={isObsidian ? { fontFamily: c.fontDisplay as string, color: c.accentText as string } : {}}>
                                        Próximas Publicaciones
                                    </h3>
                                    <div className="space-y-3">
                                        {scheduledPostsForDisplay.map(post => (
                                            <div 
                                                key={post.id} 
                                                className={`p-4 rounded-xl ${isObsidian ? '' : 'bg-gray-900/50'}`}
                                                style={isObsidian ? {
                                                    background: 'rgba(19, 19, 19, 0.6)',
                                                    border: '1px solid rgba(73, 68, 84, 0.2)',
                                                } : {}}
                                            >
                                                <p className={`text-sm line-clamp-2 ${isObsidian ? '' : ''}`} style={isObsidian ? { color: c.accentText as string } : {}}>
                                                    {post.caption}
                                                </p>
                                                <p className={`text-xs mt-2 ${isObsidian ? '' : 'text-gray-400'}`} style={isObsidian ? { color: c.cyanText as string } : {}}>
                                                    {new Date(post.scheduledAt).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'queue' && (
                        <div 
                            className={`rounded-2xl p-6 ${isObsidian ? '' : c.card}`}
                            style={isObsidian ? {
                                background: c.surface as string,
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${c.glassBorder as string}`,
                            } : {}}
                        >
                            <InstagramQueue
                                posts={queuePosts}
                                onCancel={(id) => showToast('info', 'Función próximamente disponible')}
                                onRetry={(id) => showToast('info', 'Función próximamente disponible')}
                                onEdit={(id) => showToast('info', 'Función próximamente disponible')}
                            />
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div 
                            className={`rounded-2xl p-6 ${isObsidian ? '' : c.card}`}
                            style={isObsidian ? {
                                background: c.surfaceContainer as string,
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${c.glassBorder as string}`,
                            } : {}}
                        >
                            <InstagramAnalytics
                                stats={stats}
                                username={accounts[0]?.username || 'instagram'}
                                period={analyticsPeriod}
                                onPeriodChange={(p) => setAnalyticsPeriod(p)}
                                onExport={handleExportReport}
                            />
                        </div>
                    )}

                    {activeTab === 'inbox' && accounts.length > 0 && (
                        <div 
                            className={`h-[600px] rounded-2xl ${isObsidian ? '' : c.card}`}
                            style={isObsidian ? {
                                background: c.surfaceContainer as string,
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${c.glassBorder as string}`,
                            } : {}}
                        >
                            <InstagramInbox accountId={currentAccountId || ''} />
                        </div>
                    )}

                    {activeTab === 'autoreply' && accounts.length > 0 && (
                        <div 
                            className={`rounded-2xl p-6 ${isObsidian ? '' : c.card}`}
                            style={isObsidian ? {
                                background: c.surface as string,
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${c.glassBorder as string}`,
                            } : {}}
                        >
                            <InstagramAutoReply accountId={currentAccountId || ''} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
