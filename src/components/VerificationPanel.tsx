import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import KYCUpload from './KYCUpload';
import BrokerConnect from './BrokerConnect';
import logger from '../utils/logger';

interface VerificationPanelProps {
    oderId: string;
    className?: string;
}

export default function VerificationPanel({ oderId, className = '' }: VerificationPanelProps) {
    const verification = useQuery(api.traderVerification.getVerificationStatus, { oderId });
    const startVerification = useMutation(api.traderVerification.startVerification);
    
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [showBrokerForm, setShowBrokerForm] = useState(false);
    const [showKYCUpload, setShowKYCUpload] = useState(false);
    const [brokerName, setBrokerName] = useState('');
    const [brokerAccountId, setBrokerAccountId] = useState('');

    const handleStartVerification = async (level: string) => {
        try {
            setIsUpgrading(true);
            await startVerification({ oderId, level: level as any });
        } catch (error) {
            logger.error('Error starting verification:', error);
        } finally {
            setIsUpgrading(false);
        }
    };

    const levels = [
        {
            id: 'basic',
            icon: '⭐',
            title: 'BÁSICO',
            status: verification?.level === 'basic' || verification?.level !== 'none' ? 'active' : 'available',
            features: ['Email verificado', 'Identidad básica'],
            color: 'blue',
        },
        {
            id: 'intermediate',
            icon: '🏛️',
            title: 'INTERMEDIO (KYC)',
            status: verification?.level === 'intermediate' ? 'active' : 
                    ['advanced', 'institutional'].includes(verification?.level) ? 'completed' : 'available',
            features: ['+ Identidad verificada con documento', '+ Mayor límite de posts', '+ Acceso a Mentoring'],
            color: 'purple',
        },
        {
            id: 'advanced',
            icon: '🏅',
            title: 'AVANZADO (Trading)',
            status: verification?.level === 'advanced' ? 'active' : 
                    verification?.level === 'institutional' ? 'completed' : 'available',
            features: ['+ Conexión con broker verificado', '+ Estadísticas de trading auditadas', '+ Puede crear planes de señales'],
            color: 'yellow',
        },
        {
            id: 'institutional',
            icon: '🏛️',
            title: 'INSTITUCIONAL',
            status: verification?.level === 'institutional' ? 'active' : 'available',
            features: ['+ Para empresas y fondos', '+ API access dedicado', '+ Soporte VIP priority'],
            color: 'amber',
        },
    ];

    const colorClasses: Record<string, { border: string; bg: string; text: string; badge: string }> = {
        blue: { border: 'border-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/30 text-blue-300' },
        purple: { border: 'border-purple-500/50', bg: 'bg-purple-500/10', text: 'text-purple-400', badge: 'bg-purple-500/30 text-purple-300' },
        yellow: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500/30 text-yellow-300' },
        amber: { border: 'border-amber-500/50', bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/30 text-amber-300' },
    };

    const getStatusBadge = (status: string, color: string) => {
        const colors = colorClasses[color];
        if (status === 'active') return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.badge}`}>✓ Activo</span>;
        if (status === 'completed') return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.badge}`}>✓ Completado</span>;
        return null;
    };

    const currentLevelIndex = levels.findIndex(l => l.id === verification?.level);

    return (
        <div className={`rounded-xl border ${colorClasses.blue.border} bg-gray-800/50 p-6 ${className}`}>
            <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">✅</span>
                <h2 className="text-xl font-bold">Verificación de Trader</h2>
            </div>

            {verification?.level && verification.level !== 'none' && (
                <div className="mb-6 p-3 rounded-lg bg-gray-700/30 border border-gray-600">
                    <span className="text-sm text-gray-400">Tu nivel actual: </span>
                    <span className="font-semibold text-white">
                        {levels.find(l => l.id === verification?.level)?.icon}{' '}
                        {levels.find(l => l.id === verification?.level)?.title}
                    </span>
                </div>
            )}

            <div className="space-y-4">
                {levels.map((level, index) => {
                    const colors = colorClasses[level.color];
                    const isLocked = index > currentLevelIndex + 1;
                    const isNext = index === currentLevelIndex + 1;
                    
                    return (
                        <div 
                            key={level.id}
                            className={`
                                rounded-lg border p-4 transition-all
                                ${colors.border} ${colors.bg}
                                ${isLocked ? 'opacity-50' : ''}
                                ${level.status === 'active' ? 'ring-2 ring-offset-2 ring-offset-gray-900' : ''}
                            `}
                            style={level.status === 'active' ? { '--tw-ring-color': `var(--${level.color}-500, #a855f7)` } as any : undefined}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{level.icon}</span>
                                    <span className="font-bold">{level.title}</span>
                                </div>
                                {getStatusBadge(level.status, level.color)}
                            </div>
                            
                            <ul className="text-sm text-gray-400 space-y-1 mb-4">
                                {level.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-gray-500">•</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {isNext && (
                                <button
                                    onClick={() => {
                                        if (level.id === 'intermediate') {
                                            setShowKYCUpload(true);
                                        } else if (level.id === 'advanced') {
                                            setShowBrokerForm(true);
                                        } else {
                                            handleStartVerification(level.id);
                                        }
                                    }}
                                    disabled={isUpgrading}
                                    className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
                                >
                                    {isUpgrading ? 'Procesando...' : level.id === 'intermediate' ? 'Subir Documentos KYC →' : 'Mejorar →'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {showBrokerForm && (
                <div className="mt-4">
                    <BrokerConnect
                        oderId={oderId}
                        onConnectComplete={() => {
                            setShowBrokerForm(false);
                        }}
                        compact={false}
                    />
                </div>
            )}

            {showKYCUpload && (
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-purple-400">Subir Documento KYC</h3>
                        <button
                            onClick={() => setShowKYCUpload(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <span className="text-xl">×</span>
                        </button>
                    </div>
                    <KYCUpload
                        oderId={oderId}
                        onUploadComplete={() => {
                            setShowKYCUpload(false);
                        }}
                    />
                </div>
            )}

            {verification?.kycStatus === 'pending' && (
                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/50">
                    <span className="text-yellow-400 text-sm">
                        📋 Tu documento KYC está siendo revisado. Te notificaremos cuando sea aprobado.
                    </span>
                </div>
            )}

            {verification?.brokerConnected && (
                <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/50">
                    <span className="text-green-400 text-sm">
                        ✓ Broker conectado: {verification.brokerName}
                    </span>
                </div>
            )}
        </div>
    );
}
