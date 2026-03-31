import React, { useState } from 'react';
import { Poll, PollOption } from '../../types';

interface PollManagementProps {
    polls: Poll[];
    onCreatePoll: (poll: Partial<Poll>) => Promise<void>;
    onUpdatePoll: (pollId: string, updates: Partial<Poll>) => Promise<void>;
    onDeletePoll: (pollId: string) => Promise<void>;
    onTogglePoll: (pollId: string, active: boolean) => Promise<void>;
    onAddOption: (pollId: string, option: string) => Promise<void>;
    onRemoveOption: (pollId: string, optionId: string) => Promise<void>;
    onVote: (pollId: string, optionId: string) => void;
}

export const PollManagement: React.FC<PollManagementProps> = ({
    polls,
    onCreatePoll,
    onUpdatePoll,
    onDeletePoll,
    onTogglePoll,
    onAddOption,
    onRemoveOption,
    onVote,
}) => {
    const [showCreate, setShowCreate] = useState(false);
    const [editingPoll, setEditingPoll] = useState<string | null>(null);
    const [newPoll, setNewPoll] = useState({
        question: '',
        options: ['', ''],
        expiresAt: '',
        active: true,
    });

    const handleCreate = async () => {
        if (!newPoll.question.trim() || newPoll.options.filter(o => o.trim()).length < 2) return;
        
        await onCreatePoll({
            question: newPoll.question,
            options: newPoll.options.filter(o => o.trim()).map((text, i) => ({
                id: `opt-${Date.now()}-${i}`,
                text,
                votes: [],
            })),
            expiresAt: newPoll.expiresAt ? new Date(newPoll.expiresAt).getTime() : Date.now() + 86400000,
            active: true,
        });
        
        setNewPoll({ question: '', options: ['', ''], expiresAt: '', active: true });
        setShowCreate(false);
    };

    const addOption = () => {
        setNewPoll(prev => ({ ...prev, options: [...prev.options, ''] }));
    };

    const updateOption = (index: number, value: string) => {
        setNewPoll(prev => ({
            ...prev,
            options: prev.options.map((o, i) => i === index ? value : o),
        }));
    };

    const activePolls = polls.filter(p => p.active);
    const inactivePolls = polls.filter(p => !p.active);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#e5e2e1' }}>
                        <span className="material-symbols-outlined text-purple-400">poll</span>
                        Encuestas
                    </h2>
                    <p className="text-xs mt-1" style={{ color: '#86868B' }}>
                        {polls.length} encuestas • {activePolls.length} activas
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="px-4 py-2 bg-primary hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nueva Encuesta
                </button>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="rounded-xl p-6 border border-white/10" style={{ background: 'rgba(32, 31, 31, 0.8)' }}>
                    <h3 className="text-sm font-bold mb-4 text-white">Crear Nueva Encuesta</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Pregunta</label>
                            <input
                                value={newPoll.question}
                                onChange={e => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-primary outline-none"
                                placeholder="¿Cuál es tu opinión sobre...?"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Opciones</label>
                            {newPoll.options.map((opt, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input
                                        value={opt}
                                        onChange={e => updateOption(i, e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-primary outline-none"
                                        placeholder={`Opción ${i + 1}`}
                                    />
                                    {newPoll.options.length > 2 && (
                                        <button
                                            onClick={() => setNewPoll(prev => ({ ...prev, options: prev.options.filter((_, idx) => idx !== i) }))}
                                            className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addOption}
                                className="text-xs text-primary hover:text-blue-400 flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Agregar opción
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Expira</label>
                                <input
                                    type="datetime-local"
                                    value={newPoll.expiresAt}
                                    onChange={e => setNewPoll(prev => ({ ...prev, expiresAt: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="flex-1 py-2.5 bg-white/5 text-gray-400 font-bold rounded-lg hover:bg-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newPoll.question.trim() || newPoll.options.filter(o => o.trim()).length < 2}
                                className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Polls */}
            <div>
                <h3 className="text-sm font-bold text-green-400 uppercase mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">radio_button_checked</span>
                    Activas ({activePolls.length})
                </h3>
                <div className="space-y-3">
                    {activePolls.map(poll => (
                        <PollCard
                            key={poll.id}
                            poll={poll}
                            onEdit={() => setEditingPoll(poll.id)}
                            onDelete={() => onDeletePoll(poll.id)}
                            onToggle={() => onTogglePoll(poll.id, false)}
                            isEditing={editingPoll === poll.id}
                            onVote={onVote}
                        />
                    ))}
                    {activePolls.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-8">No hay encuestas activas</p>
                    )}
                </div>
            </div>

            {/* Inactive Polls */}
            {inactivePolls.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">history</span>
                        Archivadas ({inactivePolls.length})
                    </h3>
                    <div className="space-y-3">
                        {inactivePolls.map(poll => (
                            <PollCard
                                key={poll.id}
                                poll={poll}
                                onEdit={() => setEditingPoll(poll.id)}
                                onDelete={() => onDeletePoll(poll.id)}
                                onToggle={() => onTogglePoll(poll.id, true)}
                                onRestore={() => onTogglePoll(poll.id, true)}
                                isEditing={editingPoll === poll.id}
                                onVote={onVote}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const PollCard: React.FC<{
    poll: Poll;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
    onRestore?: () => void;
    onVote?: (pollId: string, optionId: string) => void;
    isEditing: boolean;
}> = ({ poll, onEdit, onDelete, onToggle, onRestore, isEditing }) => {
    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
    const isExpired = poll.expiresAt && poll.expiresAt < Date.now();

    return (
        <div 
            className={`rounded-xl p-4 border transition-all ${
                poll.active && !isExpired 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-white/10 bg-white/5 opacity-60'
            }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <p className="font-bold text-white mb-1">{poll.question}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">how_to_vote</span>
                            {totalVotes} votos
                        </span>
                        {isExpired && (
                            <span className="text-red-400">Expirada</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {onRestore ? (
                        <button
                            onClick={onRestore}
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                            title="Activar"
                        >
                            <span className="material-symbols-outlined text-sm">restore</span>
                        </button>
                    ) : (
                        <button
                            onClick={onToggle}
                            className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30"
                            title="Desactivar"
                        >
                            <span className="material-symbols-outlined text-sm">pause</span>
                        </button>
                    )}
                    <button
                        onClick={onEdit}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                        title="Editar"
                    >
                        <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                        title="Eliminar"
                    >
                        <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
                {poll.options.map(option => {
                    const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                    return (
                        <div key={option.id} className="relative">
                            <div 
                                className="absolute inset-y-0 left-0 bg-primary/20 rounded-lg"
                                style={{ width: `${percentage}%` }}
                            />
                            <div className="relative flex items-center justify-between p-2">
                                <span className="text-sm text-white">{option.text}</span>
                                <span className="text-xs text-gray-400">
                                    {option.votes.length} ({percentage.toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PollManagement;
