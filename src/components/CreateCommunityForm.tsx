import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from './ToastProvider';
import { Usuario } from '../types';

interface CreateCommunityFormProps {
  usuario: Usuario;
  onSuccess?: (slug: string) => void;
  onCancel?: () => void;
}

export const CreateCommunityForm: React.FC<CreateCommunityFormProps> = ({ 
  usuario, 
  onSuccess, 
  onCancel 
}) => {
  const { showToast } = useToast();
  const createCommunityMutation = useMutation(api.communities.createCommunity);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    visibility: 'public' as const,
    accessType: 'free' as 'free' | 'paid',
    priceMonthly: 0,
    plan: 'free' as const,
    enableTVShare: false, // TradingView integration
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      showToast('error', 'El nombre y el slug son obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCommunityMutation({
        ownerId: usuario.id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        visibility: formData.visibility,
        accessType: formData.accessType,
        priceMonthly: formData.priceMonthly || 0,
        plan: formData.plan,
        enableTVShare: formData.enableTVShare,
      });

      showToast('success', '¡Comunidad creada con éxito!' + (formData.enableTVShare ? ' TVShare habilitado.' : ''));
      onSuccess?.(formData.slug);
    } catch (error: any) {
      showToast('error', error.message || 'Error al crear la comunidad');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass rounded-2xl p-8 border border-white/10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-600/10 blur-[100px] rounded-full" />

        <div className="relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/30 to-violet-600/20 border border-primary/30 flex items-center justify-center shadow-xl shadow-primary/10">
              <span className="material-symbols-outlined text-primary text-2xl">add_circle</span>
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white">
                Nueva Comunidad
              </h2>
              <p className="text-gray-400 text-sm mt-1">Define el futuro de tu imperio</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                  Nombre de la Comunidad
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Ej: Traders de Elite"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-primary/50 transition-all outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                  URL Amigable (Slug)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold">/c/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3.5 text-white placeholder-gray-600 font-mono transition-all outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="¿De qué trata tu comunidad?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 min-h-[120px] transition-all outline-none resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                  Visibilidad
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as any }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none"
                >
                  <option value="public" className="bg-[#0a0c10]">Pública</option>
                  <option value="unlisted" className="bg-[#0a0c10]">Oculta</option>
                  <option value="private" className="bg-[#0a0c10]">Privada</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                  Tipo de Acceso
                </label>
                <select
                  value={formData.accessType}
                  onChange={(e) => setFormData(prev => ({ ...prev, accessType: e.target.value as 'free' | 'paid' }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none"
                >
                  <option value="free" className="bg-[#0a0c10]">Gratuito</option>
                  <option value="paid" className="bg-[#0a0c10]">Pago (Premium)</option>
                </select>
              </div>

              {formData.accessType === 'paid' && (
                <div className="space-y-2 animate-in slide-in-from-right-4 fade-in">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                    Precio Mensual (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.priceMonthly}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceMonthly: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white transition-all outline-none"
                    min="5"
                  />
                </div>
              )}
            </div>

            {/* TVShare Integration Toggle */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.enableTVShare}
                    onChange={(e) => setFormData(prev => ({ ...prev, enableTVShare: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                    TVShare Integration
                  </span>
                  <p className="text-[9px] text-gray-500 mt-0.5">
                    Habilitar gráficos de TradingView en tiempo real para tu comunidad
                  </p>
                </div>
                <span className="material-symbols-outlined text-primary text-xl">tradingview</span>
              </label>
            </div>

            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Tu comunidad comenzará en el plan <strong className="text-white">FREE</strong> (máx. 100 miembros). Podrás escalar tu plan a Starter, Growth o Enterprise desde el panel de administración.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] px-6 py-4 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin size-4 border-2 border-white/20 border-t-white rounded-full" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">rocket_launch</span>
                      Lanzar Comunidad
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
