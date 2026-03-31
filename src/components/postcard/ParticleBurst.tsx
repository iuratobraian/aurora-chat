import React, { memo, useMemo } from 'react';

interface ParticleBurstProps {
    count?: number;
    colors?: string[];
}

export const ParticleBurst: React.FC<ParticleBurstProps> = memo(({ count = 12, colors = ['#3b82f6', '#a78bfa', '#06b6d4', '#f59e0b', '#10b981'] }) => {
    const particles = useMemo(() => Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * 360;
        const distance = 40 + Math.random() * 40;
        const tx = Math.cos((angle * Math.PI) / 180) * distance;
        const ty = Math.sin((angle * Math.PI) / 180) * distance;
        const color = colors[i % colors.length];
        const size = 4 + Math.random() * 6;
        return { tx, ty, color, size, delay: Math.random() * 0.2 };
    }), [count, colors]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
            {particles.map((p, i) => (
                <div
                    key={i}
                    className="post-particle"
                    style={{
                        '--tx': `${p.tx}px`,
                        '--ty': `${p.ty}px`,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        top: '50%',
                        left: '50%',
                        marginTop: -p.size / 2,
                        marginLeft: -p.size / 2,
                        animationDelay: `${p.delay}s`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
});

export default ParticleBurst;