import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type ImpactLevel = 'high' | 'medium' | 'low';
type SentimentType = 'bullish' | 'bearish' | 'neutral' | undefined;

interface EconomicEvent {
  _id: any;
  eventId: string;
  datetime: number;
  date: string;
  time: string;
  country: string;
  countryCode: string;
  currency: string;
  event: string;
  impact: ImpactLevel;
  actual?: string;
  forecast?: string;
  previous?: string;
  isLive: boolean;
  sentiment?: string;
}

const countryFlags: Record<string, string> = {
  'US': '🇺🇸', 'EU': '🇪🇺', 'GB': '🇬🇧', 'JP': '🇯🇵',
  'CA': '🇨🇦', 'AU': '🇦🇺', 'CH': '🇨🇭', 'NZ': '🇳🇿'
};

const CalendarioView: React.FC = () => {
  const [filtroImpacto, setFiltroImpacto] = useState<'todos' | 'alto'>('todos');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const eventsByDate = useQuery(api.market.economicCalendar.getEventsByDate, { date: selectedDate });
  const stats = useQuery(api.market.economicCalendar.getCalendarStats, { days: 7 });
  const syncCalendar = useMutation(api.market.economicCalendar.syncEconomicCalendar);

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncCalendar({});
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredEvents = eventsByDate?.filter(e => 
    filtroImpacto === 'todos' || e.impact === 'high'
  ) || [];

  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === 'bullish') return 'text-signal-green';
    if (sentiment === 'bearish') return 'text-alert-red';
    return 'text-gray-400';
  };

  const getImpactLabel = (impact: ImpactLevel) => {
    const labels: Record<ImpactLevel, string> = {
      high: 'ALTO',
      medium: 'MED',
      low: 'LOW'
    };
    return labels[impact];
  };

  const formatTime = (time: string) => {
    if (!time) return '--:--';
    const [h, m] = time.split(':');
    return `${h}:${m}`;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Economic Calendar</h3>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Sync calendar"
          >
            <svg className={`w-3 h-3 text-gray-500 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <button 
          onClick={() => setFiltroImpacto(filtroImpacto === 'todos' ? 'alto' : 'todos')}
          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all ${filtroImpacto === 'alto' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-500'}`}
        >
          High Impact
        </button>
      </div>

      <div className="flex items-center justify-between mb-2 px-1">
        <button 
          onClick={() => navigateDate('prev')}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={goToToday}
            className="text-[8px] font-bold text-primary hover:underline"
          >
            Today
          </button>
          <span className="text-[9px] font-mono font-bold text-gray-300">
            {formatDateDisplay(selectedDate)}
          </span>
        </div>
        
        <button 
          onClick={() => navigateDate('next')}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {stats && (
        <div className="flex items-center gap-3 mb-2 px-1">
          <div className="flex items-center gap-1">
            <span className="text-[7px] font-black text-red-500">HIGH</span>
            <span className="text-[8px] font-mono text-gray-400">{stats.high}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7px] font-black text-orange-500">MED</span>
            <span className="text-[8px] font-mono text-gray-400">{stats.medium}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7px] font-black text-gray-500">LOW</span>
            <span className="text-[8px] font-mono text-gray-400">{stats.low}</span>
          </div>
        </div>
      )}

      <div className="glass rounded-[1rem] border border-white/5 overflow-hidden shadow-lg flex-1 max-h-[280px] overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-12 gap-1 p-2 bg-white/5 text-[8px] font-black text-gray-600 uppercase tracking-wider border-b border-white/5 sticky top-0 backdrop-blur-md z-10">
          <div className="col-span-2 text-center">Time</div>
          <div className="col-span-1 text-center">Flag</div>
          <div className="col-span-5 pl-1">Event</div>
          <div className="col-span-2 text-center">Impact</div>
          <div className="col-span-2 text-right">Actual</div>
        </div>

        <div className="divide-y divide-white/5 text-gray-300">
          {filteredEvents.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-[9px]">
              No events for this date. Try syncing or selecting another date.
            </div>
          ) : (
            filteredEvents.map((event: EconomicEvent) => (
              <div 
                key={event._id} 
                className={`grid grid-cols-12 gap-1 p-2 items-center hover:bg-white/[0.03] transition-colors relative ${event.isLive ? 'bg-primary/5' : ''}`}
              >
                {event.isLive && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary animate-pulse"></div>
                )}
                <div className="col-span-2 text-center flex flex-col justify-center">
                  <p className={`text-[9px] font-mono font-bold ${event.isLive ? 'text-primary' : 'text-gray-400'}`}>
                    {formatTime(event.time)}
                  </p>
                </div>
                <div className="col-span-1 text-center text-sm">
                  {countryFlags[event.country] || '🌐'}
                </div>
                <div className="col-span-5 pl-1">
                  <p className="text-[9px] font-bold leading-tight line-clamp-2">{event.event}</p>
                  {event.currency && (
                    <span className="text-[7px] font-black uppercase text-gray-500">{event.currency}</span>
                  )}
                </div>
                <div className="col-span-2 text-center">
                  <span className={`text-[7px] font-black uppercase px-1 py-0.5 rounded ${
                    event.impact === 'high' ? 'text-red-500 bg-red-500/10' : 
                    event.impact === 'medium' ? 'text-orange-500 bg-orange-500/10' : 'text-gray-500'
                  }`}>
                    {getImpactLabel(event.impact)}
                  </span>
                </div>
                <div className={`col-span-2 text-right font-mono text-[9px] font-bold ${getSentimentColor(event.sentiment)}`}>
                  {event.actual || '--'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {stats?.upcomingHigh && stats.upcomingHigh.length > 0 && (
        <div className="mt-2 px-1">
          <p className="text-[7px] font-black uppercase text-gray-600 mb-1">Upcoming High Impact</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {stats.upcomingHigh.slice(0, 3).map((event: EconomicEvent) => (
              <div 
                key={event._id} 
                className="flex-shrink-0 glass rounded-lg p-1.5 border border-white/5"
              >
                <p className="text-[7px] font-mono text-gray-400">
                  {new Date(event.datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-[8px] font-bold text-gray-300 line-clamp-1">{event.event}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioView;
