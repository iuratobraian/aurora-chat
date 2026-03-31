import type { AgentType, AgentResult } from '../agentOrchestrator';

export interface LangGraphState {
  messages: Array<{
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    timestamp: number;
  }>;
  currentAgent: AgentType | null;
  taskInput: Record<string, unknown>;
  taskOutput: AgentResult | null;
  iteration: number;
  maxIterations: number;
  shouldContinue: boolean;
  nextStep: 'execute' | 'review' | 'retry' | 'finish' | 'human_review';
  error: string | null;
  checkpointId: string | null;
}

export interface LangGraphConfig {
  maxIterations: number;
  enableCheckpointing: boolean;
  enableHumanReview: boolean;
  retryOnError: boolean;
}

export const DEFAULT_LANGGRAPH_CONFIG: LangGraphConfig = {
  maxIterations: 3,
  enableCheckpointing: true,
  enableHumanReview: false,
  retryOnError: true
};

export type NodeName = 
  | 'analyze'
  | 'execute'
  | 'review'
  | 'retry'
  | 'human_review'
  | 'finish';

export interface ExecutionContext {
  config: LangGraphConfig;
  checkpointStore?: Map<string, LangGraphState>;
}
