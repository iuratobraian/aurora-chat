import { LangGraphAgent, type LangGraphState, type LangGraphConfig } from './index';
import { agentOrchestrator, type AgentType, type AgentResult } from '../agentOrchestrator';

export interface LangGraphOrchestratorConfig extends LangGraphConfig {
  defaultAgent: AgentType;
}

const DEFAULT_CONFIG: LangGraphOrchestratorConfig = {
  maxIterations: 3,
  enableCheckpointing: true,
  enableHumanReview: false,
  retryOnError: true,
  defaultAgent: 'newsfeed'
};

export class LangGraphOrchestrator {
  private config: LangGraphOrchestratorConfig;
  private langGraph: LangGraphAgent;

  constructor(config: Partial<LangGraphOrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.langGraph = new LangGraphAgent(this.config);
  }

  async executeWithLangGraph(
    agentType: AgentType,
    input: Record<string, unknown>,
    options?: {
      checkpointId?: string;
      maxIterations?: number;
      enableCheckpointing?: boolean;
      enableHumanReview?: boolean;
    }
  ): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
    state: LangGraphState;
    executionTime: number;
  }> {
    const startTime = Date.now();

    if (options?.maxIterations) {
      this.langGraph.updateConfig({ maxIterations: options.maxIterations });
    }
    if (options?.enableCheckpointing !== undefined) {
      this.langGraph.updateConfig({ enableCheckpointing: options.enableCheckpointing });
    }
    if (options?.enableHumanReview !== undefined) {
      this.langGraph.updateConfig({ enableHumanReview: options.enableHumanReview });
    }

    try {
      const state = await this.langGraph.run(agentType, input, options?.checkpointId);

      const executionTime = Date.now() - startTime;

      if (state.taskOutput) {
        return {
          success: state.taskOutput.success,
          data: state.taskOutput.data,
          error: state.taskOutput.error,
          state,
          executionTime
        };
      }

      return {
        success: state.error === null,
        data: state.messages,
        error: state.error,
        state,
        executionTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        state: {} as LangGraphState,
        executionTime: Date.now() - startTime
      };
    }
  }

  async executeSimple(
    agentType: AgentType,
    taskType: string,
    input: Record<string, unknown>,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): Promise<AgentResult> {
    return agentOrchestrator.executeTask(agentType, taskType, input, priority);
  }

  async getCheckpoint(checkpointId: string): Promise<LangGraphState | null> {
    return this.langGraph.getCheckpoint(checkpointId);
  }

  listCheckpoints(): string[] {
    return this.langGraph.listCheckpoints();
  }

  clearCheckpoints(): void {
    this.langGraph.clearCheckpoints();
  }

  updateConfig(config: Partial<LangGraphOrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): LangGraphOrchestratorConfig {
    return { ...this.config };
  }
}

export const langGraphOrchestrator = new LangGraphOrchestrator();
