import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const MusicPlayer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  interface MusicPlaylistConfig {
    value?: Array<{ name: string; url: string }>;
  }
  
  const playlistConfig = useQuery(api.config.getConfig, { key: "music_playlist" }) as MusicPlaylistConfig | null;
  const playlist = playlistConfig?.value || [
    { name: "TradeShare Mix", url: "https://soundcloud.com/krismidj" },
    { name: "Deep Focus", url: "https://soundcloud.com/chillhopdotcom/sets/lofi-hip-hop-radio" }
  ];

  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  if (!isVisible) return (
    <button 
      onClick={() => setIsVisible(true)}
      className="fixed top-1/2 -translate-y-1/2 left-4 z-[60] size-14 group rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-110 shadow-2xl shadow-primary/30"
    >
      <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-primary border-r-cyan-400 animate-spin-electric opacity-70 group-hover:opacity-100 pointer-events-none" />
      <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">music_note</span>
    </button>
  );

  // SoundCloud Widget API URL
  const targetUrl = encodeURIComponent(currentTrack.url);
  const embedUrl = `https://w.soundcloud.com/player/?url=${targetUrl}&color=%233b82f6&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`;

  return (
    <div className="fixed top-1/2 -translate-y-1/2 left-4 z-[60] transition-all duration-500 animate-in slide-in-from-left-10 group">
      {/* Reproductor Circular */}
      <div className="relative size-16 bg-[#0f1115] rounded-full flex flex-col items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-shadow">
        <div className={`absolute inset-0 rounded-full border-[2px] border-transparent border-t-primary border-l-cyan-400 opacity-80 pointer-events-none ${isPlaying ? 'animate-[spin_2s_linear_infinite]' : 'animate-pulse'}`} />
        <div className={`absolute -inset-1 rounded-full border-[1px] border-transparent border-b-purple-500 border-r-blue-500 opacity-40 pointer-events-none ${isPlaying ? 'animate-[spin_3s_linear_infinite_reverse]' : ''}`} />

        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="relative z-10 size-10 rounded-full flex items-center justify-center bg-primary hover:bg-blue-600 text-white transition-colors shadow-lg shadow-primary/40"
        >
          <span className="material-symbols-outlined text-xl">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Floating track info on hover */}
        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-x-4 group-hover:translate-x-0 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-1">
                    <span className={`size-1.5 rounded-full bg-primary ${isPlaying ? 'animate-ping' : ''}`} />
                    En Vivo
                </span>
                <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-white">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
            <p className="text-[11px] font-bold text-white truncate max-w-full mb-3">{currentTrack.name}</p>
            <div className="flex items-center gap-3">
                <button onClick={handleNext} className="flex-1 py-1.5 bg-white/5 hover:bg-white/5 rounded-lg text-[10px] font-black uppercase text-white transition-colors border border-white/10 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-xs">skip_next</span> Siguiente
                </button>
            </div>
        </div>

        {/* Hidden Iframe for Audio */}
        <div className="hidden">
             {isPlaying && (
                  <iframe 
                    key={`${currentTrackIndex}-${isPlaying}`}
                    ref={iframeRef}
                    width="100%" 
                    height="20" 
                    scrolling="no" 
                    frameBorder="no" 
                    allow="autoplay" 
                    src={embedUrl}
                  ></iframe>
             )}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;