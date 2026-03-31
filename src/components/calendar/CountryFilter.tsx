import React from 'react';

interface CountryFilterProps {
  selectedCountries: string[];
  onChange: (countries: string[]) => void;
}

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD' },
  { code: 'EU', name: 'Eurozone', flag: '🇪🇺', currency: 'EUR' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY' },
  { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD' },
];

const CountryFilter: React.FC<CountryFilterProps> = ({ selectedCountries, onChange }) => {
  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      onChange(selectedCountries.filter(c => c !== code));
    } else {
      onChange([...selectedCountries, code]);
    }
  };

  const selectAll = () => {
    onChange(COUNTRIES.map(c => c.code));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white/80">Countries</h3>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-[10px] font-semibold text-primary hover:text-blue-400 transition-colors"
          >
            All
          </button>
          <span className="text-white/20">|</span>
          <button
            onClick={clearAll}
            className="text-[10px] font-semibold text-white/50 hover:text-white/80 transition-colors"
          >
            None
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {COUNTRIES.map((country) => {
          const isSelected = selectedCountries.includes(country.code);
          return (
            <button
              key={country.code}
              onClick={() => toggleCountry(country.code)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
                transition-all duration-200 border
                ${isSelected 
                  ? 'bg-primary/20 border-primary/50 text-white' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              <span className="text-base">{country.flag}</span>
              <span>{country.code}</span>
            </button>
          );
        })}
      </div>
      
      {selectedCountries.length > 0 && selectedCountries.length < COUNTRIES.length && (
        <p className="text-[10px] text-white/40 text-center">
          Showing {selectedCountries.length} of {COUNTRIES.length} countries
        </p>
      )}
    </div>
  );
};

export default CountryFilter;
