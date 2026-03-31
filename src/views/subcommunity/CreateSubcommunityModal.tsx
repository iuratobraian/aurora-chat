import React, { useState, useCallback, useEffect, memo } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface Props {
  parentId: string;
  ownerId: string;
  onClose: () => void;
  onCreate: () => void;
}

const CreateSubcommunityModal: React.FC<Props> = ({ parentId, ownerId, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'invite_only'>('private');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const createSub = useMutation(api.subcommunities.createSubcommunity);
  const canCreate = useQuery(api.communityPlans.canCreateSubcommunity, {
    communityId: parentId as any,
    userId: ownerId,
  });

  useEffect(() => {
    if (!name) { setSlug(''); return; }
    const generated = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40);
    setSlug(generated);
  }, [name]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) { setError('El nombre es obligatorio'); return; }
    if (!slug.trim()) { setError('El slug es obligatorio'); return; }
    if (!description.trim()) { setError('La descripción es obligatoria'); return; }
    setError('');
    setSubmitting(true);
    try {
      await createSub({
        parentId: parentId as any,
        ownerId,
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        visibility,
      });
      onCreate();
    } catch (e: any) {
      setError(e.message || 'Error al crear subcomunidad');
      setSubmitting(false);
    }
  }, [name, slug, description, visibility, parentId, ownerId, createSub, onCreate]);

  const remaining = canCreate?.allowed
    ? canCreate.limits.maxSubcommunities - canCreate.currentCount
    : 0;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in zoom-in-95 fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0a0c10] border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl shadow-primary/10 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-500/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20 size-8 flex items-center justify-center rounded-lg hover:bg-white/5"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-gradient-to-br from-primary/30 to-violet-600/20 border border-primary/40 flex items-center justify-center shadow-lg shadow-primary/10">
              <span className="material-symbols-outlined text-2xl text-primary">add_circle</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide">Crear Subcomunidad</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Espacio exclusivo para tu comunidad</p>
            </div>
          </div>

          {/* Plan info */}
          {canCreate?.allowed ? (
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
              <div className="size-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400 text-lg">verified</span>
              </div>
              <div>
                <span className="text-xs text-emerald-400 font-bold">
                  Puedes crear <span className="text-white font-black">{remaining}</span> subcomunidad{remaining !== 1 ? 'es' : ''} más
                </span>
              </div>
            </div>
          ) : canCreate ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
              <div className="size-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400 text-lg">block</span>
              </div>
              <span className="text-xs text-red-400 font-bold">{canCreate.reason}</span>
            </div>
          ) : null}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
              <div className="size-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400 text-lg">error</span>
              </div>
              <span className="text-xs text-red-400 font-bold">{error}</span>
            </div>
          )}

          {/* Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nombre de la subcomunidad</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Trading Avanzado, Psicotrading, Señales"
                maxLength={60}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">URL única (slug)</label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-primary/50 focus-within:bg-white/[0.07] transition-all">
                <span className="px-3 text-xs text-gray-600 font-bold whitespace-nowrap border-r border-white/5">/c/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="trading-avanzado"
                  maxLength={40}
                  className="flex-1 bg-transparent py-3 px-3 text-sm text-white placeholder-gray-600 outline-none"
                />
              </div>
              <p className="text-[9px] text-gray-600 mt-1.5">Generado automáticamente desde el nombre</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Descripción</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe el propósito y contenido exclusivo de tu subcomunidad..."
                maxLength={300}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-colors resize-none"
              />
              <p className="text-[9px] text-gray-600 mt-1.5">{description.length}/300 caracteres</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Visibilidad</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'private' as const, label: 'Privada', desc: 'Solo invitados', icon: 'lock' },
                  { value: 'invite_only' as const, label: 'Solo Invitación', desc: 'Visible para todos', icon: 'mail' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setVisibility(opt.value)}
                    className={`relative p-4 rounded-xl border transition-all text-left ${
                      visibility === opt.value
                        ? 'bg-gradient-to-br from-primary/20 to-violet-500/10 border-primary/40 shadow-lg shadow-primary/10'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`size-8 rounded-lg flex items-center justify-center mb-2 ${
                      visibility === opt.value ? 'bg-primary/20' : 'bg-white/5'
                    }`}>
                      <span className={`material-symbols-outlined text-lg ${visibility === opt.value ? 'text-primary' : 'text-gray-400'}`}>{opt.icon}</span>
                    </div>
                    <p className={`text-xs font-bold ${visibility === opt.value ? 'text-white' : 'text-gray-300'}`}>{opt.label}</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">{opt.desc}</p>
                    {visibility === opt.value && (
                      <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px] text-white">check</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !canCreate?.allowed || !name.trim() || !slug.trim() || !description.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Creando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">add</span>
                  Crear Subcomunidad
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(CreateSubcommunityModal);
