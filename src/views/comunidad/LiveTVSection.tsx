import React, { memo, useRef } from 'react';
import { LiveStatus, Usuario, Ad } from '../../types';
import { extractYoutubeId } from '../../utils/youtube';
import LiveTVAdOverlay from '../../components/ad/LiveTVAdOverlay';

interface LiveTVSectionProps {
    liveStatus: LiveStatus;
    isAdmin: boolean;
    isLiveCinemaMode: boolean;
    usuario: Usuario | null;
    hasTvAccess: boolean;
    ads?: Ad[];
    onEditLive: () => void;
    onCinemaMode: () => void;
    onExitCinemaMode: () => void;
    onOpenSalesChat: () => void;
}

const LIVE_ROLES = ['cursante', 'trader_inicial', 'trader_experimentado', 'colaborador', 'diseñador', 'programador', 'admin', 'ceo', 'vip'];

const LiveBadge: React.FC = memo(() => (
    <div className="absolute top-4 left-4 z-30 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-2 animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.5)]">
        <span className="size-2 bg-white rounded-full shadow-[0_0_10px_white]" />
        EN VIVO
    </div>
));

const EditLiveButton: React.FC<{ isLive: boolean; onClick: () => void }> = memo(({ isLive, onClick }) => (
    <button
        onClick={onClick}
        className="absolute top-4 right-4 z-[30] px-4 py-2 bg-black/50 hover:bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-widest border border-white/10 transition-all backdrop-blur-md flex items-center gap-2"
    >
        {isLive ? 'Editar TV' : 'Iniciar Transmisión'}
    </button>
));

const CloseCinemaButton: React.FC<{ onClick: () => void }> = memo(({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute top-4 right-4 z-[1001] size-10 bg-black/50 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md"
    >
        <span className="material-symbols-outlined">close</span>
    </button>
));

const VideoIframe: React.FC<{ url: string; isAdmin: boolean }> = memo(({ url, isAdmin }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const videoId = extractYoutubeId(url);

    return (
        <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3`}
            className="w-full h-full relative z-10 pointer-events-auto"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    );
});

const LockOverlay: React.FC<{ isGuest: boolean; hasAccess: boolean; onCta: () => void }> = memo(({ isGuest, hasAccess, onCta }) => (
    <div className="absolute inset-0 z-10 bg-black/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl">
        <div className="size-20 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <span className="material-symbols-outlined text-4xl text-red-500 animate-pulse">lock</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-widest mb-3">Transmisión Restringida</h3>
        <p className="text-sm text-gray-400 font-bold max-w-md mx-auto mb-8">
            {isGuest
                ? "Actualmente estamos transmitiendo en vivo. Para ingresar debes ser parte de nuestra academia y comunidad. Regístrate y explora los planes de acceso."
                : "Estamos transmitiendo en vivo. Tu rango actual no te permite acceder a esta sesión formativa. Adquiere una membresía cursante para desbloquear la señal."}
        </p>
        <button
            onClick={onCta}
            className="px-8 py-4 bg-primary hover:bg-blue-600 border border-primary/50 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
        >
            <span className="material-symbols-outlined">workspace_premium</span>
            <span>{isGuest ? 'Ver Planes de Acceso' : 'Mejorar Membresía (Comprar)'}</span>
        </button>
    </div>
));

const AwaitingSignal: React.FC = memo(() => (
    <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">live_tv</span>
            <span className="text-white text-sm font-black uppercase tracking-widest">Transmisión en Vivo</span>
            <span className="text-gray-400 text-xs">Aguardando señal</span>
        </div>
    </div>
));

const LiveSidebar: React.FC<{ onOpenChat: () => void; onCinemaMode: () => void }> = memo(({ onOpenChat, onCinemaMode }) => (
    <div className="p-6 flex flex-col justify-center border-l border-primary/20 bg-[#06080c] z-10 relative">
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
            <span className="text-primary text-glow">TradeHub</span> TV
        </h3>
        <p className="text-sm text-gray-400 font-bold leading-relaxed mb-6">
            Únete a la sesión en vivo ahora. Análisis institucional de mercado, preguntas y respuestas en tiempo real.
        </p>
        <div className="flex flex-col gap-3">
            <button
                onClick={onOpenChat}
                className="w-full py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(59,130,246,0.4)]"
            >
                <span className="material-symbols-outlined text-xl">chat</span>
                Ingresar al Chat
            </button>
            <button
                onClick={onCinemaMode}
                className="w-full py-4 bg-white/5 hover:bg-white/5 text-white rounded-xl font-black uppercase border border-white/10 transition-all flex items-center justify-center gap-2"
            >
                <span className="material-symbols-outlined text-sm">fullscreen</span>
                Modo Cine
            </button>
        </div>
    </div>
));

const TVOffMessage: React.FC<{ alwaysOnMode?: boolean }> = memo(({ alwaysOnMode }) => (
    <div className={`flex flex-col items-center justify-center ${alwaysOnMode ? 'min-h-[400px]' : 'p-8 text-center bg-[#0a0000]'}`}>
        {alwaysOnMode ? (
            <>
                <div className="relative w-32 h-32 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full animate-pulse" />
                    <div className="absolute inset-4 bg-[#0a000f] rounded-full flex items-center justify-center border-2 border-primary/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                        <span className="material-symbols-outlined text-5xl text-gray-600">tv_off</span>
                    </div>
                </div>
                <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest mb-2">TV Fuera de Aire</h3>
                <p className="text-xs text-gray-600 font-bold max-w-xs text-center px-4">
                    La transmisión está offline actualmente. Vuelve más tarde para contenido en vivo.
                </p>
            </>
        ) : (
            <>
                <span className="material-symbols-outlined text-4xl text-gray-600 mb-2">tv_off</span>
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">TV Fuera de Aire</h3>
            </>
        )}
    </div>
));

const LiveTVSection: React.FC<LiveTVSectionProps> = ({
    liveStatus,
    isAdmin,
    isLiveCinemaMode,
    usuario,
    hasTvAccess,
    ads = [],
    onEditLive,
    onCinemaMode,
    onExitCinemaMode,
    onOpenSalesChat,
}) => {
    const isLive = liveStatus.isLive;
    const isGuest = !usuario || usuario.id === 'guest';
    const showPreview = isAdmin || isLive;

    if (!showPreview) return null;

    const videoUrl = extractYoutubeId(liveStatus.url);
    const hasValidUrl = !!videoUrl;

    return (
        <div className={`relative w-full rounded-2xl p-[3px] overflow-hidden shadow-2xl transition-all duration-500 ${isLiveCinemaMode ? 'fixed inset-0 z-[1000] rounded-none h-screen bg-black' : ''} ${isAdmin && !isLive ? 'border border-gray-800 bg-gray-900/50' : ''}`}>
            {isLive && !isLiveCinemaMode && (
                <>
                    <div className="absolute inset-[-50%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_240deg,#3b82f6_360deg)] z-0" />
                    <div className="absolute inset-[-50%] animate-[spin_5s_linear_infinite_reverse] bg-[conic-gradient(from_0deg,transparent_0_220deg,#06b6d4_360deg)] z-0" />
                </>
            )}

            <div className="relative z-10 w-full h-full bg-[#0a0000] rounded-[11px] overflow-hidden">
                {isAdmin && <EditLiveButton isLive={isLive} onClick={onEditLive} />}
                {isLiveCinemaMode && !isAdmin && <CloseCinemaButton onClick={onExitCinemaMode} />}

                {isLive ? (
                    <div className={`grid grid-cols-1 ${isLiveCinemaMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-0 h-full`}>
                        <div className={`${isLiveCinemaMode ? 'h-full' : 'lg:col-span-2 aspect-video'} bg-black relative`}>
                            {hasValidUrl ? (
                                <>
                                    {!isAdmin && <div className="absolute inset-0 z-20" />}
                                    {hasTvAccess ? (
                                        <VideoIframe url={liveStatus.url} isAdmin={isAdmin} />
                                    ) : (
                                        <LockOverlay
                                            isGuest={isGuest}
                                            hasAccess={hasTvAccess}
                                            onCta={onOpenSalesChat}
                                        />
                                    )}
                                </>
                            ) : (
                                <AwaitingSignal />
                            )}
                            <LiveBadge />

                            {/* Ad Overlay - Solo cuando hay ads y está en vivo */}
                            {isLive && ads.length > 0 && (
                                <LiveTVAdOverlay
                                    ads={ads}
                                    autoRotate={true}
                                    rotationInterval={15000}
                                    position="bottom-right"
                                />
                            )}
                        </div>
                        {!isLiveCinemaMode && (
                            <LiveSidebar
                                onOpenChat={() => window.dispatchEvent(new CustomEvent('open-live-chat'))}
                                onCinemaMode={onCinemaMode}
                            />
                        )}
                    </div>
                ) : (
                    <TVOffMessage alwaysOnMode={true} />
                )}
            </div>
        </div>
    );
};

export default memo(LiveTVSection);
