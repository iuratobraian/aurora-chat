import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ImpactBadge from './ImpactBadge';
import type { Doc } from '../../../convex/_generated/dataModel';

type EconomicEvent = Doc<'economic_calendar'>;

interface EventDetailProps {
  eventId: string | null;
  onClose: () => void;
}

const COUNTRY_INFO: Record<string, { name: string; flag: string; currency: string }> = {
  US: { name: 'United States', flag: '🇺🇸', currency: 'USD' },
  EU: { name: 'Eurozone', flag: '🇪🇺', currency: 'EUR' },
  GB: { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  JP: { name: 'Japan', flag: '🇯🇵', currency: 'JPY' },
  CN: { name: 'China', flag: '🇨🇳', currency: 'CNY' },
  AU: { name: 'Australia', flag: '🇦🇺', currency: 'AUD' },
  CA: { name: 'Canada', flag: '🇨🇦', currency: 'CAD' },
  CH: { name: 'Switzerland', flag: '🇨🇭', currency: 'CHF' },
  NZ: { name: 'New Zealand', flag: '🇳🇿', currency: 'NZD' },
};

const SOURCE_LABELS: Record<string, string> = {
  investing: 'Investing.com',
  myfxbook: 'MyFXBook',
  forexfactory: 'Forex Factory',
};

const EventDetail: React.FC<EventDetailProps> = ({ eventId, onClose }) => {
  const event = useQuery(
    api.market.economicCalendar?.get,
    eventId ? { id: eventId } : 'skip'
  );

  if (!eventId) return null;

  if (!event) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="glass rounded-2xl p-6 w-full max-w-md">
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const countryInfo = COUNTRY_INFO[event.countryCode] || {
    name: event.country,
    flag: '🌐',
    currency: event.currency
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'better': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'worse': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-white/50 bg-white/10 border-white/20';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="relative p-6 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-white/50">close</span>
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{countryInfo.flag}</span>
            <div>
              <ImpactBadge impact={event.impact} size="md" />
              <h2 className="text-lg font-bold text-white mt-2">{event.event}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-white/50">
            <span className="material-symbols-outlined text-base">public</span>
            <span>{countryInfo.name}</span>
            <span className="text-white/20">•</span>
            <span className="font-mono">{countryInfo.currency}</span>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-subtle rounded-xl p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Date</p>
              <p className="text-sm font-semibold text-white">{event.date}</p>
            </div>
            
            <div className="glass-subtle rounded-xl p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Time</p>
              <p className="text-sm font-semibold text-primary font-mono">{event.time}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white/80">Economic Data</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div className={`
                rounded-xl p-3 border
                ${event.sentiment === 'worse' ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}
              `}>
                <p className="text-[10px] text-white/40 uppercase mb-1">Previous</p>
                <p className="text-sm font-semibold text-white">
                  {event.previous || '-'}
                </p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-[10px] text-white/40 uppercase mb-1">Forecast</p>
                <p className="text-sm font-semibold text-white">
                  {event.forecast || '-'}
                </p>
              </div>
              
              <div className={`
                rounded-xl p-3 border
                ${event.sentiment === 'better' ? 'bg-green-500/10 border-green-500/30' : ''}
                ${event.sentiment === 'worse' ? 'bg-red-500/10 border-red-500/30' : ''}
                ${!event.sentiment ? 'bg-white/5 border-white/10' : ''}
              `}>
                <p className="text-[10px] text-white/40 uppercase mb-1">Actual</p>
                <p className={`
                  text-sm font-semibold
                  ${event.sentiment === 'better' ? 'text-green-400' : ''}
                  ${event.sentiment === 'worse' ? 'text-red-400' : ''}
                  ${!event.sentiment ? 'text-white' : ''}
                `}>
                  {event.actual || '-'}
                </p>
              </div>
            </div>
          </div>

          {event.revised && (
            <div className="glass-subtle rounded-xl p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Revised</p>
              <p className="text-sm font-semibold text-amber-400">{event.revised}</p>
            </div>
          )}

          {event.sentiment && (
            <div className={`
              flex items-center justify-between px-4 py-3 rounded-xl border
              ${getSentimentColor(event.sentiment)}
            `}>
              <div className="flex items-center gap-2">
                <span className={`
                  material-symbols-outlined text-lg
                  ${event.sentiment === 'better' ? 'text-green-400' : ''}
                  ${event.sentiment === 'worse' ? 'text-red-400' : ''}
                `}>
                  {event.sentiment === 'better' ? 'trending_up' : 'trending_down'}
                </span>
                <span className="text-sm font-semibold">
                  {event.sentiment === 'better' ? 'Better than expected' : 'Worse than expected'}
                </span>
              </div>
            </div>
          )}

          {event.isLive && (
            <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 rounded-xl border border-green-500/30 animate-pulse">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-green-400">Event is Live</span>
            </div>
          )}

          <div className="glass-subtle rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-bold text-white/80">Event Details</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] text-white/40">Timezone</p>
                <p className="font-medium text-white/70">{event.timezone}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40">Source</p>
                <p className="font-medium text-white/70">{SOURCE_LABELS[event.source] || event.source}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40">Created</p>
                <p className="font-medium text-white/70">{new Date(event.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40">Updated</p>
                <p className="font-medium text-white/70">{new Date(event.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-white/70 transition-colors border border-white/10"
          >
            Close
          </button>
          <button className="flex-1 px-4 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 text-sm font-semibold text-primary transition-colors border border-primary/30">
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">notifications_active</span>
              Set Alert
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
