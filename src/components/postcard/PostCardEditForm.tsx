import React, { memo, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { ImageUploadService } from '../../services/imageUpload';

interface PostCardEditFormProps {
    post: {
        id: string;
        contenido: string;
        titulo?: string;
        categoria?: string;
        par?: string;
        tipo?: string;
        zonaOperativa?: { inicio?: string; fin?: string };
        tags?: string[];
        esAnuncio?: boolean;
        comentariosCerrados?: boolean;
        tradingViewUrl?: string;
        imagenUrl?: string;
    };
    onSave: (post: any) => void;
    onCancel: () => void;
}

export const PostCardEditForm: React.FC<PostCardEditFormProps> = memo(({ post, onSave, onCancel }) => {
    const updatePostMutation = useMutation(api.posts.updatePost);

    const [editContent, setEditContent] = useState(post.contenido);
    const [editTitle, setEditTitle] = useState(post.titulo || '');
    const [editCategory, setEditCategory] = useState(post.categoria || 'General');
    const [editTags, setEditTags] = useState(post.tags?.join(', ') || '');
    const [editPar, setEditPar] = useState(post.par || '');
    const [editTipo, setEditTipo] = useState(post.tipo || 'Analisis');
    const [editZonaInicio, setEditZonaInicio] = useState(post.zonaOperativa?.inicio || '');
    const [editZonaFin, setEditZonaFin] = useState(post.zonaOperativa?.fin || '');
    const [editPinned, setEditPinned] = useState(post.esAnuncio || false);
    const [editCommentsClosed, setEditCommentsClosed] = useState(post.comentariosCerrados || false);
    const [editImagenUrl, setEditImagenUrl] = useState(post.imagenUrl || '');
    const [isUploading, setIsUploading] = useState(false);

    const handleSave = async () => {
        const tagsArr = editTags.split(',').map(t => t.trim()).filter(Boolean);
        const newTvUrl = extractTvUrl(editContent);

        const updatedPost = {
            ...post,
            titulo: editTitle,
            categoria: editCategory,
            par: editPar,
            tipo: editTipo,
            zonaOperativa: { inicio: editZonaInicio, fin: editZonaFin },
            tags: tagsArr,
            esAnuncio: editPinned,
            comentariosCerrados: editCommentsClosed,
            contenido: editContent,
            tradingViewUrl: newTvUrl ?? post.tradingViewUrl,
            imagenUrl: editImagenUrl
        };

        try {
            await updatePostMutation({
                id: post.id as any,
                titulo: editTitle,
                contenido: editContent,
                categoria: editCategory as any,
                par: editPar,
                tipo: editTipo as any,
                zonaOperativa: { inicio: editZonaInicio, fin: editZonaFin },
                tags: tagsArr,
                esAnuncio: editPinned,
                comentariosCerrados: editCommentsClosed,
                tradingViewUrl: newTvUrl ?? post.tradingViewUrl,
                imagenUrl: editImagenUrl
            });
        } catch {
            onSave(updatedPost as any);
        }
        onSave(updatedPost as any);
    };

    const extractTvUrl = (text: string): string | null => {
        if (!text) return null;
        const match = text.match(/https:\/\/www\.tradingview\.com\/(x|chart)\/\S+/);
        return match ? match[0] : null;
    };

    return (
        <div className="space-y-3 py-2 animate-in fade-in duration-300">
            <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm font-bold text-white outline-none focus:border-primary transition-all"
                placeholder="Título del análisis..."
            />
            <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 min-h-[120px] outline-none focus:border-primary transition-all resize-none"
                placeholder="Escribe tu análisis aquí..."
            />
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Categoría</label>
                    <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-primary"
                    >
                        <option value="Idea">Idea</option>
                        <option value="Analisis">Análisis</option>
                        <option value="Trade">Trade Signal</option>
                        <option value="Noticia">Noticia</option>
                        <option value="Recurso">Recurso</option>
                    </select>
                </div>
                <div>
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Tags (separados por coma)</label>
                    <input
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="BTC, Crypto, Short..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Activo/Par</label>
                    <input
                        value={editPar}
                        onChange={(e) => setEditPar(e.target.value)}
                        placeholder="BTCUSD"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Tipo</label>
                    <select
                        value={editTipo}
                        onChange={(e) => setEditTipo(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-primary"
                    >
                        <option value="Analisis">Análisis (Gris)</option>
                        <option value="Compra">Compra (Verde)</option>
                        <option value="Venta">Venta (Rojo)</option>
                    </select>
                </div>
                <div>
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Destacar</label>
                    <div className="flex items-center gap-2 h-9 p-2 bg-white/5 rounded-lg border border-white/10">
                        <input
                            type="checkbox"
                            checked={editPinned}
                            onChange={(e) => setEditPinned(e.target.checked)}
                            className="size-4 accent-amber-500"
                        />
                        <span className="text-[8px] font-black uppercase text-amber-500">Pin</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Precio Inicio</label>
                    <input
                        value={editZonaInicio}
                        onChange={(e) => setEditZonaInicio(e.target.value)}
                        placeholder="0.0000"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-primary tabular-nums"
                    />
                </div>
                <div>
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Precio Fin</label>
                    <input
                        value={editZonaFin}
                        onChange={(e) => setEditZonaFin(e.target.value)}
                        placeholder="0.0000"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-primary tabular-nums"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-inner">
                <div className="flex-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest mb-2 block">Imagen de la Publicación</label>
                    <div className="flex gap-3">
                        <input
                            value={editImagenUrl}
                            onChange={(e) => setEditImagenUrl(e.target.value)}
                            placeholder="URL de imagen (o sube una abajo)"
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-primary"
                        />
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setIsUploading(true);
                                    try {
                                        const url = await ImageUploadService.uploadImage(file);
                                        setEditImagenUrl(url);
                                    } finally {
                                        setIsUploading(false);
                                    }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <button className={`h-full px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                                isUploading ? 'bg-primary/20 border-primary animate-pulse' : 'bg-white/5 border-white/10 hover:bg-white/5'
                            }`}>
                                <span className="material-symbols-outlined text-lg">{isUploading ? 'sync' : 'upload'}</span>
                                <span className="text-[10px] font-black uppercase">{isUploading ? 'Subiendo' : 'Subir'}</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`size-5 rounded border flex items-center justify-center transition-all ${
                            editCommentsClosed ? 'bg-red-500 border-red-500' : 'bg-white/5 border-white/10 group-hover:border-red-500/50'
                        }`}>
                            <input
                                type="checkbox"
                                checked={editCommentsClosed}
                                onChange={(e) => setEditCommentsClosed(e.target.checked)}
                                className="hidden"
                            />
                            {editCommentsClosed && <span className="material-symbols-outlined text-[14px] text-white">close</span>}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                            editCommentsClosed ? 'text-red-500' : 'text-gray-500'
                        }`}>Cerrar Comentarios</span>
                    </label>

                    <div className="flex gap-2">
                        <button
                            onClick={onCancel}
                            className="px-5 py-2.5 text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-8 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            Publicar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default PostCardEditForm;