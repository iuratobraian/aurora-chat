import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRAIN_ROOT = join(__dirname, '../../brain/db');
const MEMORY_ROOT = join(BRAIN_ROOT, '../memory');
const SESSIONS_DIR = join(MEMORY_ROOT, 'sessions');
const SHARED_DIR = join(MEMORY_ROOT, 'shared');
const CONTEXT_DIR = join(MEMORY_ROOT, 'context');
const ARCHIVE_DIR = join(MEMORY_ROOT, 'archive');

const SESSION_TTL_HOURS = 72;
const MAX_CONTEXT_AGE_HOURS = 168;

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

function writeJsonl(filePath, entries) {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, entries.map(e => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
}

function now() {
  return new Date().toISOString();
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function hashContent(content) {
  return createHash('sha256').update(content).digest('hex').substring(0, 16);
}

class AgentMemory {
  constructor(agentId) {
    this.agentId = agentId;
    this.sessionId = randomUUID();
    this.sessionStart = now();
    ensureDir(SESSIONS_DIR);
    ensureDir(SHARED_DIR);
    ensureDir(CONTEXT_DIR);
    ensureDir(ARCHIVE_DIR);
  }

  recordAction(action) {
    const entry = {
      id: randomUUID(),
      agentId: this.agentId,
      sessionId: this.sessionId,
      timestamp: now(),
      action,
      sessionStart: this.sessionStart
    };
    appendJsonl(join(SESSIONS_DIR, `${this.agentId}.jsonl`), entry);
    this.syncToShared(entry);
    return entry;
  }

  syncToShared(entry) {
    const sharedFile = join(SHARED_DIR, 'shared_memory.jsonl');
    const shared = loadJsonl(sharedFile);
    
    const key = `${entry.agentId}:${entry.action.type}`;
    const existing = shared.findIndex(e => e.key === key);
    
    const sharedEntry = {
      key,
      agentId: entry.agentId,
      action: entry.action,
      lastUpdated: entry.timestamp,
      sessionId: entry.sessionId,
      occurrenceCount: existing >= 0 ? shared[existing].occurrenceCount + 1 : 1
    };
    
    if (existing >= 0) {
      shared[existing] = sharedEntry;
    } else {
      shared.push(sharedEntry);
    }
    
    writeJsonl(sharedFile, shared);
  }

  recordDecision(decision) {
    return this.recordAction({
      type: 'decision',
      ...decision
    });
  }

  recordLearning(learning) {
    return this.recordAction({
      type: 'learning',
      ...learning
    });
  }

  recordTask(task) {
    return this.recordAction({
      type: 'task',
      ...task
    });
  }

  recordContext(context) {
    return this.recordAction({
      type: 'context',
      ...context
    });
  }

  generateSessionSummary() {
    const sessions = loadJsonl(join(SESSIONS_DIR, `${this.agentId}.jsonl`));
    const recent = sessions.filter(s => s.sessionId === this.sessionId);
    
    const actions = {
      decisions: recent.filter(s => s.action.type === 'decision').length,
      learnings: recent.filter(s => s.action.type === 'learning').length,
      tasks: recent.filter(s => s.action.type === 'task').length,
      contexts: recent.filter(s => s.action.type === 'context').length
    };

    const keyDecisions = recent
      .filter(s => s.action.type === 'decision')
      .slice(-5)
      .map(s => ({
        reason: s.action.reason || 'N/A',
        outcome: s.action.outcome || 'pending',
        timestamp: s.timestamp
      }));

    const learnings = recent
      .filter(s => s.action.type === 'learning')
      .slice(-10)
      .map(s => s.action.insight);

    const completedTasks = recent
      .filter(s => s.action.type === 'task' && s.action.status === 'completed')
      .map(s => s.action.taskId);

    const summary = {
      sessionId: this.sessionId,
      agentId: this.agentId,
      sessionStart: this.sessionStart,
      sessionEnd: now(),
      duration: Date.now() - new Date(this.sessionStart).getTime(),
      actions,
      keyDecisions,
      learnings,
      completedTasks,
      contextUsed: recent.filter(s => s.action.type === 'context').map(s => s.action.source)
    };

    appendJsonl(join(CONTEXT_DIR, 'session_summaries.jsonl'), summary);
    return summary;
  }

  getCrossSessionContext(options = {}) {
    const { maxAgeHours = MAX_CONTEXT_AGE_HOURS, domains = [] } = options;
    const cutoff = hoursAgo(maxAgeHours);
    
    const summaries = loadJsonl(join(CONTEXT_DIR, 'session_summaries.jsonl'))
      .filter(s => s.sessionEnd > cutoff && s.agentId === this.agentId);

    const shared = loadJsonl(join(SHARED_DIR, 'shared_memory.jsonl'));
    
    const recentDecisions = summaries
      .flatMap(s => s.keyDecisions)
      .filter(d => new Date(d.timestamp) > new Date(cutoff));

    const recentLearnings = summaries
      .flatMap(s => s.learnings)
      .filter(Boolean);

    const taskHistory = summaries
      .flatMap(s => s.completedTasks)
      .filter(Boolean);

    const sharedPatterns = shared
      .filter(s => s.lastUpdated > cutoff)
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 20);

    return {
      agentId: this.agentId,
      sessionId: this.sessionId,
      generatedAt: now(),
      contextWindow: `Last ${maxAgeHours}h`,
      recentDecisions,
      recentLearnings,
      completedTasks: [...new Set(taskHistory)],
      sharedPatterns,
      sessionCount: summaries.length
    };
  }

  getSharedMemory(options = {}) {
    const { agentId = null, type = null, since = null } = options;
    let shared = loadJsonl(join(SHARED_DIR, 'shared_memory.jsonl'));
    
    if (agentId) {
      shared = shared.filter(s => s.agentId === agentId);
    }
    if (type) {
      shared = shared.filter(s => s.key.includes(type));
    }
    if (since) {
      shared = shared.filter(s => s.lastUpdated > since);
    }
    
    return shared.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  }

  archiveOldSessions() {
    const cutoff = hoursAgo(SESSION_TTL_HOURS);
    const sessions = loadJsonl(join(SESSIONS_DIR, `${this.agentId}.jsonl`));
    
    const toArchive = sessions.filter(s => s.timestamp < cutoff);
    const toKeep = sessions.filter(s => s.timestamp >= cutoff);
    
    if (toArchive.length > 0) {
      const archiveFile = join(ARCHIVE_DIR, `${this.agentId}_${hashContent(now())}.jsonl`);
      writeJsonl(archiveFile, toArchive);
    }
    
    if (toKeep.length < sessions.length) {
      writeJsonl(join(SESSIONS_DIR, `${this.agentId}.jsonl`), toKeep);
    }
    
    return { archived: toArchive.length, kept: toKeep.length };
  }

  getMemoryStats() {
    const sessions = loadJsonl(join(SESSIONS_DIR, `${this.agentId}.jsonl`));
    const summaries = loadJsonl(join(CONTEXT_DIR, 'session_summaries.jsonl'));
    const shared = loadJsonl(join(SHARED_DIR, 'shared_memory.jsonl'));
    
    const archives = existsSync(ARCHIVE_DIR) 
      ? readdirSync(ARCHIVE_DIR).filter(f => f.startsWith(this.agentId)).length 
      : 0;

    const recentSessions = sessions.filter(s => s.timestamp > hoursAgo(24));
    
    return {
      agentId: this.agentId,
      currentSession: this.sessionId,
      totalEntries: sessions.length,
      recentEntries24h: recentSessions.length,
      sessionCount: summaries.length,
      sharedEntries: shared.length,
      archivedSessions: archives,
      lastActivity: sessions[sessions.length - 1]?.timestamp || null
    };
  }
}

function getAllAgents() {
  if (!existsSync(SESSIONS_DIR)) return [];
  return readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => f.replace('.jsonl', ''));
}

function getGlobalContext(options = {}) {
  const { maxAgeHours = 24 } = options;
  const cutoff = hoursAgo(maxAgeHours);
  const agents = getAllAgents();
  
  const allShared = [];
  const allSummaries = loadJsonl(join(CONTEXT_DIR, 'session_summaries.jsonl'))
    .filter(s => s.sessionEnd > cutoff);

  for (const agentId of agents) {
    const shared = loadJsonl(join(SHARED_DIR, 'shared_memory.jsonl'))
      .filter(s => s.lastUpdated > cutoff && s.agentId === agentId);
    allShared.push(...shared);
  }

  const decisionsByAgent = {};
  for (const summary of allSummaries) {
    if (!decisionsByAgent[summary.agentId]) {
      decisionsByAgent[summary.agentId] = [];
    }
    decisionsByAgent[summary.agentId].push(...summary.keyDecisions);
  }

  return {
    generatedAt: now(),
    contextWindow: `Last ${maxAgeHours}h`,
    activeAgents: agents.length,
    sessionCount: allSummaries.length,
    sharedMemoryCount: allShared.length,
    decisionsByAgent,
    topPatterns: allShared
      .sort((a, b) => b.occurrenceCount - a.occurrenceCount)
      .slice(0, 10)
      .map(s => ({ key: s.key, count: s.occurrenceCount, lastUsed: s.lastUpdated }))
  };
}

function syncSharedContext(targetAgent, sourceAgents = []) {
  const allShared = loadJsonl(join(SHARED_DIR, 'shared_memory.jsonl'));
  
  let relevant = allShared;
  if (sourceAgents.length > 0) {
    relevant = allShared.filter(s => sourceAgents.includes(s.agentId));
  }
  
  const myShared = allShared.filter(s => s.agentId === targetAgent);
  const existingKeys = new Set(myShared.map(s => s.key));
  
  const toSync = relevant
    .filter(s => !existingKeys.has(s.key))
    .map(s => ({ ...s, syncedFrom: s.agentId, agentId: targetAgent, lastUpdated: now() }));
  
  if (toSync.length > 0) {
    writeJsonl(join(SHARED_DIR, 'shared_memory.jsonl'), [...allShared, ...toSync]);
  }
  
  return {
    synced: toSync.length,
    fromAgents: sourceAgents.length > 0 ? sourceAgents : 'all',
    toAgent: targetAgent
  };
}

export {
  AgentMemory,
  getAllAgents,
  getGlobalContext,
  syncSharedContext
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const agentId = process.argv[3] || 'BIG-PICKLE';
  
  if (command === 'init') {
    const memory = new AgentMemory(agentId);
    console.log(`[MemorySync] Initialized session ${memory.sessionId} for ${agentId}`);
    console.log('[MemorySync] Ready to record actions');
  } else if (command === 'stats') {
    const memory = new AgentMemory(agentId);
    const stats = memory.getMemoryStats();
    console.log('\n=== Memory Stats ===');
    console.log(`Agent: ${stats.agentId}`);
    console.log(`Current Session: ${stats.currentSession}`);
    console.log(`Total Entries: ${stats.totalEntries}`);
    console.log(`Recent (24h): ${stats.recentEntries24h}`);
    console.log(`Session Count: ${stats.sessionCount}`);
    console.log(`Shared Entries: ${stats.sharedEntries}`);
    console.log(`Archived Sessions: ${stats.archivedSessions}`);
    console.log(`Last Activity: ${stats.lastActivity || 'none'}`);
  } else if (command === 'context') {
    const memory = new AgentMemory(agentId);
    const context = memory.getCrossSessionContext({ maxAgeHours: 24 });
    console.log('\n=== Cross-Session Context ===');
    console.log(`Session: ${context.sessionId}`);
    console.log(`Sessions in window: ${context.sessionCount}`);
    console.log(`\nRecent Decisions (${context.recentDecisions.length}):`);
    context.recentDecisions.slice(-3).forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.reason} → ${d.outcome}`);
    });
    console.log(`\nRecent Learnings (${context.recentLearnings.length}):`);
    context.recentLearnings.slice(-3).forEach((l, i) => {
      console.log(`  ${i + 1}. ${l}`);
    });
  } else if (command === 'global') {
    const context = getGlobalContext({ maxAgeHours: 24 });
    console.log('\n=== Global Context ===');
    console.log(`Active Agents: ${context.activeAgents}`);
    console.log(`Sessions: ${context.sessionCount}`);
    console.log(`Shared Memory: ${context.sharedMemoryCount}`);
    console.log('\nTop Patterns:');
    context.topPatterns.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.key}: ${p.count} occurrences`);
    });
  } else if (command === 'sync') {
    const target = process.argv[4] || 'BIG-PICKLE';
    const sources = process.argv.slice(5);
    const result = syncSharedContext(target, sources);
    console.log(`[MemorySync] Synced ${result.synced} entries to ${result.toAgent}`);
  } else if (command === 'archive') {
    const memory = new AgentMemory(agentId);
    const result = memory.archiveOldSessions();
    console.log(`[MemorySync] Archived ${result.archived}, kept ${result.kept}`);
  } else if (command === 'record') {
    const type = process.argv[3];
    const data = JSON.parse(process.argv[4] || '{}');
    const memory = new AgentMemory(agentId);
    if (type === 'decision') {
      memory.recordDecision(data);
    } else if (type === 'learning') {
      memory.recordLearning(data);
    } else if (type === 'task') {
      memory.recordTask(data);
    }
    console.log(`[MemorySync] Recorded ${type}:`, data);
  } else if (command === 'summary') {
    const memory = new AgentMemory(agentId);
    const summary = memory.generateSessionSummary();
    console.log('\n=== Session Summary ===');
    console.log(`Session: ${summary.sessionId}`);
    console.log(`Duration: ${Math.round(summary.duration / 60000)}m`);
    console.log(`Actions: ${JSON.stringify(summary.actions)}`);
    console.log(`Tasks: ${summary.completedTasks.length}`);
    console.log(`Learnings: ${summary.learnings.length}`);
  } else {
    console.log('Usage:');
    console.log('  node aurora-memory-sync.mjs init <agentId>');
    console.log('  node aurora-memory-sync.mjs stats <agentId>');
    console.log('  node aurora-memory-sync.mjs context <agentId>');
    console.log('  node aurora-memory-sync.mjs global');
    console.log('  node aurora-memory-sync.mjs sync <targetAgent> [sourceAgents...]');
    console.log('  node aurora-memory-sync.mjs archive <agentId>');
    console.log('  node aurora-memory-sync.mjs record <type> <jsonData>');
    console.log('  node aurora-memory-sync.mjs summary <agentId>');
  }
}
