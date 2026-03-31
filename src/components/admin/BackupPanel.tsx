import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface BackupPanelProps {
    showToast: (type: 'success' | 'error' | 'info', message: string) => void;
    onExport: () => void;
    backups: any[];
}

const BackupPanel: React.FC<BackupPanelProps> = ({ showToast, onExport, backups }) => {
    const [exporting, setExporting] = useState(false);
    const [scheduleConfig, setScheduleConfig] = useState({
        frequency: 'daily',
        time: '03:00',
        retention: '7',
    });

    const backupSchedule = useQuery(api.platformConfig.getConfig, { key: 'backupSchedule' });
    const setConfigMutation = useMutation(api.platformConfig.setConfig);

    useEffect(() => {
        if (backupSchedule) {
            setScheduleConfig({
                frequency: (backupSchedule as any)?.frequency || 'daily',
                time: (backupSchedule as any)?.time || '03:00',
                retention: String((backupSchedule as any)?.retention || '7'),
            });
        }
    }, [backupSchedule]);

    const handleExport = async () => {
        setExporting(true);
        try {
            await onExport();
        } finally {
            setExporting(false);
        }
    };

    const handleSaveSchedule = async () => {
        try {
            await setConfigMutation({ 
                key: 'backupSchedule', 
                value: scheduleConfig,
                description: 'Backup schedule configuration' 
            });
            showToast('success', 'Programación guardada en la nube');
        } catch (err) {
            showToast('error', 'Error al guardar programación');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-400">backup</span>
                        Gestión de Backups
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Exporta e importa datos del sistema</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="px-4 py-2 bg-signal-green/20 text-signal-green rounded-lg text-xs font-bold hover:bg-signal-green/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-sm">{exporting ? 'hourglass_empty' : 'download'}</span>
                    {exporting ? 'Exportando...' : 'Exportar Sistema Completo'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-blue-400 text-2xl">description</span>
                        <span className="text-2xl font-black">{backups.length}</span>
                    </div>
                    <p className="text-xs text-gray-500">Backups en historial</p>
                </div>
                <div className="bg-gradient-to-br from-signal-green/20 to-emerald-600/10 border border-signal-green/20 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-signal-green text-2xl">check_circle</span>
                        <span className="text-2xl font-black">{backups.filter((b: any) => !b.restored).length}</span>
                    </div>
                    <p className="text-xs text-gray-500">Backups disponibles</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-purple-400 text-2xl">restore</span>
                        <span className="text-2xl font-black">{backups.filter((b: any) => b.restored).length}</span>
                    </div>
                    <p className="text-xs text-gray-500">Backups restaurados</p>
                </div>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                    <h3 className="text-sm font-bold">Historial de Exports</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {backups.length > 0 ? backups.map((backup: any) => (
                        <div key={backup._id} className="p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    backup.restored ? 'bg-yellow-500/20' : 'bg-signal-green/20'
                                }`}>
                                    <span className={`material-symbols-outlined ${
                                        backup.restored ? 'text-yellow-400' : 'text-signal-green'
                                    }`}>
                                        {backup.restored ? 'restore' : 'check_circle'}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold">
                                        {new Date(backup.createdAt).toLocaleString('es-ES')}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                        Exportado por: {backup.userId}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    backup.restored ? 'bg-yellow-500/20 text-yellow-400' : 'bg-signal-green/20 text-signal-green'
                                }`}>
                                    {backup.restored ? 'Restaurado' : 'Activo'}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-gray-500">
                            <span className="material-symbols-outlined text-5xl mb-2 block">folder_open</span>
                            <p>No hay backups exportados aún</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400">schedule</span>
                    Programación de Backups
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Frecuencia</label>
                        <select
                            value={scheduleConfig.frequency}
                            onChange={e => setScheduleConfig({ ...scheduleConfig, frequency: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm"
                        >
                            <option value="daily">Diario</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensual</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Hora</label>
                        <input
                            type="time"
                            value={scheduleConfig.time}
                            onChange={e => setScheduleConfig({ ...scheduleConfig, time: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Retener</label>
                        <select
                            value={scheduleConfig.retention}
                            onChange={e => setScheduleConfig({ ...scheduleConfig, retention: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm"
                        >
                            <option value="7">Últimos 7 días</option>
                            <option value="14">Últimos 14 días</option>
                            <option value="30">Últimos 30 días</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={handleSaveSchedule}
                    className="mt-4 px-6 py-3 bg-primary rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors"
                >
                    Guardar Programación
                </button>
            </div>
        </div>
    );
};

export default BackupPanel;
