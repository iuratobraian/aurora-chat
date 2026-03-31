import React, { useState } from 'react';
import { useAgentOrchestration, type Agent, type AgentType } from '../../hooks/useAgentOrchestration';

interface AgentStatusBarProps {
  onAgentSelect?: (agentId: AgentType) => void;
  compact?: boolean;
}

export const AgentStatusBar: React.FC<AgentStatusBarProps> = ({ onAgentSelect, compact = false }) => {
  const { agents, isInitialized } = useAgentOrchestration();
  const [expanded, setExpanded] = useState(false);

  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'loading');

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'loading': return 'bg-yellow-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusDot = (agent: Agent) => (
    <span 
      className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#0a0a0a] ${getStatusColor(agent.status)}`}
    />
  );

  if (!isInitialized) {
    return (
      <div className="h-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex items-center px-3 gap-2">
        <div className="size-5 rounded-full bg-white/10 animate-pulse" />
        <div className="h-2 w-16 bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
        >
          <div className="flex -space-x-1">
            {agents.slice(0, 3).map(agent => (
              <div key={agent.id} className="relative">
                <span 
                  className="material-symbols-outlined text-sm p-1 rounded-lg"
                  style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
                >
                  {agent.icon}
                </span>
                {getStatusDot(agent)}
              </div>
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            {activeAgents.length > 0 ? `${activeAgents.length} activos` : 'IA'}
          </span>
        </button>

        {expanded && (
          <div className="absolute top-full right-0 mt-2 w-64 glass bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => {
                  onAgentSelect?.(agent.id);
                  setExpanded(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="relative">
                  <span 
                    className="material-symbols-outlined p-2 rounded-xl"
                    style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
                  >
                    {agent.icon}
                  </span>
                  {getStatusDot(agent)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">{agent.name}</h4>
                  <p className="text-[10px] text-gray-500">{agent.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl">
      <span className="text-[10px] font-black uppercase text-gray-500 px-2">Agentes</span>
      <div className="flex -space-x-2">
        {agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => onAgentSelect?.(agent.id)}
            className="relative group"
          >
            <span 
              className="material-symbols-outlined p-2 rounded-xl border-2 border-[#0a0a0a] transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${agent.color}30`, color: agent.color }}
            >
              {agent.icon}
            </span>
            {getStatusDot(agent)}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 rounded-lg text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {agent.name}
            </div>
          </button>
        ))}
      </div>
      {activeAgents.length > 0 && (
        <div className="ml-2 px-2 py-1 bg-green-500/20 rounded-lg">
          <span className="text-[10px] font-bold text-green-400">{activeAgents.length} activos</span>
        </div>
      )}
    </div>
  );
};

export default AgentStatusBar;
