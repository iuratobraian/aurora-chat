import React, { memo, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Usuario } from '../../types';
import { getMaxPrivateCommunities, isFeatureEnabled } from '../../../lib/features';
import CreatePostInline from '../../components/CreatePostInline';

interface CreatePostModalProps {
    isOpen: boolean;
    usuario: Usuario | null;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = memo(({
    isOpen,
    usuario,
    onClose,
    onSubmit,
}) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in-95 fade-in duration-300"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-2xl bg-[#0f1115] border border-primary/50 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.2)] relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl text-primary">edit</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-wide">Nueva Publicación</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Comparte tu análisis</p>
                        </div>
                    </div>
                    <CreatePostInline usuario={usuario!} onSubmit={onSubmit} />
                </div>
            </div>
        </div>
    );
});

interface CreateCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    usuario: Usuario | null;
    onLoginRequest?: () => void;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = memo(({
    isOpen,
    onClose,
    usuario,
    onLoginRequest,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
    const [plan, setPlan] = useState<'free' | 'starter' | 'growth' | 'scale' | 'enterprise'>('starter');
    const [priceMonthly, setPriceMonthly] = useState(50);
    const [maxMembers, setMaxMembers] = useState(999999);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [slugPreview, setSlugPreview] = useState('');

    const createCommunity = useMutation(api.communities.createCommunity);
    const isPaidPlan = plan !== 'free';

    if (!isOpen) return null;

    const handleNameChange = (value: string) => {
        setName(value);
        setSlugPreview(slugify(value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuario || usuario.id === 'guest') {
            if (onLoginRequest) {
                onClose();
                onLoginRequest();
            } else {
                setError('Debes iniciar sesión para crear una comunidad');
            }
            return;
        }
        if (!name.trim()) {
            setError('El nombre es obligatorio');
            return;
        }
        if (!description.trim()) {
            setError('La descripción es obligatoria');
            return;
        }

        const slug = slugPreview || slugify(name);
        if (!slug) {
            setError('El nombre debe tener al menos 2 caracteres');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const isPaid = plan !== 'free';
            if (isPaid && !isFeatureEnabled('private_communities', usuario.plan as 'free' | 'pro' | 'elite')) {
                setError('Necesitas un plan Pro o superior para crear comunidades premium');
                setLoading(false);
                return;
            }
            await createCommunity({
                ownerId: usuario.id,
                name: name.trim(),
                slug,
                description: description.trim(),
                visibility,
                accessType: isPaid ? 'paid' : 'free',
                priceMonthly: isPaid ? priceMonthly : 0,
                maxMembers,
                plan,
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setName('');
                setDescription('');
                setVisibility('public');
                setPlan('starter');
                setPriceMonthly(50);
                setMaxMembers(999999);
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Error al crear la comunidad');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in-95 fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-[#0f1115] border border-violet-500/30 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.2)] relative overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl text-violet-400">groups</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-wide">Crear Comunidad</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Construye tu propia comunidad</p>
                        </div>
                    </div>

                    {success ? (
                        <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-300">
                            <span className="material-symbols-outlined text-6xl text-green-400 mb-4 block">check_circle</span>
                            <h3 className="text-xl font-black text-white mb-2">¡Comunidad creada!</h3>
                            <p className="text-gray-400 text-sm">Tu comunidad está lista para recibir miembros.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                    Nombre de la comunidad *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => handleNameChange(e.target.value)}
                                    placeholder="Ej: Traders de Forex"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-violet-500/50 outline-none transition-all"
                                    maxLength={60}
                                    required
                                />
                                {slugPreview && (
                                    <p className="mt-1 text-[10px] text-gray-500">
                                        URL: <span className="text-violet-400 font-mono">/comunidad/{slugPreview}</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                    Descripción *
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Describe tu comunidad..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-violet-500/50 outline-none transition-all resize-none"
                                    rows={3}
                                    maxLength={300}
                                    required
                                />
                                <p className="mt-1 text-[10px] text-gray-600 text-right">{description.length}/300</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                    Plan
                                </label>
                                <select
                                    value={plan}
                                    onChange={e => setPlan(e.target.value as any)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                                >
                                    <option value="free">Free</option>
                                    <option value="starter">Starter</option>
                                    <option value="growth">Growth</option>
                                    <option value="scale">Scale</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                    Visibilidad
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['public', 'unlisted', 'private'] as const).map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => setVisibility(v)}
                                            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                                visibility === v
                                                    ? 'bg-violet-500/20 border-violet-500/50 text-violet-400'
                                                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                                            }`}
                                        >
                                            {v === 'public' ? 'Pública' : v === 'unlisted' ? 'No listada' : 'Privada'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                    Precio mensual (USD)
                                </label>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-500 text-sm">$</span>
                                    <input
                                        type="number"
                                        value={isPaidPlan ? priceMonthly : 0}
                                        onChange={e => isPaidPlan && setPriceMonthly(Number(e.target.value))}
                                        min={0}
                                        max={1000}
                                        step={1}
                                        disabled={!isPaidPlan}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none disabled:opacity-40"
                                    />
                                    <span className="text-gray-500 text-sm">/ mes</span>
                                </div>
                                {!isPaidPlan && (
                                    <p className="mt-1 text-[10px] text-amber-400/70">
                                        Upgrade a Starter+ para cobrar membresías
                                    </p>
                                )}
                                {isPaidPlan && (
                                    <p className="mt-1 text-[10px] text-gray-600">
                                        La plataforma retiene 20% de cada suscripción
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !name.trim() || !description.trim()}
                                    className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">add</span>
                                            Crear Comunidad
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
});
