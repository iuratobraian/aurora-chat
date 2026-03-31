import React, { useMemo } from 'react';
import { Publicacion, Usuario, Ad } from '../../types';

interface SystemNotification {
    id: string;
    type: 'warning' | 'error' | 'success' | 'info';
    message: string;
    time: string;
}

interface ActivityItem {
    id: string;
    type: 'user' | 'post' | 'ad' | 'ai' | 'system';
    message: string;
    time: string;
    icon: string;
}

interface AdminDashboardProps {
    stats: any;
    users: Usuario[];
    posts: Publicacion[];
    ads: Ad[];
    notifications: SystemNotification[];
    pendingPostsCount: number;
    onNavigate: (section: 'dashboard' | 'users' | 'ads' | 'communities' | 'posts' | 'aiAgent' | 'auroraSupport' | 'moderation' | 'referrals' | 'export' | 'config' | 'backup', label: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
    stats,
    users,
    posts,
    ads,
    notifications,
    pendingPostsCount,
    onNavigate,
}) => {
    const recentActivity = useMemo<ActivityItem[]>(() => {
        const activities: ActivityItem[] = [];
        const now = new Date();
        
        // Usuarios nuevos (últimas 24h)
        const recentUsers = users
            .filter(u => u.fechaRegistro && new Date(u.fechaRegistro) > new Date(now.getTime() - 86400000))
            .sort((a, b) => new Date(b.fechaRegistro!).getTime() - new Date(a.fechaRegistro!).getTime())
            .slice(0, 3);
        
        recentUsers.forEach((user, i) => {
            const diff = now.getTime() - new Date(user.fechaRegistro).getTime();
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor(diff / 60000);
            let timeStr = 'Hace un momento';
            if (hours >= 1) timeStr = `Hace ${hours}h`;
            else if (minutes >= 5) timeStr = `Hace ${minutes}m`;
            
            activities.push({
                id: `user-${i}`,
                type: 'user',
                message: `Nuevo usuario: @${user.usuario || user.nombre}`,
                time: timeStr,
                icon: 'person_add'
            });
        });
        
        // Posts recientes (últimas 24h)
        const recentPosts = posts
            .filter(p => p.ultimaInteraccion && p.ultimaInteraccion > now.getTime() - 86400000)
            .sort((a, b) => (b.ultimaInteraccion || 0) - (a.ultimaInteraccion || 0))
            .slice(0, 3);
        
        recentPosts.forEach((post, i) => {
            const diff = now.getTime() - (post.ultimaInteraccion || 0);
            const hours = Math.floor(diff / 3600000);
            const timeStr = hours >= 1 ? `Hace ${hours}h` : 'Hace menos de 1h';
            
            activities.push({
                id: `post-${i}`,
                type: 'post',
                message: `Post activo: "${post.titulo?.substring(0, 40) || post.contenido?.substring(0, 40)}..."`,
                time: timeStr,
                icon: 'article'
            });
        });
        
        // Publicidades activas
        const activeAds = ads.filter(a => a.activo);
        if (activeAds.length > 0) {
            activities.push({
                id: 'ads-active',
                type: 'ad',
                message: `${activeAds.length} publicidades activas`,
                time: 'Ahora',
                icon: 'campaign'
            });
        }
        
        // Posts pendientes de AI
        if (pendingPostsCount > 0) {
            activities.push({
                id: 'ai-pending',
                type: 'ai',
                message: `${pendingPostsCount} posts pendientes de revisión`,
                time: 'Pendiente',
                icon: 'pending_actions'
            });
        }
        
        // Ordenar por tiempo
        activities.sort((a, b) => {
            const order = ['user', 'post', 'ad', 'ai', 'system'];
            return order.indexOf(a.type) - order.indexOf(b.type);
        });
        
        // Si no hay actividades, mostrar mensaje
        if (activities.length === 0) {
            activities.push({
                id: 'empty',
                type: 'system',
                message: 'Sin actividad reciente',
                time: 'Sistema estable',
                icon: 'check_circle'
            });
        }
        
        return activities.slice(0, 8);
    }, [users, posts, ads, pendingPostsCount]);

    const quickActions = [
        { label: 'Usuarios', icon: 'group', section: 'users' as const, color: 'from-blue-500/20 to-blue-600/10', count: users.length },
        { label: 'Publicidades', icon: 'campaign', section: 'ads' as const, color: 'from-purple-500/20 to-purple-600/10', count: ads.length },
        { label: 'Comunidades', icon: 'groups', section: 'communities' as const, color: 'from-green-500/20 to-green-600/10', count: 0 },
        { label: 'AI Agent / Sala', icon: 'smart_toy', section: 'aiAgent' as const, color: 'from-orange-500/20 to-orange-600/10', count: pendingPostsCount },
        { label: 'Agente Soporte', icon: 'auto_awesome', section: 'auroraSupport' as const, color: 'from-violet-500/20 to-fuchsia-600/10', count: notifications.filter(n => n.type === 'error' || n.type === 'warning').length },
    ];

    const statsCards = [
        { title: 'Total Usuarios', value: stats?.totalUsers || users.length, icon: 'group', color: 'blue' },
        { title: 'Publicaciones', value: stats?.totalPosts || posts.length, icon: 'article', color: 'green' },
        { title: 'Publicidades', value: ads.length, icon: 'campaign', color: 'purple' },
        { title: 'Pendientes AI', value: pendingPostsCount, icon: 'pending_actions', color: 'orange' },
    ];

    const formatRelativeTime = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diff = now.getTime() - then.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes}m`;
        if (hours < 24) return `Hace ${hours}h`;
        return `Hace ${days}d`;
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards - Glass Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <div 
                        key={index} 
                        className="rounded-xl p-5"
                        style={{
                            background: 'rgba(32, 31, 31, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(73, 68, 84, 0.15)',
                            boxShadow: '0 8px 32px rgba(60, 0, 145, 0.08)',
                        }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span 
                                className="material-symbols-outlined text-2xl"
                                style={{ 
                                    color: stat.color === 'blue' ? '#60a5fa' : 
                                           stat.color === 'green' ? '#00e676' : 
                                           stat.color === 'purple' ? '#a78bfa' : '#fb923c' 
                                }}
                            >
                                {stat.icon}
                            </span>
                        </div>
                        <p 
                            className="text-3xl font-black mb-1"
                            style={{ 
                                fontFamily: '"Space Grotesk", sans-serif',
                                letterSpacing: '-0.02em',
                                color: '#e5e2e1',
                            }}
                        >
                            {stat.value}
                        </p>
                        <p 
                            className="text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: '#86868B' }}
                        >
                            {stat.title}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div 
                    className="lg:col-span-2 rounded-xl p-5"
                    style={{
                        background: 'rgba(28, 27, 27, 0.6)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(73, 68, 84, 0.15)',
                    }}
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 
                            className="text-lg font-bold flex items-center gap-2"
                            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                        >
                            <span className="material-symbols-outlined" style={{ color: '#d0bcff' }}>bolt</span>
                            <span style={{ color: '#e5e2e1' }}>Accesos Rápidos</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => onNavigate(action.section, action.label)}
                                className="rounded-xl p-4 transition-all hover:scale-105"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(160, 120, 255, 0.15) 0%, rgba(80, 60, 120, 0.1) 100%)',
                                    border: '1px solid rgba(73, 68, 84, 0.2)',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                <span 
                                    className="material-symbols-outlined text-2xl mb-2 block"
                                    style={{ color: '#d0bcff' }}
                                >
                                    {action.icon}
                                </span>
                                <p className="text-sm font-bold" style={{ color: '#e5e2e1' }}>{action.label}</p>
                                {action.count > 0 && (
                                    <p className="text-[10px] mt-1" style={{ color: '#86868B' }}>
                                        {action.count} {action.section === 'aiAgent' ? 'pendientes' : 'totales'}
                                    </p>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications */}
                <div 
                    className="rounded-xl p-5"
                    style={{
                        background: 'rgba(32, 31, 31, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(73, 68, 84, 0.15)',
                    }}
                >
                    <h2 
                        className="text-lg font-bold flex items-center gap-2 mb-5"
                        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                        <span className="material-symbols-outlined" style={{ color: '#fbbf24' }}>notifications</span>
                        <span style={{ color: '#e5e2e1' }}>Notificaciones</span>
                    </h2>
                    <div className="space-y-3">
                        {notifications.length > 0 ? notifications.map(notif => (
                            <div 
                                key={notif.id} 
                                className="flex items-start gap-3 p-3 rounded-lg"
                                style={{ background: 'rgba(19, 19, 19, 0.6)' }}
                            >
                                <span 
                                    className="material-symbols-outlined text-sm mt-0.5"
                                    style={{
                                        color: notif.type === 'warning' ? '#fbbf24' :
                                               notif.type === 'error' ? '#f87171' :
                                               notif.type === 'success' ? '#00e676' : '#60a5fa'
                                    }}
                                >
                                    {notif.type === 'warning' ? 'warning' : 
                                     notif.type === 'error' ? 'error' : 
                                     notif.type === 'success' ? 'check_circle' : 'info'}
                                </span>
                                <div>
                                    <p className="text-xs font-medium" style={{ color: '#e5e2e1' }}>{notif.message}</p>
                                    <p className="text-[10px] mt-1" style={{ color: '#86868B' }}>{formatRelativeTime(notif.time)}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-center py-8" style={{ color: '#86868B' }}>Sin notificaciones</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div 
                className="rounded-xl p-5"
                style={{
                    background: 'rgba(28, 27, 27, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(73, 68, 84, 0.15)',
                }}
            >
                <h2 
                    className="text-lg font-bold flex items-center gap-2 mb-5"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                    <span className="material-symbols-outlined" style={{ color: '#00e676' }}>history</span>
                    <span style={{ color: '#e5e2e1' }}>Actividad Reciente</span>
                </h2>
                <div className="space-y-2">
                    {recentActivity.map(activity => (
                        <div 
                            key={activity.id} 
                            className="flex items-center gap-4 p-3 rounded-lg transition-colors"
                            style={{ background: 'transparent' }}
                        >
                            <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(32, 31, 31, 0.8)' }}
                            >
                                <span className="material-symbols-outlined text-lg" style={{ color: '#86868B' }}>{activity.icon}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium" style={{ color: '#e5e2e1' }}>{activity.message}</p>
                                <p className="text-[10px]" style={{ color: '#86868B' }}>{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
