import React from 'react';

interface VerificationBadgeProps {
    level: 'none' | 'basic' | 'intermediate' | 'advanced' | 'institutional';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function VerificationBadge({ 
    level, 
    size = 'md',
    showLabel = false 
}: VerificationBadgeProps) {
    if (level === 'none') return null;

    const config = {
        none: { icon: null, color: 'gray', label: '' },
        basic: { icon: '✓', color: 'blue', label: 'Verificado' },
        intermediate: { icon: '🏛️', color: 'purple', label: 'KYC' },
        advanced: { icon: '🏅', color: 'yellow', label: 'Trader Verificado' },
        institutional: { icon: '🏛️', color: 'amber', label: 'Institucional' },
    };

    const { icon, color, label } = config[level];
    
    const sizeClasses = {
        sm: 'text-xs px-1.5 py-0.5',
        md: 'text-sm px-2 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    const colorClasses = {
        gray: 'bg-gray-600/30 text-gray-400 border-gray-500',
        blue: 'bg-blue-600/30 text-blue-400 border-blue-500',
        purple: 'bg-purple-600/30 text-purple-400 border-purple-500',
        yellow: 'bg-yellow-600/30 text-yellow-400 border-yellow-500',
        amber: 'bg-amber-600/30 text-amber-400 border-amber-500',
    };

    return (
        <span className={`
            inline-flex items-center gap-1 rounded-full font-medium border
            ${sizeClasses[size]} ${colorClasses[color]}
        `}>
            {icon && <span>{icon}</span>}
            {showLabel && <span>{label}</span>}
        </span>
    );
}
