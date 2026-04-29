import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const BRAIN_DB = join(ROOT, '.agent/brain/db');
const MEMORY_DIR = join(BRAIN_DB, '../memory');
const OUTPUT_DIR = join(ROOT, '.agent/brain/fine_tuning');
const DATASET_FILE = join(OUTPUT_DIR, 'training_dataset.jsonl');
const STATS_FILE = join(OUTPUT_DIR, 'dataset_stats.json');

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function loadJsonl(filePath) {
  if (!existsSync(filePath)) return [];
  const content = readFileSync(filePath, 'utf-8');
  return content.trim().split('\n').filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

function appendJsonl(filePath, entry) {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, JSON.stringify(entry) + '\n', { flag: 'a' });
}

function now() {
  return new Date().toISOString();
}

const TASK_TYPES = ['feature', 'fix', 'refactor', 'review', 'security', 'testing', 'docs', 'ops'];
const DOMAINS = ['frontend', 'backend', 'security', 'testing', 'aurora', 'product', 'growth', 'marketing'];

function generateInstruction(task) {
  const templates = {
    feature: `Implement ${task.feature || 'a new feature'} for ${task.domain || 'the application'}`,
    fix: `Fix ${task.bug || 'the bug'} in ${task.location || 'the codebase'}`,
    refactor: `Refactor ${task.target || 'the code'} to improve ${task.aspect || 'maintainability'}`,
    review: `Review ${task.subject || 'the code'} and provide feedback on ${task.focus || 'quality'}`,
    security: `Address security concern: ${task.concern || 'vulnerability'} in ${task.area || 'the system'}`,
    testing: `Add tests for ${task.component || 'the component'} covering ${task.scenarios || 'edge cases'}`,
    docs: `Update documentation for ${task.subject || 'the feature'} with ${task.details || 'clear examples'}`,
    ops: `Improve ${task.aspect || 'operations'} by ${task.action || 'implementing best practices'}`
  };
  return templates[task.type] || `Handle task: ${JSON.stringify(task)}`;
}

function generateOutput(outcome) {
  const templates = [
    `Successfully completed: ${outcome.summary || 'task finished'}`,
    `Implementation details: ${outcome.details || 'code written and validated'}`,
    `Files changed: ${outcome.files?.join(', ') || 'as documented'}`,
    `Tests: ${outcome.tests || 'validated with lint'}`,
    `Notes: ${outcome.notes || 'no additional notes'}`
  ];
  return templates.join('\n');
}

function extractFromHeuristics() {
  const heuristics = loadJsonl(join(BRAIN_DB, 'heuristics.jsonl'));
  const examples = [];
  
  for (const h of heuristics) {
    if (h.statement && h.confidence >= 0.7) {
      examples.push({
        id: randomUUID(),
        type: 'heuristic',
        instruction: `Apply best practice: ${h.statement}`,
        output: `Best practice applied successfully. Confidence: ${h.confidence}, Domain: ${h.domain || 'general'}`,
        metadata: {
          source: 'heuristics',
          domain: h.domain,
          confidence: h.confidence,
          trustScore: h.trustScore || 0.5
        }
      });
    }
  }
  
  return examples;
}

function extractFromAntiPatterns() {
  const anti = loadJsonl(join(BRAIN_DB, 'anti_patterns.jsonl'));
  const examples = [];
  
  for (const a of anti) {
    if (a.statement) {
      examples.push({
        id: randomUUID(),
        type: 'anti_pattern',
        instruction: `Identify and avoid: ${a.statement}`,
        output: `Anti-pattern detected and avoided. Category: ${a.category || 'unknown'}, Severity: ${a.severity || 'medium'}`,
        metadata: {
          source: 'anti_patterns',
          category: a.category,
          severity: a.severity
        }
      });
    }
  }
  
  return examples;
}

function extractFromPatterns() {
  const patterns = loadJsonl(join(BRAIN_DB, 'patterns.jsonl'));
  const examples = [];
  
  for (const p of patterns) {
    if (p.statement || p.pattern) {
      const statement = p.statement || p.pattern;
      examples.push({
        id: randomUUID(),
        type: 'pattern',
        instruction: `Apply pattern: ${statement}`,
        output: `Pattern applied. Context: ${p.context || 'general'}, Benefits: ${p.benefits || 'improved code quality'}`,
        metadata: {
          source: 'patterns',
          context: p.context,
          reuseCount: p.reuseCount || 0
        }
      });
    }
  }
  
  return examples;
}

function extractFromErrors() {
  const errors = loadJsonl(join(BRAIN_DB, 'error_catalog.jsonl'));
  const examples = [];
  
  for (const e of errors) {
    if (e.statement || e.title) {
      const statement = e.statement || e.title;
      examples.push({
        id: randomUUID(),
        type: 'error_resolution',
        instruction: `Resolve error: ${statement}`,
        output: `Error resolved. Solution: ${e.solution || 'see error catalog'}, Prevention: ${e.prevention || 'standard practices'}`,
        metadata: {
          source: 'error_catalog',
          errorType: e.errorType,
          severity: e.severity
        }
      });
    }
  }
  
  return examples;
}

function extractFromKnowledge() {
  const knowledge = loadJsonl(join(BRAIN_DB, 'teamwork_knowledge.jsonl'));
  const examples = [];
  
  for (const k of knowledge) {
    if (k.statement || k.content) {
      const content = k.statement || k.content;
      examples.push({
        id: randomUUID(),
        type: 'knowledge',
        instruction: `Apply knowledge: ${content.substring(0, 100)}`,
        output: `Knowledge applied successfully. Domain: ${k.domain || 'general'}, Confidence: ${k.confidence || 0.8}`,
        metadata: {
          source: 'teamwork_knowledge',
          domain: k.domain,
          confidence: k.confidence
        }
      });
    }
  }
  
  return examples;
}

function extractFromDecisions() {
  const decisions = loadJsonl(join(BRAIN_DB, 'decisions_graph.jsonl'));
  const examples = [];
  
  for (const d of decisions) {
    if (d.decision || d.rationale) {
      examples.push({
        id: randomUUID(),
        type: 'decision',
        instruction: `Make a decision about: ${d.decision || d.subject}`,
        output: `Decision made: ${d.outcome || d.decision}. Rationale: ${d.rationale || 'based on analysis'}`,
        metadata: {
          source: 'decisions_graph',
          context: d.context,
          outcome: d.outcome
        }
      });
    }
  }
  
  return examples;
}

function extractFromAgentMetrics() {
  const metrics = loadJsonl(join(BRAIN_DB, 'agent_metrics.jsonl'));
  const examples = [];
  
  for (const m of metrics) {
    if (m.taskId && m.outcome) {
      examples.push({
        id: randomUUID(),
        type: 'task_completion',
        instruction: `Complete task: ${m.taskId} in domain ${m.domain || 'general'}`,
        output: `Task completed: ${m.outcome}. Files: ${m.filesChanged?.join(', ') || 'N/A'}. Quality: ${m.quality || 'good'}`,
        metadata: {
          source: 'agent_metrics',
          domain: m.domain,
          taskType: m.taskType,
          duration: m.duration
        }
      });
    }
  }
  
  return examples;
}

function generateSyntheticExamples() {
  const examples = [];
  
  const synthPairs = [
    {
      instruction: 'Fix the type error in the API response handler',
      output: 'Type error fixed by adding proper type annotation and null check. Files: server.ts. Tests: passing.',
      domain: 'backend'
    },
    {
      instruction: 'Add rate limiting to the user registration endpoint',
      output: 'Rate limiting implemented with tiered limits (FREE: 5/hr, PRO: 20/hr, ELITE: unlimited). Integration: checkRateLimit middleware.',
      domain: 'security'
    },
    {
      instruction: 'Optimize the community feed query for better performance',
      output: 'Query optimized with .take(100) limit and indexed filter. N+1 resolved with batch loading. Performance: 3x improvement.',
      domain: 'backend'
    },
    {
      instruction: 'Add React.memo and useCallback to prevent unnecessary re-renders',
      output: 'Performance optimization applied: memo() on 3 components, useCallback on 12+ handlers. Impact: reduced re-renders by ~60%.',
      domain: 'frontend'
    },
    {
      instruction: 'Fix the auth session persistence across page reloads',
      output: 'Session persistence fixed by moving token storage to sessionStorage with proper hydration check. User stays logged in after reload.',
      domain: 'security'
    },
    {
      instruction: 'Add E2E tests for the authentication flow',
      output: 'E2E auth tests added: login, register, logout, session persistence, password validation, referral codes. 6 test scenarios.',
      domain: 'testing'
    },
    {
      instruction: 'Implement semantic search with embeddings for knowledge base',
      output: 'Embedding-based retrieval implemented using Ollama nomic-embed-text. Cosine similarity with 0.3 threshold. Fallback to keyword search.',
      domain: 'aurora'
    },
    {
      instruction: 'Add drift detection for task board consistency',
      output: 'Drift detection implemented: board-focus mismatch, log-board drift, ownership drift. Score calculated from inconsistencies.',
      domain: 'aurora'
    }
  ];
  
  for (const pair of synthPairs) {
    examples.push({
      id: randomUUID(),
      type: 'synthetic',
      instruction: pair.instruction,
      output: pair.output,
      metadata: {
        source: 'synthetic',
        domain: pair.domain,
        quality: 'high'
      }
    });
  }
  
  return examples;
}

function generateDataset(options = {}) {
  const { minConfidence = 0.6, domains = [], taskTypes = [] } = options;
  
  console.log('[FineTuning] Generating training dataset...');
  
  const allExamples = [
    ...extractFromHeuristics(),
    ...extractFromAntiPatterns(),
    ...extractFromPatterns(),
    ...extractFromErrors(),
    ...extractFromKnowledge(),
    ...extractFromDecisions(),
    ...extractFromAgentMetrics(),
    ...generateSyntheticExamples()
  ];
  
  console.log(`[FineTuning] Extracted ${allExamples.length} raw examples`);
  
  let filtered = allExamples.filter(ex => {
    const conf = ex.metadata?.confidence || ex.metadata?.trustScore || 0.8;
    if (conf < minConfidence) return false;
    
    if (domains.length > 0 && !domains.includes(ex.metadata?.domain)) {
      return false;
    }
    
    if (taskTypes.length > 0 && !taskTypes.includes(ex.type)) {
      return false;
    }
    
    return true;
  });
  
  filtered = filtered.sort((a, b) => {
    const confA = a.metadata?.confidence || a.metadata?.trustScore || 0.5;
    const confB = b.metadata?.confidence || b.metadata?.trustScore || 0.5;
    return confB - confA;
  });
  
  ensureDir(OUTPUT_DIR);
  writeFileSync(DATASET_FILE, filtered.map(e => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
  
  const stats = {
    generatedAt: now(),
    totalExamples: filtered.length,
    byType: {},
    byDomain: {},
    bySource: {},
    avgConfidence: 0,
    quality: {
      high: filtered.filter(e => (e.metadata?.confidence || 0.8) >= 0.8).length,
      medium: filtered.filter(e => (e.metadata?.confidence || 0.8) >= 0.6 && (e.metadata?.confidence || 0.8) < 0.8).length,
      low: filtered.filter(e => (e.metadata?.confidence || 0.8) < 0.6).length
    }
  };
  
  for (const ex of filtered) {
    stats.byType[ex.type] = (stats.byType[ex.type] || 0) + 1;
    stats.byDomain[ex.metadata?.domain || 'unknown'] = (stats.byDomain[ex.metadata?.domain || 'unknown'] || 0) + 1;
    stats.bySource[ex.metadata?.source || 'unknown'] = (stats.bySource[ex.metadata?.source || 'unknown'] || 0) + 1;
    stats.avgConfidence += ex.metadata?.confidence || ex.metadata?.trustScore || 0.8;
  }
  
  stats.avgConfidence /= filtered.length;
  
  writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  
  console.log(`[FineTuning] Dataset generated: ${filtered.length} examples`);
  console.log(`[FineTuning] Saved to: ${DATASET_FILE}`);
  
  return stats;
}

function exportForFineTuning(format = 'jsonl') {
  ensureDir(OUTPUT_DIR);
  
  if (format === 'jsonl') {
    const data = loadJsonl(DATASET_FILE);
    console.log(`[FineTuning] Export ready: ${data.length} examples in ${DATASET_FILE}`);
    return data;
  }
  
  if (format === 'chatml') {
    const data = loadJsonl(DATASET_FILE);
    const chatml = data.map(ex => ({
      messages: [
        { role: 'user', content: ex.instruction },
        { role: 'assistant', content: ex.output }
      ],
      metadata: ex.metadata
    }));
    
    const output = join(OUTPUT_DIR, 'training_chatml.jsonl');
    writeFileSync(output, chatml.map(e => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
    console.log(`[FineTuning] ChatML export: ${output}`);
    return chatml;
  }
  
  if (format === 'alpaca') {
    const data = loadJsonl(DATASET_FILE);
    const alpaca = data.map(ex => ({
      instruction: ex.instruction,
      input: '',
      output: ex.output
    }));
    
    const output = join(OUTPUT_DIR, 'training_alpaca.json');
    writeFileSync(output, JSON.stringify(alpaca, null, 2), 'utf-8');
    console.log(`[FineTuning] Alpaca export: ${output}`);
    return alpaca;
  }
}

function getDatasetStats() {
  if (!existsSync(STATS_FILE)) {
    console.log('[FineTuning] No dataset generated yet. Run generate first.');
    return null;
  }
  
  return JSON.parse(readFileSync(STATS_FILE, 'utf-8'));
}

export {
  generateDataset,
  exportForFineTuning,
  getDatasetStats,
  extractFromHeuristics,
  extractFromAntiPatterns,
  extractFromPatterns,
  extractFromErrors,
  extractFromKnowledge,
  extractFromDecisions,
  extractFromAgentMetrics,
  generateSyntheticExamples
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'generate') {
    const options = {};
    const args = process.argv.slice(3);
    
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--min-confidence') options.minConfidence = parseFloat(args[++i]);
      if (args[i] === '--domains') options.domains = args[++i].split(',');
      if (args[i] === '--types') options.taskTypes = args[++i].split(',');
    }
    
    const stats = generateDataset(options);
    console.log('\n=== Dataset Stats ===');
    console.log(`Total: ${stats.totalExamples}`);
    console.log(`Avg Confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
    console.log('\nBy Type:', stats.byType);
    console.log('\nBy Domain:', stats.byDomain);
    console.log('\nQuality:', stats.quality);
  } else if (command === 'export') {
    const format = process.argv[3] || 'jsonl';
    exportForFineTuning(format);
    console.log(`[FineTuning] Exported in ${format} format`);
  } else if (command === 'stats') {
    const stats = getDatasetStats();
    if (stats) {
      console.log('\n=== Dataset Stats ===');
      console.log(`Generated: ${stats.generatedAt}`);
      console.log(`Total Examples: ${stats.totalExamples}`);
      console.log(`Avg Confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
      console.log('\nBy Type:', stats.byType);
      console.log('\nBy Domain:', stats.byDomain);
      console.log('\nQuality:', stats.quality);
    }
  } else {
    console.log('Usage:');
    console.log('  node aurora-fine-tuning.mjs generate [--min-confidence 0.6] [--domains frontend,backend] [--types feature,fix]');
    console.log('  node aurora-fine-tuning.mjs export [jsonl|chatml|alpaca]');
    console.log('  node aurora-fine-tuning.mjs stats');
  }
}
