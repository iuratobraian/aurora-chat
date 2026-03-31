import React, { useState, useEffect } from 'react';

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'New York (EST/EDT)', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: 'UTC-8' },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 'UTC+1' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 'UTC+8' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: 'UTC+8' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', offset: 'UTC+10' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', offset: 'UTC+12' },
];

const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const selectedTz = TIMEZONES.find(tz => tz.value === value) || TIMEZONES[0];
  
  const filteredTimezones = TIMEZONES.filter(tz => 
    tz.label.toLowerCase().includes(search.toLowerCase()) ||
    tz.value.toLowerCase().includes(search.toLowerCase()) ||
    tz.offset.includes(search)
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.timezone-selector')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative timezone-selector">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 glass rounded-xl text-sm
                   hover:bg-white/10 transition-all duration-200 border border-white/10"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-lg">schedule</span>
          <div className="text-left">
            <p className="font-semibold text-white">{selectedTz.offset}</p>
            <p className="text-[10px] text-white/50">{selectedTz.label.split('(')[0].trim()}</p>
          </div>
        </div>
        <span className={`material-symbols-outlined text-sm text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search timezone..."
              className="w-full px-3 py-2 bg-white/5 rounded-lg text-sm text-white placeholder-white/30
                         border border-white/10 focus:border-primary/50 focus:outline-none"
            />
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {filteredTimezones.map((tz) => (
              <button
                key={tz.value}
                onClick={() => {
                  onChange(tz.value);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors
                  ${value === tz.value 
                    ? 'bg-primary/20 text-white' 
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                  }
                `}
              >
                <span className="text-sm font-medium">{tz.label}</span>
                <span className="text-xs font-mono text-white/40">{tz.offset}</span>
              </button>
            ))}
            
            {filteredTimezones.length === 0 && (
              <p className="px-4 py-3 text-sm text-white/40 text-center">No timezones found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimezoneSelector;
