#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const results = {
  passed: 0,
  warning: 0,
  failed: 0,
  checks: []
};

function check(name, fn) {
  try {
    const result = fn();
    if (result === true) {
      results.passed++;
      results.checks.push({ name, status: 'passed' });
      console.log(`${GREEN}✅${RESET} ${name}`);
    } else if (result === false) {
      results.failed++;
      results.checks.push({ name, status: 'failed' });
      console.log(`${RED}🔴${RESET} ${name}`);
    } else {
      results.warning++;
      results.checks.push({ name, status: 'warning', detail: result });
      console.log(`${YELLOW}⚠️${RESET} ${name} ${typeof result === 'string' ? '- ' + result : ''}`);
    }
  } catch (e) {
    results.failed++;
    results.checks.push({ name, status: 'failed', error: e.message });
    console.log(`${RED}🔴${RESET} ${name} - ${e.message}`);
  }
}

function fileExists(path) {
  return existsSync(join(ROOT, path));
}

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), 'utf-8'));
}

function countLines(path) {
  if (!fileExists(path)) return 0;
  const content = readFileSync(join(ROOT, path), 'utf-8');
  return content.split('\n').length;
}

function getDirectories(path) {
  const dir = join(ROOT, path);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => statSync(join(dir, f)).isDirectory());
}

console.log(`\n${BOLD}🔍 Aurora Doctor - Health Check${RESET}\n`);

check('Aurora API exists', () => fileExists('scripts/aurora-api.mjs'));
check('Aurora Shell exists', () => fileExists('scripts/aurora-shell.mjs'));
check('Aurora Sovereign exists', () => fileExists('scripts/aurora-sovereign.mjs'));
check('Aurora Memory exists', () => fileExists('scripts/aurora-memory.mjs'));
check('Aurora Scorecard exists', () => fileExists('scripts/aurora-scorecard.mjs'));
check('Aurora Session Brief exists', () => fileExists('scripts/aurora-session-brief.mjs'));
check('Aurora Product Intelligence exists', () => fileExists('scripts/aurora-product-intelligence.mjs'));
check('Aurora Connectors exists', () => fileExists('scripts/aurora-connectors.mjs'));
check('Aurora Agents exists', () => fileExists('scripts/aurora-agent-tracker.mjs'));

console.log('');

check('connectors.json valid', () => {
  try { readJson('.agent/aurora/connectors.json'); return true; }
  catch { return false; }
});
check('agent-registry.json valid', () => {
  try { readJson('.agent/aurora/agent-registry.json'); return true; }
  catch { return false; }
});
check('repos.json valid', () => {
  try { readJson('.agent/aurora/repos.json'); return true; }
  catch { return false; }
});
check('product-surfaces.json valid', () => {
  try { readJson('.agent/aurora/product-surfaces.json'); return true; }
  catch { return false; }
});

console.log('');

check('TASK_BOARD.md exists', () => fileExists('.agent/workspace/coordination/TASK_BOARD.md'));
check('CURRENT_FOCUS.md exists', () => fileExists('.agent/workspace/coordination/CURRENT_FOCUS.md'));
check('AGENT_LOG.md exists', () => fileExists('.agent/workspace/coordination/AGENT_LOG.md'));

console.log('');

check('No pending tasks', () => {
  const content = readFileSync(join(ROOT, '.agent/workspace/coordination/TASK_BOARD.md'), 'utf-8');
  const pendingMatch = content.match(/\| \S+ \| pending/g);
  const pending = pendingMatch ? pendingMatch.length : 0;
  if (pending === 0) return true;
  return `Found ${pending} pending tasks`;
});

check('No stale tasks (>7 days)', () => {
  const content = readFileSync(join(ROOT, '.agent/workspace/coordination/TASK_BOARD.md'), 'utf-8');
  const inProgressMatch = content.match(/\| \S+ \| in_progress/g);
  return inProgressMatch ? 'Found in_progress tasks' : true;
});

console.log('');

check('brain/db directory exists', () => fileExists('.agent/brain/db'));
check('knowledge base populated', () => {
  const files = readdirSync(join(ROOT, '.agent/brain/db')).filter(f => f.endsWith('.jsonl'));
  return files.length > 5 ? true : `Only ${files.length} files`;
});

console.log('');

check('src directory clean', () => {
  const srcFiles = readdirSync(join(ROOT, 'src')).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  return srcFiles.length > 0 ? true : 'Empty src';
});

check('convex directory exists', () => fileExists('convex'));

console.log('');

check('package.json has aurora scripts', () => {
  const pkg = readJson('package.json');
  const scripts = Object.keys(pkg.scripts || {}).filter(s => s.startsWith('aurora:'));
  return scripts.length > 20 ? true : `Only ${scripts.length} scripts`;
});

check('Aurora UI exists', () => fileExists('.agent/aurora/app/index.html'));

console.log('');

check('MCP code-review connector', () => {
  const connectors = readJson('.agent/aurora/connectors.json');
  const hasCodeReview = connectors.mcp?.some(m => m.id === 'mcp_code_review');
  return hasCodeReview ? true : 'mcp_code_review not found';
});
check('MCP code-refiner connector', () => {
  const connectors = readJson('.agent/aurora/connectors.json');
  const hasCodeRefiner = connectors.mcp?.some(m => m.id === 'mcp_code_refiner');
  return hasCodeRefiner ? true : 'mcp_code_refiner not found';
});

console.log('');

check('knowledge base has code review MCPs', () => {
  const kb = readFileSync(join(ROOT, '.agent/brain/db/oss_ai_repos.jsonl'), 'utf-8');
  const hasCodeReview = kb.includes('MCP-CODE-REVIEW-SERVER');
  const hasCodeRefiner = kb.includes('MCP-CODE-REFINER');
  if (hasCodeReview && hasCodeRefiner) return true;
  return hasCodeReview ? 'mcp_code_refiner not in KB' : hasCodeRefiner ? 'mcp_code_review not in KB' : 'both missing';
});

console.log('\n' + '='.repeat(50));
console.log(`\n${BOLD}📊 Results:${RESET}`);
console.log(`  ${GREEN}✅ Passed:${RESET} ${results.passed}`);
console.log(`  ${YELLOW}⚠️ Warnings:${RESET} ${results.warning}`);
console.log(`  ${RED}🔴 Failed:${RESET} ${results.failed}`);

const health = results.failed === 0 ? 'HEALTHY' : results.failed <= 2 ? 'DEGRADED' : 'CRITICAL';
const color = results.failed === 0 ? GREEN : results.failed <= 2 ? YELLOW : RED;
console.log(`\n${BOLD}Health Status:${RESET} ${color}${health}${RESET}\n`);

process.exit(results.failed > 0 ? 1 : 0);
