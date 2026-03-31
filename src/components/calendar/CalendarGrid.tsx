import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ImpactBadge from './ImpactBadge';

interface CalendarGridProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  countries?: string[];
}

interface CalendarDay {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasHighImpact: boolean;
  hasMediumImpact: boolean;
  hasLowImpact: boolean;
  eventCount: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedDate,
  onDateSelect,
  countries = []
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());

  const endDate = new Date(monthEnd);
  const daysToAdd = 6 - monthEnd.getDay();
  endDate.setDate(endDate.getDate() + daysToAdd);

  const datesInView: string[] = [];
  const iterDate = new Date(startDate);
  while (iterDate <= endDate) {
    datesInView.push(iterDate.toISOString().split('T')[0]);
    iterDate.setDate(iterDate.getDate() + 1);
  }

  const events = useQuery(
    api.market.economicCalendar?.list,
    datesInView.length > 0 ? { 
      startDate: datesInView[0], 
      endDate: datesInView[datesInView.length - 1],
      countries: countries.length > 0 ? countries : undefined
    } : 'skip'
  );

  const eventsByDate = useMemo(() => {
    if (!events) return new Map<string, typeof events>();
    const map = new Map<string, typeof events>();
    for (const event of events) {
      const existing = map.get(event.date) || [];
      map.set(event.date, [...existing, event]);
    }
    return map;
  }, [events]);

  const calendarDays: CalendarDay[] = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const days: CalendarDay[] = [];
    
    const iter = new Date(startDate);
    while (iter <= endDate) {
      const dateStr = iter.toISOString().split('T')[0];
      const dayEvents = eventsByDate.get(dateStr) || [];
      
      days.push({
        date: dateStr,
        dayOfMonth: iter.getDate(),
        isCurrentMonth: iter.getMonth() === currentMonth,
        isToday: dateStr === today,
        hasHighImpact: dayEvents.some(e => e.impact === 'high'),
        hasMediumImpact: dayEvents.some(e => e.impact === 'medium'),
        hasLowImpact: dayEvents.some(e => e.impact === 'low'),
        eventCount: dayEvents.length
      });
      
      iter.setDate(iter.getDate() + 1);
    }
    
    return days;
  }, [startDate, endDate, currentMonth, eventsByDate]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            <span className="material-symbols-outlined text-sm text-white/70">chevron_left</span>
          </button>
          
          <h2 className="text-lg font-bold text-white min-w-[180px] text-center">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            <span className="material-symbols-outlined text-sm text-white/70">chevron_right</span>
          </button>
        </div>
        
        <button
          onClick={goToToday}
          className="px-4 py-2 text-xs font-semibold text-primary hover:text-blue-400 transition-colors"
        >
          Today
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-bold text-white/40 uppercase tracking-wider py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const isSelected = day.date === selectedDate;
          const hasAnyEvent = day.hasHighImpact || day.hasMediumImpact || day.hasLowImpact;
          
          return (
            <button
              key={day.date}
              onClick={() => onDateSelect(day.date)}
              className={`
                relative aspect-square p-1 rounded-xl transition-all duration-200
                flex flex-col items-center justify-center
                ${day.isCurrentMonth ? 'bg-white/5' : 'bg-transparent'}
                ${isSelected ? 'bg-primary/30 ring-2 ring-primary' : 'hover:bg-white/10'}
                ${day.isToday && !isSelected ? 'ring-1 ring-primary/50' : ''}
              `}
            >
              <span className={`
                text-sm font-semibold
                ${day.isCurrentMonth ? 'text-white' : 'text-white/30'}
                ${day.isToday ? 'text-primary' : ''}
              `}>
                {day.dayOfMonth}
              </span>
              
              {hasAnyEvent && (
                <div className="flex gap-0.5 mt-0.5">
                  {day.hasHighImpact && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                  {day.hasMediumImpact && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                  {day.hasLowImpact && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  )}
                </div>
              )}
              
              {day.eventCount > 0 && !hasAnyEvent && (
                <span className="absolute bottom-1 right-1 text-[8px] text-white/40">
                  {day.eventCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[10px] text-white/50">High</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-[10px] text-white/50">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[10px] text-white/50">Low</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
