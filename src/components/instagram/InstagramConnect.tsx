import React from 'react';

interface InstagramConnectProps {
    onConnect?: () => void;
    loading?: boolean;
    className?: string;
    isConnected?: boolean;
}

export default function InstagramConnect({ 
    onConnect, 
    loading = false,
    className = '',
    isConnected = false
}: InstagramConnectProps) {
    return (
        <div className={`rounded-xl border border-gray-600 bg-gray-800/50 p-6 ${className}`}>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold">Instagram</h2>
                    <p className="text-sm text-gray-400">Conecta tu cuenta para publicar contenido</p>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-green-400">✓</span>
                    <span>Publicar fotos y videos</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-green-400">✓</span>
                    <span>Programar publicaciones</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-green-400">✓</span>
                    <span>Ver métricas y analytics</span>
                </div>
            </div>

            {isConnected ? (
                <div className="w-full py-3 px-4 bg-green-500/10 border border-green-500/50 text-green-400 font-bold rounded-lg flex items-center justify-center gap-3 animate-in fade-in zoom-in duration-500">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg shadow-green-500/20">
                        ✓
                    </div>
                    <span className="uppercase tracking-widest text-[10px]">Cuenta Verificada</span>
                </div>
            ) : (
                <button
                    onClick={onConnect}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin text-lg">⏳</span>
                            <span className="uppercase tracking-widest text-[10px] font-black">Conectando...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="uppercase tracking-widest text-[10px] font-black">Conectar con Instagram</span>
                        </>
                    )}
                </button>
            )}

            <p className="text-xs text-gray-500 mt-4 text-center">
                Al conectar, aceptas los Términos de Instagram y la Política de Privacidad de Meta.
            </p>
        </div>
    );
}
