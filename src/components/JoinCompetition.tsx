import React from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface JoinCompetitionProps {
    competitionId: string;
    userId: string;
    username: string;
    avatar: string;
    requirements?: {
        minXP?: number;
        minLevel?: number;
        subscription?: string;
    };
    className?: string;
}

export default function JoinCompetition({ 
    competitionId, 
    userId, 
    username, 
    avatar,
    requirements,
    className = '' 
}: JoinCompetitionProps) {
    const participation = useQuery(api.competitions.getUserParticipation, { oderId: userId });
    const joinCompetition = useMutation(api.competitions.joinCompetition);
    const leaveCompetition = useMutation(api.competitions.leaveCompetition);
    
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const isJoined = participation?.some(p => p.competitionId === competitionId);

    const handleJoin = async () => {
        setLoading(true);
        setError(null);
        try {
            await joinCompetition({
                competitionId: competitionId as any,
                oderId: userId,
                username,
                avatar,
            });
        } catch (err: any) {
            setError(err.message || 'Error al unirse');
        } finally {
            setLoading(false);
        }
    };

    const handleLeave = async () => {
        setLoading(true);
        setError(null);
        try {
            await leaveCompetition({
                competitionId: competitionId as any,
                oderId: userId,
            });
        } catch (err: any) {
            setError(err.message || 'Error al salir');
        } finally {
            setLoading(false);
        }
    };

    if (isJoined) {
        return (
            <div className={`flex flex-col gap-2 ${className}`}>
                <div className="flex items-center gap-2 text-green-400 text-sm">
                    <span>✓</span>
                    <span>Ya estás participando</span>
                </div>
                <button
                    onClick={handleLeave}
                    disabled={loading}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? 'Saliendo...' : 'Abandonar competencia'}
                </button>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {requirements && (
                <div className="text-xs text-gray-500 mb-1">
                    {requirements.minLevel && <span>Nivel mínimo: {requirements.minLevel}</span>}
                    {requirements.minXP && <span> • XP mínimo: {requirements.minXP}</span>}
                    {requirements.subscription && <span> • {requirements.subscription}</span>}
                </div>
            )}
            {error && (
                <div className="p-2 rounded bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                    {error}
                </div>
            )}
            <button
                onClick={handleJoin}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
                {loading ? 'Uniéndose...' : 'Unirse a la competencia'}
            </button>
        </div>
    );
}
