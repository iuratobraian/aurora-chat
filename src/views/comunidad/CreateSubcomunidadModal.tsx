import React, { memo, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface CreateSubcomunidadModalProps {
    isOpen: boolean;
    onClose: () => void;
    parentCommunityId: string;
    parentCommunitySlug: string;
    ownerId: string;
    onSuccess?: () => void;
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

const SUB_TYPES = [
    { 
        id: 'general', 
        label: 'General', 
        icon: 'groups',
        description: 'Grupo de discussion general para la comunidad'
    },
    { 
        id: 'support', 
        label: 'Soporte', 
        icon: 'support_agent',
        description: 'Grupo para recibir ayuda y soporte especializado'
    },
    { 
        id: 'help', 
        label: 'Preguntas', 
        icon: 'help',
        description: 'Espacio para hacer preguntas y recibir respuestas'
    },
    { 
        id: 'group', 
        label: 'Grupo de Estudio', 
        icon: 'school',
        description: 'Grupo para aprender y compartir conocimiento'
    },
    { 
        id: 'courses', 
        label: 'Cursos', 
        icon: 'menu_book',
        description: 'Sección privada de cursos para la comunidad'
    },
];

export const CreateSubcomunidadModal: React.FC<CreateSubcomunidadModalProps> = memo(({
    isOpen,
    onClose,
    parentCommunityId,
    parentCommunitySlug,
    ownerId,
    onSuccess,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'general' | 'support' | 'help' | 'group' | 'courses'>('general');
    const [visibility, setVisibility] = useState<'public' | 'private' | 'invite_only'>('private');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [slugPreview, setSlugPreview] = useState('');

    const createSubcommunity = useMutation(api.subcommunities.createSubcommunity);

    if (!isOpen) return null;

    const handleNameChange = (value: string) => {
        setName(value);
        setSlugPreview(slugify(value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            await createSubcommunity({
                parentId: parentCommunityId as any,
                ownerId,
                name: name.trim(),
                slug,
                description: description.trim(),
                type,
                visibility,
                accessType: 'free',
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setName('');
                setDescription('');
                setType('general');
                setVisibility('private');
                if (onSuccess) onSuccess();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Error al crear la subcomunidad');
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
                className="w-full max-w-lg bg-[#0f1115] border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20">
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl text-purple-400">add_circle</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Nueva Subcomunidad</h2>
                            <p className="text-xs text-gray-500">Crea un espacio dentro de la comunidad</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Tipo de subcomunidad
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {SUB_TYPES.map((subType) => (
                                    <button
                                        key={subType.id}
                                        type="button"
                                        onClick={() => setType(subType.id as any)}
                                        className={`p-3 rounded-xl border transition-all text-left ${
                                            type === subType.id
                                                ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="material-symbols-outlined text-lg">
                                                {subType.icon}
                                            </span>
                                            <span className="font-medium text-sm">{subType.label}</span>
                                        </div>
                                        <p className="text-xs opacity-70">{subType.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Nombre
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Ej: Trading Avanzado"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                            />
                            {slugPreview && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Slug: /comunidad/{parentCommunitySlug}/{slugPreview}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Descripción
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe el propósito de esta subcomunidad..."
                                rows={3}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Visibilidad
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setVisibility('public')}
                                    className={`flex-1 p-3 rounded-xl border transition-all ${
                                        visibility === 'public'
                                            ? 'bg-green-500/20 border-green-500/50 text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                    }`}
                                >
                                    <span className="material-symbols-outlined block mb-1">public</span>
                                    <span className="text-sm font-medium">Público</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVisibility('private')}
                                    className={`flex-1 p-3 rounded-xl border transition-all ${
                                        visibility === 'private'
                                            ? 'bg-blue-500/20 border-blue-500/50 text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                    }`}
                                >
                                    <span className="material-symbols-outlined block mb-1">lock</span>
                                    <span className="text-sm font-medium">Privado</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVisibility('invite_only')}
                                    className={`flex-1 p-3 rounded-xl border transition-all ${
                                        visibility === 'invite_only'
                                            ? 'bg-amber-500/20 border-amber-500/50 text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                    }`}
                                >
                                    <span className="material-symbols-outlined block mb-1">person_add</span>
                                    <span className="text-sm font-medium">Solo invitación</span>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || success}
                            className={`w-full py-3 rounded-xl font-medium transition-all ${
                                success
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : loading
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/25'
                            }`}
                        >
                            {loading ? 'Creando...' : success ? '¡Creada!' : 'Crear subcomunidad'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
});

export default CreateSubcomunidadModal;
