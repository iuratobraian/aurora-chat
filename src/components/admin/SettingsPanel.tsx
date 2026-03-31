import React, { useState, useEffect } from 'react';
import logger from '../../utils/logger';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface SettingsPanelProps {
    showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ showToast }) => {
    const [activeTab, setActiveTab] = useState<'platform' | 'email' | 'security' | 'popups'>('platform');
    const [config, setConfig] = useState({
        platformName: 'TradePortal 2025',
        platformUrl: 'https://tradeporatal.com',
        maintenanceMode: false,
        allowRegistration: true,
        emailFrom: 'noreply@tradeportal.com',
        emailName: 'TradePortal',
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUser: '',
        smtpPassword: '',
        requireEmailVerification: true,
        sessionTimeout: '24',
        maxLoginAttempts: '5',
    });
    
    const [coursePromoEnabled, setCoursePromoEnabled] = useState(true);
    const [coursePromoInterval, setCoursePromoInterval] = useState(30);

    const allConfig = useQuery(api.platformConfig.getAllConfig);
    const setConfigMutation = useMutation(api.platformConfig.setConfig);

    useEffect(() => {
        if (allConfig) {
            if (allConfig.platform) {
                setConfig((prev) => ({ ...prev, ...allConfig.platform }));
            }
            if (allConfig.coursePromoEnabled !== undefined) {
                setCoursePromoEnabled(allConfig.coursePromoEnabled);
            }
            if (allConfig.coursePromoInterval !== undefined) {
                setCoursePromoInterval(allConfig.coursePromoInterval / 60000);
            }
        }
    }, [allConfig]);

    const handleSave = async () => {
        try {
            await setConfigMutation({ key: 'platform', value: config, description: 'Platform configuration' });
            await setConfigMutation({ key: 'coursePromoEnabled', value: coursePromoEnabled });
            await setConfigMutation({ key: 'coursePromoInterval', value: coursePromoInterval * 60 * 1000 });
            showToast('success', 'Configuración guardada en la nube');
        } catch (err) {
            logger.error('Error saving config:', err);
            showToast('error', 'Error al guardar configuración');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400">settings</span>
                    Configuración
                </h2>
                <p className="text-xs text-gray-500 mt-1">Configuración general de la plataforma</p>
            </div>

            <div className="flex gap-2">
                {[
                    { id: 'platform', label: 'Plataforma', icon: 'dns' },
                    { id: 'email', label: 'Email', icon: 'email' },
                    { id: 'security', label: 'Seguridad', icon: 'security' },
                    { id: 'popups', label: 'Popups', icon: 'popup' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}
                    >
                        <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                {activeTab === 'platform' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Nombre de la Plataforma</label>
                                <input
                                    value={config.platformName}
                                    onChange={e => setConfig({ ...config, platformName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">URL de la Plataforma</label>
                                <input
                                    value={config.platformUrl}
                                    onChange={e => setConfig({ ...config, platformUrl: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.maintenanceMode}
                                    onChange={e => setConfig({ ...config, maintenanceMode: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/5 border-white/20"
                                />
                                <div>
                                    <p className="text-sm font-bold">Modo Mantenimiento</p>
                                    <p className="text-[10px] text-gray-500">Desactiva el acceso para usuarios normales</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.allowRegistration}
                                    onChange={e => setConfig({ ...config, allowRegistration: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/5 border-white/20"
                                />
                                <div>
                                    <p className="text-sm font-bold">Permitir Registros</p>
                                    <p className="text-[10px] text-gray-500">Nuevos usuarios pueden registrarse</p>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'email' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Email Remitente</label>
                                <input
                                    value={config.emailFrom}
                                    onChange={e => setConfig({ ...config, emailFrom: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Nombre Remitente</label>
                                <input
                                    value={config.emailName}
                                    onChange={e => setConfig({ ...config, emailName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">SMTP Host</label>
                                <input
                                    value={config.smtpHost}
                                    onChange={e => setConfig({ ...config, smtpHost: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Puerto SMTP</label>
                                <input
                                    value={config.smtpPort}
                                    onChange={e => setConfig({ ...config, smtpPort: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Usuario SMTP</label>
                                <input
                                    value={config.smtpUser}
                                    onChange={e => setConfig({ ...config, smtpUser: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Contraseña SMTP</label>
                            <input
                                type="password"
                                value={config.smtpPassword}
                                onChange={e => setConfig({ ...config, smtpPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                            />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.requireEmailVerification}
                                onChange={e => setConfig({ ...config, requireEmailVerification: e.target.checked })}
                                className="w-5 h-5 rounded bg-white/5 border-white/20"
                            />
                            <div>
                                <p className="text-sm font-bold">Requerir Verificación de Email</p>
                                <p className="text-[10px] text-gray-500">Usuarios deben confirmar su email para activar cuenta</p>
                            </div>
                        </label>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Timeout de Sesión (horas)</label>
                                <input
                                    type="number"
                                    value={config.sessionTimeout}
                                    onChange={e => setConfig({ ...config, sessionTimeout: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Máx Intentos de Login</label>
                                <input
                                    type="number"
                                    value={config.maxLoginAttempts}
                                    onChange={e => setConfig({ ...config, maxLoginAttempts: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <button className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-colors">
                            <span className="material-symbols-outlined text-sm mr-2">password</span>
                            Cambiar Contraseña Admin
                        </button>
                    </div>
                )}

                {activeTab === 'popups' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-amber-400 text-2xl">school</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-wider text-amber-400">Popup Curso VIP</h3>
                                    <p className="text-xs text-gray-500">Configuración del popup de promoción del curso</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <label className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5 cursor-pointer hover:bg-black/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-6 rounded-full relative transition-colors ${coursePromoEnabled ? 'bg-signal-green' : 'bg-gray-600'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${coursePromoEnabled ? 'right-1' : 'left-1'}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Habilitar Popup</p>
                                            <p className="text-[10px] text-gray-500">Mostrar popup de promoción del curso</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={coursePromoEnabled}
                                        onChange={e => setCoursePromoEnabled(e.target.checked)}
                                        className="sr-only"
                                    />
                                </label>

                                <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                                    <label className="block mb-3">
                                        <p className="text-sm font-bold mb-1">Intervalo de muestra</p>
                                        <p className="text-[10px] text-gray-500 mb-3">Tiempo entre cada muestra del popup</p>
                                        <select
                                            value={coursePromoInterval}
                                            onChange={e => setCoursePromoInterval(parseInt(e.target.value))}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary outline-none"
                                        >
                                            <option value={5}>5 minutos</option>
                                            <option value={10}>10 minutos</option>
                                            <option value={15}>15 minutos</option>
                                            <option value={30}>30 minutos</option>
                                            <option value={60}>1 hora</option>
                                            <option value={120}>2 horas</option>
                                        </select>
                                    </label>
                                </div>

                                <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-bold">Vista previa</p>
                                            <p className="text-[10px] text-gray-500">Cómo se verá el popup</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem('coursePromoClosed');
                                                localStorage.removeItem('coursePromoLastShown');
                                                showToast('info', 'Vista previa activada - se mostrará en 10s');
                                            }}
                                            className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary/30 transition-colors"
                                        >
                                            Probar Popup
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="material-symbols-outlined text-blue-400">info</span>
                                        <p className="text-sm font-bold">Información</p>
                                    </div>
                                    <div className="space-y-2 text-xs text-gray-400">
                                        <p>- El popup se muestra a los 10 segundos de login</p>
                                        <p>- Los usuarios pueden cerrar el popup y no molesta más (localStorage)</p>
                                        <p>- El intervalo define el tiempo entre cada muestra</p>
                                        <p>- Link de pago: /pricing ( MercadoPago checkout)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-6 border-t border-white/10 mt-6">
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-primary rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">save</span>
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
