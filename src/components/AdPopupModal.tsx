import React, { useState } from 'react';
import ElectricLoader from './ElectricLoader';

interface Props {
  url: string;
  title: string;
  onClose: () => void;
}

const AdPopupModal: React.FC<Props> = ({ url, title, onClose }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-5xl bg-[#0a0f18] rounded-2xl overflow-hidden border border-primary/20 shadow-[0_0_80px_rgba(59,130,246,0.2)] flex flex-col animate-in zoom-in-95 duration-300" style={{ height: '88vh' }}>

        {/* Electric border top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            <span className="text-sm font-black text-white uppercase tracking-widest truncate max-w-xs">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-white/5"
              title="Abrir en nueva pestaña"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f18] z-10">
              <ElectricLoader text="Cargando contenido..." />
            </div>
          )}
          <iframe
            src={url}
            className="w-full h-full border-0"
            onLoad={() => setLoaded(true)}
            title={title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-60" />
      </div>
    </div>
  );
};

export default AdPopupModal;
