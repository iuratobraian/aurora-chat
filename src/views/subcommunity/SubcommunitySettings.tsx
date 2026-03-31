import React, { useState, useCallback, memo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface Props {
  subcommunityId: string;
  communityId: string;
  userId: string;
  subcommunity: any;
}

const AD_TYPES = [
  { value: "feed", label: "Feed", icon: "dynamic_feed" },
  { value: "sidebar", label: "Sidebar", icon: "right_panel_open" },
  { value: "banner", label: "Banner", icon: "ad_group" },
];

const SubcommunitySettings: React.FC<Props> = ({ subcommunityId, communityId, userId, subcommunity }) => {
  const [name, setName] = useState(subcommunity?.name ?? '');
  const [description, setDescription] = useState(subcommunity?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const planSettings = useQuery(api.communityPlans.getPlanSettings, { communityId: communityId as any });
  const updateSub = useMutation(api.subcommunities.updateSubcommunity);
  const toggleAdsMut = useMutation(api.communityPlans.toggleAds);
  const setAdFreq = useMutation(api.communityPlans.setAdFrequency);
  const setAdTypes = useMutation(api.communityPlans.setAllowedAdTypes);
  const deleteSub = useMutation(api.subcommunities.deleteSubcommunity);

  const plan = subcommunity?.plan || 'free';
  const isFreePlan = plan === 'free';
  const canDisableAds = planSettings?.canDisableAds ?? false;

  const handleSaveInfo = useCallback(async () => {
    if (!name.trim()) { setError('El nombre es obligatorio'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await updateSub({
        subcommunityId: subcommunityId as any,
        userId,
        name: name.trim(),
        description: description.trim(),
      });
      setSuccess('Información actualizada');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }, [name, description, subcommunityId, userId, updateSub]);

  const handleToggleAds = useCallback(async (enabled: boolean) => {
    setError('');
    try {
      await toggleAdsMut({
        communityId: communityId as any,
        subcommunityId: subcommunityId as any,
        userId,
        enabled,
      });
    } catch (e: any) {
      setError(e.message || 'Error al cambiar publicidad');
    }
  }, [communityId, subcommunityId, userId, toggleAdsMut]);

  const handleFrequency = useCallback(async (freq: number) => {
    try {
      await setAdFreq({ subcommunityId: subcommunityId as any, userId, frequency: freq });
    } catch { /* no-op */ }
  }, [subcommunityId, userId, setAdFreq]);

  const handleAdTypes = useCallback(async (types: string[]) => {
    try {
      await setAdTypes({ subcommunityId: subcommunityId as any, userId, types });
    } catch { /* no-op */ }
  }, [subcommunityId, userId, setAdTypes]);

  const handleToggleTv = useCallback(async (enabled: boolean) => {
    setError('');
    try {
      await updateSub({ subcommunityId: subcommunityId as any, userId, tvEnabled: enabled });
    } catch (e: any) {
      setError(e.message || 'Error al cambiar TV');
    }
  }, [subcommunityId, userId, updateSub]);

  const handleDelete = useCallback(async () => {
    setDeleting(true); setError('');
    try {
      await deleteSub({ subcommunityId: subcommunityId as any, userId });
    } catch (e: any) {
      setError(e.message || 'Error al eliminar');
      setDeleting(false);
    }
  }, [subcommunityId, userId, deleteSub]);

  if (!planSettings) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-3xl text-gray-500">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="size-10 rounded-xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-white/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-xl text-gray-300">settings</span>
        </div>
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-widest">Configuración</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase">Administra tu subcomunidad</p>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-400 text-lg">error</span>
          <span className="text-xs text-red-400 font-bold">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
          <span className="text-xs text-emerald-400 font-bold">{success}</span>
        </div>
      )}

      {/* ─── 1. INFORMACIÓN BÁSICA ──────────────────────────────── */}
      <section className="bg-[#0f1115] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-gray-400">info</span>
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Información Básica</h3>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-primary/50 transition-colors"
              placeholder="Nombre de la subcomunidad"
              maxLength={60}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-primary/50 transition-colors resize-none"
              placeholder="Describe tu subcomunidad..."
              maxLength={300}
            />
          </div>
          <button
            onClick={handleSaveInfo}
            disabled={saving || !name.trim()}
            className="px-5 py-2.5 bg-primary hover:bg-blue-600 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
          >
            {saving ? (
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            Guardar Cambios
          </button>
        </div>
      </section>

      {/* ─── 2. PUBLICIDAD ──────────────────────────────────────── */}
      <section className="bg-[#0f1115] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-gray-400">campaign</span>
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Publicidad</h3>
        </div>
        <div className="p-5 space-y-5">
          {/* Plan warning */}
          {isFreePlan && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-400 text-lg mt-0.5">warning</span>
              <div>
                <p className="text-xs text-amber-400 font-bold">Tu plan incluye publicidad obligatoria</p>
                <p className="text-[10px] text-amber-400/60 mt-0.5">Mejora a Starter o superior para controlar la publicidad</p>
              </div>
            </div>
          )}

          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400 text-lg">toggle_on</span>
              <div>
                <p className="text-xs text-white font-bold">Mostrar publicidad</p>
                <p className="text-[10px] text-gray-500">Permitir anuncios en el feed</p>
              </div>
            </div>
            <button
              onClick={() => handleToggleAds(!subcommunity?.adsEnabled)}
              disabled={!canDisableAds && subcommunity?.adsEnabled}
              className={`relative w-12 h-6 rounded-full transition-all ${
                subcommunity?.adsEnabled
                  ? 'bg-emerald-500'
                  : 'bg-white/10'
              } ${(!canDisableAds && subcommunity?.adsEnabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${
                subcommunity?.adsEnabled ? 'left-[26px]' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Frequency slider */}
          {subcommunity?.adsEnabled && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Frecuencia</span>
                <span className="text-xs font-black text-white bg-white/10 px-2 py-0.5 rounded-lg">
                  Cada {subcommunity?.adFrequency ?? 8} posts
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={15}
                value={subcommunity?.adFrequency ?? 8}
                onChange={e => handleFrequency(parseInt(e.target.value))}
                className="w-full accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-gray-600">3 posts</span>
                <span className="text-[9px] text-gray-600">15 posts</span>
              </div>
            </div>
          )}

          {/* Ad types */}
          {subcommunity?.adsEnabled && (
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tipos permitidos</span>
              <div className="flex flex-wrap gap-2">
                {AD_TYPES.map(at => {
                  const active = (subcommunity?.allowedAdTypes ?? []).includes(at.value);
                  return (
                    <button
                      key={at.value}
                      onClick={() => {
                        const current = subcommunity?.allowedAdTypes ?? [];
                        const next = active ? current.filter((t: string) => t !== at.value) : [...current, at.value];
                        handleAdTypes(next);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                        active
                          ? 'bg-primary/20 border border-primary/30 text-primary'
                          : 'bg-white/5 border border-white/10 text-gray-500 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{at.icon}</span>
                      {at.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── 3. TV ──────────────────────────────────────────────── */}
      <section className="bg-[#0f1115] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-gray-400">live_tv</span>
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Transmisión en Vivo</h3>
        </div>
        <div className="p-5 space-y-4">
          {!planSettings.tvAllowed ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-lg">lock</span>
              <div>
                <p className="text-xs text-amber-400 font-bold">TV no disponible en tu plan</p>
                <p className="text-[10px] text-amber-400/60">Mejora a Starter o superior para habilitar transmisiones en vivo</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-lg">videocam</span>
                <div>
                  <p className="text-xs text-white font-bold">Habilitar TV</p>
                  <p className="text-[10px] text-gray-500">Transmite en vivo a tus miembros</p>
                </div>
              </div>
              <button
                onClick={() => handleToggleTv(!subcommunity?.tvEnabled)}
                className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${
                  subcommunity?.tvEnabled ? 'bg-emerald-500' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${
                  subcommunity?.tvEnabled ? 'left-[26px]' : 'left-0.5'
                }`} />
              </button>
            </div>
          )}
          {subcommunity?.tvEnabled && planSettings.tvAllowed && (
            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-gray-400">group</span>
              <span className="text-[10px] text-gray-400 font-bold">
                Máximo de espectadores: <span className="text-white">{planSettings.tvMaxViewers}</span>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ─── 4. ZONA PELIGROSA ──────────────────────────────────── */}
      <section className="bg-[#0f1115] backdrop-blur-xl border border-red-500/20 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-red-500/10 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-red-400">skull</span>
          <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest">Zona Peligrosa</h3>
        </div>
        <div className="p-5">
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-xs text-red-400 font-bold">¿Estás seguro de eliminar esta subcomunidad?</p>
                <p className="text-[10px] text-red-400/60 mt-1">Esta acción no se puede deshacer. Se eliminarán todos los posts, chats y miembros.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                  )}
                  Confirmar Eliminación
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Eliminar Subcomunidad
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default memo(SubcommunitySettings);
