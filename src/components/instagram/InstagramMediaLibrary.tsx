import React, { useState } from 'react';

export interface MediaItem {
    id: string;
    url: string;
    thumbnailUrl?: string;
    type: 'image' | 'video';
    filename: string;
    size: number;
    uploadedAt: number;
    selected?: boolean;
}

interface InstagramMediaLibraryProps {
    media: MediaItem[];
    onSelect?: (media: MediaItem[]) => void;
    onUpload?: () => void;
    onDelete?: (mediaId: string) => void;
    maxSelection?: number;
    selectionLimit?: number;
    className?: string;
}

export default function InstagramMediaLibrary({ 
    media,
    onSelect,
    onUpload,
    onDelete,
    maxSelection = 10,
    selectionLimit = 1,
    className = '' 
}: InstagramMediaLibraryProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

    const filteredMedia = media.filter(m => {
        if (filter === 'all') return true;
        return m.type === filter;
    });

    const handleSelect = (item: MediaItem) => {
        const newSelected = new Set(selectedIds);
        
        if (selectedIds.has(item.id)) {
            newSelected.delete(item.id);
        } else if (selectedIds.size < selectionLimit) {
            newSelected.add(item.id);
        }
        
        setSelectedIds(newSelected);
        
        const selectedMedia = media.filter(m => newSelected.has(m.id));
        onSelect?.(selectedMedia);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
        });
    };

    return (
        <div className={`rounded-xl border border-gray-600 bg-gray-800/50 ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="font-bold text-lg">Biblioteca de Medios</h2>
                        <p className="text-sm text-gray-400">
                            {selectedIds.size > 0 
                                ? `${selectedIds.size} seleccionado(s)` 
                                : `Selecciona hasta ${selectionLimit}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex bg-gray-900 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1.5 rounded ${viewMode === 'grid' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
                            >
                                ⊞
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 rounded ${viewMode === 'list' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
                            >
                                ☰
                            </button>
                        </div>

                        {/* Upload Button */}
                        <button
                            onClick={onUpload}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                            <span>⬆</span>
                            <span>Subir</span>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mt-4">
                    {(['all', 'image', 'video'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                filter === f 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                        >
                            {f === 'all' ? 'Todos' : f === 'image' ? '📷 Imágenes' : '🎥 Videos'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
                {filteredMedia.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="text-4xl mb-3 block">📁</span>
                        <p className="text-gray-400 mb-4">No hay medios todavía</p>
                        <button
                            onClick={onUpload}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Subir tu primer archivo
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {filteredMedia.map(item => (
                            <div 
                                key={item.id}
                                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                                    selectedIds.has(item.id) ? 'ring-2 ring-purple-500' : ''
                                }`}
                                onClick={() => handleSelect(item)}
                            >
                                {item.type === 'video' ? (
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                        <span className="text-2xl">🎥</span>
                                    </div>
                                ) : (
                                    <img 
                                        src={item.thumbnailUrl || item.url} 
                                        alt={item.filename}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                
                                {/* Selection indicator */}
                                {selectedIds.has(item.id) && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}

                                {/* Video indicator */}
                                {item.type === 'video' && (
                                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white">
                                        🎥
                                    </div>
                                )}

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete?.(item.id);
                                        }}
                                        className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-sm"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredMedia.map(item => (
                            <div 
                                key={item.id}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                                    selectedIds.has(item.id) ? 'bg-purple-600/20' : 'hover:bg-gray-700'
                                }`}
                                onClick={() => handleSelect(item)}
                            >
                                <div className="w-12 h-12 rounded bg-gray-700 flex-shrink-0 overflow-hidden">
                                    {item.type === 'video' ? (
                                        <div className="w-full h-full flex items-center justify-center text-xl">🎥</div>
                                    ) : (
                                        <img src={item.thumbnailUrl || item.url} alt="" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.filename}</p>
                                    <p className="text-xs text-gray-400">
                                        {formatSize(item.size)} • {formatDate(item.uploadedAt)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.type === 'video' && (
                                        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">Video</span>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete?.(item.id);
                                        }}
                                        className="p-1.5 hover:bg-red-500/20 rounded text-red-400"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
