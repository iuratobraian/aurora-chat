import React from 'react';

interface MarketSessionProps {
  timezone?: string;
  showLabels?: boolean;
}

interface Session {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hours: { open: number; close: number };
}

const SESSIONS: Session[] = [
  { 
    id: 'sydney', 
    name: 'Sydney', 
    shortName: 'SYD', 
    icon: 'wb_twilight',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    hours: { open: 22, close: 7 }
  },
  { 
    id: 'tokyo', 
    name: 'Tokyo', 
    shortName: 'TKY', 
    icon: 'wb_sunny',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    hours: { open: 0, close: 9 }
  },
  { 
    id: 'london', 
    name: 'London', 
    shortName: 'LDN', 
    icon: 'location_city',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    hours: { open: 8, close: 17 }
  },
  { 
    id: 'newyork', 
    name: 'New York', 
    shortName: 'NY', 
    icon: 'account_balance',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    hours: { open: 13, close: 22 }
  },
];

const MarketSession: React.FC<MarketSessionProps> = ({ 
  timezone = 'America/New_York',
  showLabels = true 
}) => {
  const getCurrentUTCHour = () => {
    const now = new Date();
    return now.getUTCHours();
  };

  const isSessionOpen = (session: Session) => {
    const currentHour = getCurrentUTCHour();
    const { open, close } = session.hours;
    
    if (open < close) {
      return currentHour >= open && currentHour < close;
    } else {
      return currentHour >= open || currentHour < close;
    }
  };

  const getSessionProgress = (session: Session) => {
    const currentHour = getCurrentUTCHour();
    const { open, close } = session.hours;
    
    let start, end;
    if (open < close) {
      start = open;
      end = close;
    } else {
      if (currentHour >= open) {
        start = open;
        end = close + 24;
      } else {
        start = open - 24;
        end = close;
      }
    }
    
    const totalHours = end - start;
    const elapsed = currentHour >= open 
      ? (currentHour >= open ? currentHour - open : currentHour + 24 - open)
      : 0;
    
    return Math.min(100, Math.max(0, (elapsed / totalHours) * 100));
  };

  const currentSession = SESSIONS.find(s => isSessionOpen(s));

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      {showLabels && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white/80">Market Sessions</h3>
          <span className="text-[10px] text-white/40 font-mono">
            {timezone.split('/').pop()?.replace('_', ' ')}
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        {SESSIONS.map((session) => {
          const isOpen = isSessionOpen(session);
          const progress = getSessionProgress(session);
          
          return (
            <div
              key={session.id}
              className={`
                relative rounded-xl p-3 border transition-all duration-300
                ${session.bgColor} ${session.borderColor}
                ${isOpen ? 'ring-1 ring-primary/50' : 'opacity-60'}
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-lg ${session.color}`}>
                  {session.icon}
                </span>
                <span className="text-xs font-bold text-white/90">{session.shortName}</span>
                {isOpen && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
              </div>
              
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isOpen ? 'bg-green-500' : 'bg-white/30'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="flex justify-between mt-1.5">
                <span className="text-[9px] text-white/40">
                  {session.hours.open.toString().padStart(2, '0')}:00
                </span>
                <span className="text-[9px] text-white/40">
                  {session.hours.close.toString().padStart(2, '0')}:00
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {currentSession && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/30">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400 font-semibold">
            {currentSession.name} Market is Open
          </span>
        </div>
      )}
    </div>
  );
};

export default MarketSession;
