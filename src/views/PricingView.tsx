import React, { useState } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Usuario } from '../types';
import { useToast } from '../components/ToastProvider';
import logger from '../utils/logger';

interface PricingViewProps {
    usuario: Usuario | null;
    onLoginRequest?: () => void;
    onNavigate?: (tab: string) => void;
}

interface PlanFeature {
    text: string;
    included: boolean;
    tooltip?: string;
}

interface Plan {
    id: string;
    name: string;
    price: number;
    annualPrice: number;
    period: string;
    tagline: string;
    description: string;
    forWho: string;
    target: 'beginner' | 'intermediate' | 'advanced' | 'professional' | 'enterprise';
    features: PlanFeature[];
    popular?: boolean;
    recommended?: boolean;
    color: string;
    gradient: string;
    icon: string;
    cta: string;
    benefit: string;
    minDeposit?: string;
    maxDeposit?: string;
}

const plans: Plan[] = [
    {
        id: 'bronze',
        name: 'Bronze',
        price: 0,
        annualPrice: 0,
        period: 'mes',
        tagline: 'Gratis para siempre',
        description: 'Empieza tu viaje en el trading sin costo. Acceso a comunidad básica y herramientas esenciales.',
        forWho: 'Para quienes están comenzando y quieren explorar el mundo del trading sin invertir dinero.',
        target: 'beginner',
        minDeposit: '$0',
        maxDeposit: '$100',
        color: 'text-amber-700',
        gradient: 'from-amber-700/20 to-stone-800/20',
        icon: 'workspace_premium',
        cta: 'Comenzar Gratis',
        benefit: 'Cero riesgo, acceso inmediato',
        features: [
            { text: 'Feed público de comunidad', included: true },
            { text: '3 posts por día', included: true },
            { text: 'Market News diario', included: true },
            { text: 'Chat básico en vivo', included: true },
            { text: 'Acceso a contenido free', included: true },
            { text: 'Gráficos básicos', included: true },
            { text: 'Feed de señales premium', included: false },
            { text: 'IA Aurora Analytics', included: false },
            { text: 'Comunidades privadas', included: false },
            { text: 'Mentoring', included: false },
        ],
    },
    {
        id: 'silver',
        name: 'Silver',
        price: 4.99,
        annualPrice: 47.88,
        period: 'mes',
        tagline: 'El impulso que necesitas',
        description: 'Para traders en desarrollo que buscan mejorar sus habilidades con herramientas pro.',
        forWho: 'Ideal para quienes ya operan con cuentas pequeñas y quieren accelerator su crecimiento.',
        target: 'intermediate',
        minDeposit: '$100',
        maxDeposit: '$500',
        color: 'text-gray-300',
        gradient: 'from-gray-400/20 to-slate-600/20',
        icon: 'star',
        cta: 'Upgrade a Silver',
        benefit: 'Señales + herramientas = mejores decisiones',
        features: [
            { text: 'Todo en Bronze', included: true },
            { text: 'Posts ilimitados', included: true },
            { text: 'Feed de señales free', included: true },
            { text: 'Gráficos intermedios', included: true },
            { text: 'Calendario económico', included: true },
            { text: '1 comunidad privada', included: true },
            { text: 'IA Aurora básica', included: true },
            { text: 'Alertas de precio', included: true },
            { text: 'Market News premium', included: false },
            { text: 'Mentoring', included: false },
        ],
    },
    {
        id: 'gold',
        name: 'Gold',
        price: 9.99,
        annualPrice: 95.88,
        period: 'mes',
        tagline: 'El salto profesional',
        description: 'El plan más popular. Acceso completo a señales, IA avanzada y comunidades premium.',
        forWho: 'Para traders serios que operan con cuentas de tamaño medio y buscan ventaja competitiva.',
        target: 'advanced',
        minDeposit: '$500',
        maxDeposit: '$5,000',
        popular: true,
        color: 'text-yellow-400',
        gradient: 'from-yellow-500/20 to-amber-600/20',
        icon: 'workspace_premium',
        cta: 'Empezar con Gold',
        benefit: 'Señales + IA + Comunidad = Éxito',
        features: [
            { text: 'Todo en Silver', included: true },
            { text: 'Señales en tiempo real', included: true },
            { text: 'IA Aurora avanzada', included: true },
            { text: 'Gráficos TradingView Pro', included: true },
            { text: '5 comunidades privadas', included: true },
            { text: 'Market News premium', included: true },
            { text: 'Análisis de sentimiento', included: true },
            { text: 'Trading desde app', included: true },
            { text: 'Soporte prioritario', included: false },
            { text: 'Mentoring 1:1', included: false },
        ],
    },
    {
        id: 'platinum',
        name: 'Platinum',
        price: 24.99,
        annualPrice: 239.88,
        period: 'mes',
        tagline: 'Máximo rendimiento',
        description: 'Todo desbloqueado + mentoring + early access. Para traders que viven del mercado.',
        forWho: 'Para traders profesionales que operan cuentas grandes y necesitan la mejor información.',
        target: 'professional',
        minDeposit: '$5,000',
        maxDeposit: '$50,000',
        recommended: true,
        color: 'text-slate-300',
        gradient: 'from-slate-400/20 to-zinc-600/20',
        icon: 'diamond',
        cta: 'Ser Platinum',
        benefit: 'Mentoring + API + Early access = Dominio',
        features: [
            { text: 'Todo en Gold', included: true },
            { text: 'Señales premium en vivo', included: true },
            { text: 'IA Aurora con contexto', included: true },
            { text: 'Mentoring 1:1 mensual', included: true },
            { text: 'API Access para traders', included: true },
            { text: 'Comunidades ilimitadas', included: true },
            { text: 'Early access a features', included: true },
            { text: 'Reportes semanales', included: true },
            { text: 'Soporte 24/7', included: true },
            { text: 'Cuentas fondeadas', included: true },
        ],
    },
    {
        id: 'vip',
        name: 'VIP',
        price: 99.99,
        annualPrice: 959.88,
        period: 'mes',
        tagline: 'El club exclusivo',
        description: 'Experiencia premium total. Trading room privado, análisis institucional y concierge personal.',
        forWho: 'Para high rollers y traders institucionales que operan cuentas de $50K+.',
        target: 'enterprise',
        minDeposit: '$50,000',
        maxDeposit: 'Ilimitado',
        color: 'text-violet-300',
        gradient: 'from-violet-500/20 to-purple-600/20',
        icon: 'verified',
        cta: 'Acceder al VIP',
        benefit: 'Concierge + Room + Institucional = Élite',
        features: [
            { text: 'Todo en Platinum', included: true },
            { text: 'Trading room VIP privado', included: true },
            { text: 'Análisis institucional', included: true },
            { text: 'Concierge personal 24/7', included: true },
            { text: 'Prop firms mejoradas', included: true },
            { text: 'Signals con SL/TP exactos', included: true },
            { text: 'Portfolio management', included: true },
            { text: 'Risk management consulting', included: true },
            { text: 'Invitaciones a eventos', included: true },
            { text: 'Acceso directo a traders exitosos', included: true },
        ],
    },
];

const creatorPlans = [
    {
        id: 'creator_starter',
        name: 'Creator Starter',
        price: 19.99,
        annualPrice: 191.88,
        period: 'mes',
        tagline: 'Lanza tu comunidad',
        description: 'Crea y monetiza tu primera comunidad. Herramientas esenciales para comenzar.',
        forWho: 'Para traders y educators que quieren compartir conocimiento y generar ingresos.',
        color: 'text-emerald-400',
        gradient: 'from-emerald-500/20 to-teal-600/20',
        icon: 'groups',
        cta: 'Crear mi Comunidad',
        benefit: 'Tu conocimiento = ingresos pasivos',
        features: [
            { text: 'Comunidad monetizable', included: true },
            { text: 'Hasta 100 miembros', included: true },
            { text: 'Gestión básica de miembros', included: true },
            { text: 'Chat privado', included: true },
            { text: 'Contenido exclusivo', included: true },
            { text: 'Estadísticas básicas', included: true },
            { text: 'Comisión platform 15%', included: true },
            { text: 'Sin herramientas de acquisition', included: false },
            { text: 'API Access', included: false },
            { text: 'Soporte dedicado', included: false },
        ],
    },
    {
        id: 'creator_pro',
        name: 'Creator Pro',
        price: 49.99,
        annualPrice: 479.88,
        period: 'mes',
        tagline: 'Escala tu negocio',
        description: 'Herramientas completas para construir tu marca y escalar tu comunidad.',
        forWho: 'Para creators establecidos que quieren crecer exponencialmente.',
        popular: true,
        color: 'text-purple-400',
        gradient: 'from-purple-500/20 to-violet-600/20',
        icon: 'storefront',
        cta: 'Escalar con Pro',
        benefit: 'Growth tools + Analytics = Scale',
        features: [
            { text: 'Todo en Creator Starter', included: true },
            { text: 'Miembros ilimitados', included: true },
            { text: 'Estadísticas avanzadas', included: true },
            { text: 'Herramientas de acquisition', included: true },
            { text: 'Landing page personalizada', included: true },
            { text: 'Email marketing básico', included: true },
            { text: 'Comisión reducida 10%', included: true },
            { text: 'API Access', included: true },
            { text: 'Soporte prioritario', included: true },
            { text: 'White-label options', included: false },
        ],
    },
    {
        id: 'creator_enterprise',
        name: 'Creator Enterprise',
        price: 149.99,
        annualPrice: 1439.88,
        period: 'mes',
        tagline: 'El imperio del trading',
        description: 'Solución completa para construir tu ecosistema de trading. White-label + todo desbloqueado.',
        forWho: 'Para empresas y equipos que quieren su propia plataforma de trading community.',
        color: 'text-cyan-400',
        gradient: 'from-cyan-500/20 to-blue-600/20',
        icon: 'apartment',
        cta: 'Construir mi Imperio',
        benefit: 'White-label + Team + API = Imperio',
        features: [
            { text: 'Todo en Creator Pro', included: true },
            { text: 'White-label completo', included: true },
            { text: 'Team management', included: true },
            { text: 'Custom integrations', included: true },
            { text: 'Revenue share custom', included: true },
            { text: 'API completa', included: true },
            { text: 'Onboarding dedicado', included: true },
            { text: 'Account manager', included: true },
            { text: 'SLA garantizada', included: true },
            { text: 'Training para tu equipo', included: true },
        ],
    },
];

const PricingView: React.FC<PricingViewProps> = ({ usuario, onLoginRequest, onNavigate }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<'trader' | 'creator'>('trader');
    const { showToast } = useToast();

    const createCheckout = useMutation(api.payments.createCheckoutSession);
    const createPaymentPreference = useAction(api.paymentOrchestrator.createMercadoPagoPreference);

    const handleSubscribe = async (planId: string, price: number) => {
        if (!usuario || usuario.id === 'guest') {
            onLoginRequest?.();
            return;
        }
        
        if (price === 0) {
            showToast('success', '¡Ya tienes acceso gratuito!');
            return;
        }

        setLoadingPlan(planId);
        try {
            // Usar MercadoPago para suscripciones
            const planPrices: Record<string, { amount: number; name: string }> = {
                bronze: { amount: 0, name: 'Bronze' },
                silver: { amount: 4.99, name: 'Silver' },
                gold: { amount: 9.99, name: 'Gold' },
                platinum: { amount: 24.99, name: 'Platinum' },
                starter: { amount: 9.99, name: 'Starter' },
                growth: { amount: 24.99, name: 'Growth' },
                enterprise: { amount: 49.99, name: 'Enterprise' },
            };
            
            const planInfo = planPrices[planId] || { amount: price, name: planId };
            const description = `Suscripción TradePortal - ${planInfo.name}`;
            
            const result = await createPaymentPreference({
                userId: usuario.id,
                amount: planInfo.amount,
                description,
                plan: planId,
                email: usuario.email || '',
                paymentType: 'subscription',
                billingCycle: billingCycle === 'annual' ? 'yearly' : 'monthly',
            });

            if (result.init_point) {
                showToast('success', 'Redirigiendo al pago...');
                window.location.href = result.init_point;
            } else {
                throw new Error('Error al crear preferencia de pago');
            }
        } catch (e: any) {
            logger.error('Checkout error:', e);
            showToast('error', e.message || 'Error al procesar. Intenta de nuevo.');
        } finally {
            setLoadingPlan(null);
        }
    };

    const getPrice = (plan: Plan) => {
        return billingCycle === 'annual' ? plan.annualPrice : plan.price;
    };

    const formatPrice = (price: number) => {
        if (price === 0) return 'GRATIS';
        return `$${price.toFixed(2)}`;
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-black py-16">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
                </div>
                
                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full mb-6">
                        <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Planes para todos</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                        Elige tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Plan</span>
                    </h1>
                    
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                        Desde traders que empiezan con $0 hasta instituciones con cuentas de $100K+. 
                        Tenemos el plan perfecto para tu bolsillo y tus metas.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-3 p-1 bg-white/5 rounded-full border border-white/10">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                                billingCycle === 'monthly' 
                                    ? 'bg-primary text-white shadow-lg' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                                billingCycle === 'annual' 
                                    ? 'bg-emerald-500 text-white shadow-lg' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Anual
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full">-20%</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="sticky top-16 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex gap-1 py-2">
                        {[
                            { id: 'trader', label: 'Para Traders', icon: 'trending_up', desc: 'Planes por tamaño de cuenta' },
                            { id: 'creator', label: 'Para Creators', icon: 'storefront', desc: 'Monetiza tu conocimiento' },
                        ].map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id as any)}
                                className={`flex-1 py-4 px-6 rounded-xl transition-all flex items-center gap-3 ${
                                    activeCategory === cat.id
                                        ? 'bg-white/10 border border-white/20 text-white'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                                <div className="text-left">
                                    <p className="font-bold text-sm">{cat.label}</p>
                                    <p className="text-[10px] text-gray-500">{cat.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Trader Plans */}
                {activeCategory === 'trader' && (
                    <div className="space-y-8">
                        {/* Plan Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                                        plan.popular || plan.recommended
                                            ? 'ring-2 ring-primary shadow-2xl shadow-primary/20'
                                            : 'ring-1 ring-white/10'
                                    }`}
                                >
                                    {/* Popular Badge */}
                                    {(plan.popular || plan.recommended) && (
                                        <div className="absolute -top-0 left-0 right-0 bg-gradient-to-r from-primary to-purple-500 py-1.5 text-center z-20">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-white">
                                                {plan.popular ? '⭐ Más Popular' : '💎 Recomendado'}
                                            </span>
                                        </div>
                                    )}

                                    <div className={`h-full bg-gradient-to-br ${plan.gradient} p-6 ${(plan.popular || plan.recommended) ? 'pt-10' : ''}`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`size-12 rounded-xl bg-gradient-to-br ${plan.gradient} border border-white/10 flex items-center justify-center`}>
                                                <span className={`material-symbols-outlined text-2xl ${plan.color}`}>{plan.icon}</span>
                                            </div>
                                            <div>
                                                <h3 className={`font-black text-xl ${plan.color}`}>{plan.name}</h3>
                                                <p className="text-[10px] text-gray-500 uppercase">{plan.target}</p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black text-white">{formatPrice(getPrice(plan))}</span>
                                                {getPrice(plan) !== 0 && (
                                                    <span className="text-gray-500 text-sm">/{plan.period}</span>
                                                )}
                                            </div>
                                            {billingCycle === 'annual' && getPrice(plan) > 0 && (
                                                <p className="text-[10px] text-emerald-400 mt-1">
                                                    Ahorras ${((plan.price * 12) - plan.annualPrice).toFixed(2)}/año
                                                </p>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-400 mb-4 line-clamp-2">{plan.tagline}</p>

                                        {/* Account Size Indicator */}
                                        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-4 px-3 py-2 bg-black/20 rounded-lg">
                                            <span>Tu cuenta:</span>
                                            <span className="text-white font-bold">{plan.minDeposit} - {plan.maxDeposit}</span>
                                        </div>

                                        <ul className="space-y-2 mb-6">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className={`flex items-start gap-2 text-xs ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    <span className={`material-symbols-outlined text-lg ${
                                                        feature.included ? 'text-emerald-400' : 'text-gray-700'
                                                    }`}>
                                                        {feature.included ? 'check_circle' : 'cancel'}
                                                    </span>
                                                    {feature.text}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleSubscribe(plan.id, getPrice(plan))}
                                            disabled={loadingPlan === plan.id}
                                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                                                plan.popular || plan.recommended
                                                    ? 'bg-gradient-to-r from-primary to-purple-500 text-white hover:opacity-90 shadow-lg shadow-primary/30'
                                                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                            } ${loadingPlan === plan.id ? 'opacity-50 cursor-wait' : ''}`}
                                        >
                                            {loadingPlan === plan.id ? 'Procesando...' : plan.cta}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Comparison Table */}
                        <div className="mt-16">
                            <h2 className="text-2xl font-black text-white text-center mb-8">Comparación Detallada</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full rounded-2xl overflow-hidden">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase">Característica</th>
                                            {plans.map(plan => (
                                                <th key={plan.id} className={`p-4 text-center ${plan.color}`}>
                                                    <span className="text-lg font-black">{plan.name}</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { name: 'Posts por día', values: ['3', 'Ilimitados', 'Ilimitados', 'Ilimitados', 'Ilimitados'] },
                                            { name: 'Señales', values: ['Free only', 'Free', 'Tiempo real', 'Premium', 'VIP + exactas'] },
                                            { name: 'IA Aurora', values: ['❌', 'Básica', 'Avanzada', 'Contexto', 'Institucional'] },
                                            { name: 'Comunidades privadas', values: ['❌', '1', '5', 'Ilimitadas', 'Ilimitadas'] },
                                            { name: 'Gráficos', values: ['Básicos', 'Intermedios', 'TradingView Pro', 'TradingView Pro+', 'TradingView Elite'] },
                                            { name: 'Mentoring', values: ['❌', '❌', '❌', '1:1 mensual', 'Ilimitado'] },
                                            { name: 'API Access', values: ['❌', '❌', '❌', '✅', 'Completa'] },
                                            { name: 'Soporte', values: ['Comunidad', 'Email', 'Prioritario', '24/7', 'Concierge'] },
                                        ].map((row, i) => (
                                            <tr key={i} className="bg-black/20 hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-sm text-gray-400">{row.name}</td>
                                                {row.values.map((val, j) => (
                                                    <td key={j} className="p-4 text-center text-sm font-medium text-white">
                                                        {val}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Creator Plans */}
                {activeCategory === 'creator' && (
                    <div className="space-y-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-black text-white mb-4">Planes para Creators</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Monetiza tu conocimiento y construye tu comunidad de trading. 
                                Desde freelancers hasta empresas de trading education.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {creatorPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                                        plan.popular ? 'ring-2 ring-purple-500 shadow-2xl shadow-purple-500/20' : 'ring-1 ring-white/10'
                                    }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 py-1.5 text-center z-20">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-white">⭐ Más Popular</span>
                                        </div>
                                    )}

                                    <div className={`h-full bg-gradient-to-br ${plan.gradient} p-8 ${plan.popular ? 'pt-12' : ''}`}>
                                        <div className="size-16 rounded-2xl bg-black/20 flex items-center justify-center mb-6">
                                            <span className={`material-symbols-outlined text-4xl ${plan.color}`}>{plan.icon}</span>
                                        </div>

                                        <h3 className={`text-2xl font-black ${plan.color} mb-2`}>{plan.name}</h3>
                                        <p className="text-sm text-gray-400 mb-6">{plan.tagline}</p>

                                        <div className="mb-6">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-5xl font-black text-white">${getPrice(plan as any).toFixed(2)}</span>
                                                <span className="text-gray-500">/{(plan as any).period}</span>
                                            </div>
                                            {billingCycle === 'annual' && (
                                                <p className="text-emerald-400 text-sm mt-2">
                                                    ${((plan as any).price * 12 - (plan as any).annualPrice).toFixed(2)} ahorrados/año
                                                </p>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-300 mb-6">{plan.description}</p>

                                        <ul className="space-y-3 mb-8">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm">
                                                    <span className={`material-symbols-outlined text-lg ${feature.included ? 'text-emerald-400' : 'text-gray-700'}`}>
                                                        {feature.included ? 'check_circle' : 'cancel'}
                                                    </span>
                                                    <span className={feature.included ? 'text-gray-200' : 'text-gray-600'}>
                                                        {feature.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleSubscribe(plan.id, getPrice(plan as any))}
                                            className={`w-full py-4 rounded-xl font-bold transition-all ${
                                                plan.popular
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                            }`}
                                        >
                                            {plan.cta}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Creator Benefits */}
                        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20">
                            <h3 className="text-xl font-black text-white mb-6 text-center">¿Por qué monetizar con nosotros?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { icon: 'payments', title: 'Pagos seguros', desc: 'Procesamos pagos con Stripe y MercadoPago' },
                                    { icon: 'analytics', title: 'Analytics completas', desc: 'Métricas de engagement y revenue' },
                                    { icon: 'campaign', title: 'Growth tools', desc: 'Landing pages y email marketing' },
                                    { icon: 'support_agent', title: 'Soporte dedicado', desc: 'Te ayudamos a escalar tu negocio' },
                                ].map((benefit, i) => (
                                    <div key={i} className="text-center">
                                        <div className="size-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                                            <span className="material-symbols-outlined text-3xl text-purple-400">{benefit.icon}</span>
                                        </div>
                                        <h4 className="font-bold text-white mb-1">{benefit.title}</h4>
                                        <p className="text-xs text-gray-400">{benefit.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto px-4 py-16">
                <h2 className="text-2xl font-black text-white text-center mb-8">Preguntas Frecuentes</h2>
                <div className="space-y-4">
                    {[
                        { q: '¿Puedo cambiar de plan?', a: 'Sí, puedes actualizar o downgradear tu plan en cualquier momento. Los cambios se aplican al siguiente ciclo de facturación.' },
                        { q: '¿Hay período de prueba?', a: 'Sí, todos los planes de pago tienen 7 días de garantía de devolución. Si no estás satisfecho, te devolvemos el dinero.' },
                        { q: '¿Cómo funcionan los precios anuales?', a: 'El precio anual es un prepago de 12 meses con un 20% de descuento. Se cobra automáticamente cada año.' },
                        { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos tarjeta de crédito/débito (Visa, Mastercard, Amex), PayPal, MercadoPago, y transferencia bancaria para planes enterprise.' },
                        { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí, puedes cancelar tu suscripción en cualquier momento. Mantienes acceso hasta el final del período pagado.' },
                    ].map((faq, i) => (
                        <details key={i} className="group rounded-xl bg-white/5 border border-white/10">
                            <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                                <span className="font-bold text-white">{faq.q}</span>
                                <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div className="px-4 pb-4 text-sm text-gray-400">
                                {faq.a}
                            </div>
                        </details>
                    ))}
                </div>
            </div>

            {/* CTA Final */}
            <div className="max-w-4xl mx-auto px-4 pb-20">
                <div className="text-center p-12 rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/10 border border-primary/20">
                    <h2 className="text-3xl font-black text-white mb-4">¿Listo para comenzar?</h2>
                    <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                        Únete a miles de traders que ya están mejorando sus resultados con TradeHub.
                    </p>
                    <button
                        onClick={() => usuario?.id === 'guest' ? onLoginRequest?.() : onNavigate?.('comunidad')}
                        className="px-8 py-4 bg-gradient-to-r from-primary to-purple-500 text-white font-black rounded-xl text-lg shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                    >
                        {usuario?.id === 'guest' ? 'Crear Cuenta Gratis' : 'Explorar Gratis'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PricingView;
