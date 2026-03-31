import React, { useState, useCallback } from 'react';
import logger from '../../utils/logger';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

interface ShareOption {
  id: string;
  icon: string;
  label: string;
  color: string;
  action: () => void;
}

interface MobileShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData;
  customOptions?: Omit<ShareOption, 'id' | 'action'>[];
}

const MobileShareSheet: React.FC<MobileShareSheetProps> = ({
  isOpen,
  onClose,
  shareData,
  customOptions = [],
}) => {
  const [isSupported] = useState(typeof navigator !== 'undefined' && 'share' in navigator);
  const [showNativeShare, setShowNativeShare] = useState(false);

  const handleNativeShare = useCallback(async () => {
    if (!isSupported) {
      setShowNativeShare(true);
      return;
    }

    try {
      await navigator.share(shareData);
      onClose();
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        logger.error('Error sharing:', err);
      }
    }
  }, [isSupported, shareData, onClose]);

  const handleCopyLink = useCallback(async () => {
    const link = shareData.url || window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      onClose();
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      onClose();
    }
  }, [shareData.url, onClose]);

  const defaultOptions: ShareOption[] = [
    {
      id: 'native',
      icon: 'share',
      label: 'Compartir',
      color: 'from-primary to-blue-600',
      action: handleNativeShare,
    },
    {
      id: 'copy',
      icon: 'link',
      label: 'Copiar enlace',
      color: 'from-gray-600 to-gray-700',
      action: handleCopyLink,
    },
    {
      id: 'whatsapp',
      icon: 'chat',
      label: 'WhatsApp',
      color: 'from-green-500 to-green-600',
      action: () => {
        const text = `${shareData.title || ''} ${shareData.url || ''}`.trim();
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        onClose();
      },
    },
    {
      id: 'twitter',
      icon: 'tag',
      label: 'Twitter / X',
      color: 'from-slate-700 to-slate-800',
      action: () => {
        const text = `${shareData.title || ''} ${shareData.url || ''}`.trim();
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
        onClose();
      },
    },
    {
      id: 'telegram',
      icon: 'send',
      label: 'Telegram',
      color: 'from-blue-400 to-blue-500',
      action: () => {
        const text = `${shareData.title || ''} ${shareData.url || ''}`.trim();
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareData.url || '')}&text=${encodeURIComponent(shareData.title || text)}`, '_blank');
        onClose();
      },
    },
    {
      id: 'email',
      icon: 'mail',
      label: 'Email',
      color: 'from-red-500 to-red-600',
      action: () => {
        const subject = shareData.title || '';
        const body = `${shareData.text || ''}\n\n${shareData.url || ''}`.trim();
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
        onClose();
      },
    },
  ];

  const allOptions = [...defaultOptions, ...customOptions.map((opt, i) => ({
    ...opt,
    id: `custom-${i}`,
    action: () => {},
  }))];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] transition-opacity duration-300"
        onClick={onClose}
        style={{ opacity: showNativeShare ? 0 : 1 }}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 z-[201] bg-card-dark border-t border-white/10 rounded-t-3xl p-6 pb-8 transition-transform duration-400 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Compartir</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400 text-xl">close</span>
          </button>
        </div>

        {shareData.title && (
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">{shareData.title}</p>
        )}

        <div className="grid grid-cols-4 gap-4">
          {allOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.action}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200`}
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  {option.icon}
                </span>
              </div>
              <span className="text-xs text-gray-400 text-center leading-tight">
                {option.label}
              </span>
            </button>
          ))}
        </div>

        {!isSupported && (
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
            <p className="text-xs text-gray-400 text-center">
              Tu navegador no soporta Web Share API. Usa las opciones alternativas.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileShareSheet;
