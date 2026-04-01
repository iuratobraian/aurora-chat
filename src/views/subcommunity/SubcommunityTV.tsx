import React, { useState, memo, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { extractYoutubeId } from "../../utils/youtube";
import { useToast } from '../../components/ToastProvider';
import { PlayButton } from '../../components/ui/PlayButton';
import { DotPattern } from '../../components/ui/DotPattern';

const LiveBadge: React.FC = memo(() => (
  <div className="absolute top-4 left-4 z-30 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-2 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]">
    <span className="size-2 bg-white rounded-full shadow-[0_0_10px_white]" />
    EN VIVO
  </div>
));

const CinemaOverlay: React.FC<{ videoId: string; onClose: () => void }> = memo(({ videoId, onClose }) => (
  <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center animate-in fade-in duration-300">
    <button
      onClick={onClose}
      className="absolute top-4 right-4 z-[1001] size-10 bg-black/50 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all"
    >
      <span className="material-symbols-outlined">close</span>
    </button>
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
      className="w-full h-full"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
));

const OfflineBranding: React.FC<{ onPlay?: () => void }> = memo(({ onPlay }) => (
  <div className="relative flex items-center justify-center w-full aspect-video bg-[#0f1115] overflow-hidden">
    <DotPattern opacity={0.05} />
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10" />
    <div className="relative flex flex-col items-center gap-6 z-10">
      <div className="relative">
        <div className="size-24 rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-primary/60">live_tv</span>
        </div>
        <div className="absolute -inset-2 border border-primary/10 rounded-full animate-ping opacity-20" />
      </div>
      <div className="text-center">
        <span className="text-white text-lg font-black uppercase tracking-[0.3em] block mb-2">
          TradeShare TV
        </span>
        <span className="text-gray-500 text-xs font-medium uppercase tracking-[0.2em] block mb-1">
          Fuera de Aire
        </span>
        <span className="text-gray-600 text-[10px] font-medium uppercase tracking-wider block">
          El stream comenzará pronto
        </span>
      </div>
      {onPlay && (
        <PlayButton onClick={onPlay} size="lg" />
      )}
    </div>
  </div>
));

interface Props {
  subcommunityId: string;
  userId: string;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
}

const SubcommunityTV: React.FC<Props> = ({ subcommunityId, userId, isOwner, isAdmin, isMember }) => {
  const [streamUrl, setStreamUrl] = useState('');
  const [cinemaMode, setCinemaMode] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alwaysOn, setAlwaysOn] = useState(true);
  const { showToast } = useToast();

  const tvStatus = useQuery(api.subcommunityTV.getTVStatus, {
    subcommunityId: subcommunityId as any,
  });

  const startStream = useMutation(api.subcommunityTV.startStream);
  const stopStream = useMutation(api.subcommunityTV.stopStream);
  const updateStreamUrl = useMutation(api.subcommunityTV.updateStreamUrl);

  const tvIsLive = (tvStatus as any)?.tvIsLive ?? false;
  const tvStreamUrl = (tvStatus as any)?.tvStreamUrl ?? '';
  const videoId = tvStreamUrl ? extractYoutubeId(tvStreamUrl) : null;
  const hasControl = isOwner || isAdmin;

  const handleStart = useCallback(async () => {
    const trimmed = streamUrl.trim();
    if (!trimmed) {
      showToast('warning', 'La URL no puede estar vacía');
      return;
    }
    
    if (!extractYoutubeId(trimmed)) {
      showToast('error', 'URL de YouTube no válida');
      return;
    }

    setIsSaving(true);
    try {
      await startStream({
        subcommunityId: subcommunityId as any,
        userId,
        streamUrl: trimmed,
      });
      setShowUrlInput(false);
      setStreamUrl('');
      showToast('success', 'Transmisión iniciada correctamente');
    } catch (e: any) {
      showToast('error', e.message || 'Error al iniciar transmisión');
    } finally {
      setIsSaving(false);
    }
  }, [streamUrl, startStream, subcommunityId, userId, showToast]);

  const handleUpdate = useCallback(async () => {
    const trimmed = streamUrl.trim();
    if (!trimmed) {
      showToast('warning', 'La URL no puede estar vacía');
      return;
    }
    
    if (!extractYoutubeId(trimmed)) {
      showToast('error', 'URL de YouTube no válida');
      return;
    }

    setIsSaving(true);
    try {
      await updateStreamUrl({
        subcommunityId: subcommunityId as any,
        userId,
        streamUrl: trimmed,
      });
      setIsEditing(false);
      setStreamUrl('');
      showToast('success', 'URL de transmisión actualizada');
    } catch (e: any) {
      showToast('error', e.message || 'Error al actualizar URL');
    } finally {
      setIsSaving(false);
    }
  }, [streamUrl, updateStreamUrl, subcommunityId, userId, showToast]);

  const handleStop = useCallback(async () => {
    setIsSaving(true);
    try {
      await stopStream({ subcommunityId: subcommunityId as any, userId });
      showToast('info', 'Transmisión detenida');
    } catch (e: any) {
      showToast('error', e.message || 'Error al detener transmisión');
    } finally {
      setIsSaving(false);
    }
  }, [stopStream, subcommunityId, userId, showToast]);

  if (!isMember) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-12 bg-black/40 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-50" />
        <div className="size-20 rounded-3xl border border-white/10 bg-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
          <span className="material-symbols-outlined text-4xl text-gray-700">lock</span>
        </div>
        <div className="text-center relative z-10">
          <h3 className="text-lg font-black text-white uppercase tracking-[0.2em] mb-2">Transmisión Exclusiva</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">Únete a esta subcomunidad para acceder a la señal en vivo y interactuar con el creador.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#0f1115] rounded-[2.5rem] overflow-hidden border border-white/10 backdrop-blur-3xl shadow-2xl transition-all hover:border-white/20">
        {/* Video area */}
        <div className="relative group/video">
          {tvIsLive && videoId ? (
            <div className="relative aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <LiveBadge />
              <button
                onClick={() => setCinemaMode(true)}
                className="absolute bottom-4 right-4 z-30 px-3 py-2 bg-black/50 hover:bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md flex items-center gap-2 transition-all opacity-0 group-hover/video:opacity-100 scale-95 group-hover/video:scale-100"
              >
                <span className="material-symbols-outlined text-sm">fullscreen</span>
                Modo Cine
              </button>
            </div>
          ) : (
            <OfflineBranding onPlay={() => setAlwaysOn(true)} />
          )}
        </div>

        {/* Always On Toggle */}
        <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`size-8 rounded-lg flex items-center justify-center border ${tvIsLive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-gray-500'}`}>
              <span className="material-symbols-outlined text-sm">{tvIsLive ? 'sensors' : 'sensors_off'}</span>
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest leading-none mb-0.5">
                {tvIsLive ? 'Streaming Activo' : 'TV Fuera de Aire'}
              </h4>
              <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">
                {tvIsLive ? 'Señal en vivo' : alwaysOn ? 'Branding activo' : 'Offline'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAlwaysOn(!alwaysOn)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${alwaysOn ? 'bg-primary' : 'bg-white/10'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${alwaysOn ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Controls */}
        {hasControl && (
          <div className="p-6 border-t border-white/5 bg-gradient-to-b from-transparent to-white/5">
            {showUrlInput || isEditing ? (
              <div className="flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">URL de YouTube</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder-gray-600 outline-none focus:border-primary/50 transition-all"
                      autoFocus
                    />
                    <button
                      onClick={isEditing ? handleUpdate : handleStart}
                      disabled={isSaving || !streamUrl.trim()}
                      className="px-8 bg-primary hover:bg-blue-600 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                      {isSaving ? (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-lg">{isEditing ? 'save' : 'rocket_launch'}</span>
                      )}
                      {isEditing ? 'Actualizar' : 'Iniciar'}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setShowUrlInput(false); setIsEditing(false); setStreamUrl(''); }}
                    className="px-4 py-2 text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-xl flex items-center justify-center border ${tvIsLive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                    <span className="material-symbols-outlined text-xl">{tvIsLive ? 'sensors' : 'sensors_off'}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest leading-none mb-1">
                      {tvIsLive ? 'Streaming Activo' : 'Offline'}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                      {tvIsLive ? 'Conectado a señal de video' : 'Listo para iniciar'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!tvIsLive ? (
                    <button
                      onClick={() => setShowUrlInput(true)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-lg">play_arrow</span>
                      Iniciar Live
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { setIsEditing(true); setStreamUrl(tvStreamUrl); }}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                        Cambiar Link
                      </button>
                      <button
                        onClick={handleStop}
                        disabled={isSaving}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] border border-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-lg">stop</span>
                        )}
                        Finalizar
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cinema mode overlay */}
      {cinemaMode && videoId && (
        <CinemaOverlay videoId={videoId} onClose={() => setCinemaMode(false)} />
      )}
    </>
  );
};

export default memo(SubcommunityTV);
