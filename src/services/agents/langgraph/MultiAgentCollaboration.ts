import type { AgentType } from '../agentOrchestrator';
import type { LangGraphState } from './types';
import { langGraphAgent } from './LangGraphAgent';

export type AgentMessageRole = 'coordinator' | 'researcher' | 'analyst' | 'executor' | 'reviewer';

export interface AgentMessage {
  id: string;
  from: AgentType;
  to: AgentType;
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface CollaborationSession {
  id: string;
  agents: AgentType[];
  messages: AgentMessage[];
  sharedState: Record<string, unknown>;
  status: 'initializing' | 'active' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
  result?: unknown;
}

export interface MultiAgentConfig {
  maxRounds: number;
  timeoutMs: number;
  requireAllResponses: boolean;
  consensusThreshold: number;
}

const DEFAULT_MULTI_AGENT_CONFIG: MultiAgentConfig = {
  maxRounds: 5,
  timeoutMs: 30000,
  requireAllResponses: false,
  consensusThreshold: 0.8
};

export class MultiAgentCollaboration {
  private config: MultiAgentConfig;
  private sessions: Map<string, CollaborationSession> = new Map();

  constructor(config: Partial<MultiAgentConfig> = {}) {
    this.config = { ...DEFAULT_MULTI_AGENT_CONFIG, ...config };
  }

  createSession(agents: AgentType[], initialInput: Record<string, unknown>): string {
    const sessionId = `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CollaborationSession = {
      id: sessionId,
      agents,
      messages: [],
      sharedState: { ...initialInput },
      status: 'initializing',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  getSession(sessionId: string): CollaborationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  async runCollaborative(
    sessionId: string,
    task: string,
    agentRoles?: Map<AgentType, AgentMessageRole>
  ): Promise<CollaborationSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = 'active';

    const roles = agentRoles || this.defaultRoles(session.agents);
    
    for (let round = 0; round < this.config.maxRounds; round++) {
      const roundMessages: AgentMessage[] = [];

      for (const agent of session.agents) {
        const role = roles.get(agent);
        const prompt = this.buildPrompt(agent, role, task, session, roundMessages);

        try {
          const result = await this.executeAgentWithTimeout(agent, prompt, session.sharedState);

          const message: AgentMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            from: agent,
            to: 'coordinator' as AgentType,
            content: typeof result.data === 'string' ? result.data : JSON.stringify(result.data),
            timestamp: Date.now(),
            metadata: {
              round,
              success: result.success,
              executionTime: result.executionTime
            }
          };

          roundMessages.push(message);
          session.messages.push(message);

          if (result.success && result.data) {
            this.mergeSharedState(session.sharedState, result.data);
          }
        } catch (error) {
          session.messages.push({
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            from: agent,
            to: 'coordinator' as AgentType,
            content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            timestamp: Date.now(),
            metadata: { round, success: false, error: true }
          });
        }
      }

      if (this.checkConsensus(session.messages)) {
        session.result = this.aggregateResults(session.messages);
        session.status = 'completed';
        break;
      }

      session.updatedAt = Date.now();
    }

    if (session.status !== 'completed') {
      session.status = 'completed';
      session.result = this.aggregateResults(session.messages);
    }

    return session;
  }

  private defaultRoles(agents: AgentType[]): Map<AgentType, AgentMessageRole> {
    const roles: Map<AgentType, AgentMessageRole> = new Map();
    const roleOrder: AgentMessageRole[] = ['coordinator', 'researcher', 'analyst', 'executor', 'reviewer'];
    
    agents.forEach((agent, index) => {
      roles.set(agent, roleOrder[index % roleOrder.length]);
    });

    return roles;
  }

  private buildPrompt(
    agent: AgentType,
    role: AgentMessageRole | undefined,
    task: string,
    session: CollaborationSession,
    roundMessages: AgentMessage[]
  ): string {
    const roleDescriptions: Record<AgentMessageRole, string> = {
      coordinator: 'Coordina el trabajo y toma decisiones finales',
      researcher: 'Busca información y analiza datos',
      analyst: 'Procesa y interpreta resultados',
      executor: 'Ejecuta acciones y genera output',
      reviewer: 'Revisa y valida el trabajo'
    };

    const context = roundMessages.length > 0
      ? `\n\nContexto de rondas anteriores:\n${roundMessages.map(m => `[${m.from}]: ${m.content.slice(0, 200)}`).join('\n')}`
      : '';

    const sharedKeys = Object.keys(session.sharedState).length > 0
      ? `\n\nEstado compartido:\n${JSON.stringify(session.sharedState, null, 2)}`
      : '';

    return `
Eres un agente ${roleDescriptions[role || 'executor']}.
Tu tipo de agente: ${agent}

TAREA: ${task}
${context}
${sharedKeys}

Responde con tu análisis o resultado.
`.trim();
  }

  private async executeAgentWithTimeout(
    agent: AgentType,
    prompt: string,
    input: Record<string, unknown>
  ): Promise<{ success: boolean; data?: unknown; executionTime: number }> {
    return Promise.race([
      langGraphAgent.run(agent, { ...input, prompt }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), this.config.timeoutMs)
      )
    ]).then(state => ({
      success: state.taskOutput?.success ?? false,
      data: state.taskOutput?.data ?? state.messages,
      executionTime: state.taskOutput?.executionTime ?? 0
    })).catch(() => ({
      success: false,
      error: 'Timeout'
    })) as Promise<{ success: boolean; data?: unknown; executionTime: number }>;
  }

  private mergeSharedState(shared: Record<string, unknown>, data: unknown): void {
    if (data && typeof data === 'object') {
      Object.assign(shared, data as Record<string, unknown>);
    }
  }

  private checkConsensus(messages: AgentMessage[]): boolean {
    if (messages.length < 2) return false;

    const recentMessages = messages.slice(-this.config.requireAllResponses ? messages.length : 3);
    const successCount = recentMessages.filter(m => m.metadata?.success).length;
    const ratio = successCount / recentMessages.length;

    return ratio >= this.config.consensusThreshold;
  }

  private aggregateResults(messages: AgentMessage[]): unknown {
    const successfulMessages = messages.filter(m => m.metadata?.success);
    
    if (successfulMessages.length === 0) {
      return { error: 'No successful results', messages: messages.length };
    }

    const lastMessage = successfulMessages[successfulMessages.length - 1];
    
    try {
      return JSON.parse(lastMessage.content);
    } catch {
      return lastMessage.content;
    }
  }

  sendMessage(
    sessionId: string,
    from: AgentType,
    to: AgentType,
    content: string,
    metadata?: Record<string, unknown>
  ): AgentMessage | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const message: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      content,
      timestamp: Date.now(),
      metadata
    };

    session.messages.push(message);
    session.updatedAt = Date.now();

    return message;
  }

  listSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  clearSessions(): void {
    this.sessions.clear();
  }

  updateConfig(config: Partial<MultiAgentConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const multiAgentCollaboration = new MultiAgentCollaboration();
