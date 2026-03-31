import React, { useState } from 'react';
import { BookReader } from '../../components/BookReader';

interface ProfileBibliotecaTabProps {
    userBookLibrary: any[];
    onNavigate?: (tab: string) => void;
}

export const ProfileBibliotecaTab: React.FC<ProfileBibliotecaTabProps> = ({
    userBookLibrary,
    onNavigate,
}) => {
    const [selectedBook, setSelectedBook] = useState<{ title: string; fileUrl: string } | null>(null);

    return (
        <div className="space-y-6">
            <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-400">menu_book</span>
                    Mi Biblioteca
                </h3>
                
                {userBookLibrary && userBookLibrary.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {userBookLibrary.map((book: any) => (
                            <div
                                key={book._id}
                                onClick={() => setSelectedBook({ title: book.title, fileUrl: book.fileUrl })}
                                className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all cursor-pointer group hover:scale-105 hover:shadow-lg hover:shadow-amber-500/10"
                            >
                                <div className="relative h-40 bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                                    {book.coverUrl ? (
                                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-6xl text-amber-400/50 group-hover:scale-110 transition-transform">auto_stories</span>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <p className="text-white font-bold text-xs line-clamp-2 leading-tight">{book.title}</p>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-amber-400 bg-black/50 rounded-full p-1">play_arrow</span>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-[10px] text-white/40 line-clamp-1">
                                        {book.authorName || 'Autor desconocido'}
                                    </p>
                                    <p className="text-[9px] text-amber-400/60 mt-1">
                                        Añadido {new Date(book.addedAt).toLocaleDateString('es-ES')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="size-20 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <span className="material-symbols-outlined text-4xl text-amber-400/50">menu_book</span>
                        </div>
                        <h3 className="text-lg font-black text-white mb-2">Tu biblioteca está vacía</h3>
                        <p className="text-sm text-white/40 mb-4">Los libros que compres aparecerán aquí</p>
                        <button
                            onClick={() => onNavigate?.('marketplace')}
                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
                        >
                            <span className="material-symbols-outlined">store</span>
                            Explorar Marketplace
                        </button>
                    </div>
                )}
            </div>

            {selectedBook && (
                <BookReader
                    fileUrl={selectedBook.fileUrl}
                    title={selectedBook.title}
                    onClose={() => setSelectedBook(null)}
                />
            )}
        </div>
    );
};

export default ProfileBibliotecaTab;
