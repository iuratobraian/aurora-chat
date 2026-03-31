import { AgentType } from '../agentOrchestrator';

export interface WorkflowNode {
  id: string;
  name: string;
  description: string;
  agentType?: AgentType;
  action?: string;
  condition?: (state: WorkflowState) => boolean;
  onError?: string;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  condition?: (state: WorkflowState) => boolean;
}

export interface WorkflowState {
  taskId: string;
  currentNode: string;
  data: Record<string, unknown>;
  history: Array<{
    node: string;
    input: unknown;
    output: unknown;
    timestamp: number;
  }>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  startNode: string;
  endNodes: string[];
}

export class LangGraphWorkflow {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private activeRuns: Map<string, WorkflowState> = new Map();

  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
  }

  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  listWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  async run(
    workflowId: string,
    initialData: Record<string, unknown> = {}
  ): Promise<WorkflowState> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const state: WorkflowState = {
      taskId: `wf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      currentNode: workflow.startNode,
      data: { ...initialData },
      history: [],
      status: 'running'
    };

    this.activeRuns.set(state.taskId, state);

    try {
      return await this.executeWorkflow(workflow, state);
    } catch (error) {
      state.status = 'failed';
      state.error = error instanceof Error ? error.message : 'Unknown error';
      return state;
    }
  }

  private async executeWorkflow(
    workflow: WorkflowDefinition,
    state: WorkflowState
  ): Promise<WorkflowState> {
    while (state.status === 'running') {
      const node = workflow.nodes.find(n => n.id === state.currentNode);
      
      if (!node) {
        state.status = 'failed';
        state.error = `Node ${state.currentNode} not found`;
        break;
      }

      if (workflow.endNodes.includes(state.currentNode)) {
        state.status = 'completed';
        break;
      }

      try {
        const result = await this.executeNode(node, state);
        
        state.history.push({
          node: node.id,
          input: { ...state.data },
          output: result,
          timestamp: Date.now()
        });

        if (result && typeof result === 'object') {
          Object.assign(state.data, result as Record<string, unknown>);
        }

        const nextNode = this.findNextNode(workflow, state);
        
        if (!nextNode) {
          state.status = 'completed';
        } else {
          state.currentNode = nextNode;
        }
      } catch (error) {
        if (node.onError) {
          state.currentNode = node.onError;
        } else {
          state.status = 'failed';
          state.error = error instanceof Error ? error.message : 'Unknown error';
          break;
        }
      }
    }

    return state;
  }

  private async executeNode(node: WorkflowNode, state: WorkflowState): Promise<unknown> {
    if (node.action) {
      const { langGraphAgent } = await import('./LangGraphAgent');
      
      const result = await langGraphAgent.run(
        node.agentType || 'newsfeed',
        {
          ...state.data,
          action: node.action,
          taskId: state.taskId
        }
      );

      return result.taskOutput?.data;
    }

    return { executed: true, node: node.name };
  }

  private findNextNode(workflow: WorkflowDefinition, state: WorkflowState): string | null {
    const edges = workflow.edges.filter(e => e.from === state.currentNode);

    for (const edge of edges) {
      if (!edge.condition) {
        return edge.to;
      }

      if (edge.condition(state)) {
        return edge.to;
      }
    }

    const defaultEdge = edges.find(e => !e.condition);
    return defaultEdge?.to || null;
  }

  pause(taskId: string): boolean {
    const state = this.activeRuns.get(taskId);
    if (!state || state.status !== 'running') return false;

    state.status = 'paused';
    return true;
  }

  async resume(taskId: string): Promise<WorkflowState | null> {
    const state = this.activeRuns.get(taskId);
    if (!state || state.status !== 'paused') return null;

    const workflow = Array.from(this.workflows.values()).find(w => 
      w.nodes.some(n => n.id === state.currentNode)
    );

    if (!workflow) return null;

    state.status = 'running';
    return await this.executeWorkflow(workflow, state);
  }

  getState(taskId: string): WorkflowState | null {
    return this.activeRuns.get(taskId) || null;
  }

  cancel(taskId: string): boolean {
    const state = this.activeRuns.get(taskId);
    if (!state || state.status !== 'running') return false;

    state.status = 'failed';
    state.error = 'Cancelled by user';
    return true;
  }

  listActiveRuns(): WorkflowState[] {
    return Array.from(this.activeRuns.values())
      .filter(s => s.status === 'running' || s.status === 'paused');
  }

  clearCompleted(): void {
    for (const [id, state] of this.activeRuns.entries()) {
      if (state.status === 'completed' || state.status === 'failed') {
        this.activeRuns.delete(id);
      }
    }
  }
}

export const langGraphWorkflow = new LangGraphWorkflow();

export const PREDEFINED_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'research-analyze-report',
    name: 'Research & Analyze Report',
    description: 'Research topic, analyze data, and generate report',
    startNode: 'research',
    endNodes: ['report'],
    nodes: [
      {
        id: 'research',
        name: 'Research',
        description: 'Research the topic',
        agentType: 'newsfeed',
        action: 'searchNews'
      },
      {
        id: 'analyze',
        name: 'Analyze',
        description: 'Analyze research findings',
        agentType: 'risk',
        action: 'analyzeRisk',
        condition: (state) => {
          const hasData = state.data && Object.keys(state.data).length > 0;
          return hasData && (state.data as Record<string, unknown>).confidence 
            ? ((state.data as Record<string, unknown>).confidence as number) < 0.8 
            : true;
        }
      },
      {
        id: 'report',
        name: 'Report',
        description: 'Generate final report',
        action: 'generateReport'
      }
    ],
    edges: [
      { from: 'research', to: 'analyze' },
      { from: 'analyze', to: 'report' }
    ]
  },
  {
    id: 'content-creation-pipeline',
    name: 'Content Creation Pipeline',
    description: 'Create content with idea generation, refinement, and approval',
    startNode: 'ideas',
    endNodes: ['publish'],
    nodes: [
      {
        id: 'ideas',
        name: 'Generate Ideas',
        description: 'Generate content ideas',
        agentType: 'creator',
        action: 'generateIdeas'
      },
      {
        id: 'refine',
        name: 'Refine',
        description: 'Refine the best idea',
        agentType: 'creator',
        action: 'optimizeProfile'
      },
      {
        id: 'review',
        name: 'Review',
        description: 'Review for approval',
        condition: (state) => (state.data as Record<string, unknown>).needsReview === true
      },
      {
        id: 'publish',
        name: 'Publish',
        description: 'Publish the content',
        action: 'publish'
      }
    ],
    edges: [
      { from: 'ideas', to: 'refine' },
      { from: 'refine', to: 'review' },
      { from: 'review', to: 'publish', condition: (s) => s.data.approved === true },
      { from: 'review', to: 'refine', condition: (s) => s.data.approved === false }
    ]
  }
];

PREDEFINED_WORKFLOWS.forEach(wf => langGraphWorkflow.registerWorkflow(wf));
