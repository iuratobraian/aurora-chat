import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import logger from '../utils/logger';

interface Broker {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    servers?: { id: string; name: string }[];
}

interface BrokerConnection {
    brokerId: string;
    accountId: string;
    server?: string;
    connectedAt?: number;
    lastSync?: number;
    status: 'connected' | 'connecting' | 'error' | 'disconnected';
    error?: string;
}

interface BrokerConnectProps {
    oderId: string;
    onConnectComplete?: () => void;
    className?: string;
    compact?: boolean;
}

const SUPPORTED_BROKERS: Broker[] = [
    {
        id: 'exness',
        name: 'Exness',
        description: 'Raw spreads desde 0.0 pips',
        icon: '📊',
        color: '#7000FF',
        servers: [
            { id: 'exness-real', name: 'Exness-Real' },
            { id: 'exness-real2', name: 'Exness-Real2' },
            { id: 'exness-real3', name: 'Exness-Real3' },
            { id: 'exness-demo', name: 'Exness-Demo' },
        ],
    },
    {
        id: 'icmarkets',
        name: 'IC Markets',
        description: 'Broker ECN líder global',
        icon: '🌊',
        color: '#00D4FF',
        servers: [
            { id: 'icmarkets-live', name: 'ICMarkets-Live' },
            { id: 'icmarkets-demo', name: 'ICMarkets-Demo' },
        ],
    },
    {
        id: 'fpmarkets',
        name: 'FP Markets',
        description: 'Ejecución ECN profesional',
        icon: '🎯',
        color: '#00FF88',
        servers: [
            { id: 'fpmarkets-live', name: 'FP Markets-Live' },
            { id: 'fpmarkets-demo', name: 'FP Markets-Demo' },
        ],
    },
    {
        id: 'other',
        name: 'Otro Broker',
        description: 'Conecta con otro broker',
        icon: '🏦',
        color: '#FFB800',
    },
];

const getBrokerInfo = (brokerId: string): Broker | undefined => {
    return SUPPORTED_BROKERS.find(b => b.id === brokerId);
};

const formatLastSync = (timestamp: number | undefined): string => {
    if (!timestamp) return 'Nunca';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes}min`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
};

export default function BrokerConnect({ oderId, onConnectComplete, className = '', compact = false }: BrokerConnectProps) {
    const connectBroker = useMutation(api.traderVerification.connectBroker);
    const disconnectBroker = useMutation(api.traderVerification.disconnectBroker);
    const verification = useQuery(api.traderVerification.getVerificationStatus, { oderId });
    
    const [connections, setConnections] = useState<Record<string, BrokerConnection>>({});
    const [activeBroker, setActiveBroker] = useState<string | null>(null);
    const [showConnectModal, setShowConnectModal] = useState(false);
    
    const [accountId, setAccountId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [selectedServer, setSelectedServer] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (verification?.brokerConnected && verification?.brokerName) {
            setConnections(prev => ({
                ...prev,
                [verification.brokerName]: {
                    brokerId: verification.brokerName,
                    accountId: verification.brokerAccountId || '',
                    connectedAt: verification.updatedAt,
                    lastSync: verification.updatedAt,
                    status: 'connected',
                }
            }));
        }
    }, [verification]);

    const validateCredentials = (brokerId: string, account: string, key: string, secret: string): boolean => {
        if (!account.trim()) return false;
        
        if (brokerId === 'exness') {
            return account.length >= 6;
        }
        if (brokerId === 'icmarkets') {
            return account.length >= 5;
        }
        if (brokerId === 'fpmarkets') {
            return account.length >= 5;
        }
        return account.length >= 4;
    };

    const handleConnect = async () => {
        if (!activeBroker) return;
        
        if (!validateCredentials(activeBroker, accountId, apiKey, apiSecret)) {
            setError('Credenciales inválidas. Verifica tu Account ID.');
            return;
        }

        setConnecting(true);
        setError(null);

        setConnections(prev => ({
            ...prev,
            [activeBroker]: {
                brokerId: activeBroker,
                accountId,
                server: selectedServer,
                status: 'connecting',
            }
        }));

        try {
            await connectBroker({
                oderId,
                brokerName: activeBroker,
                brokerAccountId: `${accountId}${selectedServer ? `@${selectedServer}` : ''}`,
            });

            setConnections(prev => ({
                ...prev,
                [activeBroker]: {
                    brokerId: activeBroker,
                    accountId,
                    server: selectedServer,
                    connectedAt: Date.now(),
                    lastSync: Date.now(),
                    status: 'connected',
                }
            }));

            setSuccess(true);
            setShowConnectModal(false);
            resetForm();
            onConnectComplete?.();

            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setError('Error al conectar con el broker. Verifica tus credenciales.');
            setConnections(prev => ({
                ...prev,
                [activeBroker]: {
                    ...prev[activeBroker],
                    status: 'error',
                    error: 'Error de conexión',
                }
            }));
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async (brokerId: string) => {
        if (!window.confirm('¿Estás seguro de desconectar este broker?')) return;

        setConnections(prev => ({
            ...prev,
            [brokerId]: {
                ...prev[brokerId],
                status: 'disconnected',
            }
        }));

        try {
            await disconnectBroker({ oderId, brokerName: brokerId });
        } catch (err) {
            logger.error('Error al desconectar:', err);
        }
    };

    const resetForm = () => {
        setAccountId('');
        setApiKey('');
        setApiSecret('');
        setSelectedServer('');
        setActiveBroker(null);
    };

    const openConnectModal = (brokerId: string) => {
        setActiveBroker(brokerId);
        setShowConnectModal(true);
        setError(null);
        const broker = getBrokerInfo(brokerId);
        if (broker?.servers?.length) {
            setSelectedServer(broker.servers[0].id);
        }
    };

    const connectedBrokers = Object.values(connections).filter(c => c.status === 'connected');
    const anyConnected = connectedBrokers.length > 0;

    if (compact) {
        return (
            <div className={`space-y-3 ${className}`}>
                {anyConnected && (
                    <div className="space-y-2">
                        {connectedBrokers.map(conn => {
                            const broker = getBrokerInfo(conn.brokerId);
                            return (
                                <div 
                                    key={conn.brokerId}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-emerald-500/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-lg">
                                            {broker?.icon || '🏦'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white">{broker?.name || conn.brokerId}</p>
                                            <p className="text-[9px] text-emerald-400/70">{conn.accountId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <button
                                            onClick={() => handleDisconnect(conn.brokerId)}
                                            className="size-7 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all flex items-center justify-center"
                                            title="Desconectar"
                                        >
                                            <span className="material-symbols-outlined text-sm">link_off</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    {SUPPORTED_BROKERS.filter(b => !connections[b.id] || connections[b.id].status !== 'connected').slice(0, 4).map(broker => (
                        <button
                            key={broker.id}
                            onClick={() => openConnectModal(broker.id)}
                            className="flex items-center gap-2 p-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 transition-all"
                        >
                            <span className="text-lg">{broker.icon}</span>
                            <span className="text-[10px] font-black text-white uppercase">{broker.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                        <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Conexiones Broker</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            Vincula tu cuenta para verificar estadísticas
                        </p>
                    </div>
                </div>
                {anyConnected && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase">{connectedBrokers.length} Conectado</span>
                    </div>
                )}
            </div>

            {success && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                    <span className="text-emerald-400 text-xs font-bold">Broker conectado exitosamente. Verificando estadísticas...</span>
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                    <span className="text-red-400 text-xs font-bold">{error}</span>
                </div>
            )}

            <div className="space-y-3 mb-6">
                {SUPPORTED_BROKERS.map((broker) => {
                    const conn = connections[broker.id];
                    const isConnected = conn?.status === 'connected';
                    const isConnecting = conn?.status === 'connecting';

                    return (
                        <div
                            key={broker.id}
                            className={`
                                relative rounded-xl border overflow-hidden transition-all
                                ${isConnected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/5 hover:bg-white/5 hover:border-white/20'}
                            `}
                        >
                            <div className="flex items-center gap-4 p-4">
                                <div 
                                    className="size-12 rounded-xl flex items-center justify-center text-2xl border border-white/10"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${broker.color}20, ${broker.color}10)`,
                                        borderColor: isConnected ? `${broker.color}50` : 'rgba(255,255,255,0.1)'
                                    }}
                                >
                                    {broker.icon}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-black text-white uppercase">{broker.name}</h3>
                                        {isConnected && (
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 rounded-full">
                                                <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                <span className="text-[9px] font-black text-emerald-400 uppercase">Live</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        {isConnected ? conn.accountId : broker.description}
                                    </p>
                                    {isConnected && conn.lastSync && (
                                        <p className="text-[9px] text-gray-600 mt-0.5">
                                            Sincronizado: {formatLastSync(conn.lastSync)}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {isConnected ? (
                                        <>
                                            <button
                                                onClick={() => window.open(getBrokerTerminalUrl(broker.id), '_blank')}
                                                className="size-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all flex items-center justify-center"
                                                title="Abrir Terminal"
                                            >
                                                <span className="material-symbols-outlined text-white text-sm">open_in_new</span>
                                            </button>
                                            <button
                                                onClick={() => handleDisconnect(broker.id)}
                                                className="size-9 rounded-xl hover:bg-red-500/20 border border-red-500/20 text-red-400/50 hover:text-red-400 transition-all flex items-center justify-center"
                                                title="Desconectar"
                                            >
                                                <span className="material-symbols-outlined text-sm">link_off</span>
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => openConnectModal(broker.id)}
                                            disabled={isConnecting}
                                            className={`
                                                px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                                                ${isConnecting 
                                                    ? 'bg-white/10 text-gray-500 cursor-not-allowed' 
                                                    : 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'
                                                }
                                            `}
                                        >
                                            {isConnecting ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Conectando
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">link</span>
                                                    Conectar
                                                </span>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-2 justify-center p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <span className="material-symbols-outlined text-emerald-500/70 text-sm">verified_user</span>
                <p className="text-[9px] text-emerald-500/70 font-black uppercase tracking-widest">Encriptación de Punto a Punto Activa</p>
            </div>

            {showConnectModal && activeBroker && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in" onClick={() => setShowConnectModal(false)}>
                    <div 
                        className="w-full max-w-sm glass rounded-[2rem] border border-white/10 shadow-2xl p-8 animate-in zoom-in-95" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div 
                                className="size-12 rounded-2xl flex items-center justify-center text-2xl border border-white/20"
                                style={{ background: `${getBrokerInfo(activeBroker)?.color}20` }}
                            >
                                {getBrokerInfo(activeBroker)?.icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                    Conectar {getBrokerInfo(activeBroker)?.name}
                                </h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">
                                    Credenciales de {getBrokerInfo(activeBroker)?.name}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                    ID de Cuenta / Login MT4/MT5
                                </label>
                                <input 
                                    type="text" 
                                    value={accountId}
                                    onChange={e => setAccountId(e.target.value)}
                                    placeholder="Ej: 14728563"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-primary transition-all"
                                />
                            </div>

                            {getBrokerInfo(activeBroker)?.servers && (
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Servidor del Broker
                                    </label>
                                    <select 
                                        value={selectedServer}
                                        onChange={e => setSelectedServer(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-primary transition-all appearance-none"
                                    >
                                        <option value="">Seleccionar servidor...</option>
                                        {getBrokerInfo(activeBroker)?.servers?.map(server => (
                                            <option key={server.id} value={server.id}>{server.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                    API Key (Opcional)
                                </label>
                                <input 
                                    type="password" 
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                    placeholder="Tu API Key..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-primary transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                    API Secret (Opcional)
                                </label>
                                <input 
                                    type="password" 
                                    value={apiSecret}
                                    onChange={e => setApiSecret(e.target.value)}
                                    placeholder="Tu API Secret..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-primary transition-all"
                                />
                                <p className="text-[8px] text-gray-600 mt-1.5 ml-1">
                                    Solo si tu broker requiere autenticación OAuth
                                </p>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button 
                                    onClick={() => { setShowConnectModal(false); resetForm(); }}
                                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleConnect}
                                    disabled={connecting || !accountId.trim()}
                                    className={`
                                        flex-2 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg
                                        ${connecting || !accountId.trim()
                                            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                            : 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95'
                                        }
                                    `}
                                >
                                    {connecting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Verificando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">link</span>
                                            Vincular Cuenta
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2 justify-center py-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                            <span className="material-symbols-outlined text-emerald-500 text-sm">security</span>
                            <p className="text-[8px] text-emerald-500/80 font-black uppercase tracking-widest">Tus credenciales se almacenan de forma segura</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function getBrokerTerminalUrl(brokerId: string): string {
    const terminals: Record<string, string> = {
        exness: 'https://trade.exness.com/terminal/',
        icmarkets: 'https://www.icmarkets.com/trading',
        fpmarkets: 'https://www.fpmarkets.com/platforms/metatrader/',
    };
    return terminals[brokerId] || 'https://www.metatrader4.com/';
}
