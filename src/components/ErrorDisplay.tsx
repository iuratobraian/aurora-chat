import React, { useState, useCallback } from 'react';
import { AlertCircle, Copy, Check, X } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onClose: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(error);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = error;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.warn('Failed to copy:', err);
    }
  }, [error]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#111111] border border-red-500/20 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-red-500/10 px-4 py-3 flex items-center justify-between border-b border-red-500/20">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Error</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-red-500/10 transition-all">
            <X size={16} className="text-red-400" />
          </button>
        </div>

        {/* Error Content - Selectable */}
        <div className="p-6">
          <div 
            className="w-full bg-[#0a0a0a] border border-red-500/10 rounded-xl p-4 cursor-text select-all"
            style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
          >
            <pre className="text-xs text-red-100 font-mono whitespace-pre-wrap break-words leading-relaxed">
              {error}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-red-500/20 flex items-center justify-between bg-[#0a0a0a]/50">
          <span className="text-[9px] text-red-400/60 font-medium">
            Selecciona el texto o usa el botón para copiar
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              copied 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {copied ? (
              <>
                <Check size={12} />
                Copiado
              </>
            ) : (
              <>
                <Copy size={12} />
                Copiar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
