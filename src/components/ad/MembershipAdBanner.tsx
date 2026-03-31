import React, { memo, useState, useEffect } from 'react';

interface MembershipAdBannerProps {
    maxShowInterval?: number; // Cada cuántos posts máximo
    cooldownMs?: number; // Tiempo mínimo entre shows
}

const MEMBERSHIP_PLANS = [
    {
        name: 'Pro',
        price: '$4.99',
        period: '/mes',
        color: 'from-blue-500 to-cyan-400',
        features: ['Señales en vivo', 'EA Robots', 'Academy completa'],
        highlight: false,
    },
    {
        name: 'Elite',
        price: '$9.99',
        period: '/mes',
        color: 'from-amber-500 to-orange-500',
        features: ['Todo Pro +', 'Mentoring 1:1', 'API Access'],
        highlight: true,
    },
    {
        name: 'VIP',
        price: '$24.99',
        period: '/mes',
        color: 'from-purple-600 to-pink-500',
        features: ['Todo Elite +', 'Copy Trading', 'Soporte prioritario'],
        highlight: false,
    },
];

export const MembershipAdBanner: React.FC<MembershipAdBannerProps> = memo(({
    maxShowInterval = 8,
    cooldownMs = 300000, // 5 minutos
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [canShow, setCanShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(1); // Elite por defecto

    useEffect(() => {
        const lastShown = localStorage.getItem('membership_ad_last_shown');
        const now = Date.now();
        
        if (lastShown && now - parseInt(lastShown) < cooldownMs) {
            setCanShow(false);
        } else {
            setCanShow(true);
        }
    }, [cooldownMs]);

    const shouldShow = (postIndex: number) => {
        if (!canShow || dismissed) return false;
        if (postIndex === 0) return false;
        return postIndex % maxShowInterval === 0;
    };

    const showBanner = () => {
        setIsVisible(true);
        localStorage.setItem('membership_ad_last_shown', Date.now().toString());
    };

    const dismiss = () => {
        setIsVisible(false);
        setDismissed(true);
        localStorage.setItem('membership_ad_last_shown', Date.now().toString());
    };

    if (!isVisible) return null;

    const plan = MEMBERSHIP_PLANS[selectedPlan];

    return (
        <div className="relative rounded-2xl overflow-hidden border border-white/10 my-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black/60 to-amber-900/40" />
            <div className="absolute inset-0 stadium-scanlines opacity-30" />
            
            {/* Glow Effect */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${plan.color} opacity-20 blur-3xl animate-pulse`} />
            
            <div className="relative p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`size-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                            <span className="material-symbols-outlined text-white text-xl">workspace_premium</span>
                        </div>
                        <div>
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Publicidad</p>
                            <h3 className="text-lg font-black text-white">Mejora tu experiencia</h3>
                        </div>
                    </div>
                    <button
                        onClick={dismiss}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-500 hover:text-white"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Plan Selector */}
                <div className="flex gap-2 mb-4">
                    {MEMBERSHIP_PLANS.map((p, i) => (
                        <button
                            key={p.name}
                            onClick={() => setSelectedPlan(i)}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                                selectedPlan === i
                                    ? `bg-gradient-to-r ${p.color} text-white shadow-lg`
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>

                {/* Plan Details */}
                <div className="flex items-end gap-4 mb-4">
                    <div>
                        <p className="text-3xl font-black text-white">
                            {plan.price}
                            <span className="text-sm font-normal text-gray-500">{plan.period}</span>
                        </p>
                    </div>
                    <div className="flex-1">
                        <ul className="space-y-1">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-1.5 text-xs text-gray-300">
                                    <span className="material-symbols-outlined text-xs text-green-400">check_circle</span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* CTA */}
                <a
                    href="#/pricing"
                    className={`w-full py-3 rounded-xl bg-gradient-to-r ${plan.color} text-white text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg`}
                >
                    <span>Comenzar ahora</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
            </div>

            {/* Progress Bar - Auto dismiss after 30s */}
            <MembershipProgressBar onComplete={dismiss} />

            <style>{`
                .stadium-scanlines {
                    background: repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        rgba(0, 0, 0, 0.1) 2px,
                        rgba(0, 0, 0, 0.1) 4px
                    );
                }
            `}</style>
        </div>
    );
});

const MembershipProgressBar: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const duration = 30000; // 30 seconds
        const interval = 100;
        const decrement = (100 / duration) * interval;

        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev - decrement;
                if (next <= 0) {
                    clearInterval(timer);
                    onComplete();
                    return 0;
                }
                return next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <div className="h-1 bg-white/10">
            <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

export default MembershipAdBanner;
