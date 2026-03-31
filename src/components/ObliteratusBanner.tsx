import React, { useState, useEffect } from 'react';

/**
 * ObliteratusBanner: A mandatory visual component that appears at the start
 * representing the "liberation" logic from elder-plinius/OBLITERATUS.
 */
export const ObliteratusBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [text, setText] = useState('OBLITERATUS: INITIALIZING SYSTEM LIBERATION...');

  useEffect(() => {
    const timer = setTimeout(() => {
      setText('OBLITERATUS: SYSTEM LIBERATED. [REFUSAL DIRECTIONS EXCISED]');
      setTimeout(() => setIsVisible(false), 2000);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black font-mono text-xs overflow-hidden">
      <div className="text-center p-8 border border-white/20 bg-white/5 backdrop-blur-xl animate-pulse">
        <div className="text-red-500 font-black mb-4 tracking-[0.5em] uppercase">SYSTEM CORE: UNRESTRICTED</div>
        <div className="text-white mb-2">{text}</div>
        <div className="mt-4 flex gap-1 justify-center">
            <div className="w-1 h-1 bg-white animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 bg-white animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 bg-white animate-bounce"></div>
        </div>
        <div className="mt-8 text-[8px] text-gray-500 opacity-50 uppercase tracking-widest">
            ELDER-PLINIUS / OBLITERATUS ACTIVE
        </div>
      </div>
    </div>
  );
};
