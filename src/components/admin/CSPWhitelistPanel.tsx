import React, { useState, useEffect } from 'react';
import logger from '../../utils/logger';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface CSPWhitelistPanelProps {
    showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const DEFAULT_WHITELIST = {
    convex: 'https://*.convex.cloud',
    googleAnalytics: 'https://www.google-analytics.com',
    weather: 'https://api.openweathermap.org',
    bitacora: 'https://bitacora-de-trading.vercel.app',
};

const CSP_CATEGORIES = [
    { key: 'convex', label: 'Convex', icon: 'cloud', description: 'Convex backend services' },
    { key: 'googleAnalytics', label: 'Google Analytics', icon: 'analytics', description: 'Analytics and tracking' },
    { key: 'weather', label: 'Weather API', icon: 'cloud', description: 'Weather data provider' },
    { key: 'bitacora', label: 'Bitácora', icon: 'book', description: 'Trading journal integration' },
];

const CSPWhitelistPanel: React.FC<CSPWhitelistPanelProps> = ({ showToast }) => {
    const [whitelist, setWhitelist] = useState<Record<string, string>>(DEFAULT_WHITELIST);
    const [customDomains, setCustomDomains] = useState<string[]>([]);
    const [newDomain, setNewDomain] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const allConfig = useQuery(api.platformConfig.getAllConfig);
    const setConfigMutation = useMutation(api.platformConfig.setConfig);

    useEffect(() => {
        if (allConfig?.cspWhitelist) {
            const saved = allConfig.cspWhitelist;
            setWhitelist(saved.domains || DEFAULT_WHITELIST);
            setCustomDomains(saved.customDomains || []);
            setLastUpdated(saved.updatedAt ? new Date(saved.updatedAt).toLocaleString('es-ES') : null);
        }
    }, [allConfig]);

    const handleToggleDomain = (key: string, enabled: boolean) => {
        setWhitelist(prev => ({
            ...prev,
            [key]: enabled ? DEFAULT_WHITELIST[key as keyof typeof DEFAULT_WHITELIST] : ''
        }));
    };

    const handleAddCustomDomain = () => {
        if (!newDomain.trim()) {
            showToast('error', 'Ingresa un dominio válido');
            return;
        }
        
        let domain = newDomain.trim();
        if (!domain.startsWith('https://') && !domain.startsWith('http://')) {
            domain = 'https://' + domain;
        }
        
        if (customDomains.includes(domain)) {
            showToast('error', 'Este dominio ya está en la lista');
            return;
        }
        
        setCustomDomains(prev => [...prev, domain]);
        setNewDomain('');
        showToast('success', 'Dominio agregado');
    };

    const handleRemoveCustomDomain = (domain: string) => {
        setCustomDomains(prev => prev.filter(d => d !== domain));
        showToast('info', 'Dominio eliminado');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setConfigMutation({
                key: 'cspWhitelist',
                value: {
                    domains: whitelist,
                    customDomains,
                    updatedAt: Date.now(),
                },
                description: 'CSP domains whitelist for Content Security Policy'
            });
            showToast('success', 'Lista CSP guardada en la nube');
            setLastUpdated(new Date().toLocaleString('es-ES'));
        } catch (err) {
            logger.error('Error saving CSP whitelist:', err);
            showToast('error', 'Error al guardar configuración');
        } finally {
            setIsSaving(false);
        }
    };

    const enabledCount = Object.values(whitelist).filter(v => v).length;
    const totalCount = Object.keys(DEFAULT_WHITELIST).length + customDomains.length;

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-400 text-2xl">verified_user</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-wider text-green-400">CSP Whitelist</h3>
                        <p className="text-xs text-gray-500">Dominios permitidos para conexiones externas</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-black/30 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-400">check_circle</span>
                        <span className="text-sm font-bold">{enabledCount}/{totalCount} dominios activos</span>
                    </div>
                    {lastUpdated && (
                        <div className="text-xs text-gray-500">
                            Actualizado: {lastUpdated}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dominios Predefinidos</h4>
                
                {CSP_CATEGORIES.map(cat => {
                    const isEnabled = !!whitelist[cat.key];
                    return (
                        <div key={cat.key} className="bg-white/5 rounded-xl border border-white/10 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-gray-400">{cat.icon}</span>
                                    <div>
                                        <p className="text-sm font-bold">{cat.label}</p>
                                        <p className="text-[10px] text-gray-500">{cat.description}</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isEnabled}
                                        onChange={e => handleToggleDomain(cat.key, (e.target as HTMLInputElement).checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>
                            {isEnabled && (
                                <div className="mt-3 p-2 bg-black/30 rounded-lg">
                                    <code className="text-xs text-green-400 font-mono">{whitelist[cat.key]}</code>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dominios Personalizados</h4>
                
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newDomain}
                        onChange={e => setNewDomain(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddCustomDomain()}
                        placeholder="https://ejemplo.com"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-green-500 outline-none"
                    />
                    <button
                        onClick={handleAddCustomDomain}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500/30 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                </div>

                {customDomains.length > 0 ? (
                    <div className="space-y-2">
                        {customDomains.map((domain, index) => (
                            <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
                                <code className="text-xs text-gray-300 font-mono">{domain}</code>
                                <button
                                    onClick={() => handleRemoveCustomDomain(domain)}
                                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                >
                                    <span className="material-symbols-outlined text-red-400 text-sm">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 text-center py-4">Sin dominios personalizados</p>
                )}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-400">info</span>
                    <div className="text-xs text-gray-400">
                        <p className="font-bold text-amber-400 mb-1">Importante</p>
                        <p>Los cambios en la whitelist CSP requieren un nuevo build para aplicarse completamente. Para desarrollo local, también debes actualizar vite.config.ts.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-white/10">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-green-500 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-sm">{isSaving ? 'hourglass_empty' : 'save'}</span>
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </div>
    );
};

export default CSPWhitelistPanel;
