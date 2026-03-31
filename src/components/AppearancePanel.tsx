import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import ThemeSelector, { AccentColorPicker, FontSizeSelector, Theme } from './ThemeSelector';
import LanguageSelector from './LanguageSelector';
import logger from '../utils/logger';

interface AppearancePanelProps {
    userId: string;
    className?: string;
}

const ACCENT_COLORS = [
    { name: 'Azul', value: '#3B82F6', textColor: 'text-blue-400', bgClass: 'bg-blue-500' },
    { name: 'Púrpura', value: '#8B5CF6', textColor: 'text-purple-400', bgClass: 'bg-purple-500' },
    { name: 'Verde', value: '#10B981', textColor: 'text-emerald-400', bgClass: 'bg-emerald-500' },
    { name: 'Naranja', value: '#F97316', textColor: 'text-orange-400', bgClass: 'bg-orange-500' },
    { name: 'Rosa', value: '#EC4899', textColor: 'text-pink-400', bgClass: 'bg-pink-500' },
    { name: 'Cyan', value: '#06B6D4', textColor: 'text-cyan-400', bgClass: 'bg-cyan-500' },
];

const STORAGE_KEY = 'tradeportal_appearance';

interface AppearanceSettings {
    theme: Theme;
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
    highContrast: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
}

const defaultSettings: AppearanceSettings = {
    theme: (localStorage.getItem('theme') as Theme) || 'dark',
    accentColor: '#3B82F6',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false,
    pushEnabled: true,
    emailEnabled: true,
};

function loadFromStorage(): AppearanceSettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...defaultSettings, ...JSON.parse(stored) };
        }
    } catch (e) { /* ignore */ }
    return defaultSettings;
}

function saveToStorage(settings: AppearanceSettings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) { /* ignore */ }
}

function applyThemeToDOM(theme: Theme, accentColor: string) {
    const root = document.documentElement;
    
    const prefersDark = theme === 'system' 
        ? window.matchMedia('(prefers-color-scheme: dark)').matches 
        : theme === 'dark';
    const resolved = prefersDark ? 'dark' : 'light';

    root.setAttribute('data-theme', resolved);
    root.classList.remove('dark', 'light');
    root.classList.add(resolved);

    root.style.setProperty('--accent-color', accentColor);
    document.body.style.setProperty('--primary', accentColor);
}

function applyFontSize(fontSize: 'small' | 'medium' | 'large') {
    const map = { small: '12px', medium: '14px', large: '16px' };
    document.documentElement.style.setProperty('--base-font-size', map[fontSize]);
    document.body.style.fontSize = map[fontSize];
}

export default function AppearancePanel({ userId, className = '' }: AppearancePanelProps) {
    const preferences = useQuery(api.userPreferences.getPreferences, { oderId: userId });
    const updateTheme = useMutation(api.userPreferences.updateTheme);
    const updateNotifications = useMutation(api.userPreferences.updateNotifications);

    const [settings, setSettings] = useState<AppearanceSettings>(loadFromStorage);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [previewAccent, setPreviewAccent] = useState<string | null>(null);

    useEffect(() => {
        if (preferences) {
            const fromServer: Partial<AppearanceSettings> = {
                theme: preferences.theme as Theme,
                accentColor: preferences.accentColor,
                fontSize: preferences.fontSize,
                reducedMotion: preferences.reducedMotion,
                highContrast: preferences.highContrast,
                pushEnabled: preferences.pushEnabled,
                emailEnabled: preferences.emailEnabled,
            };
            setSettings(prev => ({ ...prev, ...fromServer }));
        }
    }, [preferences]);

    useEffect(() => {
        applyThemeToDOM(settings.theme, settings.accentColor);
        applyFontSize(settings.fontSize);
    }, [settings.theme, settings.accentColor, settings.fontSize]);

    useEffect(() => {
        if (settings.theme !== 'system') return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            applyThemeToDOM(settings.theme, settings.accentColor);
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [settings.theme, settings.accentColor]);

    const showSaved = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const update = (partial: Partial<AppearanceSettings>) => {
        const next = { ...settings, ...partial };
        setSettings(next);
        saveToStorage(next);
    };

    const handleThemeChange = async (newTheme: Theme) => {
        const currentAccent = settings.accentColor;
        update({ theme: newTheme });
        applyThemeToDOM(newTheme, currentAccent);
        try {
            setSaving(true);
            await updateTheme({ oderId: userId, theme: newTheme, accentColor: currentAccent });
        } catch (e) {
            logger.error('Error updating theme:', e);
        } finally {
            setSaving(false);
            showSaved();
        }
    };

    const handleAccentChange = async (color: string) => {
        setPreviewAccent(color);
        update({ accentColor: color });
        applyThemeToDOM(settings.theme, color);
        try {
            setSaving(true);
            await updateTheme({ oderId: userId, theme: settings.theme, accentColor: color });
        } catch (e) {
            logger.error('Error updating accent color:', e);
        } finally {
            setSaving(false);
            setPreviewAccent(null);
            showSaved();
        }
    };

    const handleFontSizeChange = async (fontSize: 'small' | 'medium' | 'large') => {
        update({ fontSize });
        applyFontSize(fontSize);
        showSaved();
    };

    const handleAccessibility = (type: 'motion' | 'contrast', enabled: boolean) => {
        if (type === 'contrast') {
            document.documentElement.classList.toggle('high-contrast', enabled);
        }
        update({ [type === 'motion' ? 'reducedMotion' : 'highContrast']: enabled });
        showSaved();
    };

    const handleNotification = async (type: 'push' | 'email', enabled: boolean) => {
        update({ [type === 'push' ? 'pushEnabled' : 'emailEnabled']: enabled });
        try {
            setSaving(true);
            await updateNotifications({
                oderId: userId,
                pushEnabled: type === 'push' ? enabled : settings.pushEnabled,
                emailEnabled: type === 'email' ? enabled : settings.emailEnabled,
            });
        } catch (e) {
            logger.error('Error updating notifications:', e);
        } finally {
            setSaving(false);
            showSaved();
        }
    };

    const currentAccent = previewAccent || settings.accentColor;
    const currentAccentInfo = ACCENT_COLORS.find(c => c.value === currentAccent) || ACCENT_COLORS[0];

    return (
        <div className={`rounded-xl border border-white/10 bg-white/5 p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🎨</span>
                    <h2 className="text-xl font-bold">Apariencia</h2>
                </div>
                <div className="flex items-center gap-3">
                    {saving && <span className="text-xs text-gray-400">Guardando...</span>}
                    {saved && <span className="text-xs text-green-400 flex items-center gap-1">✓ Guardado</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-3">Tema</h3>
                        <ThemeSelector
                            value={settings.theme}
                            onChange={handleThemeChange}
                            variant="cards"
                        />
                    </div>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-3">Color de Acento</h3>
                        <AccentColorPicker
                            value={settings.accentColor}
                            onChange={handleAccentChange}
                        />
                    </div>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-3">Tamaño de Texto</h3>
                        <FontSizeSelector
                            value={settings.fontSize}
                            onChange={handleFontSizeChange}
                        />
                    </div>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-3">Idioma</h3>
                        <LanguageSelector variant="buttons" />
                    </div>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-3">Notificaciones</h3>
                        <div className="space-y-3">
                            <ToggleRow
                                label="Notificaciones push"
                                description="Recibe alertas en el navegador"
                                checked={settings.pushEnabled}
                                onChange={v => handleNotification('push', v)}
                                accentColor={currentAccent}
                            />
                            <ToggleRow
                                label="Notificaciones por email"
                                description="Resumen diario de actividad"
                                checked={settings.emailEnabled}
                                onChange={v => handleNotification('email', v)}
                                accentColor={currentAccent}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-3">Accesibilidad</h3>
                        <div className="space-y-3">
                            <ToggleRow
                                label="Reducir movimiento"
                                description="Minimiza animaciones"
                                checked={settings.reducedMotion}
                                onChange={v => handleAccessibility('motion', v)}
                                accentColor={currentAccent}
                            />
                            <ToggleRow
                                label="Alto contraste"
                                description="Mejora visibilidad del texto"
                                checked={settings.highContrast}
                                onChange={v => handleAccessibility('contrast', v)}
                                accentColor={currentAccent}
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-3">Vista Previa</h3>
                    <div className="rounded-xl border border-white/10 overflow-hidden"
                        style={{ backgroundColor: settings.theme === 'light' ? '#f8fafc' : '#0f1115' }}
                    >
                        <div className="p-4 border-b border-white/10 flex items-center gap-3">
                            <div className="size-8 rounded-lg flex items-center justify-center font-black text-white text-xs"
                                style={{ backgroundColor: currentAccent }}
                            >
                                TP
                            </div>
                            <div>
                                <p className="text-xs font-bold" style={{ color: settings.theme === 'light' ? '#1e293b' : '#f1f5f9' }}>
                                    TradePortal 2025
                                </p>
                                <p className="text-[10px]" style={{ color: settings.theme === 'light' ? '#64748b' : '#64748b' }}>
                                    {settings.fontSize === 'small' ? '12px' : settings.fontSize === 'large' ? '16px' : '14px'}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            <div className="rounded-lg p-3 flex items-center gap-2"
                                style={{ backgroundColor: settings.theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)' }}
                            >
                                <div className="size-6 rounded-full" style={{ backgroundColor: currentAccent }} />
                                <div className="h-2 flex-1 rounded" style={{ backgroundColor: settings.theme === 'light' ? '#cbd5e1' : '#334155', width: `${40 + Math.random() * 40}%` }} />
                            </div>
                            <div className="rounded-lg p-3 flex items-center gap-2"
                                style={{ backgroundColor: settings.theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)' }}
                            >
                                <div className="size-6 rounded-full" style={{ backgroundColor: currentAccent, opacity: 0.6 }} />
                                <div className="h-2 flex-1 rounded" style={{ backgroundColor: settings.theme === 'light' ? '#cbd5e1' : '#334155', width: `${30 + Math.random() * 30}%` }} />
                            </div>
                            <div className="rounded-lg p-3 flex items-center gap-2"
                                style={{ backgroundColor: settings.theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)' }}
                            >
                                <div className="size-6 rounded-full" style={{ backgroundColor: currentAccent, opacity: 0.3 }} />
                                <div className="h-2 flex-1 rounded" style={{ backgroundColor: settings.theme === 'light' ? '#cbd5e1' : '#334155', width: `${50 + Math.random() * 30}%` }} />
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10">
                            <div className="h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: currentAccent }}
                            >
                                Botón Primario
                            </div>
                        </div>

                        <div className="p-4 pt-0 space-y-2">
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase" style={{ color: currentAccent }}>
                                    Color activo: {currentAccentInfo.name}
                                </p>
                                <p className="text-[9px]" style={{ color: settings.theme === 'light' ? '#94a3b8' : '#64748b' }}>
                                    {settings.theme === 'dark' ? 'Modo Oscuro' : settings.theme === 'light' ? 'Modo Claro' : 'Sistema'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            const fresh: AppearanceSettings = { ...defaultSettings };
                            setSettings(fresh);
                            saveToStorage(fresh);
                            applyThemeToDOM(fresh.theme, fresh.accentColor);
                            applyFontSize(fresh.fontSize);
                            document.documentElement.classList.remove('high-contrast');
                            showSaved();
                        }}
                        className="mt-3 w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white/50 transition-colors"
                    >
                        Restablecer valores
                    </button>
                </div>
            </div>
        </div>
    );
}

interface ToggleRowProps {
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    accentColor: string;
}

function ToggleRow({ label, description, checked, onChange, accentColor }: ToggleRowProps) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <div>
                <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{label}</p>
                <p className="text-[10px] text-white/30">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                    checked ? '' : 'bg-white/10'
                }`}
                style={{ backgroundColor: checked ? accentColor : undefined }}
            >
                <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-lg ${
                        checked ? 'translate-x-5' : 'translate-x-1'
                    }`}
                />
            </button>
        </label>
    );
}
