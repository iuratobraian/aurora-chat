import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = join(__dirname, '../../workspace/coordination');
const BRAIN_DB = join(__dirname, '../../brain/db');

import { semanticSearch } from './semantic-retriever.mjs';

const TASK_BOARD = join(WORKSPACE, 'TASK_BOARD.md');
const CURRENT_FOCUS = join(WORKSPACE, 'CURRENT_FOCUS.md');
const PRETASK_BRIEFS = join(WORKSPACE, 'pre-task-briefs.jsonl');

function loadFile(path) {
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf-8');
}

function appendJsonl(filePath, entry) {
  writeFileSync(filePath, JSON.stringify(entry) + '\n', { flag: 'a' });
}

function parseTaskFromBoard(taskId) {
  const content = loadFile(TASK_BOARD);
  if (!content) return null;
  
  const lines = content.split('\n');
  let currentSection = null;
  let inTaskBlock = false;
  let taskData = null;
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim();
    }
    
    if (line.includes(`| ${taskId} |`)) {
      inTaskBlock = true;
      const cols = line.split('|').filter(c => c.trim());
      if (cols.length >= 6) {
        taskData = {
          id: cols[1].trim(),
          status: cols[2].trim(),
          owner: cols[3].trim(),
          track: cols[4].trim(),
          files: cols[5].trim(),
          description: cols[6]?.trim() || ''
        };
      }
    } else if (inTaskBlock && line.includes('|')) {
      if (line.includes('✅') || line.includes('lint') || line.includes('Detalle')) {
        const detailMatch = line.match(/\| (.*?) \|/g);
        if (detailMatch && detailMatch.length > 0) {
          taskData.description += ' ' + detailMatch[detailMatch.length - 1].replace(/\|/g, '').trim();
        }
      }
    } else if (inTaskBlock && !line.includes('|')) {
      inTaskBlock = false;
    }
  }
  
  if (taskData) {
    taskData.section = currentSection;
  }
  
  return taskData;
}

async function findSimilarTasks(query, limit = 3) {
  const logContent = loadFile(join(WORKSPACE, 'AGENT_LOG.md'));
  if (!logContent) return [];
  
  const similarTasks = [];
  const taskBlocks = logContent.split(/\n(?=### \d{4}-\d{2}-\d{2})/);
  
  for (const block of taskBlocks.slice(0, 50)) {
    const taskMatch = block.match(/- TASK-ID:\s*(\S+)/);
    const descMatch = block.match(/- Detalle:\s*([^\n]+)/);
    const outcomeMatch = block.match(/- Validación:\s*([^\n]+)/);
    
    if (taskMatch && descMatch) {
      const taskId = taskMatch[1];
      const description = descMatch[1];
      
      const queryWords = query.toLowerCase().split(/\s+/);
      const descWords = description.toLowerCase().split(/\s+/);
      
      const matchCount = queryWords.filter(w => descWords.some(d => d.includes(w) || w.includes(d))).length;
      
      if (matchCount > 0) {
        similarTasks.push({
          taskId,
          description,
          outcome: outcomeMatch?.[1] || 'No validation recorded',
          relevance: matchCount / queryWords.length
        });
      }
    }
  }
  
  return similarTasks
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

function detectWarnings(task) {
  const warnings = [];
  const desc = (task.description || '').toLowerCase();
  const files = (task.files || '').toLowerCase();
  
  if (files.includes('app.tsx') || files.includes('navigation.tsx') || files.includes('comunidadview') || files.includes('pricingview')) {
    warnings.push({
      type: 'guarded_file',
      message: 'Task touches guarded files (App.tsx, Navigation.tsx, ComunidadView, PricingView). Requires explicit claim in task board.',
      severity: 'high'
    });
  }
  
  if (desc.includes('security') || desc.includes('auth') || desc.includes('payment')) {
    warnings.push({
      type: 'sensitive_operation',
      message: 'Task involves sensitive operations. Extra validation recommended.',
      severity: 'high'
    });
  }
  
  if (desc.includes('convex') && (desc.includes('mutation') || desc.includes('query'))) {
    warnings.push({
      type: 'db_change',
      message: 'Task modifies Convex schema. Check for breaking changes.',
      severity: 'medium'
    });
  }
  
  if (files.includes('server.ts')) {
    warnings.push({
      type: 'server_change',
      message: 'Task modifies server.ts. Verify API endpoints don\'t conflict.',
      severity: 'medium'
    });
  }
  
  if (files.includes('test') || desc.includes('test')) {
    warnings.push({
      type: 'test_change',
      message: 'Task involves tests. Run tests after changes.',
      severity: 'low'
    });
  }
  
  return warnings;
}

function suggestApproach(task) {
  const desc = (task.description || '').toLowerCase();
  const track = (task.track || '').toLowerCase();
  
  const approaches = [];
  
  if (track.includes('security')) {
    approaches.push('Run security audit after changes');
    approaches.push('Check for injection vulnerabilities');
    approaches.push('Verify auth checks are in place');
  }
  
  if (track.includes('perf') || desc.includes('performance') || desc.includes('n+1')) {
    approaches.push('Profile before and after changes');
    approaches.push('Run performance tests');
    approaches.push('Check database query count');
  }
  
  if (track.includes('test')) {
    approaches.push('Run relevant unit tests');
    approaches.push('Check test coverage');
    approaches.push('Add edge case tests');
  }
  
  if (desc.includes('fix')) {
    approaches.push('Reproduce the bug first');
    approaches.push('Write a failing test');
    approaches.push('Fix the root cause, not symptoms');
  }
  
  if (desc.includes('refactor') || desc.includes('cleanup')) {
    approaches.push('Ensure tests pass before refactoring');
    approaches.push('Make incremental changes');
    approaches.push('Verify behavior unchanged after refactor');
  }
  
  if (approaches.length === 0) {
    approaches.push('Understand the existing code before making changes');
    approaches.push('Make small, focused changes');
    approaches.push('Run lint and tests after each change');
  }
  
  return approaches;
}

async function buildContextPack(taskId) {
  const task = parseTaskFromBoard(taskId);
  if (!task) {
    return { error: `Task ${taskId} not found in board` };
  }
  
  const [relevantKnowledge, similarTasks] = await Promise.all([
    semanticSearch(task.description || task.id, { topK: 5, domain: task.track }),
    findSimilarTasks(task.description || task.id, 3)
  ]);
  
  const warnings = detectWarnings(task);
  const approach = suggestApproach(task);
  
  const brief = {
    briefId: randomUUID(),
    taskId,
    generatedAt: new Date().toISOString(),
    task: {
      id: task.id,
      status: task.status,
      owner: task.owner,
      track: task.track,
      files: task.files,
      description: task.description,
      section: task.section
    },
    context: {
      relevantKnowledge,
      similarTasks
    },
    warnings,
    suggestedApproach: approach,
    validationCommands: getValidationCommands(task),
    filesToCheck: task.files?.split(',').map(f => f.trim()).filter(Boolean) || []
  };
  
  appendJsonl(PRETASK_BRIEFS, brief);
  
  return brief;
}

function getValidationCommands(task) {
  const commands = [];
  const desc = (task.description || '').toLowerCase();
  const track = (task.track || '').toLowerCase();
  const files = (task.files || '').toLowerCase();
  
  commands.push({ name: 'Lint', command: 'npm run lint', reason: 'Basic code quality check' });
  
  if (track.includes('security') || desc.includes('auth') || desc.includes('security')) {
    commands.push({ name: 'Typecheck', command: 'npx tsc --noEmit', reason: 'Type safety check' });
  }
  
  if (track.includes('test')) {
    commands.push({ name: 'Tests', command: 'npm run test:run', reason: 'Run all tests' });
  }
  
  if (track.includes('perf') || desc.includes('performance')) {
    commands.push({ name: 'Build', command: 'npm run build', reason: 'Verify build succeeds' });
  }
  
  if (files.includes('convex')) {
    commands.push({ name: 'Convex Deploy', command: 'npx convex deploy', reason: 'Deploy Convex changes' });
  }
  
  if (files.includes('server.ts')) {
    commands.push({ name: 'Dev Server', command: 'npm run dev', reason: 'Test server endpoints' });
  }
  
  return commands;
}

async function preTaskAutomation(taskId, options = {}) {
  const { verbose = false, saveBrief = true } = options;
  
  console.log(`[PreTaskAutomation] Building context for ${taskId}...`);
  
  const brief = await buildContextPack(taskId);
  
  if (brief.error) {
    console.error(`[PreTaskAutomation] Error: ${brief.error}`);
    return brief;
  }
  
  if (verbose) {
    console.log(`\n=== Pre-Task Brief: ${taskId} ===`);
    console.log(`\nTask: ${brief.task.description}`);
    console.log(`\nWarnings (${brief.warnings.length}):`);
    brief.warnings.forEach(w => console.log(`  ⚠️  [${w.severity}] ${w.message}`));
    console.log(`\nSuggested Approach:`);
    brief.suggestedApproach.forEach((a, i) => console.log(`  ${i + 1}. ${a}`));
    console.log(`\nValidation Commands:`);
    brief.validationCommands.forEach(c => console.log(`  - ${c.name}: ${c.command}`));
    if (brief.context.relevantKnowledge.length > 0) {
      console.log(`\nRelevant Knowledge (${brief.context.relevantKnowledge.length}):`);
      brief.context.relevantKnowledge.slice(0, 3).forEach(k => {
        console.log(`  - [${k.source}] ${k.statement?.slice(0, 80)}...`);
      });
    }
  }
  
  console.log(`\n✅ Pre-task context ready for ${taskId}`);
  
  return brief;
}

function getRecentBriefs(limit = 10) {
  if (!existsSync(PRETASK_BRIEFS)) return [];
  
  const content = loadFile(PRETASK_BRIEFS);
  if (!content) return [];
  
  const briefs = content.trim().split('\n')
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean)
    .slice(-limit);
  
  return briefs.reverse();
}

export {
  preTaskAutomation,
  buildContextPack,
  findSimilarTasks,
  detectWarnings,
  suggestApproach,
  getValidationCommands,
  getRecentBriefs,
  parseTaskFromBoard
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  if (command === 'build') {
    if (!arg) {
      console.log('Usage: node pre-task-automation.mjs build <task-id>');
      process.exit(1);
    }
    preTaskAutomation(arg, { verbose: true });
  } else if (command === 'list') {
    const briefs = getRecentBriefs(parseInt(arg) || 10);
    console.log(`\n=== Recent Pre-Task Briefs (${briefs.length}) ===\n`);
    briefs.forEach(b => {
      console.log(`${b.taskId} - ${b.generatedAt}`);
      console.log(`  Warnings: ${b.warnings.length}`);
      console.log(`  Knowledge: ${b.context.relevantKnowledge.length}`);
      console.log();
    });
  } else if (command === 'similar') {
    if (!arg) {
      console.log('Usage: node pre-task-automation.mjs similar <query>');
      process.exit(1);
    }
    findSimilarTasks(arg, 5).then(results => {
      console.log(`\n=== Similar Tasks to "${arg}" ===\n`);
      results.forEach((r, i) => {
        console.log(`${i + 1}. [${(r.relevance * 100).toFixed(0)}%] ${r.taskId}`);
        console.log(`   ${r.description?.slice(0, 100)}...\n`);
      });
    });
  } else {
    console.log('Usage:');
    console.log('  node pre-task-automation.mjs build <task-id>');
    console.log('  node pre-task-automation.mjs list [limit]');
    console.log('  node pre-task-automation.mjs similar <query>');
  }
}
