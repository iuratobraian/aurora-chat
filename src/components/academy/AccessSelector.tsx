import React, { useState } from 'react';

interface AccessType {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  incluye: string[];
}

interface AccessSelectorProps {
  accessTypes: AccessType[];
  onSelect: (accessTypeId: string) => void;
  selectedId?: string;
}

const INCLUYE_ICONS: Record<string, string> = {
  curso: 'school',
  comunidad: 'groups',
  señales: 'trending_up',
  soporte: 'support_agent',
  'soporte_1a1': 'person',
  recursos: 'folder',
  certificados: 'certificate',
};

export const AccessSelector: React.FC<AccessSelectorProps> = ({
  accessTypes,
  onSelect,
  selectedId,
}) => {
  const [selected, setSelected] = useState<string>(selectedId || accessTypes[0]?._id);

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect(id);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'GRATIS';
    return `$${price}`;
  };

  const formatDuration = (days: number) => {
    if (days === 0) return 'Acceso de por vida';
    if (days >= 365) return `${Math.floor(days / 365)} año${days >= 730 ? 's' : ''}`;
    if (days >= 30) return `${Math.floor(days / 30)} mese${days >= 60 ? 's' : ''}`;
    return `${days} días`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4">
        Seleccioná tu Plan
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accessTypes.map((access) => (
          <div
            key={access._id}
            onClick={() => handleSelect(access._id)}
            className={`glass rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 ${
              selected === access._id
                ? 'border-primary bg-primary/5 shadow-xl shadow-primary/20'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            {/* Header */}
            <div className="mb-4">
              <h4 className="text-lg font-black text-white uppercase tracking-wide mb-2">
                {access.nombre}
              </h4>
              <p className="text-gray-400 text-sm">{access.descripcion}</p>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="text-3xl font-black text-primary mb-1">
                {formatPrice(access.precio)}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                {formatDuration(access.duracion)}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-6">
              {access.incluye.map((item) => {
                const icon = INCLUYE_ICONS[item.toLowerCase()] || 'check';
                return (
                  <div key={item} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">
                      {icon}
                    </span>
                    <span className="text-xs text-gray-300 font-bold capitalize">
                      {item.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Radio Button */}
            <div className="flex items-center justify-center">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selected === access._id
                  ? 'border-primary bg-primary'
                  : 'border-gray-500'
              }`}>
                {selected === access._id && (
                  <span className="material-symbols-outlined text-white text-xs">check</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Info */}
      {selected && (
        <div className="glass rounded-xl p-4 border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl">info</span>
            <p className="text-sm text-gray-300">
              Estás seleccionando: <span className="font-black text-white">{accessTypes.find(a => a._id === selected)?.nombre}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessSelector;
