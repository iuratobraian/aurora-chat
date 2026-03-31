import React, { memo } from 'react';
import { TrustScore, TrustTier, TrustSignals } from '../services/ranking/trustLayer';

interface TrustScoreCardProps {
    trustScore: TrustScore;
    userName?: string;
    compact?: boolean;
}

const SignalBar: React.FC<{ label: string; value: number; max: number; color: string }> = memo(({
    label,
    value,
    max,
    color,
}) => (
    <div className="flex items-center gap-2">
        <span className="text-[9px] text-gray-400 font-medium w-20 truncate">{label}</span>
        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all ${color}`}
                style={{ width: `${(value / max) * 100}%` }}
            />
        </div>
        <span className="text-[9px] text-gray-300 font-bold w-6 text-right">{value}</span>
    </div>
));

SignalBar.displayName = 'SignalBar';

export const TrustScoreCard: React.FC<TrustScoreCardProps> = memo(({
    trustScore,
    userName,
    compact = false,
}) => {
    const { score, tier, signals, boostReasons } = trustScore;

    const getTierColor = () => {
        switch (tier) {
            case 'elite': return 'text-yellow-400';
            case 'expert': return 'text-purple-400';
            case 'verified': return 'text-green-400';
            case 'basic': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    const getTierBg = () => {
        switch (tier) {
            case 'elite': return 'from-yellow-500/20 to-amber-500/20';
            case 'expert': return 'from-purple-500/20 to-pink-500/20';
            case 'verified': return 'from-green-500/20 to-emerald-500/20';
            case 'basic': return 'from-blue-500/20 to-cyan-500/20';
            default: return 'from-gray-500/20 to-gray-600/20';
        }
    };

    if (compact) {
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${getTierBg()} border border-white/5`}>
                <div className="relative">
                    <svg className="w-10 h-10 -rotate-90">
                        <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-gray-700"
                        />
                        <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeDasharray={`${(score / 100) * 100} 100`}
                            strokeLinecap="round"
                            className={getTierColor()}
                        />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${getTierColor()}`}>
                        {score}
                    </span>
                </div>
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-wider ${getTierColor()}`}>
                        {tier === 'elite' ? 'Élite' : tier === 'expert' ? 'Experto' : tier === 'verified' ? 'Verificado' : 'Básico'}
                    </p>
                    {userName && (
                        <p className="text-[8px] text-gray-400">de {userName}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl p-4 bg-white dark:bg-black/40 border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                        Trust Score
                    </h4>
                    {userName && (
                        <p className="text-[10px] text-gray-500">{userName}</p>
                    )}
                </div>
                <div className="relative">
                    <svg className="w-16 h-16 -rotate-90">
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            className="text-gray-700"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            strokeDasharray={`${(score / 100) * 175.9} 175.9`}
                            strokeLinecap="round"
                            className={getTierColor()}
                        />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-sm font-black ${getTierColor()}`}>
                        {score}
                    </span>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <SignalBar label="Accuracy" value={signals.accuracyScore} max={30} color="bg-blue-500" />
                <SignalBar label="Followers" value={signals.followerScore} max={25} color="bg-green-500" />
                <SignalBar label="Engagement" value={signals.engagementScore} max={20} color="bg-purple-500" />
                <SignalBar label="Badges" value={signals.badgeScore} max={10} color="bg-yellow-500" />
                <SignalBar label="Consistency" value={signals.consistencyScore} max={15} color="bg-cyan-500" />
                <SignalBar label="Account Age" value={signals.ageScore} max={5} color="bg-pink-500" />
            </div>

            {boostReasons.length > 0 && (
                <div className="border-t border-gray-100 dark:border-white/5 pt-3">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Boost Reasons
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {boostReasons.map((reason, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 bg-signal-green/10 text-signal-green text-[8px] font-bold rounded border border-signal-green/20"
                            >
                                {reason}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

TrustScoreCard.displayName = 'TrustScoreCard';

export default TrustScoreCard;
