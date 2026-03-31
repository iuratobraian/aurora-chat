import React, { useState, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Usuario } from '../../types';

type AdminSection = 'dashboard' | 'users' | 'ads' | 'communities' | 'propFirms' | 'posts' | 'products' | 'signals' | 'aiAgent' | 'auroraSupport' | 'marketing' | 'moderation' | 'referrals' | 'export' | 'config' | 'backup' | 'apps' | 'bitacora' | 'whatsapp' | 'trash' | 'payments' | 'resources';

interface SidebarItem {
    id: AdminSection;
    label: string;
    icon: string;
    color: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', color: 'text-primary' },
    { id: 'users', label: 'Usuarios', icon: 'group', color: 'text-blue-400' },
    { id: 'ads', label: 'Publicidad', icon: 'campaign', color: 'text-yellow-400' },
    { id: 'communities', label: 'Comunidades', icon: 'forum', color: 'text-green-400' },
    { id: 'posts', label: 'Publicaciones', icon: 'article', color: 'text-cyan-400' },
    { id: 'moderation', label: 'Moderación', icon: 'shield', color: 'text-red-400' },
    { id: 'products', label: 'Productos', icon: 'inventory_2', color: 'text-orange-400' },
    { id: 'payments', label: 'Pagos', icon: 'payments', color: 'text-emerald-400' },
    { id: 'aiAgent', label: 'AI Agent', icon: 'smart_toy', color: 'text-purple-400' },
    { id: 'auroraSupport', label: 'Aurora', icon: 'psychology', color: 'text-pink-400' },
    { id: 'marketing', label: 'Marketing', icon: 'trending_up', color: 'text-teal-400' },
    { id: 'signals', label: 'Señales', icon: 'signal_cellular_alt', color: 'text-amber-400' },
    { id: 'referrals', label: 'Referidos', icon: 'person_add', color: 'text-violet-400' },
    { id: 'propFirms', label: 'Prop Firms', icon: 'account_balance', color: 'text-sky-400' },
    { id: 'export', label: 'Exportar', icon: 'download', color: 'text-gray-400' },
    { id: 'config', label: 'Config', icon: 'settings', color: 'text-slate-400' },
    { id: 'backup', label: 'Backup', icon: 'backup', color: 'text-zinc-400' },
    { id: 'apps', label: 'Apps', icon: 'apps', color: 'text-indigo-400' },
    { id: 'bitacora', label: 'Bitácora', icon: 'menu_book', color: 'text-rose-400' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'chat', color: 'text-green-500' },

    { id: 'trash', label: 'Papelera', icon: 'delete', color: 'text-stone-400' },
    { id: 'resources', label: 'Recursos', icon: 'video_library', color: 'text-fuchsia-400' },
];

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`glass p-6 rounded-2xl ${className}`}>{children}</div>
);

interface TradeHubAdminPanelProps {
    onVisitProfile?: (id: string) => void;
    usuario?: Usuario | null;
    onBack?: () => void;
    currentMode: 'new' | 'old' | 'aurora' | 'panel';
    onModeChange: (mode: 'new' | 'old' | 'aurora' | 'panel') => void;
}

export const TradeHubAdminPanel: React.FC<TradeHubAdminPanelProps & { 
    activeSection: AdminSection; 
    setActiveSection: (s: AdminSection) => void;
    children?: React.ReactNode;
}> = ({ onVisitProfile, usuario, onBack, activeSection, setActiveSection, children, currentMode, onModeChange }) => {
    const stats = useQuery(api.stats.getStats);
    const convexAds = useQuery(api.ads.getAds);
    const convexCommunities = useQuery(api.communities.listPublicCommunities, { limit: 100 });
    const users = useQuery(api.profiles.listUsers, { limit: 100 }) || [];
    const posts = useQuery(api.posts.getPosts) || [];

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC';
    };

    return (
        <div className="fixed inset-0 min-h-screen bg-background text-on-surface font-body overflow-hidden flex flex-col z-[1000]">
            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            {/* Top AppBar */}
            <header className="fixed top-0 w-full z-[1050] flex justify-between items-center px-6 h-16 bg-surface/40 backdrop-blur-xl border-b border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-xl hover:bg-white/5 transition-all text-on-surface"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
                    <h1 className="text-xl font-bold tracking-widest text-primary uppercase font-headline">TRADEHUB</h1>
                </div>

                <div className="hidden lg:flex items-center gap-6 flex-1 max-w-2xl mx-12">
                    <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-on-surface-variant text-sm group-focus-within:text-primary transition-colors">search</span>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Búsqueda global: usuarios, comunidades, logs..."
                            className="block w-full bg-surface-container-high/50 border border-white/5 rounded-full py-2 pl-10 pr-3 text-xs text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-high transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-surface-container-high rounded-full p-1 border border-white/5 shadow-inner">
                        <button 
                            onClick={() => onModeChange('old')}
                            className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter transition-all ${currentMode !== 'panel' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                        >
                            Classic
                        </button>
                        <button 
                            onClick={() => onModeChange('panel')}
                            className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter transition-all ${currentMode === 'panel' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
                        >
                            Obsidian
                        </button>
                    </div>
                    <button className="p-2 rounded-xl hover:bg-white/5 transition-all duration-300">
                        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                    </button>
                    <div className="w-8 h-8 rounded-full border border-primary/20 p-0.5">
                        <img 
                            className="w-full h-full rounded-full object-cover" 
                            src={usuario?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"} 
                            alt="Admin" 
                        />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 pt-16 overflow-hidden">
                {/* Sidebar */}
                <aside className={`h-full bg-surface/60 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-40 overflow-y-auto no-scrollbar ${
                    sidebarOpen ? 'w-64' : 'w-0 opacity-0 pointer-events-none'
                }`}>
                    <nav className="p-4 space-y-2">
                        {SIDEBAR_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    activeSection === item.id 
                                        ? 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(173,198,255,0.2)]' 
                                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                                }`}
                            >
                                <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                                <span className="font-headline tracking-wide">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className={`flex-1 overflow-y-auto transition-all duration-300 p-6 no-scrollbar`}>
                    <div className="max-w-[1600px] mx-auto">
                        {activeSection === 'dashboard' ? (
                            <>
                                {/* Hero Stats Section */}
                                <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                    <GlassCard className="group hover:bg-surface-container-high transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-on-surface-variant">Usuarios Totales</span>
                                            <span className="material-symbols-outlined text-primary text-xl">group</span>
                                        </div>
                                        <div className="text-4xl font-headline font-bold text-on-surface">
                                            {stats?.totalUsers || users.length || 0}
                                        </div>
                                        <div className="mt-4 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-[62%]" />
                                        </div>
                                    </GlassCard>

                                    <GlassCard className="group hover:bg-surface-container-high transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-on-surface-variant">Publicaciones</span>
                                            <span className="material-symbols-outlined text-secondary text-xl">article</span>
                                        </div>
                                        <div className="text-4xl font-headline font-bold text-on-surface">
                                            {stats?.totalPosts || posts.length || 0}
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 text-[10px] text-secondary-fixed">
                                            <span className="material-symbols-outlined text-sm">trending_up</span>
                                            <span>+12% ESTA SEMANA</span>
                                        </div>
                                    </GlassCard>

                                    <GlassCard className="group hover:bg-surface-container-high transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-on-surface-variant">Comunidades</span>
                                            <span className="material-symbols-outlined text-tertiary text-xl">forum</span>
                                        </div>
                                        <div className="text-4xl font-headline font-bold text-on-surface">
                                            {convexCommunities?.length || 0}
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 text-[10px] text-tertiary">
                                            <span>COMUNIDADES ACTIVAS</span>
                                        </div>
                                    </GlassCard>

                                    <GlassCard className="group hover:bg-surface-container-high transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-on-surface-variant">Publicidad Activa</span>
                                            <span className="material-symbols-outlined text-on-surface-variant text-xl">campaign</span>
                                        </div>
                                        <div className="text-4xl font-headline font-bold text-on-surface">
                                            {convexAds?.filter((a: any) => a.activo).length || 0}
                                        </div>
                                        <div className="mt-4 text-[10px] text-on-surface-variant uppercase tracking-widest">
                                            CAMPAÑAS ACTIVAS
                                        </div>
                                    </GlassCard>
                                </section>

                                {/* Quick Actions */}
                                <section className="grid grid-cols-12 gap-6">
                                    <div className="col-span-12 lg:col-span-8">
                                        <GlassCard>
                                            <h2 className="font-headline text-lg font-bold tracking-tight text-on-surface mb-6">
                                                PANEL DE CONTROL
                                            </h2>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-white/5 hover:bg-surface-container-high transition-all">
                                                    <span className="material-symbols-outlined text-primary">add_circle</span>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest">Crear</span>
                                                </button>
                                                <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-white/5 hover:bg-surface-container-high transition-all">
                                                    <span className="material-symbols-outlined text-secondary">analytics</span>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest">Analizar</span>
                                                </button>
                                                <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-white/5 hover:bg-surface-container-high transition-all">
                                                    <span className="material-symbols-outlined text-tertiary">sync</span>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest">Sincronizar</span>
                                                </button>
                                                <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-white/5 hover:bg-surface-container-high transition-all">
                                                    <span className="material-symbols-outlined text-on-surface-variant">download</span>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest">Exportar</span>
                                                </button>
                                            </div>
                                        </GlassCard>
                                    </div>

                                    {/* Activity Feed */}
                                    <div className="col-span-12 lg:col-span-4">
                                        <GlassCard className="flex-1">
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="font-headline text-sm font-bold tracking-[0.2em] text-on-surface uppercase">Actividad Reciente</h2>
                                                <span className="text-[9px] text-on-surface-variant">EN VIVO</span>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex gap-4">
                                                    <div className="w-1 h-10 rounded-full bg-secondary" />
                                                    <div>
                                                        <p className="text-xs text-on-surface leading-relaxed">
                                                            <span className="text-secondary font-bold">Sistema</span> actualizado correctamente.
                                                        </p>
                                                        <span className="text-[9px] text-on-surface-variant font-mono">
                                                            {formatTime(currentTime)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </div>
                                </section>
                            </>
                        ) : (
                            <div className="bg-surface/30 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-2xl min-h-[70vh]">
                                {children}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface/80 backdrop-blur-2xl rounded-t-2xl border-t border-white/5">
                <button 
                    onClick={() => setActiveSection('dashboard')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                        activeSection === 'dashboard' ? 'text-primary bg-primary/10' : 'text-gray-500'
                    }`}
                >
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="font-headline text-[10px] uppercase tracking-[0.1em]">Inicio</span>
                </button>
                <button 
                    onClick={() => setActiveSection('users')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                        activeSection === 'users' ? 'text-primary bg-primary/10' : 'text-gray-500'
                    }`}
                >
                    <span className="material-symbols-outlined">group</span>
                    <span className="font-headline text-[10px] uppercase tracking-[0.1em]">Usuarios</span>
                </button>
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex flex-col items-center justify-center p-2 text-gray-500"
                >
                    <span className="material-symbols-outlined">menu</span>
                    <span className="font-headline text-[10px] uppercase tracking-[0.1em]">Menú</span>
                </button>
                <button 
                    onClick={() => setActiveSection('moderation')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                        activeSection === 'moderation' ? 'text-primary bg-primary/10' : 'text-gray-500'
                    }`}
                >
                    <span className="material-symbols-outlined">shield</span>
                    <span className="font-headline text-[10px] uppercase tracking-[0.1em]">Moderar</span>
                </button>
            </nav>

            <style>{`
                .glass {
                    background: rgba(26, 28, 30, 0.4);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .orb {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    border-radius: 50%;
                    filter: blur(120px);
                    z-index: -1;
                    opacity: 0.15;
                }
                .orb-1 { top: -10%; left: -10%; background: #4d8eff; }
                .orb-2 { bottom: -10%; right: -10%; background: #b76dff; }
                .orb-3 { top: 40%; left: 50%; background: #05e777; width: 400px; height: 400px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default TradeHubAdminPanel;
