
import React from 'react';

interface DockProps {
  pestañaActiva: string;
  setPestañaActiva: (id: string) => void;
  isProMode: boolean;
  toggleProMode: () => void;
}

const FloatingDock: React.FC<DockProps> = ({ pestañaActiva, setPestañaActiva, isProMode, toggleProMode }) => {
  const items = [
    { id: 'inicio', icon: 'grid_view', label: 'Dashboard' },
    { id: 'comunidad', icon: 'groups', label: 'Network' },
    { id: 'calendario', icon: 'event_note', label: 'Calendar' },
    { id: 'perfil', icon: 'person', label: 'Terminal' }
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="dock-glass rounded-[40px] px-6 py-4 flex items-center gap-4 shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10">
        {items.map((item) => {
          const isActive = pestañaActiva === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPestañaActiva(item.id)}
              className={`relative flex flex-col items-center justify-center size-14 rounded-[22px] transition-all duration-500 group ${
                isActive 
                ? "bg-primary text-white shadow-2xl shadow-primary/40 -translate-y-4 scale-125" 
                : "text-gray-500 hover:bg-white/5 hover:text-gray-300 hover:-translate-y-1"
              }`}
            >
              <span className={`material-symbols-outlined text-[28px] ${isActive ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              <span className="absolute -top-16 px-4 py-2 rounded-2xl glass text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap border border-white/10 pointer-events-none">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-2 size-2 bg-white rounded-full shadow-[0_0_12px_white]"></span>
              )}
            </button>
          );
        })}
        
        <div className="w-px h-10 bg-white/5 mx-2"></div>
        
        <button
          onClick={toggleProMode}
          className={`size-14 rounded-[22px] flex items-center justify-center transition-all group ${isProMode ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/30' : 'text-gray-500 hover:text-amber-500 hover:bg-white/5'}`}
        >
          <span className="material-symbols-outlined text-[28px]">{isProMode ? 'terminal' : 'visibility'}</span>
          <span className="absolute -top-16 px-4 py-2 rounded-2xl glass text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap border border-white/10 pointer-events-none">
            {isProMode ? 'Terminal Pro On' : 'Standard UI'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default FloatingDock;
