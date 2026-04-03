#!/usr/bin/env node
/**
 * plan-mode.mjs - Planning Mode for Aurora
 * 
 * Enables Aurora to create detailed plans before implementation:
 * - Analyze requirements
 * - Create step-by-step plan
 * - Estimate time per step
 * - Identify risks
 * - Wait for user approval
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md - Coordinator Mode Pattern, ULTRAPLAN
 * @see aurora/core/coordinator/aurora-coordinator.mjs - Synthesis phase
 * @see aurora/core/coordinator/worker.mjs - Research workers
 */

import fs from 'node:fs';
import path from 'node:path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const PLAN_MODE_CONFIG = {
  // Default time estimates (minutes)
  timeEstimates: {
    research: 15,
    analysis: 10,
    implementation_small: 30,    // < 100 lines
    implementation_medium: 60,   // 100-500 lines
    implementation_large: 120,   // 500+ lines
    testing: 20,
    documentation: 15,
    review: 10
  },
  
  // Risk factors
  riskFactors: {
    newDependency: 'high',
    databaseChange: 'high',
    apiChange: 'medium',
    uiChange: 'medium',
    refactor: 'medium',
    bugFix: 'low',
    documentation: 'low'
  },
  
  // Plan template sections
  requiredSections: [
    'overview',
    'requirements',
    'steps',
    'risks',
    'estimate'
  ]
};

// ============================================================================
// PLAN MODE CLASS
// ============================================================================

export class PlanMode {
  constructor(options = {}) {
    this.config = { ...PLAN_MODE_CONFIG, ...options };
    this.planHistory = [];
  }

  /**
   * Get tool schema (for Tool Registry)
   */
  getSchema() {
    return {
      name: 'plan',
      description: 'Create detailed implementation plans with estimates and risk analysis',
      parameters: {
        task: {
          type: 'object',
          required: true,
          description: 'Task to plan',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            requirements: { type: 'array', items: 'string' }
          }
        },
        complexity: {
          type: 'string',
          enum: ['small', 'medium', 'large', 'complex'],
          description: 'Expected complexity (default: auto-detect)'
        },
        includeTesting: {
          type: 'boolean',
          description: 'Include testing steps (default: true)'
        },
        includeDocs: {
          type: 'boolean',
          description: 'Include documentation steps (default: true)'
        }
      },
      returns: {
        plan: 'object',
        approved: 'boolean',
        estimate: 'string'
      }
    };
  }

  /**
   * Create plan for task
   */
  async create(task, options = {}) {
    const {
      complexity = 'auto',
      includeTesting = true,
      includeDocs = true
    } = options;

    // Log plan creation
    this.logPlan(task, 'creating');

    // Validate task
    if (!task || (!task.name && !task.description)) {
      return {
        plan: null,
        error: 'Task with name or description is required'
      };
    }

    // Analyze requirements
    const analysis = await this.analyzeRequirements(task);

    // Detect complexity if auto
    const detectedComplexity = complexity === 'auto' 
      ? this.detectComplexity(task, analysis)
      : complexity;

    // Create steps
    const steps = this.createSteps(task, analysis, detectedComplexity, includeTesting, includeDocs);

    // Identify risks
    const risks = this.identifyRisks(task, analysis, steps);

    // Estimate time
    const estimate = this.estimateTime(steps, detectedComplexity);

    // Build plan
    const plan = {
      task: {
        name: task.name || 'Unnamed Task',
        description: task.description || '',
        requirements: task.requirements || []
      },
      analysis,
      complexity: detectedComplexity,
      steps,
      risks,
      estimate,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };

    // Save to history
    this.planHistory.push({
      task: task.name || 'Unnamed',
      createdAt: plan.createdAt,
      steps: steps.length,
      status: 'draft'
    });

    return {
      plan,
      approved: false,
      requiresApproval: true
    };
  }

  /**
   * Analyze requirements
   */
  async analyzeRequirements(task) {
    const analysis = {
      type: 'unknown',
      files: [],
      dependencies: [],
      changes: []
    };

    // Analyze task description for keywords
    const desc = (task.description || '').toLowerCase();
    const name = (task.name || '').toLowerCase();
    const text = `${desc} ${name}`;

    // Detect task type
    if (text.includes('component') || text.includes('ui')) {
      analysis.type = 'ui';
    } else if (text.includes('api') || text.includes('endpoint') || text.includes('route')) {
      analysis.type = 'api';
    } else if (text.includes('database') || text.includes('schema') || text.includes('model')) {
      analysis.type = 'database';
    } else if (text.includes('test') || text.includes('spec')) {
      analysis.type = 'testing';
    } else if (text.includes('refactor') || text.includes('clean')) {
      analysis.type = 'refactor';
    } else if (text.includes('bug') || text.includes('fix')) {
      analysis.type = 'bugfix';
    } else if (text.includes('doc') || text.includes('readme')) {
      analysis.type = 'documentation';
    } else if (text.includes('dependency') || text.includes('install') || text.includes('package')) {
      analysis.type = 'dependency';
    }

    // Extract file mentions
    const filePatterns = [
      /[\w-]+\.(ts|tsx|js|jsx|css|scss|json|md)/g,
      /src\/[\w/-]+/g,
      /components\/[\w/-]+/g,
      /pages\/[\w/-]+/g
    ];

    for (const pattern of filePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        analysis.files.push(...matches);
      }
    }

    // Remove duplicates
    analysis.files = [...new Set(analysis.files)];

    return analysis;
  }

  /**
   * Detect complexity
   */
  detectComplexity(task, analysis) {
    let score = 0;

    // Type-based scoring
    const typeScores = {
      ui: 2,
      api: 3,
      database: 4,
      testing: 2,
      refactor: 3,
      bugfix: 1,
      documentation: 1,
      dependency: 2
    };
    score += typeScores[analysis.type] || 2;

    // File count scoring
    if (analysis.files.length > 5) score += 2;
    else if (analysis.files.length > 2) score += 1;

    // Requirement count scoring
    const reqCount = task.requirements?.length || 0;
    if (reqCount > 5) score += 2;
    else if (reqCount > 2) score += 1;

    // Determine complexity
    if (score <= 3) return 'small';
    if (score <= 5) return 'medium';
    if (score <= 7) return 'large';
    return 'complex';
  }

  /**
   * Create implementation steps
   */
  createSteps(task, analysis, complexity, includeTesting, includeDocs) {
    const steps = [];
    let stepNum = 1;

    // Phase 1: Research
    steps.push({
      num: stepNum++,
      phase: 'research',
      title: 'Research and Analysis',
      description: 'Understand current implementation and requirements',
      actions: [
        'Review existing code structure',
        'Identify affected files',
        'Check for similar implementations'
      ],
      estimate: this.config.timeEstimates.research
    });

    // Phase 2: Implementation
    const implSize = complexity === 'small' ? 'small' : complexity === 'medium' ? 'medium' : 'large';
    steps.push({
      num: stepNum++,
      phase: 'implementation',
      title: `Implementation (${implSize})`,
      description: `Implement the required changes`,
      actions: this.getImplementationActions(analysis.type, task),
      estimate: this.config.timeEstimates[`implementation_${implSize}`]
    });

    // Phase 3: Testing
    if (includeTesting) {
      steps.push({
        num: stepNum++,
        phase: 'testing',
        title: 'Testing',
        description: 'Write and run tests',
        actions: [
          'Write unit tests',
          'Write integration tests (if applicable)',
          'Run existing test suite',
          'Manual testing (if applicable)'
        ],
        estimate: this.config.timeEstimates.testing
      });
    }

    // Phase 4: Documentation
    if (includeDocs) {
      steps.push({
        num: stepNum++,
        phase: 'documentation',
        title: 'Documentation',
        description: 'Update documentation',
        actions: [
          'Update inline comments',
          'Update README (if applicable)',
          'Update API docs (if applicable)'
        ],
        estimate: this.config.timeEstimates.documentation
      });
    }

    // Phase 5: Review
    steps.push({
      num: stepNum++,
      phase: 'review',
      title: 'Review',
      description: 'Review changes before committing',
      actions: [
        'Self-review code changes',
        'Run linter',
        'Run type checker',
        'Verify all tests pass'
      ],
      estimate: this.config.timeEstimates.review
    });

    return steps;
  }

  /**
   * Get implementation actions based on type
   */
  getImplementationActions(type, task) {
    const actionMap = {
      ui: [
        'Create/modify component structure',
        'Add styles',
        'Implement logic/state',
        'Add props validation'
      ],
      api: [
        'Create/modify route handler',
        'Add validation',
        'Implement business logic',
        'Add error handling'
      ],
      database: [
        'Create/modify schema',
        'Add migrations',
        'Update queries',
        'Test data integrity'
      ],
      testing: [
        'Create test file',
        'Write test cases',
        'Add mocks (if needed)',
        'Verify coverage'
      ],
      refactor: [
        'Identify code smells',
        'Extract functions/components',
        'Improve naming',
        'Remove duplication'
      ],
      bugfix: [
        'Reproduce the bug',
        'Identify root cause',
        'Implement fix',
        'Verify fix resolves issue'
      ],
      documentation: [
        'Gather information',
        'Write documentation',
        'Add examples',
        'Review for clarity'
      ],
      dependency: [
        'Research dependency',
        'Install package',
        'Configure integration',
        'Update package.json'
      ]
    };

    return actionMap[type] || [
      'Analyze requirements',
      'Implement solution',
      'Verify implementation'
    ];
  }

  /**
   * Identify risks
   */
  identifyRisks(task, analysis, steps) {
    const risks = [];

    // Type-based risks
    if (analysis.type === 'database') {
      risks.push({
        type: 'data_loss',
        level: 'high',
        description: 'Database changes may cause data loss',
        mitigation: 'Create backup before migration, test on staging'
      });
    }

    if (analysis.type === 'api') {
      risks.push({
        type: 'breaking_change',
        level: 'medium',
        description: 'API changes may break existing clients',
        mitigation: 'Version API, maintain backward compatibility'
      });
    }

    if (analysis.type === 'dependency') {
      risks.push({
        type: 'compatibility',
        level: 'medium',
        description: 'New dependency may have compatibility issues',
        mitigation: 'Check peer dependencies, test thoroughly'
      });
    }

    // File count risks
    if (analysis.files.length > 5) {
      risks.push({
        type: 'scope_creep',
        level: 'medium',
        description: 'Many files affected increases complexity',
        mitigation: 'Break into smaller PRs, review each file carefully'
      });
    }

    // Add generic risks
    if (risks.length === 0) {
      risks.push({
        type: 'general',
        level: 'low',
        description: 'Standard implementation risks',
        mitigation: 'Follow best practices, write tests'
      });
    }

    return risks;
  }

  /**
   * Estimate total time
   */
  estimateTime(steps, complexity) {
    const totalMinutes = steps.reduce((sum, step) => sum + step.estimate, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let estimate = '';
    if (hours > 0) {
      estimate += `${hours}h`;
    }
    if (minutes > 0) {
      estimate += ` ${minutes}m`;
    }

    // Add complexity note
    let complexityNote = '';
    if (complexity === 'complex') {
      complexityNote = ' (high uncertainty)';
    } else if (complexity === 'large') {
      complexityNote = ' (medium uncertainty)';
    }

    return {
      total: estimate + complexityNote,
      minutes: totalMinutes,
      breakdown: steps.map(s => ({
        phase: s.phase,
        estimate: `${s.estimate}m`
      }))
    };
  }

  /**
   * Approve plan
   */
  approve(plan) {
    plan.status = 'approved';
    plan.approvedAt = new Date().toISOString();
    
    // Update history
    const historyEntry = this.planHistory.find(
      h => h.task === plan.task.name && h.status === 'draft'
    );
    if (historyEntry) {
      historyEntry.status = 'approved';
    }

    return {
      plan,
      approved: true
    };
  }

  /**
   * Reject plan
   */
  reject(plan, reason) {
    plan.status = 'rejected';
    plan.rejectedAt = new Date().toISOString();
    plan.rejectionReason = reason;

    // Update history
    const historyEntry = this.planHistory.find(
      h => h.task === plan.task.name && h.status === 'draft'
    );
    if (historyEntry) {
      historyEntry.status = 'rejected';
    }

    return {
      plan,
      approved: false,
      reason
    };
  }

  /**
   * Log plan to history
   */
  logPlan(task, action) {
    this.planHistory.push({
      task: task.name || 'Unnamed',
      action,
      timestamp: Date.now(),
      status: 'pending'
    });
  }

  /**
   * Get plan history
   */
  getHistory(limit = 10) {
    return this.planHistory.slice(-limit);
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.planHistory = [];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let planModeInstance = null;

export function getPlanMode() {
  if (!planModeInstance) {
    planModeInstance = new PlanMode();
  }
  return planModeInstance;
}

export async function createPlan(task, options = {}) {
  const planMode = getPlanMode();
  return await planMode.create(task, options);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('PlanMode - Create detailed implementation plans\n');
  console.log('Usage: node plan-mode.mjs (requires task definition)\n');
  console.log('This module is designed to be used programmatically:');
  console.log('  import { createPlan } from "./plan-mode.mjs";');
  console.log('  const result = await createPlan({ name: "My Task", description: "..." });\n');
  
  // Demo mode
  console.log('🧪 Demo mode:\n');
  
  const planMode = getPlanMode();
  const demoTask = {
    name: 'Add dark mode toggle',
    description: 'Add a toggle button to switch between light and dark theme in the navigation',
    requirements: [
      'Toggle button in navigation',
      'Persist theme preference',
      'Smooth transition'
    ]
  };
  
  planMode.create(demoTask)
    .then(result => {
      const plan = result.plan;
      
      console.log('📋 PLAN PREVIEW:\n');
      console.log(`Task: ${plan.task.name}`);
      console.log(`Complexity: ${plan.complexity}`);
      console.log(`Type: ${plan.analysis.type}`);
      console.log(`\nSteps: ${plan.steps.length}`);
      
      for (const step of plan.steps) {
        console.log(`\n  ${step.num}. ${step.title} (${step.estimate}m)`);
        console.log(`     ${step.description}`);
        console.log(`     Actions: ${step.actions.length}`);
      }
      
      console.log(`\n⏱️  Total Estimate: ${plan.estimate.total}`);
      
      console.log(`\n⚠️  Risks: ${plan.risks.length}`);
      for (const risk of plan.risks) {
        console.log(`  - [${risk.level}] ${risk.description}`);
        console.log(`    Mitigation: ${risk.mitigation}`);
      }
      
      console.log('\n\n💡 To approve: call approve(plan)');
      console.log('💡 To reject: call reject(plan, reason)\n');
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
    });
}
