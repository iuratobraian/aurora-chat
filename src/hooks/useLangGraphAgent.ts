import { useState, useCallback, useMemo } from 'react';
import { langGraphOrchestrator, type LangGraphState } from '../services/agents/langgraph';
import type { AgentType, AgentResult } from '../services/agents/agentOrchestrator';

interface UseLangGraphAgentOptions {
  maxIterations?: number;
  enableCheckpointing?: boolean;
  enableHumanReview?: boolean;
}

interface UseLangGraphAgentReturn {
  execute: (
    agentType: AgentType,
    input: Record<string, unknown>
  ) => Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
    state: LangGraphState;
    executionTime: number;
  }>;
  executeSimple: (
    agentType: AgentType,
    taskType: string,
    input: Record<string, unknown>,
    priority?: 'low' | 'normal' | 'high' | 'critical'
  ) => Promise<AgentResult>;
  checkpoints: string[];
  clearCheckpoints: () => void;
  isLoading: boolean;
  lastState: LangGraphState | null;
  error: string | null;
}

export function useLangGraphAgent(
  options: UseLangGraphAgentOptions = {}
): UseLangGraphAgentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [lastState, setLastState] = useState<LangGraphState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (
      agentType: AgentType,
      input: Record<string, unknown>
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await langGraphOrchestrator.executeWithLangGraph(
          agentType,
          input,
          options
        );

        setLastState(result.state);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
          state: {} as LangGraphState,
          executionTime: 0
        };
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const executeSimple = useCallback(
    async (
      agentType: AgentType,
      taskType: string,
      input: Record<string, unknown>,
      priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await langGraphOrchestrator.executeSimple(
          agentType,
          taskType,
          input,
          priority
        );
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return {
          taskId: '',
          agentId: '',
          success: false,
          error: errorMessage,
          executionTime: 0
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearCheckpoints = useCallback(() => {
    langGraphOrchestrator.clearCheckpoints();
  }, []);

  const checkpoints = useMemo(() => langGraphOrchestrator.listCheckpoints(), [isLoading, lastState]);

  return useMemo(() => ({
    execute,
    executeSimple,
    checkpoints,
    clearCheckpoints,
    isLoading,
    lastState,
    error
  }), [execute, executeSimple, checkpoints, clearCheckpoints, isLoading, lastState, error]);
}
