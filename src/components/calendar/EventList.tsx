import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ImpactBadge from './ImpactBadge';

interface EventListProps {
  selectedDate: string | null;
  onEventClick: (eventId: string) => void;
  countries?: string[];
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸',
  EU: '🇪🇺',
  GB: '🇬🇧',
  JP: '🇯🇵',
  CN: '🇨🇳',
  AU: '🇦🇺',
  CA: '🇨🇦',
  CH: '🇨🇭',
  NZ: '🇳🇿',
};

const EventList: React.FC<EventListProps> = ({
  selectedDate,
  onEventClick,
  countries = []
}) => {
  const events = useQuery(
    api.market.economicCalendar?.listByDate,
    selectedDate ? { 
      date: selectedDate,
      countries: countries.length > 0 ? countries : undefined
    } : 'skip'
  );

  if (!selectedDate) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-4xl text-white/20 mb-3">calendar_today</span>
          <p className="text-sm text-white/50">Select a date to view events</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!events || events.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white/80 mb-4">{formatDate(selectedDate)}</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-4xl text-white/20 mb-3">event_busy</span>
          <p className="text-sm text-white/50">No economic events for this date</p>
        </div>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => {
    if (a.time < b.time) return -1;
    if (a.time > b.time) return 1;
    if (a.impact === 'high' && b.impact !== 'high') return -1;
    if (b.impact === 'high' && a.impact !== 'high') return 1;
    return 0;
  });

  const highImpactCount = events.filter(e => e.impact === 'high').length;

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white/80">{formatDate(selectedDate)}</h3>
        {highImpactCount > 0 && (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg border border-red-500/30">
            {highImpactCount} High Impact
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {sortedEvents.map((event) => (
          <button
            key={event._id}
            onClick={() => onEventClick(event._id)}
            className={`
              w-full p-3 rounded-xl text-left transition-all duration-200
              bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20
              ${event.impact === 'high' ? 'ring-1 ring-red-500/30' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center min-w-[40px]">
                <span className="text-lg">
                  {COUNTRY_FLAGS[event.countryCode] || '🌐'}
                </span>
                <span className="text-[10px] font-mono text-white/40">{event.currency}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-primary">{event.time}</span>
                  {event.isLive && (
                    <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[9px] font-bold rounded animate-pulse">
                      LIVE
                    </span>
                  )}
                  <ImpactBadge impact={event.impact} showLabel={false} size="sm" />
                </div>
                
                <h4 className="text-sm font-semibold text-white truncate mb-1">
                  {event.event}
                </h4>
                
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {event.previous && (
                    <span className="text-white/50">
                      <span className="text-white/30">Prev:</span> {event.previous}
                    </span>
                  )}
                  {event.forecast && (
                    <span className="text-white/50">
                      <span className="text-white/30">Fcst:</span> {event.forecast}
                    </span>
                  )}
                  {event.actual && (
                    <span className={`
                      ${event.sentiment === 'better' ? 'text-green-400' : ''}
                      ${event.sentiment === 'worse' ? 'text-red-400' : ''}
                      ${!event.sentiment ? 'text-white/50' : ''}
                    `}>
                      <span className="text-white/30">Act:</span> {event.actual}
                    </span>
                  )}
                </div>
              </div>
              
              <span className="material-symbols-outlined text-sm text-white/30">
                chevron_right
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-white/10 text-center">
        <span className="text-[10px] text-white/40">
          {events.length} event{events.length !== 1 ? 's' : ''} scheduled
        </span>
      </div>
    </div>
  );
};

export default EventList;
