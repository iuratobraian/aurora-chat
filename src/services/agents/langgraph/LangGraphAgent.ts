import { agentOrchestrator, type AgentType } from '../agentOrchestrator';
import {
  type LangGraphState,
  type LangGraphConfig,
  DEFAULT_LANGGRAPH_CONFIG
} from './types';

export class LangGraphAgent {
  private config: LangGraphConfig;
  private checkpoints: Map<string, LangGraphState> = new Map();

  constructor(config: Partial<LangGraphConfig> = {}) {
    this.config = { ...DEFAULT_LANGGRAPH_CONFIG, ...config };
  }

  private createInitialState(
    agentType: AgentType,
    input: Record<string, unknown>
  ): LangGraphState {
    return {
      messages: [
        {
          role: 'user',
          content: JSON.stringify(input),
          timestamp: Date.now()
        }
      ],
      currentAgent: agentType,
      taskInput: input,
      taskOutput: null,
      iteration: 0,
      maxIterations: this.config.maxIterations,
      shouldContinue: true,
      nextStep: 'execute',
      error: null,
      checkpointId: null
    };
  }

  private extractConfidence(result: unknown): number {
    if (result && typeof result === 'object') {
      const data = result as Record<string, unknown>;
      if (typeof data.confidence === 'number') {
        return data.confidence;
      }
      if (typeof data.score === 'number') {
        return data.score;
      }
    }
    return 0.9;
  }

  async run(
    agentType: AgentType,
    input: Record<string, unknown>,
    checkpointId?: string
  ): Promise<LangGraphState> {
    let state = this.createInitialState(agentType, input);

    if (checkpointId && this.checkpoints.has(checkpointId)) {
      state = this.checkpoints.get(checkpointId)!;
      state.checkpointId = checkpointId;
    } else {
      state.checkpointId = `checkpoint-${Date.now()}`;
    }

    state.messages.push({
      role: 'assistant',
      content: `Starting task with agent: ${agentType}`,
      timestamp: Date.now()
    });

    while (state.shouldContinue && state.iteration < state.maxIterations) {
      state = await this.executeIteration(state);

      if (state.nextStep === 'finish') {
        break;
      }

      if (state.nextStep === 'retry') {
        state.messages.push({
          role: 'assistant',
          content: `Retrying task (iteration ${state.iteration + 1}/${state.maxIterations})`,
          timestamp: Date.now()
        });
      }

      if (state.nextStep === 'human_review') {
        break;
      }
    }

    state.messages.push({
      role: 'assistant',
      content: 'Task completed',
      timestamp: Date.now()
    });

    if (this.config.enableCheckpointing && state.checkpointId) {
      this.checkpoints.set(state.checkpointId, state);
    }

    return state;
  }

  private async executeIteration(state: LangGraphState): Promise<LangGraphState> {
    const agentType = state.currentAgent;
    const input = state.taskInput;

    if (!agentType) {
      return {
        ...state,
        error: 'No agent type specified',
        shouldContinue: false,
        nextStep: 'finish'
      };
    }

    let taskType = 'default';
    if (input.taskType) {
      taskType = input.taskType as string;
    } else if (input.action) {
      taskType = input.action as string;
    }

    state.messages.push({
      role: 'assistant',
      content: `Executing: ${taskType}`,
      timestamp: Date.now()
    });

    try {
      const result = await agentOrchestrator.executeTask(
        agentType,
        taskType,
        input,
        (input.priority as 'low' | 'normal' | 'high' | 'critical') || 'normal'
      );

      state.taskOutput = result;
      state.iteration++;

      if (!result.success) {
        const shouldRetry = 
          this.config.retryOnError && 
          state.iteration < state.maxIterations;

        return {
          ...state,
          error: result.error || 'Task failed',
          shouldContinue: shouldRetry,
          nextStep: shouldRetry ? 'retry' : 'finish'
        };
      }

      const confidence = this.extractConfidence(result.data);
      
      if (confidence > 0.8) {
        return {
          ...state,
          shouldContinue: false,
          nextStep: 'finish'
        };
      } else if (this.config.enableHumanReview && confidence < 0.5) {
        return {
          ...state,
          shouldContinue: false,
          nextStep: 'human_review'
        };
      } else if (state.iteration < state.maxIterations) {
        return {
          ...state,
          shouldContinue: true,
          nextStep: 'retry'
        };
      }

      return {
        ...state,
        shouldContinue: false,
        nextStep: 'finish'
      };

    } catch (error) {
      const shouldRetry = 
        this.config.retryOnError && 
        state.iteration < state.maxIterations;

      return {
        ...state,
        error: error instanceof Error ? error.message : 'Unknown error',
        shouldContinue: shouldRetry,
        nextStep: shouldRetry ? 'retry' : 'finish'
      };
    }
  }

  async getCheckpoint(checkpointId: string): Promise<LangGraphState | null> {
    return this.checkpoints.get(checkpointId) || null;
  }

  listCheckpoints(): string[] {
    return Array.from(this.checkpoints.keys());
  }

  clearCheckpoints(): void {
    this.checkpoints.clear();
  }

  updateConfig(config: Partial<LangGraphConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const langGraphAgent = new LangGraphAgent();
