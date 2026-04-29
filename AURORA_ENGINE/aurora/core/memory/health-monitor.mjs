import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = join(__dirname, '../../workspace/coordination');
const BRAIN_DB = join(__dirname, '../../brain/db');
const HEALTH_HISTORY = join(WORKSPACE, 'health-history.jsonl');

const AURORA_API_URL = process.env.AURORA_API_URL || 'http://localhost:4310';
const HEALTH_CHECK_INTERVAL = parseInt(process.env.HEALTH_CHECK_INTERVAL) || 5 * 60 * 1000;
const DRIFT_CHECK_INTERVAL = parseInt(process.env.DRIFT_CHECK_INTERVAL) || 15 * 60 * 1000;

function loadFile(path) {
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf-8');
}

function appendJsonl(filePath, entry) {
  writeFileSync(filePath, JSON.stringify(entry) + '\n', { flag: 'a' });
}

function getWorkspaceStats() {
  const boardContent = loadFile(join(WORKSPACE, 'coordination/TASK_BOARD.md'));
  const focusContent = loadFile(join(WORKSPACE, 'coordination/CURRENT_FOCUS.md'));
  
  let tasks = { total: 0, done: 0, inProgress: 0, pending: 0 };
  let focusTask = null;
  
  if (boardContent) {
    const lines = boardContent.split('\n');
    for (const line of lines) {
      if (line.includes('|') && line.match(/\| [^|]+ \| (done|pending|claimed|in_progress|requested) \|/)) {
        tasks.total++;
        if (line.includes('done')) tasks.done++;
        else if (line.includes('claimed') || line.includes('in_progress')) tasks.inProgress++;
        else if (line.includes('pending') || line.includes('requested')) tasks.pending++;
      }
    }
  }
  
  if (focusContent) {
    const taskMatch = focusContent.match(/\*\*TASK-ID\*\*:\s*(\S+)/);
    const statusMatch = focusContent.match(/\*\*Status\*\*:\s*([^\n]+)/);
    if (taskMatch) {
      focusTask = {
        taskId: taskMatch[1],
        status: statusMatch?.[1]?.trim() || null
      };
    }
  }
  
  return { tasks, focusTask };
}

function getKnowledgeStats() {
  const stats = { total: 0, byDomain: {}, bySource: {} };
  
  const collections = [
    { file: 'teamwork_knowledge.jsonl', name: 'knowledge' },
    { file: 'heuristics.jsonl', name: 'heuristics' },
    { file: 'error_catalog.jsonl', name: 'errors' },
    { file: 'activity_log.jsonl', name: 'activity' }
  ];
  
  for (const col of collections) {
    const content = loadFile(join(BRAIN_DB, col.file));
    if (content) {
      const entries = content.trim().split('\n').filter(Boolean);
      stats.total += entries.length;
    }
  }
  
  const knowledgeContent = loadFile(join(BRAIN_DB, 'teamwork_knowledge.jsonl'));
  if (knowledgeContent) {
    const entries = knowledgeContent.trim().split('\n').filter(Boolean);
    for (const entry of entries) {
      try {
        const e = JSON.parse(entry);
        if (e.domain) {
          stats.byDomain[e.domain] = (stats.byDomain[e.domain] || 0) + 1;
        }
        if (e.sourceType) {
          stats.bySource[e.sourceType] = (stats.bySource[e.sourceType] || 0) + 1;
        }
      } catch {}
    }
  }
  
  return stats;
}

async function checkAuroraAPI() {
  try {
    const response = await fetch(`${AURORA_API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return { available: true, status: data.status || 'ok', latency: data.latency || 0 };
    }
    
    return { available: false, status: 'error', reason: `HTTP ${response.status}` };
  } catch (error) {
    return { available: false, status: 'unavailable', reason: error.message };
  }
}

async function checkLocalAgents() {
  const agents = {
    ollama: { available: false, models: [] },
    codex: { available: false },
    opencode: { available: false }
  };
  
  try {
    const ollamaResponse = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(3000)
    });
    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      agents.ollama.available = true;
      agents.ollama.models = data.models?.map(m => m.name) || [];
    }
  } catch {}
  
  agents.codex.available = existsSync(process.env.CODEX_PATH || '/usr/local/bin/codex');
  agents.opencode.available = existsSync(process.env.OPENCODE_PATH || '/usr/local/bin/opencode');
  
  return agents;
}

function checkConnectors() {
  const connectors = {
    tavily: !!process.env.TAVILY_API_KEY,
    brave: !!process.env.BRAVE_SEARCH_API_KEY,
    openrouter: !!process.env.OPENROUTER_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
    convex: !!process.env.CONVEX_DEPLOYMENT
  };
  
  const ready = Object.values(connectors).filter(Boolean).length;
  const total = Object.keys(connectors).length;
  
  return { connectors, ready, total, coverage: (ready / total * 100).toFixed(0) + '%' };
}

async function buildAuroraHealthSnapshot() {
  const workspace = getWorkspaceStats();
  const knowledge = getKnowledgeStats();
  const api = await checkAuroraAPI();
  const agents = await checkLocalAgents();
  const connectors = checkConnectors();
  
  const drift = await checkDriftStatus();
  
  let health = 'green';
  const signals = [];
  
  if (!api.available) {
    health = 'red';
    signals.push('Aurora API unavailable');
  }
  
  if (drift.highSeverity > 0) {
    health = health === 'green' ? 'yellow' : health;
    signals.push(`${drift.highSeverity} high-severity drift signals`);
  }
  
  if (workspace.tasks.pending > 10) {
    signals.push(`${workspace.tasks.pending} pending tasks`);
  }
  
  if (connectors.ready < 3) {
    signals.push(`Only ${connectors.ready}/${connectors.total} connectors ready`);
  }
  
  const snapshot = {
    generatedAt: new Date().toISOString(),
    repo: 'tradeportal-2025-platinum',
    workspace: {
      totalTasks: workspace.tasks.total,
      completed: workspace.tasks.done,
      inProgress: workspace.tasks.inProgress,
      pending: workspace.tasks.pending,
      completionRate: workspace.tasks.total > 0 
        ? (workspace.tasks.done / workspace.tasks.total * 100).toFixed(1) + '%' 
        : '0%'
    },
    focus: workspace.focusTask,
    knowledge: {
      total: knowledge.total,
      domains: Object.keys(knowledge.byDomain).length,
      sources: Object.keys(knowledge.bySource).length
    },
    auroraAPI: api,
    localAgents: agents,
    connectors,
    drift: {
      signals: drift.total,
      highSeverity: drift.highSeverity,
      mediumSeverity: drift.mediumSeverity
    },
    signals,
    health
  };
  
  return snapshot;
}

async function checkDriftStatus() {
  try {
    const { detectDrift } = await import('./drift-detector.mjs');
    const drift = await detectDrift();
    
    return {
      total: drift.signals.length,
      highSeverity: drift.signals.filter(s => s.severity === 'high').length,
      mediumSeverity: drift.signals.filter(s => s.severity === 'medium').length,
      lowSeverity: drift.signals.filter(s => s.severity === 'low').length
    };
  } catch {
    return { total: 0, highSeverity: 0, mediumSeverity: 0, lowSeverity: 0 };
  }
}

async function storeHealthRecord(snapshot) {
  appendJsonl(HEALTH_HISTORY, snapshot);
  
  const history = loadFile(HEALTH_HISTORY);
  if (history) {
    const lines = history.trim().split('\n');
    if (lines.length > 100) {
      const recentLines = lines.slice(-100);
      writeFileSync(HEALTH_HISTORY, recentLines.join('\n') + '\n', 'utf-8');
    }
  }
}

async function alertOperators(snapshot) {
  console.log('\n🚨 AURORA HEALTH ALERT 🚨');
  console.log(`Status: ${snapshot.health.toUpperCase()}`);
  console.log(`Time: ${snapshot.generatedAt}`);
  console.log('\nSignals:');
  snapshot.signals.forEach(s => console.log(`  - ${s}`));
  console.log('\n');
  
}

async function healthMonitorLoop() {
  console.log('[HealthMonitor] Starting health monitoring...');
  console.log(`[HealthMonitor] Check interval: ${HEALTH_CHECK_INTERVAL / 1000}s`);
  console.log(`[HealthMonitor] Drift check interval: ${DRIFT_CHECK_INTERVAL / 1000}s`);
  
  let driftCheckCounter = 0;
  
  while (true) {
    try {
      const snapshot = await buildAuroraHealthSnapshot();
      
      await storeHealthRecord(snapshot);
      
      if (snapshot.health === 'red') {
        await alertOperators(snapshot);
      }
      
      driftCheckCounter++;
      if (driftCheckCounter >= Math.ceil(DRIFT_CHECK_INTERVAL / HEALTH_CHECK_INTERVAL)) {
        driftCheckCounter = 0;
        const drift = await checkDriftStatus();
        if (drift.highSeverity > 0) {
          console.log(`[HealthMonitor] ⚠️  ${drift.highSeverity} high-severity drift signals detected`);
        }
      }
      
      const status = snapshot.health === 'green' ? '✅' : snapshot.health === 'yellow' ? '⚠️' : '🚨';
      console.log(`[HealthMonitor] ${status} ${new Date().toISOString()} - Health: ${snapshot.health}`);
      
    } catch (error) {
      console.error('[HealthMonitor] Error:', error.message);
    }
    
    await sleep(HEALTH_CHECK_INTERVAL);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getHealthHistory(limit = 24) {
  if (!existsSync(HEALTH_HISTORY)) return [];
  
  const content = loadFile(HEALTH_HISTORY);
  if (!content) return [];
  
  const snapshots = content.trim().split('\n')
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean)
    .slice(-limit);
  
  return snapshots.reverse();
}

function getHealthTrend() {
  const history = getHealthHistory(24);
  
  if (history.length === 0) return { trend: 'unknown', uptime: '0%' };
  
  const greenCount = history.filter(h => h.health === 'green').length;
  const uptime = (greenCount / history.length * 100).toFixed(1) + '%';
  
  let trend = 'stable';
  if (history.length >= 6) {
    const recent = history.slice(0, 3);
    const older = history.slice(3, 6);
    const recentGreen = recent.filter(h => h.health === 'green').length;
    const olderGreen = older.filter(h => h.health === 'green').length;
    if (recentGreen > olderGreen) trend = 'improving';
    else if (recentGreen < olderGreen) trend = 'declining';
  }
  
  return { trend, uptime, samples: history.length };
}

async function runHealthCheck(verbose = false) {
  const snapshot = await buildAuroraHealthSnapshot();
  
  if (verbose) {
    console.log('\n=== Aurora Health Snapshot ===');
    console.log(`Generated: ${snapshot.generatedAt}`);
    console.log(`Health: ${snapshot.health.toUpperCase()}`);
    console.log('\nWorkspace:');
    console.log(`  Tasks: ${snapshot.workspace.total} (${snapshot.workspace.completed} done, ${snapshot.workspace.inProgress} in progress)`);
    console.log(`  Completion: ${snapshot.workspace.completionRate}`);
    console.log('\nKnowledge:');
    console.log(`  Total: ${snapshot.knowledge.total} entries`);
    console.log(`  Domains: ${snapshot.knowledge.domains}`);
    console.log('\nAurora API:');
    console.log(`  Available: ${snapshot.auroraAPI.available}`);
    if (snapshot.auroraAPI.latency) console.log(`  Latency: ${snapshot.auroraAPI.latency}ms`);
    console.log('\nConnectors:');
    console.log(`  Ready: ${snapshot.connectors.ready}/${snapshot.connectors.total} (${snapshot.connectors.coverage})`);
    console.log('\nDrift:');
    console.log(`  Signals: ${snapshot.drift.signals} (${snapshot.drift.highSeverity} high, ${snapshot.drift.mediumSeverity} medium)`);
    if (snapshot.signals.length > 0) {
      console.log('\nSignals:');
      snapshot.signals.forEach(s => console.log(`  ⚠️  ${s}`));
    }
  }
  
  await storeHealthRecord(snapshot);
  
  const trend = getHealthTrend();
  console.log(`\n📊 Health Trend: ${trend.trend} (${trend.uptime} uptime over ${trend.samples} checks)`);
  
  return snapshot;
}

export {
  healthMonitorLoop,
  buildAuroraHealthSnapshot,
  runHealthCheck,
  getHealthHistory,
  getHealthTrend,
  storeHealthRecord,
  alertOperators
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'check' || command === 'run') {
    const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
    runHealthCheck(verbose);
  } else if (command === 'monitor') {
    healthMonitorLoop();
  } else if (command === 'history') {
    const history = getHealthHistory(parseInt(process.argv[3]) || 24);
    console.log(`\n=== Health History (${history.length} snapshots) ===\n`);
    history.forEach(h => {
      const status = h.health === 'green' ? '✅' : h.health === 'yellow' ? '⚠️' : '🚨';
      console.log(`${status} ${h.generatedAt} - Tasks: ${h.workspace.inProgress}/${h.workspace.total} - API: ${h.auroraAPI.available ? 'ok' : 'down'}`);
    });
  } else if (command === 'trend') {
    const trend = getHealthTrend();
    console.log(`\n=== Health Trend ===`);
    console.log(`Trend: ${trend.trend}`);
    console.log(`Uptime: ${trend.uptime}`);
    console.log(`Samples: ${trend.samples}`);
  } else {
    console.log('Usage:');
    console.log('  node health-monitor.mjs check [--verbose]');
    console.log('  node health-monitor.mjs monitor');
    console.log('  node health-monitor.mjs history [limit]');
    console.log('  node health-monitor.mjs trend');
  }
}
