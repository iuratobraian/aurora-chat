import type { AgentType, AgentResult } from './agentOrchestrator';

export type SubAgentType = 
  | 'data-collector'
  | 'analyzer'
  | 'reporter'
  | 'monitor'
  | 'advisor'
  | 'tutor'
  | 'content-generator'
  | 'engagement-tracker'
  | 'voice-processor'
  | 'command-parser';

export interface SubAgentConfig {
  id: string;
  type: SubAgentType;
  name: string;
  parentAgent: AgentType;
  capabilities: string[];
  priority: number;
}

export interface SubAgentTask {
  id: string;
  subAgentType: SubAgentType;
  parentAgentType: AgentType;
  input: Record<string, unknown>;
  dependencies: string[];
  createdAt: Date;
}

export interface AggregatedResult {
  parentAgentType: AgentType;
  subAgentResults: SubAgentResult[];
  combinedData: unknown;
  totalExecutionTime: number;
  success: boolean;
}

export interface SubAgentResult {
  subAgentType: SubAgentType;
  success: boolean;
  data?: unknown;
  error?: string;
  executionTime: number;
}

const SUB_AGENT_DEFINITIONS: SubAgentConfig[] = [
  {
    id: 'news-data-collector',
    type: 'data-collector',
    name: 'News Data Collector',
    parentAgent: 'newsfeed',
    capabilities: ['fetchFromAPIs', 'aggregateSources', 'filterDuplicates'],
    priority: 1
  },
  {
    id: 'news-analyzer',
    type: 'analyzer',
    name: 'News Analyzer',
    parentAgent: 'newsfeed',
    capabilities: ['sentimentAnalysis', 'trendDetection', 'patternRecognition'],
    priority: 2
  },
  {
    id: 'news-reporter',
    type: 'reporter',
    name: 'News Reporter',
    parentAgent: 'newsfeed',
    capabilities: ['formatOutput', 'generateSummary', 'createHighlights'],
    priority: 3
  },
  {
    id: 'risk-monitor',
    type: 'monitor',
    name: 'Risk Monitor',
    parentAgent: 'risk',
    capabilities: ['trackExposure', 'alertOnThreshold', 'realTimeCheck'],
    priority: 1
  },
  {
    id: 'risk-advisor',
    type: 'advisor',
    name: 'Risk Advisor',
    parentAgent: 'risk',
    capabilities: ['calculateMetrics', 'suggestStrategies', 'provideRecommendations'],
    priority: 2
  },
  {
    id: 'course-tutor',
    type: 'tutor',
    name: 'Course Tutor',
    parentAgent: 'course',
    capabilities: ['explainConcepts', 'answerQuestions', 'provideExamples'],
    priority: 1
  },
  {
    id: 'course-content-generator',
    type: 'content-generator',
    name: 'Course Content Generator',
    parentAgent: 'course',
    capabilities: ['generateExercises', 'createQuizzes', 'produceMaterials'],
    priority: 2
  },
  {
    id: 'creator-content-generator',
    type: 'content-generator',
    name: 'Content Generator',
    parentAgent: 'creator',
    capabilities: ['generateIdeas', 'writePosts', 'createScripts'],
    priority: 1
  },
  {
    id: 'creator-engagement-tracker',
    type: 'engagement-tracker',
    name: 'Engagement Tracker',
    parentAgent: 'creator',
    capabilities: ['trackMetrics', 'analyzeGrowth', 'reportStats'],
    priority: 2
  },
  {
    id: 'voice-command-parser',
    type: 'command-parser',
    name: 'Voice Command Parser',
    parentAgent: 'voice',
    capabilities: ['parseSpeech', 'extractIntent', 'validateCommands'],
    priority: 1
  },
  {
    id: 'voice-processor',
    type: 'voice-processor',
    name: 'Voice Processor',
    parentAgent: 'voice',
    capabilities: ['processAudio', 'generateResponse', 'synthesizeSpeech'],
    priority: 2
  }
];

export class SubAgentManager {
  private definitions: Map<SubAgentType, SubAgentConfig> = new Map();
  private tasks: Map<string, SubAgentTask> = new Map();
  private results: Map<string, SubAgentResult> = new Map();

  constructor() {
    this.initializeSubAgents();
  }

  private initializeSubAgents(): void {
    SUB_AGENT_DEFINITIONS.forEach(def => {
      this.definitions.set(def.type, def);
    });
  }

  getSubAgentsForParent(parentAgent: AgentType): SubAgentConfig[] {
    return SUB_AGENT_DEFINITIONS.filter(d => d.parentAgent === parentAgent);
  }

  getSubAgentDefinition(type: SubAgentType): SubAgentConfig | undefined {
    return this.definitions.get(type);
  }

  getAllSubAgentDefinitions(): SubAgentConfig[] {
    return [...SUB_AGENT_DEFINITIONS];
  }

  createSubTask(
    subAgentType: SubAgentType,
    parentAgentType: AgentType,
    input: Record<string, unknown>,
    dependencies: string[] = []
  ): SubAgentTask {
    const taskId = `${subAgentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const task: SubAgentTask = {
      id: taskId,
      subAgentType,
      parentAgentType,
      input,
      dependencies,
      createdAt: new Date()
    };
    this.tasks.set(taskId, task);
    return task;
  }

  async executeSubAgent(task: SubAgentTask): Promise<SubAgentResult> {
    const startTime = Date.now();
    const definition = this.definitions.get(task.subAgentType);

    if (!definition) {
      return {
        subAgentType: task.subAgentType,
        success: false,
        error: `Unknown sub-agent type: ${task.subAgentType}`,
        executionTime: 0
      };
    }

    try {
      const result = await this.processSubAgentTask(task);
      const subResult: SubAgentResult = {
        subAgentType: task.subAgentType,
        success: true,
        data: result,
        executionTime: Date.now() - startTime
      };
      this.results.set(task.id, subResult);
      return subResult;
    } catch (error) {
      const errorResult: SubAgentResult = {
        subAgentType: task.subAgentType,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      };
      this.results.set(task.id, errorResult);
      return errorResult;
    }
  }

  private async processSubAgentTask(task: SubAgentTask): Promise<unknown> {
    const { subAgentType, input } = task;

    switch (subAgentType) {
      case 'data-collector':
        return this.collectData(input);
      case 'analyzer':
        return this.analyzeData(input);
      case 'reporter':
        return this.generateReport(input);
      case 'monitor':
        return this.monitorRisk(input);
      case 'advisor':
        return this.provideAdvice(input);
      case 'tutor':
        return this.tutorStudent(input);
      case 'content-generator':
        return this.generateContent(input);
      case 'engagement-tracker':
        return this.trackEngagement(input);
      case 'command-parser':
        return this.parseCommand(input);
      case 'voice-processor':
        return this.processVoice(input);
      default:
        throw new Error(`Unknown sub-agent type: ${subAgentType}`);
    }
  }

  private async collectData(input: Record<string, unknown>): Promise<unknown> {
    const sources = input.sources as string[] || ['api1', 'api2'];
    return {
      collected: sources.length,
      dataPoints: Math.floor(Math.random() * 100) + 50,
      sources,
      timestamp: new Date()
    };
  }

  private async analyzeData(input: Record<string, unknown>): Promise<unknown> {
    const data = input.data as unknown[] || [];
    return {
      sentiment: Math.random() * 2 - 1,
      trends: ['bullish', 'neutral', 'bearish'],
      confidence: Math.random() * 0.5 + 0.5,
      analyzedItems: data.length
    };
  }

  private async generateReport(input: Record<string, unknown>): Promise<unknown> {
    const analysis = input.analysis as Record<string, unknown>;
    return {
      summary: 'Market analysis complete',
      highlights: ['BTC showing bullish momentum', 'EUR/USD consolidating'],
      fullReport: analysis,
      generatedAt: new Date()
    };
  }

  private async monitorRisk(input: Record<string, unknown>): Promise<unknown> {
    const exposure = input.exposure as number || 0;
    return {
      currentExposure: exposure,
      maxAllowed: 10000,
      status: exposure > 8000 ? 'critical' : exposure > 5000 ? 'warning' : 'safe',
      alerts: exposure > 8000 ? ['Approaching limit'] : []
    };
  }

  private async provideAdvice(input: Record<string, unknown>): Promise<unknown> {
    const riskLevel = input.riskLevel as string || 'medium';
    const advice = {
      low: ['Consider increasing position size', 'Look for more opportunities'],
      medium: ['Maintain current strategy', 'Monitor positions closely'],
      high: ['Reduce exposure', 'Consider hedging positions']
    };
    return {
      recommendations: advice[riskLevel as keyof typeof advice] || advice.medium,
      riskScore: Math.random() * 10,
      generatedAt: new Date()
    };
  }

  private async tutorStudent(input: Record<string, unknown>): Promise<unknown> {
    const topic = input.topic as string || 'trading';
    return {
      explanation: `Here's how ${topic} works...`,
      examples: [`Example 1: ${topic} in practice`, `Example 2: Common patterns`],
      nextSteps: ['Practice with demo account', 'Review course materials']
    };
  }

  private async generateContent(input: Record<string, unknown>): Promise<unknown> {
    const contentType = input.contentType as string || 'analysis';
    return {
      ideas: [
        { title: `${contentType} idea 1`, format: 'post' },
        { title: `${contentType} idea 2`, format: 'video' }
      ],
      scripts: [`Script for ${contentType} content`],
      hashtags: ['#trading', '#crypto', '#forex']
    };
  }

  private async trackEngagement(input: Record<string, unknown>): Promise<unknown> {
    const period = input.period as string || '7d';
    return {
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 50),
      followers: Math.floor(Math.random() * 5000),
      period,
      growth: Math.random() * 20 - 5
    };
  }

  private async parseCommand(input: Record<string, unknown>): Promise<unknown> {
    const transcript = input.transcript as string || '';
    return {
      intent: this.extractIntent(transcript),
      entities: this.extractEntities(transcript),
      confidence: Math.random() * 0.3 + 0.7,
      action: 'execute'
    };
  }

  private async processVoice(input: Record<string, unknown>): Promise<unknown> {
    const audioData = input.audioData;
    return {
      transcription: 'Sample transcription',
      processed: true,
      response: 'Processing complete',
      audioOutput: '/api/audio/response.mp3'
    };
  }

  private extractIntent(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('precio') || lower.includes('price')) return 'getPrice';
    if (lower.includes('noticia') || lower.includes('news')) return 'getNews';
    if (lower.includes('analiza') || lower.includes('analyze')) return 'analyze';
    return 'unknown';
  }

  private extractEntities(text: string): Record<string, string> {
    const entities: Record<string, string> = {};
    if (/BTC|Bitcoin/i.test(text)) entities.symbol = 'BTC';
    if (/ETH|Ethereum/i.test(text)) entities.symbol = 'ETH';
    if (/EUR\/USD/i.test(text)) entities.symbol = 'EUR/USD';
    return entities;
  }

  async distributeTask(
    parentAgentType: AgentType,
    input: Record<string, unknown>
  ): Promise<SubAgentTask[]> {
    const subAgents = this.getSubAgentsForParent(parentAgentType);
    const sortedAgents = subAgents.sort((a, b) => a.priority - b.priority);

    return sortedAgents.map(agent => 
      this.createSubTask(agent.type, parentAgentType, input)
    );
  }

  async aggregateResults(
    parentAgentType: AgentType,
    tasks: SubAgentTask[]
  ): Promise<AggregatedResult> {
    const results: SubAgentResult[] = [];
    let totalTime = 0;
    let allSuccessful = true;

    for (const task of tasks) {
      const result = await this.executeSubAgent(task);
      results.push(result);
      totalTime += result.executionTime;
      if (!result.success) allSuccessful = false;
    }

    return {
      parentAgentType,
      subAgentResults: results,
      combinedData: this.combineResults(results),
      totalExecutionTime: totalTime,
      success: allSuccessful
    };
  }

  private combineResults(results: SubAgentResult[]): Record<string, unknown> {
    const combined: Record<string, unknown> = {};
    results.forEach((result, index) => {
      combined[`result_${index}`] = result.data;
    });
    return combined;
  }

  getSubTaskResult(taskId: string): SubAgentResult | undefined {
    return this.results.get(taskId);
  }

  getPendingTasks(): SubAgentTask[] {
    return Array.from(this.tasks.values());
  }

  clearCompletedTasks(): void {
    const now = Date.now();
    this.tasks.forEach((task, id) => {
      if (now - task.createdAt.getTime() > 3600000) {
        this.tasks.delete(id);
      }
    });
  }
}

export const subAgentManager = new SubAgentManager();
export default subAgentManager;
