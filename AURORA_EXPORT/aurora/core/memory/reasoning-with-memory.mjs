import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = join(__dirname, '../../workspace/coordination');

import { semanticSearch } from './semantic-retriever.mjs';

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const REASONING_MODEL = process.env.REASONING_MODEL || 'glm-4.7-flash';

const TASK_SCOPES = [
  'community_feed', 'auth_and_onboarding', 'backend_support',
  'pricing_and_conversion', 'qa_and_release', 'aurora_ops', 'design_system', 'marketing'
];

const RISK_PATTERNS = {
  critical: [
    /payment|pay|subscription|billing|stripe/i,
    /auth|login|password|credential|token/i,
    /admin|privil/i,
    /delete.*production|drop.*table|truncate/i
  ],
  high: [
    /security|vulnerability|xss|csrf|injection/i,
    /migration|schema.*change|breaking.*change/i,
    /api.*endpoint|rest|graphql/i,
    /rate.*limit|throttl/i
  ],
  medium: [
    /database|query|convex/i,
    /frontend|ui|component|view/i,
    /test|spec/i,
    /config|env|variable/i
  ],
  low: [
    /documentation|docs|comment/i,
    /refactor|cleanup|lint|format/i,
    /cosmetic|style|css/i
  ]
};

const VALIDATION_COMMANDS = {
  lint: 'npm run lint',
  typecheck: 'npx tsc --noEmit',
  test: 'npm run test:run',
  build: 'npm run build',
  preview: 'npm run preview'
};

function loadFile(path) {
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf-8');
}

function classifyTask(query) {
  const text = query.toLowerCase();
  
  let surface = 'general';
  let scope = 'general';
  let complexity = 'medium';
  
  if (/instagram|social.*media|post.*schedule|auto.*reply/i.test(text)) {
    scope = 'marketing';
    surface = 'instagram_dashboard';
  }
  
  if (/community|post|feed|like|comment/i.test(text)) {
    scope = 'community_feed';
    surface = 'community_feed';
  }
  
  if (/auth|login|signup|register|password|token/i.test(text)) {
    scope = 'auth_and_onboarding';
    surface = 'auth_and_onboarding';
  }
  
  if (/convex|mutation|query|db|database/i.test(text)) {
    scope = 'backend_support';
    surface = 'backend_support';
  }
  
  if (/pricing|subscription|payment|plan|premium/i.test(text)) {
    scope = 'pricing_and_conversion';
    surface = 'pricing_and_conversion';
  }
  
  if (/test|lint|bug|fix|release|deploy/i.test(text)) {
    scope = 'qa_and_release';
    surface = 'qa_and_release';
  }
  
  if (/aurora|brain|memory|agent|automation/i.test(text)) {
    scope = 'aurora_ops';
    surface = 'aurora_utility';
  }
  
  if (/component|design|ui|ux|style|theme/i.test(text)) {
    scope = 'design_system';
    surface = 'design_system';
  }
  
  if (/performance|n\+1|slow|optimize|cache/i.test(text)) {
    complexity = 'high';
  }
  
  if (/migration|refactor|breaking/i.test(text)) {
    complexity = 'high';
  }
  
  if (/documentation|readme|comment/i.test(text)) {
    complexity = 'low';
  }
  
  return { scope, surface, complexity };
}

function detectRisk(query, options = {}) {
  const { includeGuarded = true } = options;
  const text = query.toLowerCase();
  
  const risks = [];
  
  for (const pattern of RISK_PATTERNS.critical) {
    if (pattern.test(text)) {
      risks.push({
        level: 'critical',
        category: 'security',
        pattern: pattern.source,
        message: `Critical operation detected: ${pattern.source}`,
        required: ['security audit', 'extra validation']
      });
    }
  }
  
  for (const pattern of RISK_PATTERNS.high) {
    if (pattern.test(text)) {
      risks.push({
        level: 'high',
        category: pattern.source.includes('migration') ? 'database' : 'general',
        pattern: pattern.source,
        message: `High-risk operation: ${pattern.source}`,
        required: ['thorough testing']
      });
    }
  }
  
  for (const pattern of RISK_PATTERNS.medium) {
    if (pattern.test(text)) {
      risks.push({
        level: 'medium',
        category: 'general',
        pattern: pattern.source,
        message: `Medium-risk: ${pattern.source}`,
        required: ['standard validation']
      });
    }
  }
  
  if (includeGuarded) {
    const guardedFiles = ['app.tsx', 'navigation.tsx', 'comunidadview', 'pricingview'];
    for (const file of guardedFiles) {
      if (text.includes(file.toLowerCase())) {
        risks.push({
          level: 'high',
          category: 'guarded',
          pattern: file,
          message: `Task touches guarded file: ${file}`,
          required: ['explicit claim in task board']
        });
      }
    }
  }
  
  return {
    hasRisk: risks.length > 0,
    maxLevel: risks.length > 0 ? Math.min(...risks.map(r => ['low', 'medium', 'high', 'critical'].indexOf(r.level))) : -1,
    risks
  };
}

async function suggestNextStep(query, context = {}) {
  const classification = classifyTask(query);
  const risk = detectRisk(query);
  
  const steps = [];
  
  if (risk.hasRisk) {
    steps.push({
      step: 1,
      action: 'Assess risk level',
      detail: `Detected ${risk.maxLevel === 0 ? 'critical' : risk.maxLevel === 1 ? 'high' : 'medium'} risk`,
      commands: ['Review affected files', 'Check for existing tests']
    });
  }
  
  if (classification.complexity === 'high') {
    steps.push({
      step: steps.length + 1,
      action: 'Plan approach',
      detail: 'High complexity task - consider breaking down',
      commands: ['Identify dependencies', 'Check for similar implementations']
    });
  }
  
  steps.push({
    step: steps.length + 1,
    action: 'Understand existing code',
    detail: `Scope: ${classification.scope}`,
    commands: ['Review related files', 'Check task board for similar tasks']
  });
  
  steps.push({
    step: steps.length + 1,
    action: 'Implement changes',
    detail: 'Small, focused changes recommended',
    commands: []
  });
  
  steps.push({
    step: steps.length + 1,
    action: 'Validate',
    detail: 'Run validation commands',
    commands: ['npm run lint', 'npx tsc --noEmit']
  });
  
  return {
    classification,
    risk,
    steps,
    suggestedValidation: getValidationCommands(classification.scope)
  };
}

function getValidationCommands(scope) {
  const commands = [
    { name: 'Lint', command: VALIDATION_COMMANDS.lint, always: true },
    { name: 'Typecheck', command: VALIDATION_COMMANDS.typecheck, scopes: ['backend_support', 'auth_and_onboarding'] },
    { name: 'Test', command: VALIDATION_COMMANDS.test, scopes: ['qa_and_release', 'community_feed'] },
    { name: 'Build', command: VALIDATION_COMMANDS.build, scopes: ['all'] }
  ];
  
  return commands
    .filter(c => c.always || !c.scopes || c.scopes.includes(scope) || c.scopes.includes('all'))
    .map(c => ({ name: c.name, command: c.command }));
}

async function reasonWithContext(query, options = {}) {
  const { verbose = false, includeKnowledge = true, maxKnowledge = 5 } = options;
  
  if (verbose) {
    console.log(`\n[ReasoningWithMemory] Processing: "${query}"`);
  }
  
  const classification = classifyTask(query);
  if (verbose) {
    console.log(`[ReasoningWithMemory] Classified: ${classification.scope}/${classification.surface} (${classification.complexity})`);
  }
  
  const risk = detectRisk(query);
  if (verbose && risk.hasRisk) {
    console.log(`[ReasoningWithMemory] Risk detected: ${risk.maxLevel}`);
  }
  
  let knowledge = [];
  if (includeKnowledge) {
    try {
      knowledge = await semanticSearch(query, { 
        topK: maxKnowledge, 
        domain: classification.scope === 'general' ? null : classification.scope 
      });
      if (verbose) {
        console.log(`[ReasoningWithMemory] Found ${knowledge.length} relevant knowledge entries`);
      }
    } catch (error) {
      console.warn(`[ReasoningWithMemory] Knowledge search failed: ${error.message}`);
    }
  }
  
  const steps = await suggestNextStep(query, { classification, risk });
  
  const result = {
    generatedAt: new Date().toISOString(),
    query,
    classification,
    risk: {
      hasRisk: risk.hasRisk,
      level: risk.maxLevel >= 0 ? ['low', 'medium', 'high', 'critical'][risk.maxLevel] : 'none',
      count: risk.risks.length
    },
    knowledge,
    steps: steps.steps,
    validation: steps.suggestedValidation,
    contextReady: knowledge.length > 0 || !includeKnowledge,
    warnings: risk.risks.filter(r => r.level === 'high' || r.level === 'critical')
  };
  
  return result;
}

async function generateExecutionPlan(query, options = {}) {
  const { maxSteps = 7, includeDependencies = true } = options;
  
  const reasoning = await reasonWithContext(query, { includeKnowledge: true });
  
  const plan = {
    planId: Date.now().toString(36),
    generatedAt: new Date().toISOString(),
    query,
    summary: `Implement ${reasoning.classification.surface} task`,
    phases: [],
    estimatedComplexity: reasoning.classification.complexity,
    risks: reasoning.risks,
    knowledgeUsed: reasoning.knowledge.length
  };
  
  plan.phases.push({
    phase: 1,
    name: 'Discovery',
    description: 'Understand the task and gather context',
    steps: [
      'Parse task description',
      'Identify affected files',
      'Search for similar past tasks',
      'Retrieve relevant knowledge'
    ],
    validation: []
  });
  
  if (reasoning.risk.hasRisk) {
    plan.phases.push({
      phase: 2,
      name: 'Risk Assessment',
      description: 'Assess and mitigate risks',
      steps: reasoning.risks.map(r => `Address ${r.level} risk: ${r.pattern}`),
      validation: ['Security review', 'Code review']
    });
  }
  
  plan.phases.push({
    phase: plan.phases.length + 1,
    name: 'Implementation',
    description: 'Make the necessary changes',
    steps: [
      'Create backup/discovery snapshot',
      'Implement changes incrementally',
      'Run lint after each change',
      'Test affected functionality'
    ],
    validation: ['npm run lint', 'npx tsc --noEmit']
  });
  
  plan.phases.push({
    phase: plan.phases.length + 1,
    name: 'Validation',
    description: 'Verify changes work correctly',
    steps: [
      'Run full validation suite',
      'Check for regressions',
      'Verify task completion'
    ],
    validation: reasoning.validation.map(v => v.command)
  });
  
  plan.phases.push({
    phase: plan.phases.length + 1,
    name: 'Closure',
    description: 'Document and close task',
    steps: [
      'Update task board',
      'Add learnings to knowledge base',
      'Notify stakeholders'
    ],
    validation: []
  });
  
  return plan;
}

function buildReasoningPrompt(data) {
  const { query, classification, knowledge, risks } = data;
  
  let prompt = `Task: ${query}\n\n`;
  prompt += `Classification: ${classification.scope} / ${classification.surface}\n`;
  prompt += `Complexity: ${classification.complexity}\n\n`;
  
  if (knowledge.length > 0) {
    prompt += `Relevant Knowledge:\n`;
    knowledge.forEach((k, i) => {
      prompt += `${i + 1}. [${k.source}] ${k.statement || k.title}\n`;
    });
    prompt += '\n';
  }
  
  if (risks.length > 0) {
    prompt += `Risks:\n`;
    risks.forEach(r => {
      prompt += `- ${r.level.toUpperCase()}: ${r.message}\n`;
    });
    prompt += '\n';
  }
  
  prompt += `Reason step by step and provide:\n`;
  prompt += `1. Understanding of the task\n`;
  prompt += `2. Potential challenges\n`;
  prompt += `3. Recommended approach\n`;
  prompt += `4. Validation strategy\n`;
  
  return prompt;
}

export {
  classifyTask,
  detectRisk,
  suggestNextStep,
  getValidationCommands,
  reasonWithContext,
  generateExecutionPlan,
  buildReasoningPrompt,
  TASK_SCOPES,
  RISK_PATTERNS
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const query = process.argv.slice(3).join(' ');
  
  if (!query) {
    console.log('Usage:');
    console.log('  node reasoning-with-memory.mjs classify <query>');
    console.log('  node reasoning-with-memory.mjs risk <query>');
    console.log('  node reasoning-with-memory.mjs reason <query>');
    console.log('  node reasoning-with-memory.mjs plan <query>');
    process.exit(1);
  }
  
  if (command === 'classify') {
    const result = classifyTask(query);
    console.log(`\n=== Classification ===`);
    console.log(`Scope: ${result.scope}`);
    console.log(`Surface: ${result.surface}`);
    console.log(`Complexity: ${result.complexity}`);
  } else if (command === 'risk') {
    const result = detectRisk(query);
    console.log(`\n=== Risk Detection ===`);
    console.log(`Has Risk: ${result.hasRisk}`);
    if (result.hasRisk) {
      console.log(`Max Level: ${result.maxLevel}`);
      console.log(`Risks:`);
      result.risks.forEach(r => console.log(`  - [${r.level}] ${r.message}`));
    }
  } else if (command === 'reason') {
    reasonWithContext(query, { verbose: true }).then(result => {
      console.log(`\n=== Reasoning with Memory ===`);
      console.log(`Classification: ${result.classification.scope}/${result.classification.surface}`);
      console.log(`Risk Level: ${result.risk.level}`);
      console.log(`Knowledge Entries: ${result.knowledge.length}`);
      console.log(`Context Ready: ${result.contextReady}`);
      console.log(`\nSteps:`);
      result.steps.forEach(s => console.log(`  ${s.step}. ${s.action}`));
    });
  } else if (command === 'plan') {
    generateExecutionPlan(query).then(plan => {
      console.log(`\n=== Execution Plan ===`);
      console.log(`Plan ID: ${plan.planId}`);
      console.log(`Phases: ${plan.phases.length}`);
      console.log(`Complexity: ${plan.estimatedComplexity}`);
      plan.phases.forEach(p => {
        console.log(`\nPhase ${p.phase}: ${p.name}`);
        p.steps.forEach(s => console.log(`  - ${s}`));
      });
    });
  } else {
    reasonWithContext(query, { verbose: true }).then(result => {
      console.log(JSON.stringify(result, null, 2));
    });
  }
}
