import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Usuario } from '../types';
import { useToast } from '../components/ToastProvider';

interface PsicotradingProps {
    usuario?: Usuario | null;
    onUpdateUser?: (u: Usuario) => void;
}

interface RecursoEducativo {
    id: string;
    tipo: 'video' | 'pdf';
    titulo: string;
    autor: string;
    descripcion: string;
    thumbnail: string;
    embedUrl: string;
    duracion: string;
    categoria: 'Libros' | 'Podcast' | 'Psicotrading' | 'Audiolibros';
}

const PsicotradingView: React.FC<PsicotradingProps> = ({ usuario, onUpdateUser }) => {
    const [videoList, setVideoList] = useState<RecursoEducativo[]>([]);
    const [selectedResource, setSelectedResource] = useState<RecursoEducativo | null>(null);
    const [isCinemaMode, setIsCinemaMode] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<RecursoEducativo | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<RecursoEducativo>>({
        titulo: '', autor: '', descripcion: '', embedUrl: '', duracion: '', categoria: 'Psicotrading', tipo: 'video', thumbnail: ''
    });

    // Allowed Roles — only admin/ceo can delete
    const canEdit = usuario && (['admin', 'ceo', 'programador', 'diseñador'].includes(usuario.rol) || usuario.esPro);
    const canDelete = usuario && ['admin', 'ceo'].includes(usuario.rol);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setIsLoading(true);
        try {
            const data = await StorageService.getVideos();
            setVideoList(data);
        } catch (err) {
            showToast('error', 'Error al cargar recursos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleProgress = async (resourceId: string) => {
        if (!usuario) return;
        const updatedUser = await StorageService.toggleResourceProgress(usuario.id, resourceId);
        if (updatedUser && onUpdateUser) {
            onUpdateUser(updatedUser);
        }
    };

    const handleOpenModal = (res?: RecursoEducativo) => {
        if (res) {
            setEditingResource(res);
            setFormData(res);
        } else {
            setEditingResource(null);
            setFormData({ titulo: '', autor: '', descripcion: '', embedUrl: '', duracion: '', categoria: 'Psicotrading', tipo: 'video', thumbnail: '' });
        }
        setIsModalOpen(true);
    };

    // Improved Regex and ID Extraction
    const extractYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSave = async () => {
        if (!formData.titulo || !formData.embedUrl) {
            showToast('warning', "Título y URL son obligatorios.");
            return;
        }

        let finalEmbedUrl = formData.embedUrl;
        let finalThumbnail = formData.thumbnail;

        // Logic specific for Videos vs PDFs
        if (formData.tipo === 'video') {
            const ytId = extractYoutubeId(formData.embedUrl);
            if (!ytId) {
                showToast('error', "URL de YouTube no válida.");
                return;
            }
            // IMPORTANT: Construct strict embed URL without extra params initially
            finalEmbedUrl = `https://www.youtube.com/embed/${ytId}`;
            if (!finalThumbnail) {
                finalThumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
            }
        } else {
            // PDF Logic
            if (!finalThumbnail) {
                finalThumbnail = 'https://cdn-icons-png.flaticon.com/512/3389/3389081.png';
            }
        }

        const resourceToSave: RecursoEducativo = {
            id: editingResource ? editingResource.id : Date.now().toString(),
            tipo: formData.tipo || 'video',
            titulo: formData.titulo || 'Sin Título',
            autor: formData.autor || 'Desconocido',
            descripcion: formData.descripcion || '',
            embedUrl: finalEmbedUrl,
            thumbnail: finalThumbnail || '',
            duracion: formData.duracion || (formData.tipo === 'video' ? '00:00' : '0 pgs'),
            categoria: (formData.categoria as any) || 'Psicotrading'
        };

        await StorageService.saveVideo(resourceToSave);
        await fetchResources();
        setIsModalOpen(false);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("¿Eliminar este recurso de la biblioteca?")) {
            await StorageService.deleteVideo(id);
            await fetchResources();
            if (selectedResource?.id === id) setSelectedResource(null);
            showToast('success', 'Recurso eliminado');
        }
    };

    const handleExtractYouTube = async () => {
        if (isExtracting) return;
        
        setIsExtracting(true);
        showToast('info', 'Extrayendo contenido de YouTube...');
        
        try {
            // Call server-side endpoint (API key stays on server)
            const response = await fetch('/api/youtube/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Extraction failed');
            }
            
            const data = await response.json();
            
            // Save extracted videos to storage
            let added = 0;
            const existingIds = new Set(videoList.map(v => v.id));
            
            for (const video of data.videos) {
                if (!existingIds.has(video.id)) {
                    await StorageService.saveVideo(video);
                    added++;
                }
            }
            
            await fetchResources();
            showToast('success', `Extracción completada: ${added} nuevos, ${data.count - added} existentes`);
        } catch (error: any) {
            console.error('Extraction failed:', error);
            showToast('error', error.message || 'Error en la extracción. Revisa la API key de YouTube.');
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Biblioteca & Psicotrading</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase mt-1">Videos, Audiolibros y PDFs Educativos</p>
                </div>
                <div className="flex items-center gap-2">
                    {canEdit && (
                        <>
                            <button
                                onClick={handleExtractYouTube}
                                disabled={isExtracting}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
                            >
                                <span className={`material-symbols-outlined ${isExtracting ? 'animate-spin' : ''}`}>
                                    {isExtracting ? 'hourglass_empty' : 'youtube_searched_for'}
                                </span>
                                {isExtracting ? 'Extrayendo...' : 'Extraer de YouTube'}
                            </button>
                            <button
                                onClick={() => handleOpenModal()}
                                className="px-6 py-2 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
                            >
                                <span className="material-symbols-outlined">add_circle</span> Agregar
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {videoList.length === 0 && <p className="text-gray-500 col-span-full">No hay recursos disponibles.</p>}
                {['Libros', 'Podcast', 'Psicotrading', 'Audiolibros'].map(cat => {
                    const items = videoList.filter(v => v.categoria === cat);
                    if (items.length === 0) return null;
                    return (
                        <div key={cat} className="col-span-full mt-8 mb-4">
                            <h3 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">{cat}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
                                {items.map((res) => (
                                    <div
                                        key={res.id}
                                        onClick={() => setSelectedResource(res)}
                                        className="glass rounded-xl overflow-hidden cursor-pointer group hover:border-primary/40 transition-all border border-gray-200 dark:border-white/5 relative flex flex-col h-full bg-white dark:bg-card-dark aspect-[2/3]"
                                    >
                                        <div className="relative h-full w-full overflow-hidden bg-black/5 dark:bg-black/20">
                                            {usuario && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleProgress(res.id); }}
                                                    className={`absolute top-2 left-2 z-10 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest backdrop-blur-md border transition-all ${usuario.progreso?.[res.id] ? 'bg-green-500 text-white border-green-400' : 'bg-black/50 text-white border-white/20 hover:bg-white/20'}`}
                                                >
                                                    {usuario.progreso?.[res.id] ? 'Completado' : (res.tipo === 'video' ? 'Marcar Visto' : 'Marcar Leído')}
                                                </button>
                                            )}
                                            <img
                                                src={res.thumbnail}
                                                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100 ${res.tipo === 'pdf' ? 'object-contain p-2' : ''}`}
                                                alt={res.titulo}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${res.categoria === 'Audiolibros' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                                                        res.categoria === 'Psicotrading' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                                            res.categoria === 'Libros' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                                                'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                        }`}>
                                                        {res.categoria}
                                                    </span>
                                                    {canEdit && (
                                                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                                            <button onClick={(e) => { e.stopPropagation(); handleOpenModal(res); }} className="p-1 bg-black/50 hover:bg-white/20 rounded text-white">
                                                                <span className="material-symbols-outlined text-[10px]">edit</span>
                                                            </button>
                                                            <button onClick={(e) => handleDelete(e, res.id)} className="p-1 bg-black/50 hover:bg-alert-red/50 rounded text-white">
                                                                <span className="material-symbols-outlined text-[10px]">delete</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-xs font-black text-white leading-tight mb-0.5 line-clamp-2">{res.titulo}</h3>
                                                <p className="text-[9px] font-bold text-gray-300 line-clamp-1">{res.autor}</p>
                                            </div>
                                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold text-white border border-white/10">
                                                {res.duracion}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                <div className="size-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                                                    <span className="material-symbols-outlined text-white text-2xl">
                                                        {res.tipo === 'pdf' ? 'menu_book' : 'play_arrow'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Viewer Modal (Generic for Video & PDF) */}
            {selectedResource && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className={`w-full ${isCinemaMode ? 'max-w-none h-screen fixed inset-0 z-[1000] rounded-0' : 'max-w-6xl h-[90vh] rounded-[2rem]'} glass overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 border border-white/10 bg-black`}>
                        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                            {selectedResource.tipo === 'video' ? (
                                /* YouTube Iframe Fixed - Added Origin and Modest Branding to reduce error 153 */
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`${selectedResource.embedUrl}?autoplay=1&origin=${window.location.origin}&modestbranding=1&rel=0`}
                                    title={selectedResource.titulo}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                /* PDF Reader */
                                <div className="relative w-full h-full">
                                    <iframe
                                        src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedResource.embedUrl)}&embedded=true`}
                                        width="100%"
                                        height="100%"
                                        className="w-full h-full border-none"
                                        title="PDF Reader"
                                    ></iframe>
                                    <div className="absolute bottom-6 right-6 z-10">
                                        {selectedResource.tipo === 'pdf' && (
                                            <a
                                                href={selectedResource.embedUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-primary text-white text-xs font-bold uppercase tracking-wide rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-lg hover:scale-105"
                                            >
                                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                Abrir Original
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={`p-6 flex justify-between items-start ${isCinemaMode ? 'bg-black/90 text-white fixed bottom-0 left-0 w-full backdrop-blur-xl z-[210]' : 'bg-white dark:bg-[#111]'}`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-primary text-xl">
                                        {selectedResource.tipo === 'pdf' ? 'menu_book' : 'play_circle'}
                                    </span>
                                    <h2 className="text-xl font-black">{selectedResource.titulo}</h2>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="text-sm text-primary font-bold">{selectedResource.autor}</p>
                                    {selectedResource.tipo === 'video' && (
                                        <button
                                            onClick={() => setIsCinemaMode(!isCinemaMode)}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isCinemaMode ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-primary'}`}
                                        >
                                            <span className="material-symbols-outlined text-sm">{isCinemaMode ? 'close_fullscreen' : 'fullscreen'}</span>
                                            {isCinemaMode ? 'Salir Modo Cine' : 'Modo Cine'}
                                        </button>
                                    )}
                                </div>
                                {!isCinemaMode && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl line-clamp-2">{selectedResource.descripcion}</p>}
                            </div>
                            <button
                                onClick={() => { setSelectedResource(null); setIsCinemaMode(false); }}
                                className="p-3 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/5 text-gray-900 dark:text-white transition-colors ml-4"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="w-full max-w-lg glass rounded-[2rem] p-8 border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh] bg-white dark:bg-card-dark">
                        <h3 className="text-lg font-black uppercase text-gray-900 dark:text-white mb-6">
                            {editingResource ? 'Editar Recurso' : 'Agregar Nuevo Recurso'}
                        </h3>
                        <div className="space-y-4">
                            {/* Form Inputs with better light/dark compatibility */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo de Recurso</label>
                                <select
                                    value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value as any })}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-gray-900 dark:text-white outline-none mt-1"
                                >
                                    <option value="video">Video (YouTube)</option>
                                    <option value="pdf">Libro (PDF)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Título</label>
                                <input
                                    value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-gray-900 dark:text-white outline-none mt-1"
                                />
                            </div>

                            {/* ... More Inputs ... */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Autor</label>
                                    <input
                                        value={formData.autor} onChange={e => setFormData({ ...formData, autor: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-gray-900 dark:text-white outline-none mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">
                                        {formData.tipo === 'video' ? 'Duración' : 'Páginas'}
                                    </label>
                                    <input
                                        value={formData.duracion} onChange={e => setFormData({ ...formData, duracion: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-gray-900 dark:text-white outline-none mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase">
                                    {formData.tipo === 'video' ? 'YouTube Link' : 'URL del PDF'}
                                </label>
                                <input
                                    value={formData.embedUrl} onChange={e => setFormData({ ...formData, embedUrl: e.target.value })}
                                    placeholder={formData.tipo === 'video' ? "https://youtube.com/..." : "https://mi-drive.com/libro.pdf"}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-gray-900 dark:text-white outline-none mt-1"
                                />
                            </div>

                            {formData.tipo === 'pdf' && (
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Imagen de Portada (URL)</label>
                                    <input
                                        value={formData.thumbnail} onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-gray-900 dark:text-white outline-none mt-1"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Categoría</label>
                                <select
                                    value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value as any })}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-gray-900 dark:text-white outline-none mt-1"
                                >
                                    <option>Libros</option>
                                    <option>Podcast</option>
                                    <option>Psicotrading</option>
                                    <option>Audiolibros</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Descripción</label>
                                <textarea
                                    value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-gray-900 dark:text-white outline-none mt-1 h-24 resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white text-xs font-bold">Cancelar</button>
                                <button onClick={handleSave} className="px-6 py-2 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg">Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PsicotradingView;