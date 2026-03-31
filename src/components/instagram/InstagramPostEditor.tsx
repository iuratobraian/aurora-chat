import React, { useState, useRef } from 'react';

interface MediaItem {
    id: string;
    url: string;
    type: 'image' | 'video';
    thumbnail?: string;
}

interface InstagramPostEditorProps {
    onPublish?: (data: PostData) => void;
    onSchedule?: (data: PostData, date: Date) => void;
    selectedMedia?: MediaItem[];
    className?: string;
}

interface PostData {
    caption: string;
    location?: string;
    firstComment?: string;
    mediaIds: string[];
}

export default function InstagramPostEditor({ 
    onPublish, 
    onSchedule,
    selectedMedia = [],
    className = '' 
}: InstagramPostEditorProps) {
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [firstComment, setFirstComment] = useState('');
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('12:00');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const charactersLeft = 2200 - caption.length;
    const isOverLimit = charactersLeft < 0;

    const handlePublish = () => {
        if (!caption.trim() || isOverLimit) return;
        
        const data: PostData = {
            caption,
            location: location || undefined,
            firstComment: firstComment || undefined,
            mediaIds: selectedMedia.map(m => m.id),
        };

        if (showSchedule && scheduleDate) {
            const dateTime = new Date(`${scheduleDate}T${scheduleTime}`);
            onSchedule?.(data, dateTime);
        } else {
            onPublish?.(data);
        }
    };

    const getPreviewImage = () => {
        if (selectedMedia.length > 0) {
            return selectedMedia[0].thumbnail || selectedMedia[0].url;
        }
        return null;
    };

    const previewImage = getPreviewImage();

    return (
        <div className={`grid lg:grid-cols-2 gap-6 ${className}`}>
            {/* Preview Panel */}
            <div className="rounded-xl border border-gray-600 bg-gray-800/50 overflow-hidden">
                <div className="bg-gray-900 px-4 py-2 border-b border-gray-700">
                    <span className="text-sm font-medium text-gray-400">Vista Previa</span>
                </div>
                
                <div className="p-4">
                    {/* Instagram Post Preview */}
                    <div className="bg-black rounded-lg overflow-hidden max-w-sm mx-auto">
                        {/* Header */}
                        <div className="flex items-center gap-3 p-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                            <span className="font-semibold text-sm">tu_cuenta</span>
                        </div>

                        {/* Media */}
                        <div className="aspect-square bg-gray-800 flex items-center justify-center">
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <span className="text-4xl mb-2 block">📷</span>
                                    <span className="text-sm">Añade una imagen</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-3 flex items-center gap-4">
                            <span className="text-xl cursor-pointer">❤️</span>
                            <span className="text-xl cursor-pointer">💬</span>
                            <span className="text-xl cursor-pointer">✈️</span>
                            <span className="ml-auto text-xl cursor-pointer">📕</span>
                        </div>

                        {/* Caption Preview */}
                        <div className="px-3 pb-3">
                            <p className="text-sm">
                                <span className="font-semibold mr-2">tu_cuenta</span>
                                <span className="text-gray-300">
                                    {caption || 'Tu caption aparecerá aquí...'}
                                </span>
                            </p>
                            {caption.length > 125 && (
                                <button className="text-gray-400 text-sm mt-1">...más</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor Panel */}
            <div className="space-y-4">
                {/* Caption */}
                <div className="rounded-xl border border-gray-600 bg-gray-800/50 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Caption</label>
                        <span className={`text-xs ${isOverLimit ? 'text-red-400' : charactersLeft < 100 ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {charactersLeft}
                        </span>
                    </div>
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Escribe un caption atractivo..."
                        className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:border-purple-500 focus:outline-none"
                        maxLength={2200}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {['#trading', '#forex', '#tradinglife'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setCaption(prev => prev + ` ${tag}`)}
                                className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location */}
                <div className="rounded-xl border border-gray-600 bg-gray-800/50 p-4">
                    <label className="text-sm font-medium block mb-2">Ubicación</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Añadir ubicación"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                </div>

                {/* First Comment */}
                <div className="rounded-xl border border-gray-600 bg-gray-800/50 p-4">
                    <label className="text-sm font-medium block mb-2">Primer comentario</label>
                    <textarea
                        value={firstComment}
                        onChange={(e) => setFirstComment(e.target.value)}
                        placeholder="Añadir comentario inicial (hashtags, menciones...)"
                        className="w-full h-20 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:border-purple-500 focus:outline-none"
                    />
                </div>

                {/* Schedule Toggle */}
                <div className="rounded-xl border border-gray-600 bg-gray-800/50 p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showSchedule}
                            onChange={(e) => setShowSchedule(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600"
                        />
                        <span className="text-sm font-medium">Programar publicación</span>
                    </label>

                    {showSchedule && (
                        <div className="flex gap-4 mt-3">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">Fecha</label>
                                <input
                                    type="date"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">Hora</label>
                                <input
                                    type="time"
                                    value={scheduleTime}
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Publish Button */}
                <button
                    onClick={handlePublish}
                    disabled={!caption.trim() || isOverLimit}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    {showSchedule && scheduleDate ? (
                        <>
                            <span>📅</span>
                            <span>Programar</span>
                        </>
                    ) : (
                        <>
                            <span>📤</span>
                            <span>Publicar ahora</span>
                        </>
                    )}
                </button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" />
        </div>
    );
}
