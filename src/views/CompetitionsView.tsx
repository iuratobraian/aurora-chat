import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import JoinCompetition from '../components/JoinCompetition';
import Leaderboard from '../components/Leaderboard';

interface Props {
    user?: { id: string; usuario: string; avatar: string } | null;
}

export default function CompetitionsView({ user }: Props) {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);
    
    const upcomingCompetitions = useQuery(api.competitions.getUpcomingCompetitions, { limit: 5 });
    const featuredCompetitions = useQuery(api.competitions.getFeaturedCompetitions);
    const activeCompetitions = useQuery(api.competitions.getActiveCompetitions);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getTimeRemaining = (timestamp: number) => {
        const diff = timestamp - Date.now();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days > 0) return `en ${days} días`;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours > 0) return `en ${hours} horas`;
        return 'próximamente';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">🟢 Activa</span>;
            case 'upcoming':
                return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">🔵 Próxima</span>;
            case 'ended':
                return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">⚫ Finalizada</span>;
            default:
                return null;
        }
    };

    const competitionTypes = [
        { icon: '🎯', name: 'Accuracy Wars', desc: 'Mejor precisión en ideas de trading' },
        { icon: '📝', name: 'Content King', desc: 'Mayor engagement en publicaciones' },
        { icon: '🔥', name: 'Streak Master', desc: 'Mayor racha de actividad' },
        { icon: '💰', name: 'Weekly Profit', desc: 'Mejor porcentaje de ganancia' },
        { icon: '👥', name: 'Referral Rally', desc: 'Más referidos' },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🏆</span>
                        <h1 className="text-3xl font-bold">Competitions & Challenges</h1>
                    </div>
                </div>

                {/* Coming Soon Banner */}
                <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-8 mb-8 border border-purple-500/30">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🚧</div>
                        <h2 className="text-3xl font-bold mb-2">COMING SOON 🚧</h2>
                        <p className="text-gray-300 mb-6 max-w-md mx-auto">
                            Los torneos y competencias están en desarrollo. 
                            ¡Prepárate para demostrar quién es el mejor trader!
                        </p>
                        
                        {!subscribed ? (
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Tu email para notificaciones"
                                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-purple-500 focus:outline-none text-white placeholder-gray-400"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors whitespace-nowrap"
                                >
                                    Notificarme
                                </button>
                            </form>
                        ) : (
                            <div className="bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2 inline-block">
                                <span className="text-green-400">✓ ¡Te avisaremos cuando estén disponibles!</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Competitions */}
                {activeCompetitions && activeCompetitions.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span>🟢</span> COMPETENCIAS ACTIVAS
                        </h2>
                        
                        <div className="grid lg:grid-cols-2 gap-6">
                            {activeCompetitions.map((comp) => (
                                <div 
                                    key={comp._id} 
                                    className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700 overflow-hidden"
                                >
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-xl">{comp.title}</h3>
                                                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded mt-1 inline-block">
                                                    {comp.type}
                                                </span>
                                            </div>
                                            {getStatusBadge(comp.status)}
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4">{comp.description}</p>
                                        
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                            <span>👥 {comp.currentParticipants} participantes</span>
                                            <span>📅 Termina: {formatDate(comp.endsAt)}</span>
                                        </div>

                                        {user && (
                                            <JoinCompetition
                                                competitionId={comp._id}
                                                userId={user.id}
                                                username={user.usuario}
                                                avatar={user.avatar || ''}
                                                requirements={comp.entryRequirement}
                                            />
                                        )}
                                    </div>
                                    
                                    {/* Leaderboard */}
                                    <div className="bg-gray-900/50 p-4 border-t border-gray-700">
                                        <Leaderboard 
                                            competitionId={comp._id} 
                                            limit={5}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upcoming Competitions */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>📅</span> PRÓXIMAS COMPETENCIAS
                    </h2>
                    
                    {upcomingCompetitions && upcomingCompetitions.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            {upcomingCompetitions.map((comp) => (
                                <div 
                                    key={comp._id} 
                                    className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-purple-500/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-lg">{comp.title}</h3>
                                        <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                                            {comp.type}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{comp.description}</p>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">
                                            Begins: {formatDate(comp.startsAt)}
                                        </span>
                                        <span className="text-purple-400">
                                            {getTimeRemaining(comp.startsAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {[1, 2].map((i) => (
                                <div 
                                    key={i}
                                    className="bg-gray-800/30 rounded-xl p-5 border border-gray-700 border-dashed"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-lg text-gray-500">Nueva Competencia</h3>
                                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded animate-pulse">
                                            Soon
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm">Detalles por anunciarse...</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Competition Types */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>🏅</span> TIPOS DE COMPETENCIAS
                    </h2>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {competitionTypes.map((type, index) => (
                            <div 
                                key={index}
                                className="bg-gray-800/30 rounded-xl p-4 border border-gray-700 hover:border-purple-500/30 transition-all hover:scale-[1.02]"
                            >
                                <div className="text-3xl mb-2">{type.icon}</div>
                                <h3 className="font-bold mb-1">{type.name}</h3>
                                <p className="text-gray-400 text-sm">{type.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
