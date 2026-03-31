import React, { useState } from 'react';

interface Schedule {
    period: 'morning' | 'afternoon' | 'evening';
    hours: number[];
    enabled: boolean;
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

interface AIAgentSectionProps {
    pendingPosts: PendingPost[];
    publishedPosts: PendingPost[];
    agentConfig: { enabled: boolean; schedules: Schedule[] } | null;
    onToggleAgent: (enabled: boolean) => void;
    onGenerateNews: () => void;
    onApprovePost: (id: any) => void;
    onRejectPost: (id: any) => void;
    onDeletePost: (id: any) => void;
    onEditPost: (post: PendingPost) => void;
    onReschedule: (post: PendingPost) => void;
    formatDateTime: (timestamp: number) => string;
    onUpdateSchedules: (schedules: Schedule[]) => void;
}

const ScheduleEditor: React.FC<{ schedules: Schedule[]; onUpdate: (schedules: Schedule[]) => void }> = ({ schedules, onUpdate }) => {
    const defaultSchedules: Schedule[] = [
        { period: 'morning', hours: [6, 8, 10], enabled: true },
        { period: 'afternoon', hours: [12, 14, 16], enabled: true },
        { period: 'evening', hours: [18, 20, 22], enabled: true },
    ];

    const [localSchedules, setLocalSchedules] = useState<Schedule[]>(
        schedules.length > 0 ? schedules : defaultSchedules
    );

    const periodLabels = {
        morning: '🌅 Mañana',
        afternoon: '☀️ Tarde',
        evening: '🌙 Noche',
    };

    const togglePeriod = (period: 'morning' | 'afternoon' | 'evening') => {
        const updated = localSchedules.map(s =>
            s.period === period ? { ...s, enabled: !s.enabled } : s
        );
        setLocalSchedules(updated);
        onUpdate(updated);
    };

    const toggleHour = (period: 'morning' | 'afternoon' | 'evening', hour: number) => {
        const updated = localSchedules.map(s => {
            if (s.period === period) {
                const hours = s.hours.includes(hour)
                    ? s.hours.filter(h => h !== hour)
                    : [...s.hours, hour].sort((a, b) => a - b);
                return { ...s, hours };
            }
            return s;
        });
        setLocalSchedules(updated);
        onUpdate(updated);
    };

    return (
        <div className="space-y-4">
            {localSchedules.map(schedule => (
                <div key={schedule.period} className="bg-black/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold">{periodLabels[schedule.period]}</span>
                        <button
                            onClick={() => togglePeriod(schedule.period)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                                schedule.enabled
                                    ? 'bg-signal-green/20 text-signal-green'
                                    : 'bg-white/5 text-gray-500'
                            }`}
                        >
                            {schedule.enabled ? 'Activo' : 'Inactivo'}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(schedule.period === 'morning' ? [6, 8, 10] :
                          schedule.period === 'afternoon' ? [12, 14, 16] :
                          [18, 20, 22]).map(hour => (
                            <button
                                key={hour}
                                onClick={() => toggleHour(schedule.period, hour)}
                                disabled={!schedule.enabled}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                    schedule.hours.includes(hour)
                                        ? 'bg-primary text-white'
                                        : 'bg-white/5 text-gray-400'
                                } ${!schedule.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {hour.toString().padStart(2, '0')}:00
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const AIAgentSection: React.FC<AIAgentSectionProps> = ({
    pendingPosts,
    publishedPosts,
    agentConfig,
    onToggleAgent,
    onGenerateNews,
    onApprovePost,
    onRejectPost,
    onDeletePost,
    onEditPost,
    onReschedule,
    formatDateTime,
    onUpdateSchedules,
}) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'published'>('pending');

    return (
        <div className="space-y-6">
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">smart_toy</span>
                        Agente IA de Noticias
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            agentConfig?.enabled ? 'bg-signal-green/20 text-signal-green' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                            {agentConfig?.enabled ? 'ACTIVO' : 'PAUSADO'}
                        </span>
                        <button
                            onClick={() => onToggleAgent(!agentConfig?.enabled)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                agentConfig?.enabled
                                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                    : 'bg-signal-green/20 text-signal-green hover:bg-signal-green/30'
                            }`}
                        >
                            {agentConfig?.enabled ? 'Pausar' : 'Activar'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-black/30 rounded-xl p-4 text-center">
                        <p className="text-3xl font-black text-primary">{pendingPosts.length}</p>
                        <p className="text-[10px] uppercase text-gray-500 mt-1">Pendientes</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4 text-center">
                        <p className="text-3xl font-black text-signal-green">{publishedPosts.length}</p>
                        <p className="text-[10px] uppercase text-gray-500 mt-1">Publicados</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4 text-center">
                        <p className="text-3xl font-black text-blue-400">{
                            (agentConfig?.schedules || [])
                                .filter((s: Schedule) => s.enabled)
                                .reduce((acc: number, s: Schedule) => acc + s.hours.length, 0)
                        }</p>
                        <p className="text-[10px] uppercase text-gray-500 mt-1">Horarios Activos</p>
                    </div>
                </div>

                <button
                    onClick={onGenerateNews}
                    className="w-full py-4 bg-gradient-to-r from-primary to-purple-600 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Generar Posts Ahora
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`flex-1 px-4 py-3 text-xs font-bold uppercase ${activeTab === 'pending' ? 'bg-primary/20 text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                        >
                            Pendientes ({pendingPosts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('published')}
                            className={`flex-1 px-4 py-3 text-xs font-bold uppercase ${activeTab === 'published' ? 'bg-signal-green/20 text-signal-green border-b-2 border-signal-green' : 'text-gray-500'}`}
                        >
                            Publicados ({publishedPosts.length})
                        </button>
                    </div>

                    <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                        {activeTab === 'pending' ? (
                            pendingPosts.length > 0 ? pendingPosts.map(post => (
                                <div key={post._id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex gap-4">
                                        <img
                                            src={post.imagenUrl || 'https://picsum.photos/seed/news/200/150'}
                                            className="size-24 rounded-lg object-cover flex-shrink-0"
                                            alt=""
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h4 className="font-bold text-sm line-clamp-1">{post.titulo}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-bold uppercase">{post.categoria}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                                            post.sentiment === 'Bullish' ? 'bg-signal-green/20 text-signal-green' :
                                                            post.sentiment === 'Bearish' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-white/5 text-gray-400'
                                                        }`}>
                                                            {post.sentiment}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                                    📅 {formatDateTime(post.programedAt)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.contenido}</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => onReschedule(post)} className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-bold hover:bg-blue-500/30">
                                                    Reprogramar
                                                </button>
                                                <button onClick={() => onEditPost(post)} className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-bold hover:bg-white/5">
                                                    Editar
                                                </button>
                                                <button onClick={() => onRejectPost(post._id)} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold hover:bg-red-500/30">
                                                    Eliminar
                                                </button>
                                                <button onClick={() => onApprovePost(post._id)} className="px-3 py-1.5 bg-signal-green/20 text-signal-green rounded-lg text-[10px] font-bold hover:bg-signal-green/30">
                                                    Publicar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 text-gray-500">
                                    <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
                                    <p className="text-lg font-bold">No hay publicaciones pendientes</p>
                                </div>
                            )
                        ) : (
                            publishedPosts.length > 0 ? publishedPosts.slice(0, 10).map(post => (
                                <div key={post._id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex gap-4">
                                        <img
                                            src={post.imagenUrl || 'https://picsum.photos/seed/news/200/150'}
                                            className="size-16 rounded-lg object-cover flex-shrink-0"
                                            alt=""
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm line-clamp-1">{post.titulo}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="px-2 py-0.5 bg-signal-green/20 text-signal-green rounded text-[8px] font-bold">PUBLICADO</span>
                                                <span className="text-[10px] text-gray-500">{formatDateTime(post.programedAt)}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => onDeletePost(post._id)} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold hover:bg-red-500/30">
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 text-gray-500">
                                    <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
                                    <p className="text-lg font-bold">No hay posts publicados aún</p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <h3 className="text-lg font-bold mb-4">Horarios de Publicación</h3>
                    <ScheduleEditor
                        schedules={(agentConfig?.schedules || []) as Schedule[]}
                        onUpdate={onUpdateSchedules}
                    />
                </div>
            </div>
        </div>
    );
};

export default AIAgentSection;
