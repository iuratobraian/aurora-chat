import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

export type AgentType = 'news' | 'risk' | 'course' | 'creator' | 'voice';

export interface Agent {
  id: AgentType;
  name: string;
  description: string;
  icon: string;
  status: 'idle' | 'loading' | 'active' | 'error';
  color: string;
}

export interface AgentContextValue {
  agents: Agent[];
  isInitialized: boolean;
  setAgentStatus: (agentId: AgentType, status: Agent['status']) => void;
  getActiveAgents: () => Agent[];
}

const defaultAgents: Agent[] = [
  {
    id: 'news',
    name: 'Noticias',
    description: 'Asistente de noticias del mercado',
    icon: 'newspaper',
    status: 'idle',
    color: '#3b82f6'
  },
  {
    id: 'risk',
    name: 'Riesgo',
    description: 'Asistente de gestión de riesgo',
    icon: 'shield',
    status: 'idle',
    color: '#ef4444'
  },
  {
    id: 'course',
    name: 'Cursos',
    description: 'Asistente de aprendizaje',
    icon: 'school',
    status: 'idle',
    color: '#10b981'
  },
  {
    id: 'creator',
    name: 'Creador',
    description: 'Asistente para creadores de contenido',
    icon: 'video_library',
    status: 'idle',
    color: '#8b5cf6'
  },
  {
    id: 'voice',
    name: 'Voz',
    description: 'Agente de voz IA',
    icon: 'mic',
    status: 'idle',
    color: '#f59e0b'
  }
];

const AgentOrchestrationContext = createContext<AgentContextValue | null>(null);

export const useAgentOrchestration = () => {
  const context = useContext(AgentOrchestrationContext);
  if (!context) {
    throw new Error('useAgentOrchestration must be used within AgentOrchestrationProvider');
  }
  return context;
};

export const AgentOrchestrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAgents = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: 'idle'
      })));
      
      setIsInitialized(true);
    };

    initializeAgents();
  }, []);

  const setAgentStatus = useCallback((agentId: AgentType, status: Agent['status']) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, status } : agent
    ));
  }, []);

  const getActiveAgents = useCallback(() => {
    return agents.filter(agent => agent.status === 'active' || agent.status === 'loading');
  }, [agents]);

  return (
    <AgentOrchestrationContext.Provider value={{ agents, isInitialized, setAgentStatus, getActiveAgents }}>
      {children}
    </AgentOrchestrationContext.Provider>
  );
};

export default useAgentOrchestration;
