import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../api';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, Trash2, Edit2, Bell } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarViewProps {
  userId: string;
  channelId: string;
  onClose: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ userId, channelId, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [notificationMinutes, setNotificationMinutes] = useState(15);

  const events = useQuery(api.events.getEventsByChannel, { channelId });
  const createEvent = useMutation(api.events.createEvent);
  const joinEvent = useMutation(api.events.joinEvent);
  const leaveEvent = useMutation(api.events.leaveEvent);
  const deleteEvent = useMutation(api.events.deleteEvent);

  // Días del mes actual
  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Eventos para el día seleccionado
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate || !events) return [];
    return events.filter(e => isSameDay(new Date(e.date), selectedDate));
  }, [selectedDate, events]);

  // Eventos del mes actual para mostrar puntos en el calendario
  const eventsByDate = useMemo(() => {
    if (!events) return new Map<string, number>();
    const map = new Map<string, number>();
    events.forEach(e => {
      const dateKey = format(new Date(e.date), 'yyyy-MM-dd');
      map.set(dateKey, (map.get(dateKey) || 0) + 1);
    });
    return map;
  }, [events]);

  const handleCreateEvent = async () => {
    if (!newEventTitle.trim() || !newEventDate) return;
    const dateTime = new Date(`${newEventDate}T${newEventTime || '00:00'}`);
    try {
      await createEvent({
        channelId,
        title: newEventTitle,
        description: newEventDesc,
        date: dateTime.getTime(),
        userId: userId as any,
        notificationTime: notificationMinutes,
      });
      setNewEventTitle('');
      setNewEventDesc('');
      setNewEventDate('');
      setNewEventTime('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  const handleJoinLeave = async (eventId: string, isParticipating: boolean) => {
    try {
      if (isParticipating) {
        await leaveEvent({ eventId: eventId as any, userId: userId as any });
      } else {
        await joinEvent({ eventId: eventId as any, userId: userId as any });
      }
    } catch (err) {
      console.error('Error joining/leaving event:', err);
    }
  };

  return (
    <div className="flex flex-col h-full theme-bg">
      {/* Header */}
      <div className="pt-[env(safe-area-inset-top,12px)] pb-3 px-4 border-b theme-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded-lg transition-all theme-hover">
            <ChevronLeft size={18} className="theme-text" />
          </button>
          <h2 className="text-sm font-bold theme-text">Calendario de Eventos</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="p-1.5 rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary/20"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Navegación del mes */}
      <div className="px-4 py-3 flex items-center justify-between border-b theme-border">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 rounded theme-hover">
          <ChevronLeft size={16} className="theme-text" />
        </button>
        <h3 className="text-xs font-bold theme-text uppercase tracking-widest">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 rounded theme-hover">
          <ChevronRight size={16} className="theme-text" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 px-4 py-2 border-b theme-border">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="text-center text-[9px] font-bold theme-text-muted uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Calendario grid */}
      <div className="grid grid-cols-7 gap-1 p-4 flex-1 overflow-y-auto">
        {daysInMonth.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const eventCount = eventsByDate.get(dateKey) || 0;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`
                relative h-10 rounded-xl flex flex-col items-center justify-center transition-all text-xs font-semibold
                ${isSelected ? 'bg-primary text-white' : 'theme-hover'}
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isTodayDate && !isSelected ? 'border border-primary/50' : ''}
              `}
            >
              {format(day, 'd')}
              {eventCount > 0 && (
                <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de eventos del día seleccionado */}
      {selectedDate && (
        <div className="border-t theme-border p-4 flex-1 overflow-y-auto">
          <h4 className="text-[10px] font-bold theme-text-sec uppercase tracking-widest mb-3">
            Eventos {format(selectedDate, 'd MMM', { locale: es })}
          </h4>
          {selectedDayEvents.length === 0 ? (
            <p className="text-[11px] theme-text-muted text-center py-4">No hay eventos este día</p>
          ) : (
            <div className="space-y-2">
              {selectedDayEvents.map((event: any) => {
                const isParticipating = event.participants?.includes(userId);
                const isCreator = event.createdBy === userId;
                const eventDate = new Date(event.date);

                return (
                  <div key={event._id} className="theme-surface border theme-border rounded-xl p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <h5 className="text-xs font-bold theme-text flex-1">{event.title}</h5>
                      {isCreator && (
                        <button className="p-1 rounded theme-hover">
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-[10px] theme-text-sec">{event.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-[9px] theme-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {format(eventDate, 'HH:mm')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={10} />
                        {event.participants?.length || 0} participantes
                      </span>
                      {event.notificationTime && (
                        <span className="flex items-center gap-1">
                          <Bell size={10} />
                          {event.notificationTime}min antes
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleJoinLeave(event._id, isParticipating)}
                      className={`w-full py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                        isParticipating 
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      {isParticipating ? 'Salir' : 'Unirse'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Formulario crear evento */}
      {showCreateForm && (
        <div className="border-t theme-border p-4 space-y-3">
          <h4 className="text-[10px] font-bold theme-text uppercase tracking-widest">Nuevo Evento</h4>
          <input
            value={newEventTitle}
            onChange={e => setNewEventTitle(e.target.value)}
            placeholder="Título del evento"
            className="w-full theme-sidebar/5 border border-white/10 rounded-lg px-3 py-2 theme-text text-xs outline-none focus:border-primary/50"
          />
          <textarea
            value={newEventDesc}
            onChange={e => setNewEventDesc(e.target.value)}
            placeholder="Descripción..."
            className="w-full theme-sidebar/5 border border-white/10 rounded-lg px-3 py-2 theme-text text-xs outline-none focus:border-primary/50 h-16 resize-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={newEventDate}
              onChange={e => setNewEventDate(e.target.value)}
              className="theme-sidebar/5 border border-white/10 rounded-lg px-3 py-2 theme-text text-xs outline-none"
            />
            <input
              type="time"
              value={newEventTime}
              onChange={e => setNewEventTime(e.target.value)}
              className="theme-sidebar/5 border border-white/10 rounded-lg px-3 py-2 theme-text text-xs outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Bell size={12} className="text-primary" />
            <select
              value={notificationMinutes}
              onChange={e => setNotificationMinutes(parseInt(e.target.value))}
              className="flex-1 theme-sidebar/5 border border-white/10 rounded-lg px-3 py-2 theme-text text-xs outline-none"
            >
              <option value={5}>5 min antes</option>
              <option value={15}>15 min antes</option>
              <option value={30}>30 min antes</option>
              <option value={60}>1 hora antes</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest theme-text-muted theme-hover"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateEvent}
              className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20"
            >
              Crear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
