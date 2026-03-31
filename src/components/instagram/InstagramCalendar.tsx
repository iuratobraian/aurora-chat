import React, { useState } from 'react';

export interface ScheduledPost {
    id: string;
    caption: string;
    mediaUrl?: string;
    scheduledAt: number;
    status: 'scheduled' | 'published' | 'failed';
    accountUsername: string;
}

interface InstagramCalendarProps {
    posts: ScheduledPost[];
    onPostClick?: (post: ScheduledPost) => void;
    onDateClick?: (date: Date) => void;
    className?: string;
}

export default function InstagramCalendar({ 
    posts,
    onPostClick,
    onDateClick,
    className = '' 
}: InstagramCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days: (number | null)[] = [];
        
        // Empty cells for days before the first day
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }
        
        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        
        return days;
    };

    const getPostsForDate = (day: number) => {
        return posts.filter(post => {
            const postDate = new Date(post.scheduledAt);
            return (
                postDate.getDate() === day &&
                postDate.getMonth() === currentDate.getMonth() &&
                postDate.getFullYear() === currentDate.getFullYear()
            );
        });
    };

    const navigateMonth = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    const days = getDaysInMonth(currentDate);
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const today = new Date();

    return (
        <div className={`rounded-xl border border-gray-600 bg-gray-800/50 ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="font-bold text-lg">Calendario</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        ←
                    </button>
                    <span className="font-medium min-w-[140px] text-center capitalize">
                        {formatMonthYear(currentDate)}
                    </span>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
                {/* Week days header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                        const dayPosts = day ? getPostsForDate(day) : [];
                        const isToday = day === today.getDate() && 
                                       currentDate.getMonth() === today.getMonth() && 
                                       currentDate.getFullYear() === today.getFullYear();
                        const isSelected = selectedDate?.getDate() === day &&
                                          selectedDate?.getMonth() === currentDate.getMonth() &&
                                          selectedDate?.getFullYear() === currentDate.getFullYear();
                        const isPast = day && new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                        return (
                            <div
                                key={index}
                                className={`
                                    min-h-[60px] p-1 rounded-lg border transition-colors cursor-pointer
                                    ${day ? 'border-gray-700 hover:border-gray-600' : ''}
                                    ${isToday ? 'border-purple-500 bg-purple-500/10' : ''}
                                    ${isSelected ? 'border-purple-500 bg-purple-500/20' : ''}
                                    ${isPast && day ? 'opacity-50' : ''}
                                `}
                                onClick={() => {
                                    if (day) {
                                        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                        setSelectedDate(newDate);
                                        onDateClick?.(newDate);
                                    }
                                }}
                            >
                                {day && (
                                    <>
                                        <span className={`
                                            text-sm font-medium block mb-1
                                            ${isToday ? 'text-purple-400' : 'text-gray-300'}
                                        `}>
                                            {day}
                                        </span>
                                        
                                        {/* Post indicators */}
                                        <div className="space-y-0.5">
                                            {dayPosts.slice(0, 2).map(post => (
                                                <button
                                                    key={post.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onPostClick?.(post);
                                                    }}
                                                    className={`
                                                        w-full text-left px-1 py-0.5 rounded text-xs truncate
                                                        ${post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' : ''}
                                                        ${post.status === 'published' ? 'bg-green-500/20 text-green-400' : ''}
                                                        ${post.status === 'failed' ? 'bg-red-500/20 text-red-400' : ''}
                                                    `}
                                                >
                                                    {post.status === 'published' ? '✓' : post.status === 'failed' ? '✗' : '📅'} {post.caption.slice(0, 20)}
                                                </button>
                                            ))}
                                            {dayPosts.length > 2 && (
                                                <span className="text-xs text-gray-500 px-1">
                                                    +{dayPosts.length - 2} más
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-700 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/50"></span>
                    <span className="text-gray-400">Programado</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50"></span>
                    <span className="text-gray-400">Publicado</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50"></span>
                    <span className="text-gray-400">Fallido</span>
                </div>
            </div>
        </div>
    );
}
