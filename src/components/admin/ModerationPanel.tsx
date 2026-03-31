import React, { useState } from 'react';
import { Usuario } from '../../types';
import { StorageService } from '../../services/storage';

interface SpamReport {
    _id: any;
    userId: string;
    contentId: string;
    contentText: string;
    reason: string;
    contentType: 'post' | 'comment';
    createdAt: number;
    status: 'pending' | 'reviewed' | 'dismissed';
    reporterId?: string;
    moderatorId?: string;
    action?: string;
    notes?: string;
    severity?: 'low' | 'medium' | 'high';
    resolvedAt?: number;
    userProfile?: { nombre?: string; usuario?: string; avatar?: string } | null;
    content?: { titulo?: string; contenido?: string; status?: string } | null;
    reporterName?: string;
    affectedUserName?: string;
    affectedUserUsuario?: string;
}

interface ModerationStats {
    reports: { total: number; pending: number; reviewed: number; dismissed: number; today: number; thisWeek: number };
    posts: { total: number; createdToday: number; createdThisWeek: number; flagged: number };
    moderation: { actionsToday: number; topModerators: { moderatorId: string; count: number }[] };
    topReasons: { reason: string; count: number }[];
}

interface SuspendedUser {
    _id: any;
    userId: string;
    nombre: string;
    usuario: string;
    email: string;
    role?: number;
    fechaRegistro?: string;
}

interface ModerationPanelProps {
    reports: SpamReport[];
    stats: ModerationStats | null;
    logs: any[];
    users: Usuario[];
    suspendedUsers?: SuspendedUser[];
    topReasons?: { reason: string; count: number }[];
    onModerate: (contentId: string, contentType: 'post' | 'comment', action: 'approve' | 'reject' | 'delete' | 'dismiss') => void;
    onBulkModerate: (contentIds: string[], contentType: 'post' | 'comment', action: 'approve' | 'reject' | 'delete' | 'dismiss') => void;
    onBanUser: (userId: string, reason: string) => void;
    onSuspendUser?: (userId: string, reason: string, duration: string) => void;
    onUnsuspendUser?: (userId: string) => void;
    showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const ModerationPanel: React.FC<ModerationPanelProps> = ({
    reports,
    stats,
    logs,
    users,
    suspendedUsers = [],
    topReasons = [],
    onModerate,
    onBulkModerate,
    onBanUser,
    onSuspendUser,
    onUnsuspendUser,
    showToast,
}) => {
    const [activeTab, setActiveTab] = useState<'reports' | 'spam' | 'users' | 'logs' | 'stats' | 'suspended'>('reports');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'dismissed'>('pending');
    const [selectedReports, setSelectedReports] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterReason, setFilterReason] = useState<string>('all');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [showBanModal, setShowBanModal] = useState<{ userId: string; nombre?: string } | null>(null);
    const [showSuspendModal, setShowSuspendModal] = useState<{ userId: string; nombre?: string } | null>(null);
    const [banReason, setBanReason] = useState('');
    const [suspendReason, setSuspendReason] = useState('');
    const [suspendDuration, setSuspendDuration] = useState<string>('7days');
    const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('json');

    const pendingReports = reports.filter(r => r.status === 'pending');
    const reviewedReports = reports.filter(r => r.status === 'reviewed');
    const dismissedReports = reports.filter(r => r.status === 'dismissed');

    const uniqueReasons = [...new Set(reports.map(r => r.reason))].filter(Boolean);

    const filteredReports = reports.filter(r => {
        const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
        const matchesReason = filterReason === 'all' || r.reason === filterReason;
        const matchesSeverity = filterSeverity === 'all' || r.severity === filterSeverity;
        const matchesSearch = !searchTerm || 
            r.contentText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.userProfile?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.userProfile?.usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.affectedUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.affectedUserUsuario?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesReason && matchesSeverity && matchesSearch;
    });

    const spamDetectedPosts = [...pendingReports, ...reviewedReports].filter(r => r.contentType === 'post');
    const bannedUsers = users.filter(u => u.isBlocked);

    const formatRelativeTime = (date: string | number) => {
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

    const formatDate = (date: string | number) => {
        return new Date(date).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleSelectReport = (reportId: string) => {
        setSelectedReports(prev => 
            prev.includes(reportId) 
                ? prev.filter(id => id !== reportId)
                : [...prev, reportId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedReports.length === filteredReports.length) {
            setSelectedReports([]);
        } else {
            setSelectedReports(filteredReports.map(r => r._id));
        }
    };

    const handleBulkAction = (action: 'approve' | 'reject' | 'delete' | 'dismiss') => {
        if (selectedReports.length === 0) {
            showToast('error', 'Selecciona al menos un reporte');
            return;
        }
        const contentIds = selectedReports.map(id => {
            const report = reports.find(r => r._id === id);
            return report?.contentId || id;
        });
        onBulkModerate(contentIds, 'post', action);
        setSelectedReports([]);
        showToast('success', `${selectedReports.length} reportes procesados`);
    };

    const handleBanUserConfirm = () => {
        if (!showBanModal || !banReason.trim()) {
            showToast('error', 'Ingresa una razón para banear');
            return;
        }
        onBanUser(showBanModal.userId, banReason);
        setShowBanModal(null);
        setBanReason('');
        showToast('success', 'Usuario baneado exitosamente');
    };

    const handleSuspendUserConfirm = () => {
        if (!showSuspendModal || !suspendReason.trim()) {
            showToast('error', 'Ingresa una razón para suspender');
            return;
        }
        if (onSuspendUser) {
            onSuspendUser(showSuspendModal.userId, suspendReason, suspendDuration);
            setShowSuspendModal(null);
            setSuspendReason('');
            setSuspendDuration('7days');
            showToast('success', 'Usuario suspendido exitosamente');
        }
    };

    const exportLogs = () => {
        const data = exportFormat === 'json' 
            ? JSON.stringify(logs, null, 2)
            : logs.map(l => `${formatDate(l.createdAt)},${l.moderatorName},${l.action},${l.contentType},${l.contentId},${l.reason}`).join('\n');
        
        const blob = new Blob([data], { type: exportFormat === 'json' ? 'application/json' : 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moderation_logs_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('success', 'Historial exportado');
    };

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case 'high': return 'bg-red-500/20 text-red-400';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400';
            case 'low': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                    className="rounded-xl p-5"
                    style={{
                        background: 'rgba(32, 31, 31, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(249, 115, 22, 0.2)',
                    }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="material-symbols-outlined text-2xl" style={{ color: '#fb923c' }}>pending_actions</span>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold" style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c' }}>PENDIENTE</span>
                    </div>
                    <p className="text-3xl font-black mb-1" style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#e5e2e1' }}>{stats?.reports.pending || pendingReports.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#86868B' }}>Reportes Pendientes</p>
                </div>

                <div 
                    className="rounded-xl p-5"
                    style={{
                        background: 'rgba(32, 31, 31, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(248, 113, 113, 0.2)',
                    }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="material-symbols-outlined text-2xl" style={{ color: '#f87171' }}>spam</span>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold" style={{ background: 'rgba(248, 113, 113, 0.2)', color: '#f87171' }}>ALERTA</span>
                    </div>
                    <p className="text-3xl font-black mb-1" style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#e5e2e1' }}>{spamDetectedPosts.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#86868B' }}>Spam Detectado</p>
                </div>

                <div 
                    className="rounded-xl p-5"
                    style={{
                        background: 'rgba(32, 31, 31, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0, 230, 118, 0.2)',
                    }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="material-symbols-outlined text-2xl" style={{ color: '#00e676' }}>check_circle</span>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold" style={{ background: 'rgba(0, 230, 118, 0.2)', color: '#00e676' }}>RESUELTO</span>
                    </div>
                    <p className="text-3xl font-black mb-1" style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#e5e2e1' }}>{stats?.reports.reviewed || reviewedReports.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#86868B' }}>Reportes Atendidos</p>
                </div>

                <div 
                    className="rounded-xl p-5"
                    style={{
                        background: 'rgba(32, 31, 31, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(167, 139, 250, 0.2)',
                    }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="material-symbols-outlined text-2xl" style={{ color: '#a78bfa' }}>block</span>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold" style={{ background: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa' }}>BANEADOS</span>
                    </div>
                    <p className="text-3xl font-black mb-1" style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#e5e2e1' }}>{bannedUsers.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#86868B' }}>Usuarios Bloqueados</p>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'reports', label: 'Reportes', icon: 'flag', count: pendingReports.length, color: '#fb923c' },
                    { id: 'spam', label: 'Spam Detection', icon: 'phishing', count: spamDetectedPosts.length, color: '#f87171' },
                    { id: 'suspended', label: 'Suspendidos', icon: 'pause_circle', count: suspendedUsers.length, color: '#fbbf24' },
                    { id: 'users', label: 'Baneados', icon: 'block', count: bannedUsers.length, color: '#a78bfa' },
                    { id: 'logs', label: 'Historial', icon: 'history', count: logs.length, color: '#60a5fa' },
                    { id: 'stats', label: 'Estadísticas', icon: 'analytics', count: 0, color: '#00e676' },
                ].map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all"
                            style={{
                                background: isActive ? `rgba(${tab.color === '#fb923c' ? '251,146,60' : tab.color === '#f87171' ? '248,113,113' : tab.color === '#fbbf24' ? '251,191,36' : tab.color === '#a78bfa' ? '167,139,250' : tab.color === '#60a5fa' ? '96,165,250' : '0,230,118'}, 0.2)` : 'rgba(28, 27, 27, 0.6)',
                                color: isActive ? tab.color : '#86868B',
                                border: isActive ? `1px solid ${tab.color}30` : '1px solid transparent',
                            }}
                        >
                            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                            {tab.label}
                            {tab.count > 0 && (
                                <span 
                                    className="px-1.5 py-0.5 rounded-full text-[10px]"
                                    style={{ background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(248,113,113,0.1)', color: isActive ? tab.color : '#f87171' }}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {activeTab === 'reports' && (
                <div className="space-y-4">
                    <div 
                        className="rounded-xl p-4"
                        style={{
                            background: 'rgba(28, 27, 27, 0.6)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(73, 68, 84, 0.15)',
                        }}
                    >
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                            <div className="flex-1 w-full">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#86868B' }}>search</span>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Buscar reportes..."
                                        className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
                                        style={{
                                            background: 'rgba(19, 19, 19, 0.6)',
                                            border: '1px solid rgba(73, 68, 84, 0.2)',
                                            color: '#e5e2e1',
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value as any)}
                                    className="rounded-lg px-3 py-2 text-xs font-bold outline-none"
                                    style={{
                                        background: 'rgba(19, 19, 19, 0.6)',
                                        border: '1px solid rgba(73, 68, 84, 0.2)',
                                        color: '#e5e2e1',
                                    }}
                                >
                                    <option value="all">Todos</option>
                                    <option value="pending">Pendientes</option>
                                    <option value="reviewed">Atendidos</option>
                                    <option value="dismissed">Descartados</option>
                                </select>
                            </div>
                        </div>

                        {selectedReports.length > 0 && (
                            <div 
                                className="mt-4 p-3 rounded-xl flex items-center justify-between"
                                style={{
                                    background: 'rgba(160, 120, 255, 0.1)',
                                    border: '1px solid rgba(160, 120, 255, 0.2)',
                                }}
                            >
                                <span className="text-sm font-bold" style={{ color: '#d0bcff' }}>
                                    {selectedReports.length} seleccionados
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleBulkAction('approve')} className="px-3 py-1.5 bg-signal-green/20 text-signal-green rounded-lg text-xs font-bold hover:bg-signal-green/30">
                                        Aprobar Todo
                                    </button>
                                    <button onClick={() => handleBulkAction('dismiss')} className="px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded-lg text-xs font-bold hover:bg-gray-500/30">
                                        Descartar
                                    </button>
                                    <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30">
                                        Eliminar Todo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-black/50">
                                    <tr>
                                        <th className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded bg-white/5 border-white/20"
                                            />
                                        </th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Tipo</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Contenido</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Razón</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Usuario</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Fecha</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Estado</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredReports.length > 0 ? filteredReports.map(report => (
                                        <tr key={report._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedReports.includes(report._id)}
                                                    onChange={() => toggleSelectReport(report._id)}
                                                    className="w-4 h-4 rounded bg-white/5 border-white/20"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                    report.contentType === 'post' 
                                                        ? 'bg-blue-500/20 text-blue-400' 
                                                        : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                    {report.contentType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 max-w-xs">
                                                <p className="text-xs text-gray-300 line-clamp-2">
                                                    {report.content?.titulo || report.contentText?.substring(0, 80) || 'Sin contenido'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[9px] font-bold">
                                                    {report.reason}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold">
                                                        {report.userProfile?.nombre?.[0] || report.userProfile?.usuario?.[0] || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold">{report.userProfile?.nombre || 'Unknown'}</p>
                                                        <p className="text-[10px] text-gray-500">@{report.userProfile?.usuario || 'unknown'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-gray-500">{formatRelativeTime(report.createdAt)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                    report.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                                                    report.status === 'reviewed' ? 'bg-signal-green/20 text-signal-green' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                    {report.status === 'pending' ? 'Pendiente' : report.status === 'reviewed' ? 'Atendido' : 'Descartado'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => onModerate(report.contentId, report.contentType, 'approve')}
                                                        className="p-1.5 bg-signal-green/20 text-signal-green rounded-lg hover:bg-signal-green/30 transition-colors"
                                                        title="Aprobar"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">check</span>
                                                    </button>
                                                    <button
                                                        onClick={() => onModerate(report.contentId, report.contentType, 'reject')}
                                                        className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                                                        title="Rechazar"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </button>
                                                    <button
                                                        onClick={() => onModerate(report.contentId, report.contentType, 'delete')}
                                                        className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setShowBanModal({ userId: report.userId, nombre: report.userProfile?.nombre })}
                                                        className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                                                        title="Banear Usuario"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">person_off</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-20 text-center text-gray-500">
                                                <span className="material-symbols-outlined text-5xl mb-2 block">inbox</span>
                                                <p className="text-sm">No hay reportes que mostrar</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'spam' && (
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-red-400">phishing</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-400">Spam Detection Activo</h3>
                                <p className="text-xs text-gray-500">Posts detectados como spam automáticamente por el sistema</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {spamDetectedPosts.length > 0 ? spamDetectedPosts.map(report => (
                            <div key={report._id} className="bg-white/5 rounded-xl border border-red-500/20 overflow-hidden backdrop-blur-sm hover:border-red-500/40 transition-colors">
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[9px] font-bold uppercase flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">phishing</span>
                                            SPAM
                                        </span>
                                        <span className="text-[10px] text-gray-500">{formatRelativeTime(report.createdAt)}</span>
                                    </div>
                                    
                                    <h4 className="font-bold text-sm mb-2 line-clamp-1">
                                        {report.content?.titulo || 'Post Detectado'}
                                    </h4>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                        {report.content?.contenido || report.contentText}
                                    </p>
                                    
                                    <div className="bg-black/30 rounded-lg p-2 mb-3">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Razón</p>
                                        <p className="text-xs text-red-400 font-medium">{report.reason}</p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold">
                                                {report.userProfile?.nombre?.[0] || '?'}
                                            </div>
                                            <span className="text-[10px] text-gray-500">@{report.userProfile?.usuario}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-white/5 p-3 bg-black/30 flex gap-2">
                                    <button
                                        onClick={() => onModerate(report.contentId, 'post', 'approve')}
                                        className="flex-1 py-2 bg-signal-green/20 text-signal-green rounded-lg text-[10px] font-bold hover:bg-signal-green/30 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">check</span>
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => onModerate(report.contentId, 'post', 'delete')}
                                        className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                <span className="material-symbols-outlined text-5xl mb-2 block">verified_user</span>
                                <p className="text-sm">No hay posts detectados como spam</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-purple-400">group</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-purple-400">Usuarios Baneados</h3>
                                <p className="text-xs text-gray-500">Gestión de usuarios bloqueados en la plataforma</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-black/50">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Usuario</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Email</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Rol</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Registro</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {bannedUsers.length > 0 ? bannedUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400">
                                                        {user.nombre?.[0] || user.usuario?.[0] || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{user.nombre || 'Unknown'}</p>
                                                        <p className="text-[10px] text-gray-500">@{user.usuario || 'unknown'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-gray-400">{user.email || 'No email'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[9px] font-bold uppercase">
                                                    {user.rol || 'user'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-gray-500">{formatRelativeTime(user.fechaRegistro || '')}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => {
                                                        const updated = { ...user, isBlocked: false };
                                                        StorageService.updateUser(updated);
                                                        showToast('success', 'Usuario desbaneado');
                                                        window.location.reload();
                                                    }}
                                                    className="px-3 py-1.5 bg-signal-green/20 text-signal-green rounded-lg text-[10px] font-bold hover:bg-signal-green/30 transition-colors"
                                                >
                                                    Desbanear
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-20 text-center text-gray-500">
                                                <span className="material-symbols-outlined text-5xl mb-2 block">group_off</span>
                                                <p className="text-sm">No hay usuarios baneados</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'suspended' && (
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-yellow-400">pause_circle</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-yellow-400">Usuarios Suspendidos</h3>
                                <p className="text-xs text-gray-500">Usuarios temporalmente suspendidos de la plataforma</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-black/50">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Usuario</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Email</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Rol</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Registro</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {suspendedUsers.length > 0 ? suspendedUsers.map(user => (
                                        <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-sm font-bold text-yellow-400">
                                                        {user.nombre?.[0] || user.usuario?.[0] || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{user.nombre || 'Unknown'}</p>
                                                        <p className="text-[10px] text-gray-500">@{user.usuario || 'unknown'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-gray-400">{user.email || 'No email'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[9px] font-bold uppercase">
                                                    {user.role === 5 ? 'Admin' : user.role === 4 ? 'Mod' : user.role === 3 ? 'Creator' : user.role === 2 ? 'Elite' : user.role === 1 ? 'Pro' : 'Free'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-gray-500">{formatRelativeTime(user.fechaRegistro || '')}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => {
                                                        if (onUnsuspendUser) {
                                                            onUnsuspendUser(user.userId);
                                                            showToast('success', 'Suspensión levantada');
                                                        }
                                                    }}
                                                    className="px-3 py-1.5 bg-signal-green/20 text-signal-green rounded-lg text-[10px] font-bold hover:bg-signal-green/30 transition-colors"
                                                >
                                                    Levantar Suspensión
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-20 text-center text-gray-500">
                                                <span className="material-symbols-outlined text-5xl mb-2 block">check_circle</span>
                                                <p className="text-sm">No hay usuarios suspendidos</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20 rounded-xl p-5 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="material-symbols-outlined text-2xl text-green-400">trending_up</span>
                            </div>
                            <p className="text-3xl font-black mb-1">{stats?.reports.reviewed || 0}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Reportes Atendidos</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 rounded-xl p-5 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="material-symbols-outlined text-2xl text-blue-400">schedule</span>
                            </div>
                            <p className="text-3xl font-black mb-1">{stats?.moderation.actionsToday || 0}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Acciones Hoy</p>
                        </div>

                        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20 rounded-xl p-5 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="material-symbols-outlined text-2xl text-cyan-400">description</span>
                            </div>
                            <p className="text-3xl font-black mb-1">{stats?.posts.flagged || 0}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Posts Pendientes</p>
                        </div>

                        <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-500/20 rounded-xl p-5 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="material-symbols-outlined text-2xl text-teal-400">warning</span>
                            </div>
                            <p className="text-3xl font-black mb-1">{stats?.reports.today || 0}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Reportes Hoy</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white/5 rounded-xl border border-white/10 p-5 backdrop-blur-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl text-orange-400">report</span>
                                Principales Razones de Reporte
                            </h3>
                            <div className="space-y-3">
                                {(topReasons.length > 0 ? topReasons : stats?.topReasons || []).slice(0, 8).map((item: any, index: number) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium truncate">{item.reason}</span>
                                                <span className="text-xs text-gray-500 ml-2">{item.count}</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                                                    style={{ width: `${Math.min((item.count / (topReasons[0]?.count || 1)) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl border border-white/10 p-5 backdrop-blur-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl text-blue-400">person</span>
                                Top Moderadores
                            </h3>
                            <div className="space-y-3">
                                {stats?.moderation.topModerators.slice(0, 5).map((mod: any, index: number) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                            index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                            index === 1 ? 'bg-gray-400/20 text-gray-300' :
                                            index === 2 ? 'bg-orange-600/20 text-orange-600' :
                                            'bg-white/5 text-gray-400'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{mod.moderatorId.slice(0, 12)}...</p>
                                            <p className="text-xs text-gray-500">{mod.count} acciones</p>
                                        </div>
                                    </div>
                                ))}
                                {(!stats?.moderation.topModerators || stats.moderation.topModerators.length === 0) && (
                                    <p className="text-center text-gray-500 py-4">No hay datos de moderadores</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl border border-white/10 p-5 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl text-green-400">show_chart</span>
                            Resumen de Actividad
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-white/5 rounded-lg">
                                <p className="text-2xl font-black text-green-400">{stats?.reports.total || 0}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Total Reportes</p>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-lg">
                                <p className="text-2xl font-black text-blue-400">{stats?.reports.thisWeek || 0}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Esta Semana</p>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-lg">
                                <p className="text-2xl font-black text-purple-400">{stats?.posts.total || 0}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Total Posts</p>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-lg">
                                <p className="text-2xl font-black text-cyan-400">{stats?.posts.createdThisWeek || 0}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Posts Semana</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-blue-400">history</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-blue-400">Historial de Moderación</h3>
                                <p className="text-xs text-gray-500">Registro de todas las acciones de moderación realizadas</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                            {logs.length > 0 ? logs.map((log: any) => (
                                <div key={log._id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            log.action === 'approve' ? 'bg-signal-green/20' :
                                            log.action === 'delete' ? 'bg-red-500/20' :
                                            log.action === 'reject' ? 'bg-yellow-500/20' :
                                            'bg-gray-500/20'
                                        }`}>
                                            <span className={`material-symbols-outlined ${
                                                log.action === 'approve' ? 'text-signal-green' :
                                                log.action === 'delete' ? 'text-red-400' :
                                                log.action === 'reject' ? 'text-yellow-400' :
                                                'text-gray-400'
                                            }`}>
                                                {log.action === 'approve' ? 'check_circle' :
                                                 log.action === 'delete' ? 'delete_forever' :
                                                 log.action === 'reject' ? 'cancel' :
                                                 'remove_circle'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold">
                                                    {log.action === 'approve' ? 'Aprobó' :
                                                     log.action === 'delete' ? 'Eliminó' :
                                                     log.action === 'reject' ? 'Rechazó' :
                                                     'Descartó'}
                                                </span>
                                                <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-bold uppercase">
                                                    {log.contentType}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-auto">{formatRelativeTime(log.createdAt)}</span>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                Moderador: <span className="text-primary">{log.moderatorName}</span>
                                                {log.reason && <span className="text-gray-500"> - {log.reason}</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center text-gray-500">
                                    <span className="material-symbols-outlined text-5xl mb-2 block">history_toggle_off</span>
                                    <p className="text-sm">No hay acciones registradas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showBanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setShowBanModal(null)}>
                    <div className="bg-[#0f1115] rounded-2xl p-6 w-full max-w-md border border-purple-500/30" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-purple-400">person_off</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Banear Usuario</h3>
                                <p className="text-xs text-gray-500">{showBanModal.nombre || showBanModal.userId}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Razón del Ban *</label>
                                <select
                                    value={banReason}
                                    onChange={e => setBanReason(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none transition-colors"
                                >
                                    <option value="">Seleccionar razón...</option>
                                    <option value="Spam">Spam / Contenido basura</option>
                                    <option value="Contenido inapropiado">Contenido inapropiado</option>
                                    <option value="Acoso">Acoso / Bullying</option>
                                    <option value="Estafa">Estafa / Fraude</option>
                                    <option value="Violación de términos">Violación de términos</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            {banReason === 'Otro' && (
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Descripción</label>
                                    <textarea
                                        value={banReason}
                                        onChange={e => setBanReason(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none transition-colors h-20 resize-none"
                                        placeholder="Describe la razón..."
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowBanModal(null)} className="flex-1 py-3 bg-white/5 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleBanUserConfirm} className="flex-1 py-3 bg-purple-500 rounded-xl text-sm font-bold hover:bg-purple-600 transition-colors">
                                Confirmar Ban
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModerationPanel;
