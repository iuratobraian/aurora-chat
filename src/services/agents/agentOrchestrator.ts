import type { NewsItem, AnalysisResult } from './newsAgentService';

export type AgentType = 'newsfeed' | 'risk' | 'course' | 'creator' | 'voice';

export type AgentStatus = 'idle' | 'initializing' | 'ready' | 'busy' | 'error' | 'terminated';

export interface AgentConfig {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  maxConcurrentTasks: number;
  enabled: boolean;
}

export interface AgentState {
  status: AgentStatus;
  lastActive: Date | null;
  errorCount: number;
  tasksCompleted: number;
}

export interface AgentTask {
  id: string;
  agentId: string;
  type: string;
  input: Record<string, unknown>;
  priority: 'low' | 'normal' | 'high' | 'critical';
  createdAt: Date;
}

export interface AgentResult {
  taskId: string;
  agentId: string;
  success: boolean;
  data?: unknown;
  error?: string;
  executionTime: number;
}

export interface SubAgentDefinition {
  id: string;
  name: string;
  type: string;
  parentAgent: AgentType;
  capabilities: string[];
}

const AGENT_CONFIGS: AgentConfig[] = [
  {
    id: 'newsfeed-agent',
    type: 'newsfeed',
    name: 'NewsFeed Agent',
    description: 'Provides market news, asset analysis, and sentiment tracking',
    capabilities: ['fetchNews', 'analyzeAsset', 'searchNews', 'trackSentiment'],
    maxConcurrentTasks: 3,
    enabled: true
  },
  {
    id: 'risk-agent',
    type: 'risk',
    name: 'Risk Assistant',
    description: 'Manages risk analysis, position sizing, and portfolio protection',
    capabilities: ['calculatePositionSize', 'determineStopLoss', 'analyzeRisk', 'portfolioAnalysis'],
    maxConcurrentTasks: 2,
    enabled: true
  },
  {
    id: 'course-agent',
    type: 'course',
    name: 'Course Assistant',
    description: 'Manages learning paths, course recommendations, and progress tracking',
    capabilities: ['recommendCourses', 'trackProgress', 'answerQuestions', 'suggestNextSteps'],
    maxConcurrentTasks: 5,
    enabled: true
  },
  {
    id: 'creator-agent',
    type: 'creator',
    name: 'Creator Assistant',
    description: 'Supports content creation, engagement strategies, and monetization',
    capabilities: ['generateIdeas', 'optimizeProfile', 'analyzeEngagement', 'monetize'],
    maxConcurrentTasks: 4,
    enabled: true
  },
  {
    id: 'voice-agent',
    type: 'voice',
    name: 'Voice Agent',
    description: 'Voice interactions for quick commands and hands-free trading assistance',
    capabilities: ['speechToText', 'voiceCommands', 'handsFreeTrading', 'audioResponses'],
    maxConcurrentTasks: 1,
    enabled: true
  }
];

class AgentOrchestrator {
  private agents: Map<AgentType, AgentConfig> = new Map();
  private states: Map<AgentType, AgentState> = new Map();
  private taskQueue: AgentTask[] = [];
  private results: Map<string, AgentResult> = new Map();
  private listeners: Map<string, (result: AgentResult) => void> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents(): void {
    AGENT_CONFIGS.forEach(config => {
      if (config.enabled) {
        this.agents.set(config.type, config);
        this.states.set(config.type, {
          status: 'ready',
          lastActive: null,
          errorCount: 0,
          tasksCompleted: 0
        });
      }
    });
  }

  getAgent(type: AgentType): AgentConfig | undefined {
    return this.agents.get(type);
  }

  getAgentState(type: AgentType): AgentState | undefined {
    return this.states.get(type);
  }

  getAllAgents(): AgentConfig[] {
    return Array.from(this.agents.values());
  }

  getAllStates(): Map<AgentType, AgentState> {
    return new Map(this.states);
  }

  setAgentStatus(type: AgentType, status: AgentStatus): void {
    const state = this.states.get(type);
    if (state) {
      state.status = status;
      if (status === 'ready' || status === 'busy') {
        state.lastActive = new Date();
      }
    }
  }

  async executeTask(
    agentType: AgentType,
    taskType: string,
    input: Record<string, unknown>,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): Promise<AgentResult> {
    const agent = this.agents.get(agentType);
    const state = this.states.get(agentType);

    if (!agent || !state) {
      return {
        taskId: '',
        agentId: '',
        success: false,
        error: `Agent ${agentType} not found or not enabled`,
        executionTime: 0
      };
    }

    const taskId = `${agentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    this.setAgentStatus(agentType, 'busy');

    try {
      let result: unknown;

      switch (agentType) {
        case 'newsfeed':
          result = await this.executeNewsTask(taskType, input);
          break;
        case 'risk':
          result = await this.executeRiskTask(taskType, input);
          break;
        case 'course':
          result = await this.executeCourseTask(taskType, input);
          break;
        case 'creator':
          result = await this.executeCreatorTask(taskType, input);
          break;
        case 'voice':
          result = await this.executeVoiceTask(taskType, input);
          break;
        default:
          throw new Error(`Unknown agent type: ${agentType}`);
      }

      state.tasksCompleted++;
      state.errorCount = 0;

      const agentResult: AgentResult = {
        taskId,
        agentId: agent.id,
        success: true,
        data: result,
        executionTime: Date.now() - startTime
      };

      this.results.set(taskId, agentResult);
      this.notifyListeners(taskId, agentResult);

      return agentResult;
    } catch (error) {
      state.errorCount++;

      const errorResult: AgentResult = {
        taskId,
        agentId: agent.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      };

      this.results.set(taskId, errorResult);
      this.notifyListeners(taskId, errorResult);

      return errorResult;
    } finally {
      this.setAgentStatus(agentType, 'ready');
    }
  }

  private async executeNewsTask(taskType: string, input: Record<string, unknown>): Promise<unknown> {
    const { fetchMarketNews, analyzeAsset, searchNews } = await import('./newsAgentService');

    switch (taskType) {
      case 'fetchNews':
        return fetchMarketNews(input.category as string | undefined);
      case 'analyzeAsset':
        return analyzeAsset(input.symbol as string);
      case 'searchNews':
        return searchNews(input.query as string);
      default:
        throw new Error(`Unknown news task: ${taskType}`);
    }
  }

  private async executeRiskTask(taskType: string, input: Record<string, unknown>): Promise<unknown> {
    const capital = input.capital as number;
    const riskPercent = input.riskPercent as number;
    const entryPrice = input.entryPrice as number;
    const stopLoss = input.stopLoss as number;
    const takeProfit = input.takeProfit as number;

    switch (taskType) {
      case 'calculatePositionSize': {
        const riskAmount = capital * (riskPercent / 100);
        const priceRisk = Math.abs(entryPrice - stopLoss);
        const positionSize = riskAmount / priceRisk;
        const riskReward = takeProfit ? (takeProfit - entryPrice) / priceRisk : 0;
        return {
          positionSize: Math.round(positionSize * 100) / 100,
          riskAmount,
          riskReward: Math.round(riskReward * 100) / 100
        };
      }
      case 'determineStopLoss': {
        const atr = input.atr as number || 0.02;
        const volatilityMultiplier = input.volatilityMultiplier as number || 1.5;
        return {
          stopLoss: entryPrice * (1 - atr * volatilityMultiplier),
          riskPercent: atr * volatilityMultiplier * 100
        };
      }
      case 'analyzeRisk': {
        const positionRisk = input.positionRisk as number || 2;
        const correlationRisk = input.correlationRisk as number || 0.3;
        const totalRisk = positionRisk + (correlationRisk * 50);
        return {
          riskLevel: totalRisk > 5 ? 'high' : totalRisk > 3 ? 'medium' : 'low',
          totalRisk: Math.round(totalRisk * 100) / 100,
          recommendations: totalRisk > 3 ? ['Reduce position size', 'Add hedging'] : ['Risk acceptable']
        };
      }
      case 'portfolioAnalysis': {
        const positions = input.positions as Array<{symbol: string; weight: number; risk: number}>;
        const totalRisk = positions.reduce((sum, p) => sum + (p.weight * p.risk), 0);
        return {
          portfolioRisk: totalRisk,
          riskLevel: totalRisk > 0.15 ? 'high' : totalRisk > 0.08 ? 'medium' : 'low',
          suggestions: totalRisk > 0.15 ? ['Reduce high-risk positions'] : []
        };
      }
      default:
        throw new Error(`Unknown risk task: ${taskType}`);
    }
  }

  private async executeCourseTask(taskType: string, input: Record<string, unknown>): Promise<unknown> {
    const userLevel = input.userLevel as string;
    const interest = input.interest as string;

    switch (taskType) {
      case 'recommendCourses': {
        const courses = [
          { level: 'beginner', name: 'Fundamentos del Trading', duration: '4h', topics: ['Conceptos básicos', 'Mercados', 'Gráficos'] },
          { level: 'intermediate', name: 'Análisis Técnico Avanzado', duration: '6h', topics: ['Patrones', 'Indicadores', 'Estrategias'] },
          { level: 'advanced', name: 'Trading Institucional', duration: '8h', topics: ['Order flow', 'Volumen', 'Microestructura'] }
        ];
        return courses.filter(c => c.level === userLevel || !userLevel);
      }
      case 'trackProgress': {
        return {
          completedLessons: input.completedLessons as number || 0,
          totalLessons: input.totalLessons as number || 20,
          percentage: Math.round(((input.completedLessons as number) || 0) / ((input.totalLessons as number) || 20) * 100)
        };
      }
      case 'answerQuestions': {
        return {
          answer: `Pregunta sobre ${interest}: Los conceptos fundamentales incluyen gestión de riesgo, análisis técnico y fundamental.`,
          sources: ['Curso: Fundamentos', 'Curso: Análisis Técnico']
        };
      }
      case 'suggestNextSteps': {
        const suggestions = [
          'Completar módulo de gestión de riesgo',
          'Practicar con cuenta demo',
          'Revisar análisis de mercados actuales'
        ];
        return { suggestions };
      }
      default:
        throw new Error(`Unknown course task: ${taskType}`);
    }
  }

  private async executeCreatorTask(taskType: string, input: Record<string, unknown>): Promise<unknown> {
    const contentType = input.contentType as string;

    switch (taskType) {
      case 'generateIdeas': {
        const ideas = [
          { type: 'analysis', title: `Análisis ${contentType || 'mercado'}`, engagement: 'high' },
          { type: 'education', title: 'Concepto del día', engagement: 'medium' },
          { type: 'signal', title: `Señal ${contentType || 'crypto'}`, engagement: 'very-high' }
        ];
        return { ideas };
      }
      case 'optimizeProfile': {
        return {
          suggestions: [
            'Agregar bio con keywords de trading',
            'Usar foto profesional',
            'Añadir enlaces a contenido destacado'
          ],
          score: 75
        };
      }
      case 'analyzeEngagement': {
        return {
          avgLikes: 150,
          avgComments: 25,
          bestTime: '9:00 AM',
          trending: true
        };
      }
      case 'monetize': {
        return {
          strategies: ['Membresías', 'Señales premium', 'Cursos'],
          estimatedRevenue: 500
        };
      }
      default:
        throw new Error(`Unknown creator task: ${taskType}`);
    }
  }

  private async executeVoiceTask(taskType: string, input: Record<string, unknown>): Promise<unknown> {
    const transcript = input.transcript as string;

    switch (taskType) {
      case 'speechToText': {
        return { transcript, confidence: 0.95 };
      }
      case 'voiceCommands': {
        const command = transcript?.toLowerCase() || '';
        let action = 'unknown';
        let params = {};

        if (command.includes('precio')) {
          action = 'getPrice';
          params = { symbol: this.extractSymbol(command) };
        } else if (command.includes('noticia')) {
          action = 'getNews';
        } else if (command.includes('analiza')) {
          action = 'analyze';
          params = { symbol: this.extractSymbol(command) };
        }

        return { action, params, transcript };
      }
      case 'handsFreeTrading': {
        return {
          command: input.command,
          executed: true,
          confirmation: 'Orden ejecutada'
        };
      }
      case 'audioResponses': {
        return {
          text: input.text,
          audioUrl: `/api/audio/${Date.now()}.mp3`
        };
      }
      default:
        throw new Error(`Unknown voice task: ${taskType}`);
    }
  }

  private extractSymbol(text: string): string {
    const patterns = /(BTC|ETH|EUR\/USD|GOLD|S&P\s?500)/gi;
    const match = text.match(patterns);
    return match ? match[0].toUpperCase() : 'BTC';
  }

  subscribe(taskId: string, callback: (result: AgentResult) => void): () => void {
    this.listeners.set(taskId, callback);
    return () => this.listeners.delete(taskId);
  }

  private notifyListeners(taskId: string, result: AgentResult): void {
    const callback = this.listeners.get(taskId);
    if (callback) {
      callback(result);
    }
  }

  getTaskResult(taskId: string): AgentResult | undefined {
    return this.results.get(taskId);
  }

  getTaskQueue(): AgentTask[] {
    return [...this.taskQueue];
  }

  clearResults(): void {
    this.results.clear();
  }

  getAgentCapabilities(type: AgentType): string[] {
    const agent = this.agents.get(type);
    return agent?.capabilities || [];
  }

  isAgentReady(type: AgentType): boolean {
    const state = this.states.get(type);
    return state?.status === 'ready';
  }

  getAgentHealth(type: AgentType): { healthy: boolean; errors: number } {
    const state = this.states.get(type);
    return {
      healthy: state ? state.errorCount < 5 : false,
      errors: state?.errorCount || 0
    };
  }

  shutdown(): void {
    this.agents.forEach((_, type) => {
      this.setAgentStatus(type, 'terminated');
    });
    this.taskQueue = [];
    this.results.clear();
    this.listeners.clear();
  }
}

export const agentOrchestrator = new AgentOrchestrator();
export default agentOrchestrator;
