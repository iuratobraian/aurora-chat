import React, { useState } from 'react';
import { Ad } from '../../types';

const SECTOR_OPTIONS = [
    { value: 'sidebar', label: 'Sidebar', icon: 'vertical_split', color: '#60a5fa' },
    { value: 'feed', label: 'Feed', icon: 'feed', color: '#34d399' },
    { value: 'banner', label: 'Banner Principal', icon: 'image', color: '#a78bfa' },
    { value: 'cursos', label: 'Cursos', icon: 'school', color: '#fbbf24' },
    { value: 'noticias', label: 'Noticias', icon: 'newspaper', color: '#f472b6' },
    { value: 'home', label: 'Home', icon: 'home', color: '#22d3d1' },
    { value: 'signals', label: 'Señales', icon: 'trending_up', color: '#818cf8' },
    { value: 'profile', label: 'Perfil', icon: 'person', color: '#c084fc' },
] as const;

const VISUAL_STYLES = [
    { value: 'default', label: 'Moderno', icon: 'gradient' },
    { value: 'stadium', label: 'Estadio', icon: 'stadium' },
    { value: 'neo', label: 'Cyber', icon: 'bolt' },
] as const;

type Sector = typeof SECTOR_OPTIONS[number]['value'];

interface AdManagementProps {
    ads: Ad[];
    onSave: (data: Partial<Ad>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onCreateNew: () => void;
    onEdit: (ad: Ad) => void;
    onSeed: () => void;
}

const AdManagement: React.FC<AdManagementProps> = ({ ads, onSave, onDelete, onCreateNew, onEdit, onSeed }) => {
    const [activeSector, setActiveSector] = useState<Sector | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Ad>>({
        titulo: '', descripcion: '', imagenUrl: '', link: '', sector: 'sidebar', activo: true, subtitle: '', extra: '', contenido: ''
    });
    const [visualStyle, setVisualStyle] = useState<'default' | 'stadium' | 'neo'>('default');

    const getAdsBySector = () => {
        const sectors: Record<string, Ad[]> = {};
        SECTOR_OPTIONS.forEach(s => sectors[s.value] = []);
        
        ads.forEach(ad => {
            if (ad.sector && sectors[ad.sector]) {
                sectors[ad.sector].push(ad);
            } else if (!ad.sector) {
                if (!sectors['sidebar']) sectors['sidebar'] = [];
                sectors['sidebar'].push(ad);
            }
        });
        
        return sectors;
    };

    const filteredAdsBySector = getAdsBySector();

    const getSectorInfo = (sector: string) => SECTOR_OPTIONS.find(s => s.value === sector) || SECTOR_OPTIONS[0];
    const getActiveAds = () => ads.filter(a => a.activo).length;
    const getInactiveAds = () => ads.filter(a => !a.activo).length;

    const openCreate = () => {
        setEditingAd(null);
        setFormData({ titulo: '', descripcion: '', imagenUrl: '', link: '', sector: activeSector === 'all' ? 'sidebar' : activeSector, activo: true, subtitle: '', extra: '', contenido: '' });
        setShowModal(true);
    };

    const openEdit = (ad: Ad) => {
        setEditingAd(ad);
        setFormData({ ...ad });
        if (ad.extra) setVisualStyle(ad.extra as 'default' | 'stadium' | 'neo');
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave({ ...formData, extra: visualStyle });
        setSaving(false);
        setShowModal(false);
    };

    const handleToggle = async (ad: Ad) => {
        await onSave({ ...ad, activo: !ad.activo });
    };

    const handleDelete = async (id: string) => {
        await onDelete(id);
        setShowDeleteConfirm(null);
    };

    return (
        <div className="space-y-4">
            {/* Header con Stats */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#e5e2e1' }}>
                        <span className="material-symbols-outlined text-purple-400">campaign</span>
                        Publicidades
                    </h2>
                    <p className="text-xs mt-1" style={{ color: '#86868B' }}>
                        {ads.length} total • {getActiveAds()} activas • {getInactiveAds()} inactivas
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onSeed} className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all">
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        Seed
                    </button>
                    <button onClick={openCreate} className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 bg-primary hover:bg-blue-600 transition-all text-white">
                        <span className="material-symbols-outlined text-sm">add</span>
                        Nueva
                    </button>
                </div>
            </div>

            {/* Filtro por Sector */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                    onClick={() => setActiveSector('all')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        activeSector === 'all' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                    Todas ({ads.length})
                </button>
                {SECTOR_OPTIONS.map(sector => {
                    const count = filteredAdsBySector[sector.value]?.length || 0;
                    return (
                        <button
                            key={sector.value}
                            onClick={() => setActiveSector(sector.value as Sector)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                                activeSector === sector.value 
                                    ? 'text-white' 
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                            style={activeSector === sector.value ? { background: sector.color } : {}}
                        >
                            <span className="material-symbols-outlined text-sm">{sector.icon}</span>
                            {sector.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Grid de Ads por Sector */}
            <div className="space-y-6">
                {(activeSector === 'all' ? SECTOR_OPTIONS : [SECTOR_OPTIONS.find(s => s.value === activeSector)]).filter(Boolean).map(sector => {
                    const sectorAds = activeSector === 'all' 
                        ? filteredAdsBySector[sector!.value] || [] 
                        : ads.filter(a => a.sector === activeSector);
                    
                    if (activeSector !== 'all' && sectorAds.length === 0) return null;

                    return (
                        <div key={sector!.value}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm" style={{ color: sector!.color }}>
                                        {sector!.icon}
                                    </span>
                                    <h3 className="font-bold text-sm" style={{ color: sector!.color }}>
                                        {sector!.label}
                                    </h3>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5" style={{ color: '#86868B' }}>
                                        {sectorAds.length}
                                    </span>
                                </div>
                                {activeSector === 'all' && (
                                    <button
                                        onClick={() => { setActiveSector(sector!.value as Sector); openCreate(); }}
                                        className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-xs">add</span>
                                        Agregar
                                    </button>
                                )}
                            </div>

                            {sectorAds.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {sectorAds.map(ad => (
                                        <div
                                            key={ad.id}
                                            className="rounded-xl overflow-hidden transition-all hover:scale-[1.02]"
                                            style={{
                                                background: 'rgba(32, 31, 31, 0.8)',
                                                border: `1px solid ${ad.activo ? 'rgba(73, 68, 84, 0.3)' : 'rgba(248, 113, 113, 0.2)'}`,
                                            }}
                                        >
                                            {/* Image */}
                                            <div className="relative h-24 bg-black/40">
                                                {ad.imagenUrl ? (
                                                    <img src={ad.imagenUrl} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-3xl text-gray-600">image</span>
                                                    </div>
                                                )}
                                                {!ad.activo && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded">INACTIVO</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-2 left-2">
                                                    <span 
                                                        className="px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1"
                                                        style={{ background: `${sector!.color}40`, color: sector!.color }}
                                                    >
                                                        {sector!.icon === 'vertical_split' && <span className="material-symbols-outlined text-xs">{sector!.icon}</span>}
                                                        {sector!.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-3">
                                                <h4 className="font-bold text-xs mb-1 truncate" style={{ color: '#e5e2e1' }}>
                                                    {ad.titulo || 'Sin título'}
                                                </h4>
                                                <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">
                                                    {ad.descripcion || 'Sin descripción'}
                                                </p>

                                                {/* Quick Actions */}
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleToggle(ad)}
                                                        className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                                                            ad.activo 
                                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                                                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                                        }`}
                                                    >
                                                        <span className="material-symbols-outlined text-xs">{ad.activo ? 'pause' : 'play_arrow'}</span>
                                                        {ad.activo ? 'Activo' : 'Inactivo'}
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(ad)}
                                                        className="px-2 py-1.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                                                        title="Editar"
                                                    >
                                                        <span className="material-symbols-outlined text-xs">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(ad.id)}
                                                        className="px-2 py-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <span className="material-symbols-outlined text-xs">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 rounded-xl border border-dashed border-gray-700">
                                    <span className="material-symbols-outlined text-4xl text-gray-600 mb-2">campaign</span>
                                    <p className="text-xs text-gray-500">No hay publicidades en {sector!.label}</p>
                                    <button
                                        onClick={openCreate}
                                        className="mt-2 px-3 py-1.5 rounded bg-white/5 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 mx-auto"
                                    >
                                        <span className="material-symbols-outlined text-xs">add</span>
                                        Crear primera
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
                    <div className="bg-[#0f1115] rounded-2xl p-6 w-full max-w-2xl border border-white/10 my-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">edit</span>
                                {editingAd ? 'Editar' : 'Nueva'} Publicidad
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Título *</label>
                                    <input
                                        value={formData.titulo || ''}
                                        onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                        placeholder="Título de la pub"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Subtítulo</label>
                                    <input
                                        value={formData.subtitle || ''}
                                        onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                        placeholder="Subtítulo"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Descripción *</label>
                                <textarea
                                    value={formData.descripcion || ''}
                                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none h-16 resize-none"
                                    placeholder="Descripción breve"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">URL Imagen</label>
                                    <input
                                        value={formData.imagenUrl || ''}
                                        onChange={e => setFormData({ ...formData, imagenUrl: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Link Destino</label>
                                    <input
                                        value={formData.link || ''}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Sector *</label>
                                    <select
                                        value={formData.sector || 'sidebar'}
                                        onChange={e => setFormData({ ...formData, sector: e.target.value as Sector })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                    >
                                        {SECTOR_OPTIONS.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Estilo Visual</label>
                                    <select
                                        value={visualStyle}
                                        onChange={e => setVisualStyle(e.target.value as any)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                    >
                                        {VISUAL_STYLES.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.activo ?? true}
                                        onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                                <div>
                                    <span className="text-sm font-bold">{formData.activo ? 'Activo' : 'Inactivo'}</span>
                                    <p className="text-[10px] text-gray-500">{formData.activo ? 'Visible en la plataforma' : 'Oculta'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!formData.titulo || saving}
                                className="flex-1 py-3 bg-primary rounded-xl text-sm font-bold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">save</span>
                                {saving ? 'Guardando...' : editingAd ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Eliminar */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="bg-[#0f1115] rounded-2xl p-6 w-full max-w-sm border border-red-500/30" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <span className="material-symbols-outlined text-5xl text-red-400 mb-4">warning</span>
                            <h3 className="text-lg font-bold mb-2">¿Eliminar Publicidad?</h3>
                            <p className="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3 bg-white/5 rounded-xl text-sm font-bold hover:bg-white/10">
                                    Cancelar
                                </button>
                                <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-3 bg-red-500 rounded-xl text-sm font-bold hover:bg-red-600">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdManagement;
