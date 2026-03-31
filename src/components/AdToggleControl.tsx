import React from 'react';

interface Props {
  adsEnabled: boolean;
  adFrequency: number;
  allowedAdTypes: string[];
  canDisableAds: boolean;
  planName: string;
  onToggle: (enabled: boolean) => void;
  onFrequencyChange: (freq: number) => void;
  onTypesChange: (types: string[]) => void;
}

const AD_TYPES = [
  { value: 'feed', label: 'Feed', icon: 'feed' },
  { value: 'sidebar', label: 'Sidebar', icon: 'vertical_split' },
  { value: 'banner', label: 'Banner', icon: 'image' },
];

const AdToggleControl: React.FC<Props> = ({
  adsEnabled,
  adFrequency,
  allowedAdTypes,
  canDisableAds,
  planName,
  onToggle,
  onFrequencyChange,
  onTypesChange,
}) => {
  const toggleType = (type: string) => {
    if (allowedAdTypes.includes(type)) {
      onTypesChange(allowedAdTypes.filter(t => t !== type));
    } else {
      onTypesChange([...allowedAdTypes, type]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Publicidad</h4>
          <p className="text-[10px] text-white/50 uppercase tracking-wider">
            Controla los anuncios en esta subcomunidad
          </p>
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
          planName === 'free' ? 'bg-gray-500/20 text-gray-400' :
          planName === 'starter' ? 'bg-blue-500/20 text-blue-400' :
          planName === 'growth' ? 'bg-purple-500/20 text-purple-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          Plan {planName}
        </span>
      </div>

      <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
        adsEnabled
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-white/5 border-white/10'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined text-2xl ${
            adsEnabled ? 'text-green-400' : 'text-white/30'
          }`}>
            campaign
          </span>
          <div>
            <p className="text-sm font-medium text-white">
              {adsEnabled ? 'Publicidad activa' : 'Publicidad desactivada'}
            </p>
            {adsEnabled && (
              <p className="text-[10px] text-white/50">
                Un anuncio cada {adFrequency} posts
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => onToggle(!adsEnabled)}
          disabled={!canDisableAds && !adsEnabled}
          className={`relative w-12 h-6 rounded-full transition-all ${
            adsEnabled ? 'bg-green-500' : 'bg-white/20'
          } ${!canDisableAds && !adsEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            adsEnabled ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {!canDisableAds && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <span className="material-symbols-outlined text-yellow-400 text-lg">info</span>
          <p className="text-[11px] text-yellow-400">
            Tu plan <strong>{planName}</strong> incluye publicidad obligatoria.
            Mejora a <strong>Starter</strong> para poder desactivarla.
          </p>
        </div>
      )}

      {adsEnabled && (
        <>
          <div className="space-y-2">
            <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
              Frecuencia de anuncios
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={3}
                max={15}
                value={adFrequency}
                onChange={(e) => onFrequencyChange(Number(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-sm font-bold text-white w-8 text-right">
                {adFrequency}
              </span>
            </div>
            <p className="text-[10px] text-white/40">Cada {adFrequency} posts se mostrará un anuncio</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
              Tipos de anuncio permitidos
            </label>
            <div className="flex gap-2">
              {AD_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    allowedAdTypes.includes(type.value)
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdToggleControl;
