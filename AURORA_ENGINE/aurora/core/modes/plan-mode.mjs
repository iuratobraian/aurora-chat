/**
 * plan-mode.mjs - Planning Before Implementation para Aurora
 *
 * Analiza requisitos, genera plan paso a paso con estimaciones,
 * identifica riesgos, y espera aprobación antes de ejecutar.
 *
 * Uso:
 *   const { PlanMode } = await import('./plan-mode.mjs');
 *   const planner = new PlanMode();
 *   const plan = await planner.analyze('Crear componente de chat con WebSocket');
 */

import fs from 'node:fs';
import path from 'node:path';

// ============================================================================
// ANALYSIS ENGINE
// ============================================================================

function analyzeComplexity(requirement) {
  const lower = requirement.toLowerCase();
  let score = 0;
  const factors = [];

  // File count estimation
  if (lower.includes('component') || lower.includes('vista') || lower.includes('view')) {
    score += 2;
    factors.push('UI component');
  }
  if (lower.includes('api') || lower.includes('endpoint') || lower.includes('mutation')) {
    score += 3;
    factors.push('Backend logic');
  }
  if (lower.includes('database') || lower.includes('schema') || lower.includes('tabla')) {
    score += 3;
    factors.push('Database changes');
  }
  if (lower.includes('auth') || lower.includes('permission') || lower.includes('role')) {
    score += 4;
    factors.push('Security/Auth');
  }
  if (lower.includes('real-time') || lower.includes('websocket') || lower.includes('push')) {
    score += 4;
    factors.push('Real-time');
  }
  if (lower.includes('migration') || lower.includes('refactor')) {
    score += 5;
    factors.push('Refactoring');
  }
  if (lower.includes('test') || lower.includes('e2e')) {
    score += 2;
    factors.push('Testing');
  }

  // Estimate files affected
  const estimatedFiles = Math.max(1, Math.ceil(score * 1.5));

  // Estimate time (hours)
  const estimatedHours = Math.max(0.5, score * 0.75);

  return {
    score,
    level: score <= 3 ? 'low' : score <= 6 ? 'medium' : score <= 9 ? 'high' : 'critical',
    factors,
    estimatedFiles,
    estimatedHours: Math.round(estimatedHours * 4) / 4, // Round to nearest 0.25
  };
}

function generateSteps(requirement, complexity) {
  const steps = [];
  const lower = requirement.toLowerCase();

  // Standard steps based on complexity factors
  steps.push({
    step: 1,
    action: 'Analyze requirements',
    description: `Understand "${requirement.substring(0, 80)}..."`,
    estimatedTime: Math.max(0.25, complexity.estimatedHours * 0.1),
  });

  if (complexity.factors.includes('Database changes')) {
    steps.push({
      step: steps.length + 1,
      action: 'Update schema',
      description: 'Modify convex/schema.ts with new tables/fields',
      estimatedTime: Math.max(0.5, complexity.estimatedHours * 0.15),
    });
    steps.push({
      step: steps.length + 1,
      action: 'Deploy schema',
      description: 'Run npx convex deploy',
      estimatedTime: 0.25,
    });
  }

  if (complexity.factors.includes('Backend logic')) {
    steps.push({
      step: steps.length + 1,
      action: 'Create Convex functions',
      description: 'Add queries, mutations, and/or actions',
      estimatedTime: Math.max(1, complexity.estimatedHours * 0.3),
    });
  }

  if (complexity.factors.includes('UI component')) {
    steps.push({
      step: steps.length + 1,
      action: 'Create frontend component',
      description: 'Build React component with Tailwind CSS',
      estimatedTime: Math.max(1, complexity.estimatedHours * 0.3),
    });
  }

  if (complexity.factors.includes('Real-time')) {
    steps.push({
      step: steps.length + 1,
      action: 'Set up real-time connection',
      description: 'Configure WebSocket or Convex streams',
      estimatedTime: Math.max(0.5, complexity.estimatedHours * 0.15),
    });
  }

  steps.push({
    step: steps.length + 1,
    action: 'Type check',
    description: 'Run npx tsc --noEmit',
    estimatedTime: 0.25,
  });

  if (complexity.factors.includes('Testing')) {
    steps.push({
      step: steps.length + 1,
      action: 'Write tests',
      description: 'Add unit/integration tests',
      estimatedTime: Math.max(0.5, complexity.estimatedHours * 0.2),
    });
  }

  steps.push({
    step: steps.length + 1,
    action: 'Update TASK_BOARD',
    description: 'Mark task as done, update AGENT_LOG',
    estimatedTime: 0.25,
  });

  return steps;
}

function identifyRisks(complexity) {
  const risks = [];

  if (complexity.factors.includes('Security/Auth')) {
    risks.push({
      level: 'high',
      description: 'Auth/permission changes require careful validation',
      mitigation: 'Test with multiple user roles',
    });
  }

  if (complexity.factors.includes('Database changes')) {
    risks.push({
      level: 'medium',
      description: 'Schema changes may break existing queries',
      mitigation: 'Run npx convex deploy and test all related queries',
    });
  }

  if (complexity.factors.includes('Refactoring')) {
    risks.push({
      level: 'high',
      description: 'Refactoring may introduce regressions',
      mitigation: 'Run full test suite after changes',
    });
  }

  if (complexity.level === 'critical') {
    risks.push({
      level: 'high',
      description: 'High complexity task — consider splitting into sub-tasks',
      mitigation: 'Break into smaller, independently testable pieces',
    });
  }

  return risks;
}

// ============================================================================
// PLAN MODE CLASS
// ============================================================================

export class PlanMode {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();
    this.plans = [];
  }

  /**
   * Analyze a requirement and generate a plan
   * @param {string} requirement - Description of what needs to be done
   * @returns {Promise<{plan: object, approved: boolean}>}
   */
  async analyze(requirement) {
    const complexity = analyzeComplexity(requirement);
    const steps = generateSteps(requirement, complexity);
    const risks = identifyRisks(complexity);
    const files = this.estimateFiles(requirement, complexity);

    const plan = {
      id: `plan-${Date.now()}`,
      requirement,
      complexity,
      steps,
      risks,
      files,
      createdAt: new Date().toISOString(),
      approved: false,
    };

    this.plans.push(plan);
    return { plan, approved: false };
  }

  /**
   * Approve a plan
   * @param {string} planId
   */
  approve(planId) {
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) return { success: false, error: 'Plan not found' };

    plan.approved = true;
    plan.approvedAt = new Date().toISOString();
    return { success: true, plan };
  }

  /**
   * Reject a plan with reason
   * @param {string} planId
   * @param {string} reason
   */
  reject(planId, reason) {
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) return { success: false, error: 'Plan not found' };

    plan.rejected = true;
    plan.rejectionReason = reason;
    plan.rejectedAt = new Date().toISOString();
    return { success: true, plan };
  }

  /**
   * Get all plans
   */
  getPlans() {
    return this.plans;
  }

  /**
   * Estimate affected files
   */
  estimateFiles(requirement, complexity) {
    const files = [];
    const lower = requirement.toLowerCase();

    if (lower.includes('schema') || lower.includes('tabla') || lower.includes('table')) {
      files.push('convex/schema.ts');
    }
    if (lower.includes('component') || lower.includes('vista')) {
      const componentName = requirement.match(/(\w+)(View|Component)/)?.[0] || 'NewComponent';
      files.push(`src/views/${componentName}.tsx`);
    }
    if (lower.includes('convex') || lower.includes('mutation') || lower.includes('query')) {
      const moduleName = requirement.match(/(\w+)\.ts/)?.[1] || 'newModule';
      files.push(`convex/${moduleName}.ts`);
    }
    if (lower.includes('nav') || lower.includes('menu')) {
      files.push('src/components/Navigation.tsx');
    }
    if (lower.includes('app.tsx') || lower.includes('route') || lower.includes('ruta')) {
      files.push('src/App.tsx');
    }

    return files.length > 0 ? files : ['(to be determined during implementation)'];
  }

  /**
   * Schema for Aurora registry
   */
  getSchema() {
    return {
      name: 'plan',
      description: 'Analyze a requirement and create a step-by-step plan before implementation. Requires approval before executing.',
      parameters: {
        type: 'object',
        properties: {
          requirement: {
            type: 'string',
            description: 'Description of what needs to be done',
          },
          action: {
            type: 'string',
            enum: ['analyze', 'approve', 'reject', 'list'],
          },
          planId: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['action'],
      },
    };
  }
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const requirement = process.argv.slice(2).join(' ');

  if (!requirement) {
    console.log('Usage: node plan-mode.mjs <requirement description>');
    console.log('Example: node plan-mode.mjs Crear componente de chat con WebSocket');
    process.exit(1);
  }

  const planner = new PlanMode();

  planner.analyze(requirement).then(({ plan }) => {
    console.log('📋 PLAN ANALYSIS\n');
    console.log(`Requirement: ${requirement}`);
    console.log(`Complexity: ${plan.complexity.level.toUpperCase()} (${plan.complexity.score}/10)`);
    console.log(`Est. time: ${plan.complexity.estimatedHours}h`);
    console.log(`Est. files: ${plan.complexity.estimatedFiles}`);
    console.log(`Factors: ${plan.complexity.factors.join(', ')}`);

    console.log('\n📝 STEPS:');
    plan.steps.forEach(s => {
      console.log(`  ${s.step}. ${s.action} (${s.estimatedTime}h)`);
      console.log(`     ${s.description}`);
    });

    if (plan.risks.length > 0) {
      console.log('\n⚠️  RISKS:');
      plan.risks.forEach((r, i) => {
        console.log(`  ${i + 1}. [${r.level.toUpperCase()}] ${r.description}`);
        console.log(`     Mitigation: ${r.mitigation}`);
      });
    }

    if (plan.files.length > 0) {
      console.log('\n📁 AFFECTED FILES:');
      plan.files.forEach(f => console.log(`  - ${f}`));
    }

    console.log(`\n💡 Plan ID: ${plan.id}`);
    console.log('To approve: node plan-mode.mjs approve <planId>');
  });
}
