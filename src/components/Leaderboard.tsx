import React from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Avatar } from './Avatar';

interface LeaderboardProps {
    competitionId: string;
    limit?: number;
    className?: string;
}

export default function Leaderboard({ 
    competitionId, 
    limit = 10,
    className = '' 
}: LeaderboardProps) {
    const leaderboard = useQuery(api.competitions.getLeaderboard, { 
        competitionId: competitionId as any,
        limit 
    });

    const getRankEmoji = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    const getRankClass = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-yellow-500/20 border-yellow-500/50';
            case 2: return 'bg-gray-400/20 border-gray-400/50';
            case 3: return 'bg-orange-600/20 border-orange-600/50';
            default: return 'bg-gray-800/30 border-gray-700';
        }
    };

    if (!leaderboard) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-12 bg-gray-700/30 rounded mb-4" />
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-700/20 rounded mb-2" />
                ))}
            </div>
        );
    }

    if (leaderboard.length === 0) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <span className="text-4xl mb-2 block">🏆</span>
                <p className="text-gray-400">No hay participantes aún</p>
                <p className="text-sm text-gray-500">¡Sé el primero en unirte!</p>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🏆</span>
                <h3 className="font-bold text-lg">Clasificación</h3>
            </div>
            
            <div className="space-y-2">
                {leaderboard.map((participant, index) => {
                    const rank = index + 1;
                    return (
                        <div 
                            key={participant._id}
                            className={`
                                flex items-center gap-3 p-3 rounded-lg border
                                ${getRankClass(rank)}
                            `}
                        >
                            <span className="text-xl w-8 text-center">
                                {getRankEmoji(rank)}
                            </span>
                            
                            <Avatar 
                                src={participant.avatar}
                                name={participant.username}
                                seed={participant.oderId}
                                size="md"
                                rounded="full"
                                className="bg-gray-700"
                            />
                            
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                    {participant.username}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {participant.metrics?.posts || 0} publicaciones
                                </p>
                            </div>
                            
                            <div className="text-right">
                                <p className="font-bold text-lg">
                                    {participant.score.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400">puntos</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
