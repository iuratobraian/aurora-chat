import React, { memo } from 'react';
import { TrustTier } from '../services/ranking/trustLayer';

interface TrustBadgeProps {
    tier: TrustTier;
    score?: number;
    showScore?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const TIER_CONFIG = {
    new: {
        label: 'Nuevo',
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-400',
        borderColor: 'border-gray-500/20',
        icon: null,
    },
    basic: {
        label: 'Básico',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/20',
        icon: null,
    },
    verified: {
        label: 'Verificado',
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-400',
        borderColor: 'border-green-500/20',
        icon: 'verified',
    },
    expert: {
        label: 'Experto',
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500/20',
        icon: 'workspace_premium',
    },
    elite: {
        label: 'Élite',
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-400',
        borderColor: 'border-yellow-500/20',
        icon: 'workspace_premium',
    },
};

const SIZE_CONFIG = {
    sm: {
        container: 'px-1.5 py-0.5',
        text: 'text-[7px]',
        icon: 'text-[9px]',
        gap: 'gap-0.5',
    },
    md: {
        container: 'px-2 py-1',
        text: 'text-[8px]',
        icon: 'text-[10px]',
        gap: 'gap-1',
    },
    lg: {
        container: 'px-2.5 py-1',
        text: 'text-[9px]',
        icon: 'text-[12px]',
        gap: 'gap-1',
    },
};

export const TrustBadge: React.FC<TrustBadgeProps> = memo(({
    tier,
    score,
    showScore = false,
    size = 'sm',
}) => {
    const config = TIER_CONFIG[tier];
    const sizeConfig = SIZE_CONFIG[size];

    if (tier === 'new' || tier === 'basic') {
        return null;
    }

    return (
        <span
            className={`inline-flex items-center ${sizeConfig.gap} ${config.bgColor} ${config.borderColor} border rounded ${sizeConfig.container} font-black uppercase tracking-widest ${config.textColor}`}
        >
            {config.icon && (
                <span className={`material-symbols-outlined ${sizeConfig.icon}`}>
                    {config.icon}
                </span>
            )}
            <span className={sizeConfig.text}>
                {config.label}
            </span>
            {showScore && score !== undefined && (
                <span className={`${sizeConfig.text} opacity-70 ml-0.5`}>
                    {score}
                </span>
            )}
        </span>
    );
});

TrustBadge.displayName = 'TrustBadge';

interface BoostBadgeProps {
    reason?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const BoostBadge: React.FC<BoostBadgeProps> = memo(({
    reason,
    size = 'sm',
}) => {
    const sizeConfig = SIZE_CONFIG[size];

    return (
        <span
            className={`inline-flex items-center gap-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded ${sizeConfig.container} font-black uppercase tracking-widest ${sizeConfig.text}`}
            title={reason}
        >
            <span className={`material-symbols-outlined ${sizeConfig.icon}`}>
                rocket_launch
            </span>
            <span>Boost</span>
        </span>
    );
});

BoostBadge.displayName = 'BoostBadge';

interface QualityIndicatorProps {
    score: number;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const QualityIndicator: React.FC<QualityIndicatorProps> = memo(({
    score,
    showLabel = false,
    size = 'sm',
}) => {
    const sizeConfig = SIZE_CONFIG[size];

    const getColor = () => {
        if (score >= 70) return { bg: 'bg-signal-green', text: 'text-signal-green' };
        if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-500' };
        return { bg: 'bg-gray-500', text: 'text-gray-400' };
    };

    const color = getColor();

    return (
        <div className={`inline-flex items-center ${sizeConfig.gap}`} title={`Calidad: ${score}`}>
            <div className={`w-8 h-1.5 rounded-full bg-gray-700 overflow-hidden`}>
                <div
                    className={`h-full rounded-full transition-all ${color.bg}`}
                    style={{ width: `${Math.min(100, score)}%` }}
                />
            </div>
            {showLabel && (
                <span className={`${sizeConfig.text} ${color.text} font-bold`}>
                    {score}
                </span>
            )}
        </div>
    );
});

QualityIndicator.displayName = 'QualityIndicator';

export default TrustBadge;
