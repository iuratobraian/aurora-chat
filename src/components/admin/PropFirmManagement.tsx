import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import logger from '../../../lib/utils/logger';

interface PropFirmManagementProps {
  showToast?: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export default function PropFirmManagement({ showToast }: PropFirmManagementProps) {
  const propFirms = useQuery(api.propFirms.getAllPropFirms);
  const createFirm = useMutation(api.propFirms.createPropFirm);
  const updateFirm = useMutation(api.propFirms.updatePropFirm);
  const deleteFirm = useMutation(api.propFirms.deletePropFirm);
  const seedPropFirms = useMutation(api.propFirms.seedPropFirms);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const result = await seedPropFirms({});
      showToast?.('success', `¡${result.seeded} Prop Firms creadas!`);
    } catch (error) {
      showToast?.('error', 'Error al crear Prop Firms');
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenEdit = (firm?: any) => {
    if (firm) {
      setFormData({
        id: firm._id,
        name: firm.name,
        description: firm.description,
        logoUrl: firm.logoUrl || '',
        coverUrl: firm.coverUrl || '',
        affiliateLink: firm.affiliateLink || '',
        characteristics: firm.characteristics ? firm.characteristics.join(', ') : '',
        isActive: firm.isActive,
        order: firm.order || 0
      });
    } else {
      setFormData({
        name: '',
        description: '',
        logoUrl: '',
        coverUrl: '',
        affiliateLink: '',
        characteristics: '',
        isActive: true,
        order: 0
      });
    }
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        logoUrl: formData.logoUrl || undefined,
        coverUrl: formData.coverUrl || undefined,
        affiliateLink: formData.affiliateLink,
        isActive: formData.isActive,
        order: Number(formData.order) || 0,
        characteristics: formData.characteristics ? formData.characteristics.split(',').map((s: string) => s.trim()) : [],
      };

      if (formData.id) {
        await updateFirm({ id: formData.id, ...payload });
      } else {
        await createFirm(payload);
      }
      setIsEditing(false);
      setFormData(null);
    } catch (err) {
      logger.error("Error guardando prop firm:", err);
      alert("Hubo un error al guardar");
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm("¿Estás seguro de eliminar esta Prop Firm?")) {
      await deleteFirm({ id });
    }
  };

  if (!propFirms) return <div className="text-white">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 
            className="text-xl font-bold flex items-center gap-2"
            style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#e5e2e1' }}
          >
            <span className="material-symbols-outlined" style={{ color: '#d0bcff' }}>account_balance</span>
            Gestión de Prop Firms
          </h2>
          <p className="text-xs mt-1" style={{ color: '#86868B' }}>{propFirms.length} firmas registradas</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(20, 184, 166, 0.2))',
              color: '#34d399',
              border: '1px solid rgba(52, 211, 153, 0.3)',
            }}
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            {seeding ? 'Creando...' : 'Seed Datos'}
          </button>
          <button
            onClick={() => handleOpenEdit()}
            className="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(160, 120, 255, 0.3)',
            }}
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Nueva Firma
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {propFirms.map((firm) => (
          <div 
            key={firm._id} 
            className="p-5 rounded-2xl relative group"
            style={{
              background: 'rgba(32, 31, 31, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(73, 68, 84, 0.15)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {firm.logoUrl ? (
                  <img src={firm.logoUrl} alt={firm.name} className="size-10 rounded-xl object-contain" style={{ background: 'white' }} />
                ) : (
                  <div 
                    className="size-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(19, 19, 19, 0.6)' }}
                  >
                    <span className="material-symbols-outlined text-lg" style={{ color: '#86868B' }}>image</span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm" style={{ color: '#e5e2e1' }}>{firm.name}</h3>
                  <p className="text-[10px] font-medium" style={{ color: '#86868B' }}>Orden: {firm.order}</p>
                </div>
              </div>
              <span 
                className="px-2 py-1 rounded text-[10px] font-bold uppercase"
                style={firm.isActive 
                    ? { background: 'rgba(0, 230, 118, 0.2)', color: '#00e676' } 
                    : { background: 'rgba(248, 113, 113, 0.2)', color: '#f87171' }
                }
              >
                {firm.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            
            <p className="text-xs line-clamp-2 mb-4" style={{ color: '#86868B' }}>{firm.description}</p>
            
            <div className="flex justify-end gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(73, 68, 84, 0.15)' }}>
              <button
                onClick={() => handleOpenEdit(firm)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' }}
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(firm._id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
          <div 
            className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(32, 31, 31, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(73, 68, 84, 0.3)',
            }}
          >
            <div className="p-6 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(73, 68, 84, 0.15)' }}>
              <h2 className="text-lg font-bold" style={{ color: '#e5e2e1' }}>{formData.id ? 'Editar Firma' : 'Nueva Firma'}</h2>
              <button onClick={() => setIsEditing(false)} style={{ color: '#86868B' }}>
                <span className="material-symbols-outlined block">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#86868B' }}>Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5"
                    style={{
                      background: 'rgba(19, 19, 19, 0.6)',
                      border: '1px solid rgba(73, 68, 84, 0.2)',
                      color: '#e5e2e1',
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#86868B' }}>Descripción</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5"
                    style={{
                      background: 'rgba(19, 19, 19, 0.6)',
                      border: '1px solid rgba(73, 68, 84, 0.2)',
                      color: '#e5e2e1',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#86868B' }}>Logo URL</label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5"
                    style={{
                      background: 'rgba(19, 19, 19, 0.6)',
                      border: '1px solid rgba(73, 68, 84, 0.2)',
                      color: '#e5e2e1',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#86868B' }}>Fondo/Cover URL</label>
                  <input
                    type="url"
                    value={formData.coverUrl}
                    onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5"
                    style={{
                      background: 'rgba(19, 19, 19, 0.6)',
                      border: '1px solid rgba(73, 68, 84, 0.2)',
                      color: '#e5e2e1',
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#86868B' }}>Enlace de Afiliado</label>
                  <input
                    type="url"
                    required
                    value={formData.affiliateLink}
                    onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Características (separadas por coma)</label>
                  <input
                    type="text"
                    value={formData.characteristics}
                    onChange={(e) => setFormData({ ...formData, characteristics: e.target.value })}
                    placeholder="Ej: Spread Bajo, Pagos 24h, MetaTrader 5"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Orden (Prioridad visual)</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="size-5 rounded border-white/20 bg-black accent-primary"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-white cursor-pointer">
                    Firma Activa (Visible al público)
                  </label>
                </div>
              </div>

              <div className="border-t border-white/10 mt-6 pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                >
                  Guadar Firma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
