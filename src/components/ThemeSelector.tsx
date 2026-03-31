import React, { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'system';

interface ThemeSelectorProps {
    value: Theme;
    onChange: (theme: Theme) => void;
    className?: string;
    variant?: 'cards' | 'buttons' | 'toggle';
}

const accentColors = [
    { name: 'Azul', value: '#3B82F6', textColor: 'text-blue-400' },
    { name: 'Púrpura', value: '#8B5CF6', textColor: 'text-purple-400' },
    { name: 'Verde', value: '#10B981', textColor: 'text-emerald-400' },
    { name: 'Naranja', value: '#F97316', textColor: 'text-orange-400' },
    { name: 'Rosa', value: '#EC4899', textColor: 'text-pink-400' },
    { name: 'Cyan', value: '#06B6D4', textColor: 'text-cyan-400' },
];

export const ACCENT_COLORS_EXPORT = accentColors;

export default function ThemeSelector({
    value,
    onChange,
    className = '',
    variant = 'cards'
}: ThemeSelectorProps) {
    const themes: { id: Theme; icon: string; label: string }[] = [
        { id: 'dark', icon: 'dark_mode', label: 'Oscuro' },
        { id: 'light', icon: 'light_mode', label: 'Claro' },
        { id: 'system', icon: 'settings_brightness', label: 'Sistema' },
    ];

    if (variant === 'toggle') {
        const currentIndex = themes.findIndex(t => t.id === value);

        return (
            <div className={`flex items-center gap-3 ${className}`}>
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => onChange(theme.id)}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                            ${value === theme.id
                                ? 'bg-white/10 text-white'
                                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                            }
                        `}
                    >
                        <span className="material-symbols-outlined text-sm">{theme.icon}</span>
                        <span>{theme.label}</span>
                    </button>
                ))}
            </div>
        );
    }

    if (variant === 'buttons') {
        return (
            <div className={`flex gap-2 ${className}`}>
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => onChange(theme.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            value === theme.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 hover:bg-white/10 text-white/70'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">{theme.icon}</span>
                        <span>{theme.label}</span>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-3 gap-3 ${className}`}>
            {themes.map((theme) => (
                <button
                    key={theme.id}
                    onClick={() => onChange(theme.id)}
                    className={`
                        relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                        ${value === theme.id
                            ? 'border-white bg-white/10'
                            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                        }
                    `}
                >
                    <span className="material-symbols-outlined text-2xl text-white/70">{theme.icon}</span>
                    <span className={`text-sm font-bold ${
                        value === theme.id ? 'text-white' : 'text-white/50'
                    }`}>
                        {theme.label}
                    </span>
                    {value === theme.id && (
                        <span className="absolute top-2 right-2 material-symbols-outlined text-xs text-white">check_circle</span>
                    )}
                </button>
            ))}
        </div>
    );
}

interface AccentColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    className?: string;
}

export function AccentColorPicker({ value, onChange, className = '' }: AccentColorPickerProps) {
    return (
        <div className={`flex flex-wrap gap-3 ${className}`}>
            {accentColors.map((color) => (
                <button
                    key={color.value}
                    onClick={() => onChange(color.value)}
                    className={`
                        w-10 h-10 rounded-full transition-all flex items-center justify-center
                        ${value === color.value
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110'
                            : 'hover:scale-105 hover:ring-2 hover:ring-white/30'
                        }
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                >
                    {value === color.value && (
                        <span className="text-white text-sm material-symbols-outlined">check</span>
                    )}
                </button>
            ))}
        </div>
    );
}

interface FontSizeSelectorProps {
    value: 'small' | 'medium' | 'large';
    onChange: (size: 'small' | 'medium' | 'large') => void;
    className?: string;
}

export function FontSizeSelector({ value, onChange, className = '' }: FontSizeSelectorProps) {
    const sizes: { id: 'small' | 'medium' | 'large'; label: string; sizeClass: string }[] = [
        { id: 'small', label: 'A-', sizeClass: 'text-xs' },
        { id: 'medium', label: 'A', sizeClass: 'text-sm' },
        { id: 'large', label: 'A+', sizeClass: 'text-base' },
    ];

    return (
        <div className={`flex gap-2 ${className}`}>
            {sizes.map((s) => (
                <button
                    key={s.id}
                    onClick={() => onChange(s.id)}
                    className={`
                        w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center
                        ${value === s.id
                            ? 'border-white bg-white/10 text-white'
                            : 'border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white/70'
                        }
                    `}
                >
                    <span className={s.sizeClass}>{s.label}</span>
                </button>
            ))}
        </div>
    );
}
