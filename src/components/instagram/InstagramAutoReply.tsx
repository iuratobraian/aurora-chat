import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import logger from '../../../lib/utils/logger';

interface AutoReplyRule {
    _id: string;
    triggerType: 'keyword' | 'pattern' | 'sender' | 'always';
    triggerValue: string;
    responseType: 'text' | 'template' | 'ai_generated';
    responseText?: string;
    aiPrompt?: string;
    aiModel?: string;
    isActive: boolean;
    onlyNewFollowers: boolean;
    triggerCount: number;
    replyCount: number;
    createdAt: number;
}

interface InstagramAutoReplyProps {
    accountId: string;
}

export default function InstagramAutoReply({ accountId }: InstagramAutoReplyProps) {
    const [activeTab, setActiveTab] = useState<'rules' | 'templates' | 'settings'>('rules');
    const [showAddRule, setShowAddRule] = useState(false);
    const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null);
    const [ruleForm, setRuleForm] = useState({
        trigger: '',
        keywords: '',
        response: '',
        useAI: false,
        aiModel: 'phi-4-mini-instruct',
    });

    const rules = useQuery(api["instagram/autoReply"]?.getAutoReplyRules, { userId: 'current', accountId });
    const stats = useQuery(api["instagram/autoReply"]?.getActiveRules, { accountId });

    const createRule = useMutation(api["instagram/autoReply"]?.createAutoReplyRule);
    const toggleRule = useMutation(api["instagram/autoReply"]?.toggleRuleStatus);
    const deleteRuleMutation = useMutation(api["instagram/autoReply"]?.deleteAutoReplyRule);

    const handleSaveRule = async () => {
        if (!ruleForm.trigger || (!ruleForm.response && !ruleForm.useAI)) return;
        
        try {
            await createRule({
                userId: 'current',
                accountId,
                triggerType: ruleForm.trigger as 'keyword' | 'pattern' | 'sender' | 'always',
                triggerValue: ruleForm.keywords.split(',')[0]?.trim() || ruleForm.trigger,
                responseType: ruleForm.useAI ? 'ai_generated' : 'text',
                responseText: ruleForm.response,
                aiModel: ruleForm.useAI ? ruleForm.aiModel : undefined,
                onlyNewFollowers: false,
            });
            setShowAddRule(false);
            setRuleForm({ trigger: '', keywords: '', response: '', useAI: false, aiModel: 'phi-4-mini-instruct' });
        } catch (error) {
            logger.error('Error creating rule:', error);
        }
    };

    const handleToggleRule = async (ruleId: string, _active: boolean) => {
        try {
            await toggleRule({ ruleId: ruleId as Id<"instagram_auto_reply_rules">, userId: 'current' });
        } catch (error) {
            logger.error('Error toggling rule:', error);
        }
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta regla?')) return;
        try {
            await deleteRuleMutation({ ruleId: ruleId as Id<"instagram_auto_reply_rules">, userId: 'current' });
        } catch (error) {
            logger.error('Error deleting rule:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Respuestas Automáticas</h2>
                        <p className="text-gray-400 text-sm mt-1">Configura respuestas automáticas inteligentes</p>
                    </div>
                    <button
                        onClick={() => setShowAddRule(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva Regla
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <span className="text-gray-400 text-sm">Mensajes</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.totalReplies || 0}</p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <span className="text-gray-400 text-sm">AI Asistidas</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.aiReplies || 0}</p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-gray-400 text-sm">Tiempo Ahorrado</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.timeSaved || '0m'}</p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-gray-400 text-sm">Satisfacción</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.satisfactionRate || '100%'}</p>
                    </div>
                </div>

                <div className="border-b border-gray-700 mb-6">
                    <div className="flex gap-4">
                        {(['rules', 'templates', 'settings'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                                    activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                {tab === 'rules' ? 'Reglas' : tab === 'templates' ? 'Plantillas' : 'Configuración'}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'rules' && (
                    <div className="space-y-3">
                        {(rules || []).length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <p>No hay reglas configuradas</p>
                                <p className="text-sm mt-1">Crea tu primera regla de respuesta automática</p>
                            </div>
                        ) : (
                            (rules || []).map((rule: AutoReplyRule) => (
                                <div
                                    key={rule._id}
                                    className={`bg-gray-800 rounded-xl p-4 border transition-colors ${
                                        rule.isActive ? 'border-gray-700' : 'border-gray-800 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">
                                                    {rule.triggerType === 'keyword' ? 'Palabra clave' : rule.triggerType}
                                                </span>
                                                {rule.responseType === 'ai_generated' && (
                                                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                        </svg>
                                                        AI
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                                                    {rule.triggerValue}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 text-sm">{rule.responseText}</p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => setEditingRule(rule)}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRule(rule._id)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={rule.isActive}
                                                    onChange={(e) => handleToggleRule(rule._id, e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'templates' && (
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { name: 'Saludo', text: '¡Hola! Gracias por tu mensaje. ¿En qué puedo ayudarte hoy?' },
                            { name: 'Información', text: 'Para más información sobre nuestros servicios, visita nuestra página web.' },
                            { name: 'Horario', text: 'Nuestro horario de atención es de Lunes a Viernes, 9:00 AM - 6:00 PM.' },
                            { name: 'Gracias', text: '¡Gracias por tu interés! Te responderemos lo antes posible.' },
                            { name: 'Próximo', text: 'Estaré disponible en breve. ¿Hay algo urgente que necesites?' },
                            { name: 'Despedida', text: '¡Fue un placer ayudarte! No dudes en contactarnos si tienes más preguntas.' },
                        ].map((template, idx) => (
                            <div
                                key={idx}
                                className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-750 transition-colors group"
                                onClick={() => {
                                    setRuleForm(prev => ({ ...prev, response: template.text }));
                                    setShowAddRule(true);
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-white">{template.name}</h4>
                                    <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2">{template.text}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6 max-w-xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tiempo de Espera (minutos)</label>
                            <input
                                type="number"
                                defaultValue={1}
                                min={0}
                                max={60}
                                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Tiempo antes de enviar respuesta automática</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Límite Diario de Respuestas</label>
                            <input
                                type="number"
                                defaultValue={100}
                                min={1}
                                max={1000}
                                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Máximo de respuestas automáticas por día</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Modelo de IA Predeterminado</label>
                            <select className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option value="phi-4-mini-instruct">Phi-4 Mini (Microsoft/GitHub)</option>
                                <option value="gpt-4o-mini">GPT-4o Mini (OpenAI)</option>
                                <option value="claude-3-haiku">Claude 3 Haiku (Anthropic)</option>
                                <option value="gemini-pro">Gemini Pro (Google)</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between py-4 border-t border-gray-700">
                            <div>
                                <h4 className="font-medium text-white">Notificaciones</h4>
                                <p className="text-sm text-gray-500"> Recibir notificaciones por email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                            Guardar Configuración
                        </button>
                    </div>
                )}
            </div>

            {showAddRule && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg">
                        <h3 className="text-lg font-bold text-white mb-4">Nueva Regla de Respuesta</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Trigger</label>
                                <select
                                    value={ruleForm.trigger}
                                    onChange={(e) => setRuleForm(prev => ({ ...prev, trigger: e.target.value }))}
                                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="keyword">Palabra Clave</option>
                                    <option value="greeting">Saludo</option>
                                    <option value="question">Pregunta</option>
                                    <option value="silence">Sin Respuesta</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Palabras Clave (separadas por coma)</label>
                                <input
                                    type="text"
                                    value={ruleForm.keywords}
                                    onChange={(e) => setRuleForm(prev => ({ ...prev, keywords: e.target.value }))}
                                    placeholder="trading, forex, información"
                                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={ruleForm.useAI}
                                        onChange={(e) => setRuleForm(prev => ({ ...prev, useAI: e.target.checked }))}
                                        className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-white">Usar IA para generar respuesta</span>
                                </label>
                            </div>

                            {ruleForm.useAI && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Modelo de IA</label>
                                    <select
                                        value={ruleForm.aiModel}
                                        onChange={(e) => setRuleForm(prev => ({ ...prev, aiModel: e.target.value }))}
                                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="phi-4-mini-instruct">Phi-4 Mini (Recomendado)</option>
                                        <option value="gpt-4o-mini">GPT-4o Mini</option>
                                        <option value="claude-3-haiku">Claude 3 Haiku</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Respuesta Fija (si no usa IA)</label>
                                <textarea
                                    value={ruleForm.response}
                                    onChange={(e) => setRuleForm(prev => ({ ...prev, response: e.target.value }))}
                                    rows={3}
                                    placeholder="Escribe tu respuesta automática..."
                                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddRule(false)}
                                className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveRule}
                                disabled={!ruleForm.trigger || (!ruleForm.response && !ruleForm.useAI)}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                            >
                                Guardar Regla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
