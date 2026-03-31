import React from 'react';

interface Signal {
  _id: string;
  titulo: string;
  descripcion: string;
  activo: string;
  direccion: 'long' | 'short';
  precioEntrada: number;
  stopLoss: number;
  takeProfit: number;
  estado: string;
  visibilidad: 'publica' | 'premium';
  resultado?: number;
  fechaEntrada: number;
  likes?: string[];
}

interface SignalCardProps {
  signal: Signal;
  isMember: boolean;
  onLike?: (signalId: string) => void;
  onOpen?: (signalId: string) => void;
}

const ESTADO_COLORS: Record<string, string> = {
  activa: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  en_ganancia: 'bg-green-500/20 text-green-400 border-green-500/30',
  en_perdida: 'bg-red-500/20 text-red-400 border-red-500/30',
  cerrada_ganancia: 'bg-green-500/20 text-green-400 border-green-500/30',
  cerrada_perdida: 'bg-red-500/20 text-red-400 border-red-500/30',
  stop_loss: 'bg-red-500/20 text-red-400 border-red-500/30',
  take_profit: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const DIRECCION_COLORS = {
  long: 'text-green-400 bg-green-500/10 border-green-500/20',
  short: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export const SignalCard: React.FC<SignalCardProps> = ({
  signal,
  isMember,
  onLike,
  onOpen,
}) => {
  const estadoColor = ESTADO_COLORS[signal.estado] || ESTADO_COLORS.activa;
  const direccionColor = DIRECCION_COLORS[signal.direccion as keyof typeof DIRECCION_COLORS];
  const isLocked = signal.visibilidad === 'premium' && !isMember;
  const likesCount = signal.likes?.length || 0;

  const formatPrice = (price: number) => price.toFixed(5);
  const formatResult = (result: number) => {
    const sign = result >= 0 ? '+' : '';
    return `${sign}${result.toFixed(2)}%`;
  };

  return (
    <div
      onClick={() => !isLocked && onOpen?.(signal._id)}
      className={`glass rounded-2xl overflow-hidden border transition-all duration-300 ${
        isLocked
          ? 'border-white/5 opacity-60'
          : 'border-white/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10'
      } cursor-pointer`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${direccionColor}`}>
              {signal.direccion.toUpperCase()}
            </span>
            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${estadoColor}`}>
              {signal.estado.replace('_', ' ')}
            </span>
          </div>
          {signal.visibilidad === 'premium' && (
            <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-wider border border-purple-500/30">
              PREMIUM
            </span>
          )}
        </div>

        <h3 className="text-lg font-black text-white uppercase tracking-wide mb-1">
          {signal.titulo}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2">
          {signal.descripcion}
        </p>
      </div>

      {/* Signal Details */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Entrada</p>
            <p className="text-white font-black">{formatPrice(signal.precioEntrada)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Stop Loss</p>
            <p className="text-red-400 font-black">{formatPrice(signal.stopLoss)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Take Profit</p>
            <p className="text-green-400 font-black">{formatPrice(signal.takeProfit)}</p>
          </div>
        </div>

        {/* Result */}
        {signal.resultado !== undefined && (
          <div className={`p-3 rounded-xl mb-4 ${
            signal.resultado >= 0
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Resultado</span>
              <span className={`text-lg font-black ${
                signal.resultado >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatResult(signal.resultado)}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-gray-500 font-bold">{signal.activo}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike?.(signal._id);
              }}
              className={`flex items-center gap-1 transition-colors ${
                onLike ? 'hover:text-primary' : ''
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {likesCount > 0 ? 'favorite' : 'favorite_border'}
              </span>
              <span className="text-[10px] text-gray-400 font-bold">{likesCount}</span>
            </button>
          </div>
          <span className="text-[10px] text-gray-500">
            {new Date(signal.fechaEntrada).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center p-6">
            <span className="material-symbols-outlined text-purple-400 text-4xl mb-2">lock</span>
            <p className="text-white font-black uppercase tracking-wider mb-1">Señal Premium</p>
            <p className="text-gray-400 text-xs">Unite a la comunidad para ver esta señal</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalCard;
